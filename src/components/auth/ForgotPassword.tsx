import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from "react-hot-toast";
import { Mail, ArrowLeft, ShieldCheck, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordSchema } from "../../lib/validators";

/**
 * ForgotPassword — Step 1 of the password reset flow.
 * Admin enters their email → server validates → reset session created.
 * Navigates to /admin/verify-otp with the reset token.
 */
export default function ForgotPassword() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordSchema) => {
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.email }),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Request failed.");
      }

      // Store reset token in sessionStorage and localStorage (fallback for compatibility)
      if (json.data?.resetToken) {
        sessionStorage.setItem("pve_reset_token", json.data.resetToken);
        sessionStorage.setItem("pve_reset_expires", json.data.expiresAt || "");
        localStorage.setItem("pve_reset_token", json.data.resetToken);
        localStorage.setItem("pve_reset_expires", json.data.expiresAt || "");
      }

      toast.success("Identity verified successfully!", {
        duration: 4000,
        style: { background: "#1e293b", color: "#e2e8f0", borderRadius: "12px", border: "1px solid #10b981" },
      });

      setSuccess(true);
    } catch (err: any) {
      const msg = err.message || "Something went wrong. Please try again.";
      if (msg.includes("rate") || msg.includes("RATE_LIMIT")) {
        toast.error("Too many requests. Please wait before trying again.", {
          style: { background: "#1e293b", color: "#e2e8f0", borderRadius: "12px" },
        });
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
        {/* Back to login */}
        <Link
          to="/admin/login"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        {/* Card */}
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
                // ── Step 1: Email Input ──────────────────────────────────
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <div className="w-14 h-14 bg-[#FF7A1A]/15 border border-[#FF7A1A]/25 rounded-2xl flex items-center justify-center mb-4">
                      <ShieldCheck className="w-7 h-7 text-[#FF7A1A]" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Reset Password</h1>
                    <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                      Enter your admin email address to request a password reset session.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        Admin Email
                      </label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FF7A1A] transition-colors duration-200">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          {...register("email")}
                          type="email"
                          id="forgot-password-email"
                          placeholder="admin@powervegexim.com"
                          disabled={isSubmitting}
                          autoComplete="email"
                          className={`
                            w-full pl-11 pr-4 py-3.5
                            bg-white/[0.04] border rounded-xl text-white placeholder-slate-600
                            text-sm font-medium transition-all duration-200
                            focus:outline-none focus:ring-2
                            ${errors.email
                              ? "border-red-500/60 focus:ring-red-500/30"
                              : "border-white/10 focus:ring-[#FF7A1A]/30 focus:border-[#FF7A1A]/60"
                            }
                          `}
                        />
                      </div>
                      {errors.email && (
                        <p className="flex items-center gap-1.5 text-red-400 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      id="forgot-password-submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3.5 bg-gradient-to-r from-[#FF7A1A] to-[#e05a00] hover:from-[#ff8c33] hover:to-[#f06300] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF7A1A]/20 transition-all duration-200 disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Verifying Email...
                        </span>
                      ) : (
                        "Verify and Continue"
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                // ── Step 1 Success: Dedicated Option ────────────────────
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                    Your reset session is active and secure. Click below to create your new password.
                  </p>
                  
                  <motion.button
                    id="go-to-reset-password-page"
                    onClick={() => navigate("/admin/reset-password")}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3.5 bg-gradient-to-r from-[#FF7A1A] to-[#e05a00] hover:from-[#ff8c33] hover:to-[#f06300] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF7A1A]/20 transition-all duration-200"
                  >
                    Reset Password Now →
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
