/**
 * Auth API Routes
 * All authentication-related Express endpoints.
 *
 * Routes:
 *   POST /api/auth/login              — Email + password login
 *   POST /api/auth/logout             — Clear session
 *   GET  /api/auth/me                 — Get current session
 *   POST /api/auth/refresh            — Refresh JWT (sliding window)
 *   POST /api/auth/forgot-password    — Step 1: validate email → create reset session
 *   GET  /api/auth/recovery-phone/:t  — Step 2: get phone number (for Firebase signIn)
 *   POST /api/auth/verify-otp         — Step 3: verify Firebase ID token after OTP
 *   POST /api/auth/reset-password     — Step 4: set new password
 */
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";
import path from "path";
import fs from "fs";

import { requireAuth, issueSession, clearSession } from "./authMiddleware.js";
import { loginRateLimiter, otpRequestRateLimiter, authRateLimiter } from "./rateLimiter.js";
import { verifyFirebaseIdToken } from "./firebaseAdmin.js";
import {
  sendLoginNotification,
  sendPasswordChangedNotification,
  sendPasswordResetInitiated,
  sendFailedAttemptsNotification,
} from "./emailService.js";
import {
  loginApiSchema,
  forgotPasswordApiSchema,
  verifyOtpApiSchema,
  resetPasswordApiSchema,
  sendOtpApiSchema,
} from "../../lib/validators.js";
import type { AdminRecord, LoginLog, ResetSession, LoginEventType } from "../../types/auth.js";

const router = Router();

// ─── DB Helpers ──────────────────────────────────────────────────────────────

const CWD = process.cwd();
const DATA_DIR = path.join(CWD, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function readDb(): any {
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

function writeDb(data: any): void {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse browser + OS + device from User-Agent */
function parseUserAgent(ua: string) {
  const parser = new UAParser(ua);
  const result = parser.getResult();
  return {
    browser: `${result.browser.name || "Unknown"} ${result.browser.version || ""}`.trim(),
    os: `${result.os.name || "Unknown"} ${result.os.version || ""}`.trim(),
    device: result.device.type || "desktop",
  };
}

/** Get client IP, respecting proxy headers */
function getClientIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || "unknown";
}

/** Mask phone number — show only last 4 digits */
function maskPhone(phone: string): string {
  if (phone.length < 6) return "****";
  const suffix = phone.slice(-4);
  const prefix = phone.slice(0, phone.startsWith("+") ? 3 : 2);
  return `${prefix}****${suffix}`;
}

/** Log a login/security event to db.login_logs */
function logEvent(
  db: any,
  adminId: string,
  event: LoginEventType,
  req: Request,
  meta?: string
): void {
  const ua = parseUserAgent(req.headers["user-agent"] || "");
  const logEntry: LoginLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    admin_id: adminId,
    event,
    ip: getClientIp(req),
    country: (req.headers["cf-ipcountry"] as string) || "Unknown",
    browser: ua.browser,
    os: ua.os,
    device: ua.device,
    timestamp: new Date().toISOString(),
    meta,
  };

  if (!db.login_logs) db.login_logs = [];
  db.login_logs.unshift(logEntry);

  // Keep only last 500 logs
  if (db.login_logs.length > 500) {
    db.login_logs = db.login_logs.slice(0, 500);
  }
}

/** Find admin record by email */
function findAdmin(db: any, email: string): AdminRecord | null {
  return db.admins?.find((a: AdminRecord) => a.email.toLowerCase() === email.toLowerCase()) ?? null;
}

/** Check if admin is locked (too many consecutive fails) */
function isAdminLocked(db: any, adminId: string): boolean {
  const logs: LoginLog[] = db.login_logs || [];
  const recent = logs
    .filter((l) => l.admin_id === adminId)
    .slice(0, 10); // check last 10 events

  // Count consecutive failures from latest
  let consecutiveFails = 0;
  for (const log of recent) {
    if (log.event === "login_success") break;
    if (log.event === "login_fail") consecutiveFails++;
  }

  return consecutiveFails >= 5;
}

// In-memory reset session store (keyed by token UUID)
// In production, use Redis or a DB table
const resetSessions = new Map<string, ResetSession>();

/** Clean expired reset sessions */
function cleanExpiredSessions(): void {
  const now = new Date();
  for (const [key, session] of resetSessions.entries()) {
    if (new Date(session.expires_at) < now) {
      resetSessions.delete(key);
    }
  }
}

// ─── Routes ──────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 * Validate credentials, issue JWT session cookie.
 */
router.post("/login", loginRateLimiter, async (req: Request, res: Response) => {
  const parsed = loginApiSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "Invalid request data.", errors: parsed.error.flatten() });
    return;
  }

  const { email, password, rememberMe } = parsed.data;
  const db = readDb();
  const admin = findAdmin(db, email);

  if (!admin) {
    // Don't reveal if email exists — generic error
    res.status(401).json({ success: false, error: "Invalid email or password.", code: "INVALID_CREDENTIALS" });
    return;
  }

  // Check lockout
  if (isAdminLocked(db, admin.id)) {
    res.status(429).json({
      success: false,
      error: "Your account is temporarily locked due to too many failed attempts. Please reset your password or try again in 15 minutes.",
      code: "ACCOUNT_LOCKED",
    });
    return;
  }

  // Verify password
  const passwordValid = await bcrypt.compare(password, admin.password_hash);

  if (!passwordValid) {
    logEvent(db, admin.id, "login_fail", req);
    writeDb(db);

    // Count consecutive failures to send email alert at exactly 5
    const recentFails = (db.login_logs as LoginLog[])
      .filter((l) => l.admin_id === admin.id && l.event === "login_fail")
      .slice(0, 5);

    if (recentFails.length >= 5) {
      sendFailedAttemptsNotification({
        to: admin.email,
        name: admin.full_name,
        attempts: recentFails.length,
        ip: getClientIp(req),
        timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      });
    }

    res.status(401).json({ success: false, error: "Invalid email or password.", code: "INVALID_CREDENTIALS" });
    return;
  }

  // Success — issue session
  const ua = parseUserAgent(req.headers["user-agent"] || "");
  logEvent(db, admin.id, "login_success", req);

  // Update last_login
  const adminIndex = db.admins.findIndex((a: AdminRecord) => a.id === admin.id);
  if (adminIndex !== -1) {
    db.admins[adminIndex].last_login = new Date().toISOString();
    db.admins[adminIndex].updated_at = new Date().toISOString();
  }
  writeDb(db);

  // Issue JWT
  issueSession(
    res,
    {
      adminId: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
    },
    rememberMe
  );

  // Send login email notification (async, non-blocking)
  sendLoginNotification({
    to: admin.email,
    name: admin.full_name,
    ip: getClientIp(req),
    browser: ua.browser,
    os: ua.os,
    country: (req.headers["cf-ipcountry"] as string) || "Unknown",
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  });

  res.json({
    success: true,
    data: {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      last_login: admin.last_login,
    },
  });
});

