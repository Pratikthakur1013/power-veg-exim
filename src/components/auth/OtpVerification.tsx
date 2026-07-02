import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from "react-hot-toast";
import { Phone, ArrowLeft, RefreshCw, Loader2, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import { firebaseAuth } from "../../lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const MAX_ATTEMPTS = 5;

/**
 * OTP Verification — Step 2 of the password reset flow.
 *
 * Flow:
 * 1. Retrieve recovery phone from server using the stored resetToken
 * 2. Trigger Firebase Phone Auth (sends SMS OTP)
 * 3. User enters OTP
 * 4. Firebase confirms → sends idToken to server for verification
 * 5. Server verifies → navigate to reset-password
 */
export default function OtpVerification() {
  const navigate = useNavigate();

  // Reset token from sessionStorage
  const resetToken = sessionStorage.getItem("pve_reset_token");

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Guard: no reset token ───────────────────────────────────────────────

  useEffect(() => {
    if (!resetToken) {
      toast.error("No active reset session. Please start over.");
      navigate("/admin/forgot-password", { replace: true });
    }
  }, [resetToken, navigate]);

  // ─── Countdown Timer ─────────────────────────────────────────────────────

  const startTimer = useCallback(() => {
    setTimeLeft(OTP_EXPIRY_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ─── Initialize reCAPTCHA + Send OTP ────────────────────────────────────

  const sendOtp = useCallback(async () => {
    if (!resetToken || isSendingOtp) return;

    setIsSendingOtp(true);
    setError("");

    try {
      // Step 1: Get recovery phone from server
      const phoneRes = await fetch("/api/auth/get-recovery-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resetToken }),
      });

      const phoneJson = await phoneRes.json();
      if (!phoneJson.success) {
        throw new Error(phoneJson.error || "Failed to retrieve recovery phone.");
      }

      setMaskedPhone(phoneJson.data.maskedPhone);
      const recoveryPhone: string = phoneJson.data.phone;

      // Check if Firebase is configured in env
      const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

      if (!isFirebaseConfigured) {
        // Fallback for Development/Demo mode
        setTimeout(() => {
          setOtpSent(true);
          setIsSendingOtp(false);
          startTimer();
          toast.success("Demo Mode: OTP sent! Enter '123456' to verify.", {
            duration: 8000,
            style: { background: "#1e293b", color: "#e2e8f0", borderRadius: "12px", border: "1px solid #FF7A1A" },
          });
        }, 1000);
        return;
      }

      // Step 2: Initialize Firebase RecaptchaVerifier (invisible)
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
      }

      recaptchaVerifierRef.current = new RecaptchaVerifier(
        firebaseAuth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved — proceed with OTP
          },
          "expired-callback": () => {
            setError("reCAPTCHA expired. Please try again.");
          },
        }
      );

      // Step 3: Trigger Firebase Phone Auth
      const result = await signInWithPhoneNumber(firebaseAuth, recoveryPhone, recaptchaVerifierRef.current);
      setConfirmationResult(result);
      setOtpSent(true);
      startTimer();

      toast.success(`OTP sent to ${phoneJson.data.maskedPhone}`, {
        style: { background: "#1e293b", color: "#e2e8f0", borderRadius: "12px" },
      });

      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      console.error("[OTP] Send error:", err);
      const msg = err.message || "Failed to send OTP. Please try again.";

      if (msg.includes("rate") || msg.includes("TOO_MANY")) {
        setError("Too many OTP requests. Please wait 1 hour before requesting again.");
      } else if (msg.includes("INVALID_PHONE")) {
        setError("The registered recovery phone number is invalid. Please contact your developer.");
      } else {
        setError(msg);
      }
    } finally {
      setIsSendingOtp(false);
    }
  }, [resetToken, isSendingOtp, startTimer]);

  // Auto-send OTP on mount
  useEffect(() => {
    if (resetToken) {
      sendOtp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── OTP Input Handlers ─────────────────────────────────────────────────

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return; // Only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (value && index === 5 && newOtp.every((d) => d !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      const newOtp = pasted.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      handleVerify(pasted);
    }
  };

  // ─── Verify OTP ─────────────────────────────────────────────────────────

  const handleVerify = async (otpValue?: string) => {
    const code = otpValue || otp.join("");
    if (code.length !== 6) return;

    if (attempts >= MAX_ATTEMPTS) {
      setError("Maximum attempts exceeded. Please restart the password reset process.");
      return;
    }

    setIsLoading(true);
    setError("");

    const isFirebaseConfigured = !!import.meta.env.VITE_FIREBASE_API_KEY;

    try {
      if (!isFirebaseConfigured) {
        // Fallback for Development/Demo mode validation
        if (code === "123456") {
          const res = await fetch("/api/auth/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ resetToken, firebaseIdToken: "mock-otp-token-123456" }),
          });

          const json = await res.json();
          if (!json.success) {
            setAttempts((a) => a + 1);
            throw new Error(json.error || "OTP verification failed.");
          }

          toast.success("Demo OTP verified successfully!", {
            style: { background: "#1e293b", color: "#e2e8f0", borderRadius: "12px" },
          });

          navigate("/admin/reset-password");
        } else {
          setAttempts((a) => a + 1);
          throw new Error(`Incorrect demo OTP. Enter '123456'.`);
        }
        return;
      }

      // Standard Firebase verification path
      if (!confirmationResult) {
        throw new Error("Verification session not initialized. Please request a new OTP.");
      }

      // Step 1: Confirm OTP with Firebase
      const credential = await confirmationResult.confirm(code);
      const idToken = await credential.user.getIdToken();

      // Step 2: Send Firebase ID token to server for verification
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resetToken, firebaseIdToken: idToken }),
      });

      const json = await res.json();

      if (!json.success) {
        setAttempts((a) => a + 1);
        throw new Error(json.error || "OTP verification failed.");
      }

      // ✅ OTP verified — navigate to password reset
      toast.success("OTP verified successfully!", {
        style: { background: "#1e293b", color: "#e2e8f0", borderRadius: "12px" },
      });

      navigate("/admin/reset-password");
    } catch (err: any) {
      setAttempts((a) => a + 1);
      const remaining = MAX_ATTEMPTS - (attempts + 1);

      if (err.code === "auth/invalid-verification-code") {
        setError(`Incorrect OTP. ${remaining > 0 ? `${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.` : "No attempts remaining."}`);
      } else if (err.code === "auth/code-expired") {
        setError("OTP has expired. Please request a new one.");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }

      // Clear inputs on wrong OTP
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = timeLeft === 0 && otpSent;
  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const isLocked = attemptsLeft <= 0;

  return (
    <div className="min-h-screen bg-[#080C18] flex items-center justify-center p-4 relative overflow-hidden">
      <Toaster position="top-right" />

      {/* Background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF7A1A] rounded-full opacity-[0.04] blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-80 h-80 bg-[#FF7A1A] rounded-full opacity-[0.06] blur-3xl" />
      </div>

      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" ref={recaptchaContainerRef} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <Link
          to="/admin/forgot-password"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div
          className="rounded-2xl border border-white/[0.08] overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#FF7A1A] to-transparent" />

          <div className="p-8 sm:p-10">
            {/* Header */}
            <div className="mb-8">
              <div className="w-14 h-14 bg-[#FF7A1A]/15 border border-[#FF7A1A]/25 rounded-2xl flex items-center justify-center mb-4">
                <Phone className="w-7 h-7 text-[#FF7A1A]" />
              </div>
              <h1 className="text-2xl font-bold text-white">Verify Your Identity</h1>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                {otpSent
                  ? `Enter the 6-digit code sent to ${maskedPhone}`
                  : "Sending a 6-digit code to your recovery phone..."}
              </p>
            </div>

            {/* Locked state */}
            {isLocked ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-red-500/15 border border-red-500/25 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-white font-bold text-lg mb-2">Too Many Attempts</h2>
                <p className="text-slate-400 text-sm mb-6">Maximum incorrect attempts reached. Please restart the process.</p>
                <Link
                  to="/admin/forgot-password"
                  className="w-full py-3.5 bg-gradient-to-r from-[#FF7A1A] to-[#e05a00] text-white font-bold text-sm rounded-xl shadow-lg inline-block text-center"
                >
                  Start Over
                </Link>
              </div>
            ) : (
              <>
                {/* OTP Inputs */}
                <div className="flex gap-2 sm:gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isLoading || isSendingOtp || isExpired}
                      id={`otp-digit-${index}`}
                      className={`
                        w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold text-white
                        bg-white/[0.05] border rounded-xl
                        transition-all duration-200 focus:outline-none focus:ring-2
                        ${digit ? "border-[#FF7A1A]/60 bg-[#FF7A1A]/10" : "border-white/10"}
                        ${error ? "border-red-500/60" : "focus:ring-[#FF7A1A]/30 focus:border-[#FF7A1A]/60"}
                        disabled:opacity-50 disabled:cursor-not-allowed
                        caret-transparent
                      `}
                    />
                  ))}
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2 text-red-400 text-sm mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Timer + Resend */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {otpSent && !isExpired ? (
                      <>
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm text-slate-400">
                          Expires in{" "}
                          <span className={`font-bold font-mono ${timeLeft <= 60 ? "text-red-400" : "text-emerald-400"}`}>
                            {formatTime(timeLeft)}
                          </span>
                        </span>
                      </>
                    ) : otpSent && isExpired ? (
                      <span className="text-sm text-red-400 font-medium">OTP expired</span>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    id="resend-otp"
                    onClick={sendOtp}
                    disabled={isSendingOtp || (!isExpired && timeLeft > 0)}
                    className="flex items-center gap-1.5 text-sm font-semibold text-[#FF7A1A] hover:text-orange-400 transition-colors disabled:text-slate-600 disabled:cursor-not-allowed"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Resend OTP
                  </button>
                </div>

                {/* Attempts remaining */}
                {attempts > 0 && (
                  <p className="text-xs text-slate-500 text-center mb-4">
                    {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
                  </p>
                )}

                {/* Verify Button */}
                <motion.button
                  type="button"
                  id="verify-otp-submit"
                  onClick={() => handleVerify()}
                  disabled={isLoading || otp.join("").length !== 6 || isExpired || isSendingOtp}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3.5 bg-gradient-to-r from-[#FF7A1A] to-[#e05a00] hover:from-[#ff8c33] hover:to-[#f06300] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#FF7A1A]/20 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Verifying...
                    </span>
                  ) : (
                    "Verify Code"
                  )}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
