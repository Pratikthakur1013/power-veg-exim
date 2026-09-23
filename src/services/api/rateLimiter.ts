/**
 * Rate Limiting Configuration
 * Protects auth endpoints from brute-force attacks.
 */
import rateLimit from "express-rate-limit";

/**
 * Strict limiter for login — 5 attempts per 15 minutes per IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: "Too many login attempts. Your account is temporarily locked. Please try again after 15 minutes.",
    code: "RATE_LIMIT_LOGIN",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * OTP request limiter — 5 OTP requests per hour per IP
 */
export const otpRequestRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    error: "Too many OTP requests. Please try again after 1 hour.",
    code: "RATE_LIMIT_OTP",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General auth route limiter — 20 requests per 5 minutes per IP
 */
export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20,
  message: {
    success: false,
    error: "Too many requests. Please slow down.",
    code: "RATE_LIMIT_GENERAL",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Global API limiter — 200 requests per 15 minutes per IP
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    success: false,
    error: "Too many requests from this IP. Please try again later.",
    code: "RATE_LIMIT_GLOBAL",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
