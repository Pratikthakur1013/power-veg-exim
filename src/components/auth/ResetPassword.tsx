import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from "react-hot-toast";
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordSchema } from "../../lib/validators";
import PasswordStrength from "./PasswordStrength";

/**
 * ResetPassword — Step 3 of the password reset flow.
 * Requires pve_reset_token in sessionStorage (set after OTP verified).
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetToken = sessionStorage.getItem("pve_reset_token") || localStorage.getItem("pve_reset_token");

  useEffect(() => {
    if (!resetToken) {
      toast.error("No valid reset session. Please start over.");
      navigate("/admin/forgot-password", { replace: true });
    }
  }, [resetToken, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password") || "";

  const onSubmit = async (data: ResetPasswordSchema) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resetToken,
          newPassword: data.password,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Password reset failed.");
      }

      // Clear reset session
      sessionStorage.removeItem("pve_reset_token");
      sessionStorage.removeItem("pve_reset_expires");
      localStorage.removeItem("pve_reset_token");
      localStorage.removeItem("pve_reset_expires");

      setSuccess(true);
    } catch (err: any) {
      const msg = err.message || "Something went wrong. Please try again.";

      if (msg.includes("expired") || msg.includes("INVALID_RESET_TOKEN")) {
        toast.error("Reset session expired. Please start over.", {
          style: { background: "#1e293b", color: "#e2e8f0", borderRadius: "12px" },
        });
        sessionStorage.removeItem("pve_reset_token");
        localStorage.removeItem("pve_reset_token");
        navigate("/admin/forgot-password", { replace: true });
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

      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF7A1A] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-[#FF7A1A] rounded-full opacity-[0.06] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {!success && (
          <Link
            to="/admin/verify-otp"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        )}

        <div
          className="rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF7A1A] to-transparent" />

          <div className="p-8 sm:p-10">
            <AnimatePresence mode="wait">
              {!success ? (
                // ── Password Form ─────────────────────────────────────────
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <div className="w-14 h-14 bg-[#FF7A1A]/15 border border-[#FF7A1A]/25 rounded-2xl flex items-center justify-center mb-4">
                      <Lock className="w-7 h-7 text-[#FF7A1A]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Create New Password</h1>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      Choose a strong password. It must be at least 12 characters with uppercase, lowercase, numbers, and special characters.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        New Password
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF7A1A] transition-colors duration-200">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          id="new-password"
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          disabled={isSubmitting}
                          className={`
                            w-full pl-11 pr-11 py-3.5
                            bg-white/[0.04] border rounded-xl text-white placeholder-slate-600
                            text-sm font-medium transition-all duration-200
                            focus:outline-none focus:ring-2
                            ${errors.password
                              ? "border-red-500/60 focus:ring-red-500/30"
                              : "border-white/10 focus:ring-[#FF7A1A]/30 focus:border-[#FF7A1A]/60"
                            }
                          `}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      <PasswordStrength password={passwordValue} />

                      {errors.password && (
                        <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        Confirm Password
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF7A1A] transition-colors duration-200">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          {...register("confirmPassword")}
                          type={showConfirm ? "text" : "password"}
                          id="confirm-password"
                          placeholder="Repeat your password"
                          autoComplete="new-password"
                          disabled={isSubmitting}
                          className={`
                            w-full pl-11 pr-11 py-3.5
                            bg-white/[0.04] border rounded-xl text-white placeholder-slate-600
                            text-sm font-medium transition-all duration-200
                            focus:outline-none focus:ring-2
                            ${errors.confirmPassword
                              ? "border-red-500/60 focus:ring-red-500/30"
                              : "border-white/10 focus:ring-[#FF7A1A]/30 focus:border-[#FF7A1A]/60"
                            }
                          `}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="flex items-center gap-1.5 text-red-400 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      id="reset-password-submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-gradient-to-r from-[#FF7A1A] to-[#e05a00] hover:from-[#ff8c33] hover:to-[#f06300] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF7A1A]/20 transition-all duration-200 disabled:opacity-60 mt-2"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating Password...
                        </span>
                      ) : (
                        "Reset Password"
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                // ── Success State ─────────────────────────────────────────
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-center py-4"
                >
                  {/* Animated success icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                      Your password has been successfully updated. You can now log in with your new password.
                    </p>

                    <motion.button
                      id="go-to-login"
                      onClick={() => navigate("/admin/login")}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-gradient-to-r from-[#FF7A1A] to-[#e05a00] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF7A1A]/20 transition-all duration-200"
                    >
                      Go to Login →
                    </motion.button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