/**
 * POST /api/auth/logout
 * Clear session cookie and log event.
 */
router.post("/logout", requireAuth, (req: Request, res: Response) => {
  const db = readDb();
  if (req.admin) {
    logEvent(db, req.admin.adminId, "logout", req);
    writeDb(db);
  }
  clearSession(res);
  res.json({ success: true, data: { message: "Logged out successfully." } });
});

/**
 * GET /api/auth/me
 * Return current admin session info.
 */
router.get("/me", requireAuth, (req: Request, res: Response) => {
  const db = readDb();
  const admin = db.admins?.find((a: AdminRecord) => a.id === req.admin!.adminId);
  if (!admin) {
    clearSession(res);
    res.status(401).json({ success: false, error: "Admin not found.", code: "ADMIN_NOT_FOUND" });
    return;
  }

  res.json({
    success: true,
    data: {
      id: admin.id,
      email: admin.email,
      full_name: admin.full_name,
      role: admin.role,
      last_login: admin.last_login,
      recovery_phone_masked: maskPhone(admin.recovery_phone || ""),
    },
  });
});

/**
 * POST /api/auth/refresh
 * Refresh the JWT session (extend inactivity window).
 */
router.post("/refresh", requireAuth, (req: Request, res: Response) => {
  issueSession(res, {
    adminId: req.admin!.adminId,
    email: req.admin!.email,
    full_name: req.admin!.full_name,
    role: req.admin!.role,
  });
  res.json({ success: true, data: { refreshed: true } });
});

/**
 * POST /api/auth/forgot-password
 * Step 1: Validate email → create a reset session → return token + masked phone
 */
