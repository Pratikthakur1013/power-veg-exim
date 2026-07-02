import React from "react";
import type { PasswordStrengthResult } from "../../types/auth";

/**
 * Compute password strength score and label.
 * Score: 0 (weak) → 4 (very strong)
 */
export function computePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return { level: "weak", score: 0, label: "Enter a password", color: "#475569" };
  }

  let score = 0;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(4, score);

  const levels: PasswordStrengthResult[] = [
    { level: "weak", score: 0, label: "Too weak", color: "#ef4444" },
    { level: "weak", score: 1, label: "Weak", color: "#f97316" },
    { level: "fair", score: 2, label: "Fair", color: "#eab308" },
    { level: "good", score: 3, label: "Good", color: "#22c55e" },
    { level: "strong", score: 4, label: "Strong", color: "#10b981" },
  ];

  return levels[score];
}

interface PasswordStrengthProps {
  password: string;
}

/**
 * Visual password strength meter with animated fill bars and label.
 */
export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label, color } = computePasswordStrength(password);

  const requirements = [
    { met: password.length >= 12, text: "12+ characters" },
    { met: /[A-Z]/.test(password), text: "Uppercase letter" },
    { met: /[a-z]/.test(password), text: "Lowercase letter" },
    { met: /[0-9]/.test(password), text: "Number" },
    { met: /[^A-Za-z0-9]/.test(password), text: "Special character (!@#$%^&*)" },
  ];

  return (
    <div className="mt-2 space-y-2">
      {/* Bar meter */}
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{
              backgroundColor: score >= level ? color : "rgba(100,116,139,0.25)",
            }}
          />
        ))}
      </div>

      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color }}>
          {label}
        </span>
        <span className="text-xs text-slate-500">{score}/4</span>
      </div>

      {/* Requirements checklist */}
      {password.length > 0 && (
        <ul className="grid grid-cols-2 gap-1 mt-1">
          {requirements.map((req) => (
            <li key={req.text} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: req.met ? "rgba(16,185,129,0.2)" : "rgba(100,116,139,0.15)",
                  border: `1px solid ${req.met ? "#10b981" : "rgba(100,116,139,0.3)"}`,
                }}
              >
                {req.met && (
                  <svg className="w-2 h-2" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span style={{ color: req.met ? "#94a3b8" : "#64748b" }}>{req.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
