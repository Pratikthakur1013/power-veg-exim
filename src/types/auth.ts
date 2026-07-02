// ─── Admin Auth Types ──────────────────────────────────────────────────────

export interface AdminRecord {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  recovery_phone: string;
  phone_verified: boolean;
  role: "admin";
  created_at: string;
  updated_at: string;
  last_login: string | null;
}

export interface AdminPublic {
  id: string;
  full_name: string;
  email: string;
  recovery_phone_masked: string; // "+91****3310"
  role: "admin";
  last_login: string | null;
}

// ─── Auth Session ──────────────────────────────────────────────────────────

export interface AuthSession {
  adminId: string;
  email: string;
  full_name: string;
  role: "admin";
  iat?: number;
  exp?: number;
}

// ─── Login Logs ────────────────────────────────────────────────────────────

export type LoginEventType =
  | "login_success"
  | "login_fail"
  | "logout"
  | "otp_requested"
  | "otp_verified"
  | "otp_fail"
  | "password_reset"
  | "session_expired";

export interface LoginLog {
  id: string;
  admin_id: string;
  event: LoginEventType;
  ip: string;
  country: string;
  browser: string;
  os: string;
  device: string;
  timestamp: string;
  meta?: string; // optional extra info
}

// ─── OTP / Reset Session ───────────────────────────────────────────────────

export interface ResetSession {
  token: string; // UUID
  admin_id: string;
  phase: "email_verified" | "otp_verified";
  otp_hash?: string; // bcrypt-hashed 6-digit OTP
  otp_attempts: number;
  otp_requests_in_window: number;
  request_window_start: string; // ISO timestamp for rate window
  expires_at: string; // ISO timestamp
  created_at: string;
}

// ─── API Response Shapes ──────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Form Input Types ─────────────────────────────────────────────────────

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface ForgotPasswordFormValues {
  email: string;
}

export interface OtpFormValues {
  otp: string;
}

export interface ResetPasswordFormValues {
  password: string;
  confirmPassword: string;
}

// ─── Password Strength ───────────────────────────────────────────────────

export type PasswordStrengthLevel = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  level: PasswordStrengthLevel;
  score: number; // 0-4
  label: string;
  color: string;
}

// ─── Express Request Extension ────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      admin?: AuthSession;
    }
  }
}