router.post("/forgot-password", authRateLimiter, async (req: Request, res: Response) => {
  const parsed = forgotPasswordApiSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "Invalid email address." });
    return;
  }

  const { email } = parsed.data;
  const db = readDb();
  const admin = findAdmin(db, email);

  // Always respond with same message to prevent email enumeration
  const genericMsg = "If this email is registered, a recovery code has been sent to the admin's registered phone number.";

  if (!admin) {
    // Artificial delay to prevent timing attacks
    await new Promise((r) => setTimeout(r, 800));
    res.json({ success: true, data: { message: genericMsg } });
    return;
  }

  cleanExpiredSessions();

  // Create reset session (directly verified since OTP is disabled)
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes for the reset flow

  const session: ResetSession = {
    token,
    admin_id: admin.id,
    phase: "otp_verified",
    otp_attempts: 0,
    otp_requests_in_window: 0,
    request_window_start: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  };

  resetSessions.set(token, session);

  // Log event
  logEvent(db, admin.id, "password_reset_initiated", req);
  writeDb(db);

  // Send email notification
  sendPasswordResetInitiated({
    to: admin.email,
    name: admin.full_name,
    maskedPhone: maskPhone(admin.recovery_phone || ""),
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    ip: getClientIp(req),
  });

  res.json({
    success: true,
    data: {
      message: genericMsg,
      resetToken: token,
      maskedPhone: maskPhone(admin.recovery_phone || ""),
      expiresAt: expiresAt.toISOString(),
    },
  });
});

/**
 * POST /api/auth/get-recovery-phone
 * Returns the ACTUAL recovery phone for a valid reset session.
 * Used by the client to initiate Firebase Phone Auth.
 */
router.post("/get-recovery-phone", otpRequestRateLimiter, (req: Request, res: Response) => {
  const parsed = sendOtpApiSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "Invalid reset token." });
    return;
  }

  const { resetToken } = parsed.data;
  const session = resetSessions.get(resetToken);

  if (!session) {
    res.status(400).json({ success: false, error: "Invalid or expired reset session. Please start the password reset again.", code: "INVALID_RESET_TOKEN" });
    return;
  }

  if (new Date(session.expires_at) < new Date()) {
    resetSessions.delete(resetToken);
    res.status(400).json({ success: false, error: "Reset session has expired. Please start over.", code: "SESSION_EXPIRED" });
    return;
  }

  if (session.phase !== "email_verified") {
    res.status(400).json({ success: false, error: "Invalid session state.", code: "INVALID_SESSION_PHASE" });
    return;
  }

  // Check OTP request rate limit (5 per hour)
  const windowStart = new Date(session.request_window_start);
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);

  if (windowStart > hourAgo && session.otp_requests_in_window >= 5) {
    res.status(429).json({
      success: false,
      error: "Maximum OTP requests exceeded. Please wait 1 hour before requesting again.",
      code: "OTP_RATE_LIMIT",
    });
    return;
  }

  // Reset window if needed
  if (windowStart <= hourAgo) {
    session.otp_requests_in_window = 0;
    session.request_window_start = new Date().toISOString();
  }

  session.otp_requests_in_window++;
  resetSessions.set(resetToken, session);

  const db = readDb();
  const admin = db.admins?.find((a: AdminRecord) => a.id === session.admin_id);

  if (!admin) {
    res.status(404).json({ success: false, error: "Admin account not found." });
    return;
  }

  res.json({
    success: true,
    data: {
      phone: admin.recovery_phone, // Full phone for Firebase signInWithPhoneNumber
      maskedPhone: maskPhone(admin.recovery_phone || ""),
    },
  });
});

/**
 * POST /api/auth/verify-otp
 * Step 3: Verify Firebase Phone Auth ID token → upgrade session to otp_verified
 */
