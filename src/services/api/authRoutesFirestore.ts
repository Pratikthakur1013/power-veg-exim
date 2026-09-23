/**
 * Auth API Routes — Firestore Version
 * 
 * Identical auth logic to authRoutes.ts but reads/writes admin data
 * via Firestore instead of the local db.json file.
 *
 * Routes:
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 *   POST /api/auth/refresh
 *   POST /api/auth/forgot-password
 *   POST /api/auth/reset-password
 *   GET  /api/auth/logs
 */
import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UAParser } from 'ua-parser-js';

import { requireAuth, issueSession, clearSession } from './authMiddleware.js';
import { loginRateLimiter, otpRequestRateLimiter, authRateLimiter } from './rateLimiter.js';
import { verifyFirebaseIdToken } from './firebaseAdmin.js';
import {
  sendLoginNotification,
  sendPasswordChangedNotification,
  sendPasswordResetInitiated,
  sendFailedAttemptsNotification,
} from './emailService.js';
import {
  loginApiSchema,
  forgotPasswordApiSchema,
  verifyOtpApiSchema,
  resetPasswordApiSchema,
  sendOtpApiSchema,
} from '../../lib/validators.js';
import type { AdminRecord, LoginLog, ResetSession, LoginEventType } from '../../types/auth.js';
import { firestoreDb } from './firestoreDb.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseUserAgent(ua: string) {
  const parser = new UAParser(ua);
  const result = parser.getResult();
  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: result.device.type || 'desktop',
  };
}

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

function maskPhone(phone: string): string {
  if (phone.length < 6) return '****';
  const suffix = phone.slice(-4);
  const prefix = phone.slice(0, phone.startsWith('+') ? 3 : 2);
  return `${prefix}****${suffix}`;
}

async function logEvent(
  adminId: string,
  event: LoginEventType,
  req: Request,
  meta?: string
): Promise<void> {
  const ua = parseUserAgent(req.headers['user-agent'] || '');
  const logEntry: LoginLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    admin_id: adminId,
    event,
    ip: getClientIp(req),
    country: (req.headers['cf-ipcountry'] as string) || 'Unknown',
    browser: ua.browser,
    os: ua.os,
    device: ua.device,
    timestamp: new Date().toISOString(),
    meta,
  };
  await firestoreDb.addLoginLog(logEntry);
}

async function isAdminLocked(adminId: string): Promise<boolean> {
  const recent = await firestoreDb.getRecentLoginEvents(adminId, 10);
  let consecutiveFails = 0;
  for (const log of recent) {
    if (log.event === 'login_success') break;
    if (log.event === 'login_fail') consecutiveFails++;
  }
  return consecutiveFails >= 5;
}

// In-memory reset session store (per cold start — acceptable for low-traffic admin flows)
const resetSessions = new Map<string, ResetSession>();

function cleanExpiredSessions(): void {
  const now = new Date();
  for (const [key, session] of resetSessions.entries()) {
    if (new Date(session.expires_at) < now) {
      resetSessions.delete(key);
    }
  }
}

// ─── Router factory ───────────────────────────────────────────────────────────

