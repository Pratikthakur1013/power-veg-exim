import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { loginSchema, type LoginSchema } from "../../lib/validators";

// ─── Background Orbs ─────────────────────────────────────────────────────────

function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF7A1A] rounded-full opacity-[0.04] blur-3xl" />
      <div className="absolute top-1/3 -right-40 w-80 h-80 bg-[#FF7A1A] rounded-full opacity-[0.06] blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-orange-800 rounded-full opacity-[0.05] blur-3xl" />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,122,26,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,122,26,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ─── Input Field ─────────────────────────────────────────────────────────────

interface InputFieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  rightElement?: React.ReactNode;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
}

function InputField({ label, icon, error, rightElement, inputProps }: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="relative group">
        {/* Icon */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF7A1A] transition-colors duration-200 z-10">
          {icon}
        </div>
        {/* Input */}
        <input
          {...inputProps}
          className={`
            w-full pl-11 pr-${rightElement ? "11" : "4"} py-3.5
            bg-white/[0.04] border rounded-xl text-white placeholder-slate-600
            text-sm font-medium
            transition-all duration-200
            focus:outline-none focus:ring-2
            ${error
              ? "border-red-500/60 focus:ring-red-500/30 focus:border-red-500"
              : "border-white/10 focus:ring-[#FF7A1A]/30 focus:border-[#FF7A1A]/60"
            }
            hover:bg-white/[0.06]
          `}
        />
        {/* Right element */}
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-1.5 text-red-400 text-xs"
          >
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutMessage, setLockoutMessage] = useState("");

  const from = (location.state as any)?.from || "/admin";
  const reason = new URLSearchParams(location.search).get("reason");

  // Show inactivity message if redirected due to session expiry
  useEffect(() => {
    if (reason === "inactivity") {
      toast("Session expired due to inactivity. Please log in again.", {
        icon: "⏰",
        style: {
          background: "#1e293b",
          color: "#e2e8f0",
          border: "1px solid rgba(255,122,26,0.3)",
          borderRadius: "12px",
        },
      });
    }
  }, [reason]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsSubmitting(true);
    setLockoutMessage("");

    try {
      await login(data.email, data.password, data.rememberMe);
      toast.success("Welcome back! Redirecting to dashboard...", {
        style: {
          background: "#1e293b",
          color: "#e2e8f0",
          border: "1px solid rgba(16,185,129,0.4)",
          borderRadius: "12px",
        },
      });
      setTimeout(() => navigate(from, { replace: true }), 800);
    } catch (err: any) {
      const msg = err.message || "Login failed. Please try again.";

      if (msg.includes("locked") || msg.includes("ACCOUNT_LOCKED")) {
        setLockoutMessage(msg);
      } else if (msg.includes("Invalid email") || msg.includes("INVALID_CREDENTIALS")) {
        setError("password", { message: "Invalid email or password." });
      } else if (msg.includes("rate") || msg.includes("RATE_LIMIT")) {
        setLockoutMessage("Too many attempts. Please try again in 15 minutes.");
      } else {
        toast.error(msg, {
          style: { background: "#1e293b", color: "#e2e8f0", borderRadius: "12px" },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C18] flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-right" />
      <BackgroundOrbs />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Glow halo behind card */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-[#FF7A1A]/20 via-transparent to-transparent blur-xl pointer-events-none" />

        {/* Card */}
        <div
          className="relative rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
        >
          {/* Top accent stripe */}
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF7A1A] to-transparent" />

          <div className="p-8 sm:p-10">
            {/* Logo + Branding */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-col items-center mb-8"
            >
              {/* Logo icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-[#FF7A1A]/20 rounded-2xl blur-lg" />
                <div className="relative w-16 h-16 bg-gradient-to-br from-[#FF7A1A] to-[#e05a00] rounded-2xl flex items-center justify-center shadow-xl">
                  <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
                    <circle cx="20" cy="20" r="18" fill="rgba(255,255,255,0.15)" />
                    <text x="20" y="27" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">🌿</text>
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white tracking-tight">Power Veg Exim</h1>
              <p className="text-sm text-slate-400 mt-1 font-medium">Admin Portal</p>

              {/* Security badge */}
              <div className="mt-3 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 text-xs font-semibold tracking-wide">SECURE LOGIN</span>
              </div>
            </motion.div>

            {/* Lockout Alert */}
            <AnimatePresence>
              {lockoutMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm font-semibold">Account Temporarily Locked</p>
                    <p className="text-red-400/80 text-xs mt-0.5">{lockoutMessage}</p>
                    <Link
                      to="/admin/forgot-password"
                      className="text-[#FF7A1A] text-xs font-semibold underline-offset-2 hover:underline mt-1 inline-block"
                    >
                      Reset your password →
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
              autoComplete="off"
            >
              <InputField
                label="Email Address"
                icon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                inputProps={{
                  ...register("email"),
                  type: "email",
                  placeholder: "admin@powervegexim.com",
                  autoComplete: "email",
                  disabled: isSubmitting,
                  id: "admin-login-email",
                }}
              />

              <InputField
                label="Password"
                icon={<Lock className="w-4 h-4" />}
                error={errors.password?.message}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-slate-500 hover:text-slate-300 transition-colors duration-200 p-0.5"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                inputProps={{
                  ...register("password"),
                  type: showPassword ? "text" : "password",
                  placeholder: "Enter your password",
                  autoComplete: "current-password",
                  disabled: isSubmitting,
                  id: "admin-login-password",
                }}
              />

              {/* Remember Me + Forgot Password row */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative">
                    <input
                      {...register("rememberMe")}
                      type="checkbox"
                      id="admin-remember-me"
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-[#FF7A1A] peer-checked:border-[#FF7A1A] transition-all duration-200 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white hidden peer-checked:block" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200 select-none">
                    Remember me for 7 days
                  </span>
                </label>

                <Link
                  to="/admin/forgot-password"
                  className="text-xs text-[#FF7A1A] hover:text-orange-400 font-semibold transition-colors duration-200"
                  id="admin-forgot-password-link"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                id="admin-login-submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.01 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className="
                  relative w-full py-3.5 px-6 mt-2
                  bg-gradient-to-r from-[#FF7A1A] to-[#e05a00]
                  hover:from-[#ff8c33] hover:to-[#f06300]
                  text-white font-bold text-sm tracking-wide rounded-xl
                  shadow-lg shadow-[#FF7A1A]/25
                  transition-all duration-200
                  disabled:opacity-60 disabled:cursor-not-allowed
                  overflow-hidden group
                "
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 pointer-events-none" />

                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  "Sign In to Dashboard"
                )}
              </motion.button>
            </motion.form>

            {/* Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center text-xs text-slate-600"
            >
              Protected by enterprise-grade security.
              <br />
              All access attempts are logged and monitored.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
