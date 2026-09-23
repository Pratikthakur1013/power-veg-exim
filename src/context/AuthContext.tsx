import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminInfo {
  id: string;
  email: string;
  full_name: string;
  role: "admin";
  last_login: string | null;
  recovery_phone_masked: string;
}

interface AuthContextValue {
  admin: AdminInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Constants ────────────────────────────────────────────────────────────────

/** Auto-logout after 30 minutes of inactivity (in ms) */
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

/** Refresh session every 25 minutes to keep it alive while active */
const SESSION_REFRESH_INTERVAL_MS = 25 * 60 * 1000;

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Inactivity Auto-Logout ──────────────────────────────────────────────

  const resetInactivityTimer = useCallback(() => {
    if (!admin) return;

    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);

    inactivityTimer.current = setTimeout(async () => {
      await performLogout();
      // Redirect to login with expired message
      window.location.href = "/admin/login?reason=inactivity";
    }, INACTIVITY_TIMEOUT_MS);
  }, [admin]);

  // Reset timer on user activity
  useEffect(() => {
    if (!admin) return;

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    const handler = () => resetInactivityTimer();

    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer(); // Start immediately

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [admin, resetInactivityTimer]);

  // ─── Session Refresh ─────────────────────────────────────────────────────

  const refreshSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        // Session expired — force logout
        setAdmin(null);
      }
    } catch {
      // Network error — keep state, try again later
    }
  }, []);

  useEffect(() => {
    if (!admin) return;

    refreshTimer.current = setInterval(refreshSession, SESSION_REFRESH_INTERVAL_MS);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [admin, refreshSession]);

  // ─── Boot: Check Existing Session ────────────────────────────────────────

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const { data } = await res.json();
          setAdmin(data);
        }
      } catch {
        // No session or network error — stay logged out
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, []);

  // ─── Login ────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string, rememberMe: boolean) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, rememberMe }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || "Login failed.");
    }

    setAdmin(json.data);
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────

  const performLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Proceed even if request fails
    }
    setAdmin(null);
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (refreshTimer.current) clearInterval(refreshTimer.current);
  }, []);

  const logout = useCallback(async () => {
    await performLogout();
    window.location.href = "/admin/login";
  }, [performLogout]);

  // ─── Context Value ────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    login,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