export default function authRoutesFactory(): Router {
  const router = Router();

  /**
   * POST /api/auth/login
   */
  router.post('/login', loginRateLimiter, async (req: Request, res: Response) => {
    const parsed = loginApiSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid request data.', errors: parsed.error.flatten() });
      return;
    }

    const { email, password, rememberMe } = parsed.data;

    try {
      const admin = await firestoreDb.getAdminByEmail(email);

      if (!admin) {
        res.status(401).json({ success: false, error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
        return;
      }

      if (await isAdminLocked(admin.id)) {
        res.status(429).json({
          success: false,
          error: 'Your account is temporarily locked due to too many failed attempts. Please reset your password or try again in 15 minutes.',
          code: 'ACCOUNT_LOCKED',
        });
        return;
      }

      const passwordValid = await bcrypt.compare(password, admin.password_hash);

      if (!passwordValid) {
        await logEvent(admin.id, 'login_fail', req);

        // Count recent failures to trigger email alert
        const recentLogs = await firestoreDb.getRecentLoginEvents(admin.id, 5);
        const recentFails = recentLogs.filter((l) => l.event === 'login_fail');
        if (recentFails.length >= 5) {
          sendFailedAttemptsNotification({
            to: admin.email,
            name: admin.full_name,
            attempts: recentFails.length,
            ip: getClientIp(req),
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          });
        }

        res.status(401).json({ success: false, error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' });
        return;
      }

      // Success
      const ua = parseUserAgent(req.headers['user-agent'] || '');
      await logEvent(admin.id, 'login_success', req);
      await firestoreDb.updateAdmin(admin.id, {
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      issueSession(res, {
        adminId: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role,
      }, rememberMe);

      sendLoginNotification({
        to: admin.email,
        name: admin.full_name,
        ip: getClientIp(req),
        browser: ua.browser,
        os: ua.os,
        country: (req.headers['cf-ipcountry'] as string) || 'Unknown',
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
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
    } catch (err) {
      console.error('[AuthRoutes] Login error:', err);
      res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  });

  /**
   * POST /api/auth/logout
   */
  router.post('/logout', requireAuth, async (req: Request, res: Response) => {
    if (req.admin) {
      await logEvent(req.admin.adminId, 'logout', req).catch(() => {});
    }
    clearSession(res);
    res.json({ success: true, data: { message: 'Logged out successfully.' } });
  });

  /**
   * GET /api/auth/me
   */
  router.get('/me', requireAuth, async (req: Request, res: Response) => {
    try {
      const admin = await firestoreDb.getAdminById(req.admin!.adminId);
      if (!admin) {
        clearSession(res);
        res.status(401).json({ success: false, error: 'Admin not found.', code: 'ADMIN_NOT_FOUND' });
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
          recovery_phone_masked: maskPhone(admin.recovery_phone || ''),
        },
      });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  });

  /**
   * POST /api/auth/refresh
   */
  router.post('/refresh', requireAuth, (req: Request, res: Response) => {
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
   */
  router.post('/forgot-password', authRateLimiter, async (req: Request, res: Response) => {
    const parsed = forgotPasswordApiSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid email address.' });
      return;
    }

    const { email } = parsed.data;
    const genericMsg = 'If this email is registered, a recovery code has been sent to the admin\'s registered phone number.';

    try {
      const admin = await firestoreDb.getAdminByEmail(email);

      if (!admin) {
        await new Promise((r) => setTimeout(r, 800));
        res.json({ success: true, data: { message: genericMsg } });
        return;
      }

      cleanExpiredSessions();

      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const session: ResetSession = {
        token,
        admin_id: admin.id,
        phase: 'otp_verified',
        otp_attempts: 0,
        otp_requests_in_window: 0,
        request_window_start: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      };

      resetSessions.set(token, session);

      await logEvent(admin.id, 'password_reset_initiated', req);

      sendPasswordResetInitiated({
        to: admin.email,
        name: admin.full_name,
        maskedPhone: maskPhone(admin.recovery_phone || ''),
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        ip: getClientIp(req),
      });

      res.json({
        success: true,
        data: {
          message: genericMsg,
          resetToken: token,
          maskedPhone: maskPhone(admin.recovery_phone || ''),
          expiresAt: expiresAt.toISOString(),
        },
      });
    } catch (err) {
      console.error('[AuthRoutes] forgot-password error:', err);
      res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  });

  /**
   * POST /api/auth/verify-otp
   */
  router.post('/verify-otp', authRateLimiter, async (req: Request, res: Response) => {
    const parsed = verifyOtpApiSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Invalid request data.' });
      return;
    }

    const { resetToken, firebaseIdToken } = parsed.data;
    const session = resetSessions.get(resetToken);

    if (!session || new Date(session.expires_at) < new Date()) {
      resetSessions.delete(resetToken);
      res.status(400).json({ success: false, error: 'Invalid or expired reset session.', code: 'INVALID_RESET_TOKEN' });
      return;
    }

    if (session.otp_attempts >= 5) {
      resetSessions.delete(resetToken);
      res.status(429).json({ success: false, error: 'Too many incorrect OTP attempts.', code: 'OTP_MAX_ATTEMPTS' });
      return;
    }

    try {
      const isFirebaseConfigured = !!process.env.FIREBASE_PROJECT_ID;
      if (!isFirebaseConfigured && firebaseIdToken === 'mock-otp-token-123456' && process.env.NODE_ENV !== 'production') {
        const admin = await firestoreDb.getAdminById(session.admin_id);
        if (!admin) {
          res.status(404).json({ success: false, error: 'Admin not found.' });
          return;
        }
        session.phase = 'otp_verified';
        session.expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
        resetSessions.set(resetToken, session);
        await logEvent(admin.id, 'otp_verified', req, 'Mock OTP verification (Dev Mode)');
        res.json({ success: true, data: { message: 'OTP verified successfully (Demo Mode).', resetToken } });
        return;
      }

      const decodedToken = await verifyFirebaseIdToken(firebaseIdToken);
      const admin = await firestoreDb.getAdminById(session.admin_id);

      if (!admin) {
        res.status(404).json({ success: false, error: 'Admin not found.' });
        return;
      }

      if (decodedToken.phone_number !== admin.recovery_phone) {
        session.otp_attempts++;
        resetSessions.set(resetToken, session);
        await logEvent(admin.id, 'otp_fail', req);
        res.status(401).json({ success: false, error: 'Phone number verification failed.', code: 'PHONE_MISMATCH' });
        return;
      }

      session.phase = 'otp_verified';
      session.expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      resetSessions.set(resetToken, session);
      await logEvent(admin.id, 'otp_verified', req);
      res.json({ success: true, data: { message: 'OTP verified successfully.', resetToken } });
    } catch (err: any) {
      session.otp_attempts++;
      resetSessions.set(resetToken, session);
      console.error('[AuthRoutes] OTP verification error:', err.message);
      res.status(401).json({ success: false, error: 'OTP verification failed.', code: 'OTP_INVALID' });
    }
  });

  /**
   * POST /api/auth/reset-password
   */
  router.post('/reset-password', authRateLimiter, async (req: Request, res: Response) => {
    const parsed = resetPasswordApiSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'Password does not meet requirements.' });
      return;
    }

    const { resetToken, newPassword } = parsed.data;
    const session = resetSessions.get(resetToken);

    if (!session || new Date(session.expires_at) < new Date()) {
      resetSessions.delete(resetToken);
      res.status(400).json({ success: false, error: 'Invalid or expired reset session.', code: 'INVALID_RESET_TOKEN' });
      return;
    }

    if (session.phase !== 'otp_verified') {
      res.status(403).json({ success: false, error: 'OTP verification required.', code: 'OTP_NOT_VERIFIED' });
      return;
    }

    try {
      const admin = await firestoreDb.getAdminById(session.admin_id);
      if (!admin) {
        res.status(404).json({ success: false, error: 'Admin not found.' });
        return;
      }

      const newHash = await bcrypt.hash(newPassword, 12);
      await firestoreDb.updateAdmin(session.admin_id, {
        password_hash: newHash,
        updated_at: new Date().toISOString(),
      });

      await logEvent(session.admin_id, 'password_reset', req);
      resetSessions.delete(resetToken);

      sendPasswordChangedNotification({
        to: admin.email,
        name: admin.full_name,
        timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        ip: getClientIp(req),
      });

      res.json({ success: true, data: { message: 'Password reset successfully. Please log in with your new password.' } });
    } catch (err) {
      console.error('[AuthRoutes] reset-password error:', err);
      res.status(500).json({ success: false, error: 'Internal server error.' });
    }
  });

  /**
   * GET /api/auth/logs
   */
  router.get('/logs', requireAuth, async (req: Request, res: Response) => {
    try {
      const logs = await firestoreDb.getLoginLogs(100);
      res.json({ success: true, data: logs });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to load logs.' });
    }
  });

  return router;
}