router.post("/verify-otp", authRateLimiter, async (req: Request, res: Response) => {
  const parsed = verifyOtpApiSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "Invalid request data." });
    return;
  }

  const { resetToken, firebaseIdToken } = parsed.data;
  const session = resetSessions.get(resetToken);

  if (!session || new Date(session.expires_at) < new Date()) {
    resetSessions.delete(resetToken);
    res.status(400).json({ success: false, error: "Invalid or expired reset session.", code: "INVALID_RESET_TOKEN" });
    return;
  }

  if (session.otp_attempts >= 5) {
    resetSessions.delete(resetToken);
    res.status(429).json({ success: false, error: "Too many incorrect OTP attempts. Please restart the password reset process.", code: "OTP_MAX_ATTEMPTS" });
    return;
  }

  try {
    // Allow Mock OTP validation in Development mode if Firebase is not fully configured
    const isFirebaseConfigured = !!process.env.FIREBASE_PROJECT_ID;
    if (!isFirebaseConfigured && firebaseIdToken === "mock-otp-token-123456" && process.env.NODE_ENV !== "production") {
      const db = readDb();
      const admin = db.admins?.find((a: AdminRecord) => a.id === session.admin_id);
      if (!admin) {
        res.status(404).json({ success: false, error: "Admin not found." });
        return;
      }

      session.phase = "otp_verified";
      session.expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      resetSessions.set(resetToken, session);

      logEvent(db, admin.id, "otp_verified", req, "Mock OTP verification (Dev Mode)");
      writeDb(db);

      res.json({ success: true, data: { message: "OTP verified successfully (Demo Mode).", resetToken } });
      return;
    }

    // Verify the Firebase ID token issued after phone OTP confirmation
    const decodedToken = await verifyFirebaseIdToken(firebaseIdToken);

    // Confirm the phone in the token matches the admin's recovery phone
    const db = readDb();
    const admin = db.admins?.find((a: AdminRecord) => a.id === session.admin_id);

    if (!admin) {
      res.status(404).json({ success: false, error: "Admin not found." });
      return;
    }

    if (decodedToken.phone_number !== admin.recovery_phone) {
      session.otp_attempts++;
      resetSessions.set(resetToken, session);

      logEvent(db, admin.id, "otp_fail", req);
      writeDb(db);

      res.status(401).json({ success: false, error: "Phone number verification failed.", code: "PHONE_MISMATCH" });
      return;
    }

    // ✅ OTP verified — upgrade session
    session.phase = "otp_verified";
    session.expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min to reset password
    resetSessions.set(resetToken, session);

    logEvent(db, admin.id, "otp_verified", req);
    writeDb(db);

    res.json({ success: true, data: { message: "OTP verified successfully.", resetToken } });
  } catch (err: any) {
    session.otp_attempts++;
    resetSessions.set(resetToken, session);

    console.error("[AuthRoutes] OTP verification error:", err.message);
    res.status(401).json({ success: false, error: "OTP verification failed. Please try again.", code: "OTP_INVALID" });
  }
});

/**
 * POST /api/auth/reset-password
 * Step 4: Set new password (requires otp_verified session)
 */
router.post("/reset-password", authRateLimiter, async (req: Request, res: Response) => {
  const parsed = resetPasswordApiSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ success: false, error: "Password does not meet requirements.", errors: parsed.error.flatten() });
    return;
  }

  const { resetToken, newPassword } = parsed.data;
  const session = resetSessions.get(resetToken);

  if (!session || new Date(session.expires_at) < new Date()) {
    resetSessions.delete(resetToken);
    res.status(400).json({ success: false, error: "Invalid or expired reset session. Please start over.", code: "INVALID_RESET_TOKEN" });
    return;
  }

  if (session.phase !== "otp_verified") {
    res.status(403).json({ success: false, error: "OTP verification required before resetting password.", code: "OTP_NOT_VERIFIED" });
    return;
  }

  const db = readDb();
  const adminIndex = db.admins?.findIndex((a: AdminRecord) => a.id === session.admin_id);

  if (adminIndex === -1 || adminIndex === undefined) {
    res.status(404).json({ success: false, error: "Admin not found." });
    return;
  }

  // Hash new password with bcrypt (cost 12)
  const newHash = await bcrypt.hash(newPassword, 12);

  db.admins[adminIndex].password_hash = newHash;
  db.admins[adminIndex].updated_at = new Date().toISOString();

  // Log event
  logEvent(db, session.admin_id, "password_reset", req);
  writeDb(db);

  // Invalidate reset session immediately
  resetSessions.delete(resetToken);

  // Send email notification
  const admin: AdminRecord = db.admins[adminIndex];
  sendPasswordChangedNotification({
    to: admin.email,
    name: admin.full_name,
    timestamp: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    ip: getClientIp(req),
  });

  res.json({ success: true, data: { message: "Password reset successfully. Please log in with your new password." } });
});

/**
 * GET /api/auth/logs
 * Return recent login logs (protected — admin only)
 */
router.get("/logs", requireAuth, (req: Request, res: Response) => {
  const db = readDb();
  const logs = (db.login_logs || []).slice(0, 100); // Last 100 events
  res.json({ success: true, data: logs });
});

export default router;
