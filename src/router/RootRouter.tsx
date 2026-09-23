import React, { Suspense, lazy, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../context/AuthContext";
import AuthGuard from "../pages/auth/AuthGuard";
import App from "../pages/HomePage";
// Lazy load AdminPanel and Auth pages to keep main site bundle lean
const AdminPanel = lazy(() => import("../pages/AdminPanel"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));

// ─── Admin Dashboard Page ─────────────────────────────────────────────────

function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  const loadData = () => {
    fetch("/api/public/data", { credentials: "include" })
      .then((r) => r.json())
      .then(setData)
      .catch(() =>
        setData({
          products: [],
          gallery: [],
          certifications: [],
          countries: [],
          company_profile: {},
          website_settings: {},
        })
      );
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080C18] flex items-center justify-center">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-[#FF7A1A]/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF7A1A] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080C18] flex items-center justify-center">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-[#FF7A1A]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF7A1A] animate-spin" />
          </div>
        </div>
      }
    >
      <AdminPanel
        onClose={() => window.location.href = "/"}
        publicData={data}
        onRefreshData={loadData}
      />
    </Suspense>
  );
}

// ─── Root Router ──────────────────────────────────────────────────────────

/**
 * RootRouter — Top-level router for the entire Power Veg Exim application.
 *
 * Public routes:
 *   /                         → Main marketing site (existing App.tsx)
 *   /admin/login              → Admin login page
 *   /admin/forgot-password    → Step 1: email verification
 *   /admin/verify-otp         → Step 2: OTP verification
 *   /admin/reset-password     → Step 3: new password
 *
 * Protected routes (require valid JWT session):
 *   /admin                    → Admin dashboard
 *   /admin/*                  → All admin sub-routes
 */
export default function RootRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public Routes ─────────────────────────────────────────── */}
          <Route path="/" element={<App />} />

          {/* Auth pages — accessible without login */}
          <Route path="/admin/login" element={
            <Suspense fallback={<div className="min-h-screen bg-[#080C18] flex items-center justify-center"><div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-2 border-[#FF7A1A]/20" /><div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF7A1A] animate-spin" /></div></div>}>
              <LoginPage />
            </Suspense>
          } />
          <Route path="/admin/forgot-password" element={
            <Suspense fallback={<div className="min-h-screen bg-[#080C18] flex items-center justify-center"><div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-2 border-[#FF7A1A]/20" /><div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF7A1A] animate-spin" /></div></div>}>
              <ForgotPassword />
            </Suspense>
          } />
          <Route path="/admin/reset-password" element={
            <Suspense fallback={<div className="min-h-screen bg-[#080C18] flex items-center justify-center"><div className="relative w-10 h-10"><div className="absolute inset-0 rounded-full border-2 border-[#FF7A1A]/20" /><div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#FF7A1A] animate-spin" /></div></div>}>
              <ResetPassword />
            </Suspense>
          } />

          {/* ── Protected Admin Routes ────────────────────────────────── */}
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <AdminDashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AuthGuard>
                <AdminDashboard />
              </AuthGuard>
            }
          />

          {/* Catch-all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
