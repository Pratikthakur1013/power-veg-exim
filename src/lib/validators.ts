import { z } from "zod";

// ─── Password Policy ──────────────────────────────────────────────────────

export const PASSWORD_SCHEMA = z
  .string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[0-9]/, "Must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Must contain at least one special character (!@#$%^&*)");

// ─── Login Form ───────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export type LoginSchema = z.infer<typeof loginSchema>;

// ─── Forgot Password ─────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase(),
});

export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

// ─── OTP Verification ────────────────────────────────────────────────────

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only numbers"),
});

export type OtpSchema = z.infer<typeof otpSchema>;

// ─── Password Reset ──────────────────────────────────────────────────────

export const resetPasswordSchema = z
  .object({
    password: PASSWORD_SCHEMA,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// ─── Server-side validation helpers ──────────────────────────────────────

export const loginApiSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordApiSchema = z.object({
  email: z.string().email(),
});

export const verifyOtpApiSchema = z.object({
  resetToken: z.string().uuid(),
  firebaseIdToken: z.string().min(1),
});

export const resetPasswordApiSchema = z.object({
  resetToken: z.string().uuid(),
  newPassword: PASSWORD_SCHEMA,
});

export const sendOtpApiSchema = z.object({
  resetToken: z.string().uuid(),
});
