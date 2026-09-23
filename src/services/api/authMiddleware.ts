/**
 * JWT Authentication Middleware
 * Verifies the HttpOnly session cookie and attaches the admin session to req.admin.
 * JWT_SECRET is read lazily so dotenv import order doesn't matter.
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthSession } from "../../types/auth.js";

/** Read JWT_SECRET at call time (lazy) so .env is always loaded first */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Only warn once
    if (!(process as any).__jwtWarnShown) {
      console.warn("[AuthMiddleware] ⚠️  JWT_SECRET not found in environment. Set it in .env");
      (process as any).__jwtWarnShown = true;
    }
    return "INSECURE_FALLBACK_CHANGE_IN_PRODUCTION";
  }
  return secret;
}

/**
 * requireAuth — protect admin routes.
 * Reads `pve_session` cookie, verifies JWT, attaches session to req.admin.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.pve_session;

  if (!token) {
    res.status(401).json({ success: false, error: "Authentication required.", code: "NO_SESSION" });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthSession;
    req.admin = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({ success: false, error: "Session expired. Please log in again.", code: "SESSION_EXPIRED" });
    } else {
      res.status(401).json({ success: false, error: "Invalid session. Please log in again.", code: "INVALID_SESSION" });
    }
  }
}

/**
 * Issue a signed JWT and set it as a secure HttpOnly cookie.
 */
export function issueSession(
  res: Response,
  payload: Omit<AuthSession, "iat" | "exp">,
  rememberMe = false
): string {
  const expiresIn = rememberMe ? "7d" : "30m";
  const maxAge = rememberMe
    ? 7 * 24 * 60 * 60 * 1000   // 7 days in ms
    : 30 * 60 * 1000;            // 30 minutes in ms

  const secret = getJwtSecret();
  const token = jwt.sign(payload, secret, { expiresIn });

  res.cookie("pve_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge,
    path: "/",
  });

  return token;
}

/**
 * Clear the session cookie on logout.
 */
export function clearSession(res: Response): void {
  res.clearCookie("pve_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
}
