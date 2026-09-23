import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion } from "motion/react";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard — wraps all /admin/* routes (except login/forgot-password/verify-otp/reset-password).
 * Redirects to /admin/login if user is not authenticated.
 * Shows a premium loading skeleton while session is being verified.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin/login", {
        replace: true,
        state: { from: location.pathname },
      });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  // Premium loading skeleton while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#080C18] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          {/* Animated spinner */}
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-[#FF7A1A]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF7A1A] animate-spin" />
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">Verifying session...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
