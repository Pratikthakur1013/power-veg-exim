/**
 * Email Notification Service
 * Uses Nodemailer with Gmail SMTP to send transactional emails.
 *
 * SETUP: Add SMTP_USER and SMTP_PASS (Gmail App Password) to .env
 * Gmail App Password: https://myaccount.google.com/apppasswords
 */
import nodemailer from "nodemailer";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

function createTransporter() {
  const { SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("[EmailService] SMTP credentials not configured. Emails will be skipped.");
    return null;
  }

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  const transporter = createTransporter();
  if (!transporter) return;

  try {
    await transporter.sendMail({
      from: `"Power Veg Exim Security" <${process.env.SMTP_USER}>`,
      ...payload,
    });
    console.log(`[EmailService] Sent "${payload.subject}" to ${payload.to}`);
  } catch (err) {
    console.error("[EmailService] Failed to send email:", err);
    // Non-fatal — don't crash the request
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  max-width: 600px;
  margin: 0 auto;
  background: #0B1020;
  color: #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
`;

const HEADER_STYLE = `
  background: linear-gradient(135deg, #FF7A1A, #e05a00);
  padding: 24px 32px;
  text-align: center;
`;

const BODY_STYLE = `
  padding: 32px;
`;

const ALERT_STYLE = `
  background: rgba(255, 122, 26, 0.1);
  border: 1px solid rgba(255, 122, 26, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
`;

function emailWrapper(content: string): string {
  return `
    <div style="${BASE_STYLE}">
      <div style="${HEADER_STYLE}">
        <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">🌿 Power Veg Exim</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Admin Security Notification</p>
      </div>
      <div style="${BODY_STYLE}">
        ${content}
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="font-size:12px;color:#64748b;margin:0;">
          This is an automated security notification from Power Veg Exim admin system.<br/>
          If you did not perform this action, contact your system administrator immediately.
        </p>
      </div>
    </div>
  `;
}

// ─── Notification Functions ───────────────────────────────────────────────

export async function sendLoginNotification(opts: {
  to: string;
  name: string;
  ip: string;
  browser: string;
  os: string;
  country: string;
  timestamp: string;
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: "🔐 New Admin Login — Power Veg Exim",
    html: emailWrapper(`
      <h2 style="color:#FF7A1A;margin-top:0;">New Login Detected</h2>
      <p>Hello <strong>${opts.name}</strong>,</p>
      <p>A new login to the Power Veg Exim admin panel was detected.</p>
      <div style="${ALERT_STYLE}">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#94a3b8;width:120px;">Time</td><td style="color:#e2e8f0;">${opts.timestamp}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8;">IP Address</td><td style="color:#e2e8f0;">${opts.ip}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8;">Country</td><td style="color:#e2e8f0;">${opts.country}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8;">Browser</td><td style="color:#e2e8f0;">${opts.browser}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8;">OS</td><td style="color:#e2e8f0;">${opts.os}</td></tr>
        </table>
      </div>
      <p>If this was you, no action is needed. If this was not you, please reset your password immediately.</p>
    `),
  });
}

export async function sendPasswordChangedNotification(opts: {
  to: string;
  name: string;
  timestamp: string;
  ip: string;
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: "🔑 Password Changed — Power Veg Exim Admin",
    html: emailWrapper(`
      <h2 style="color:#FF7A1A;margin-top:0;">Password Successfully Changed</h2>
      <p>Hello <strong>${opts.name}</strong>,</p>
      <p>Your admin account password was successfully changed.</p>
      <div style="${ALERT_STYLE}">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#94a3b8;width:120px;">Time</td><td style="color:#e2e8f0;">${opts.timestamp}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8;">IP Address</td><td style="color:#e2e8f0;">${opts.ip}</td></tr>
        </table>
      </div>
      <p><strong style="color:#ef4444;">If you did not make this change, contact your developer immediately.</strong></p>
    `),
  });
}

export async function sendPasswordResetInitiated(opts: {
  to: string;
  name: string;
  maskedPhone: string;
  timestamp: string;
  ip: string;
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: "🔄 Password Reset Initiated — Power Veg Exim Admin",
    html: emailWrapper(`
      <h2 style="color:#FF7A1A;margin-top:0;">Password Reset Requested</h2>
      <p>Hello <strong>${opts.name}</strong>,</p>
      <p>A password reset was initiated for your admin account. A one-time verification code was sent to your registered recovery phone number ending in <strong>${opts.maskedPhone.slice(-4)}</strong>.</p>
      <div style="${ALERT_STYLE}">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#94a3b8;width:120px;">Time</td><td style="color:#e2e8f0;">${opts.timestamp}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8;">IP Address</td><td style="color:#e2e8f0;">${opts.ip}</td></tr>
        </table>
      </div>
      <p><strong style="color:#ef4444;">If you did not request this reset, your account may be at risk. Contact your developer immediately.</strong></p>
    `),
  });
}

export async function sendFailedAttemptsNotification(opts: {
  to: string;
  name: string;
  attempts: number;
  ip: string;
  timestamp: string;
}): Promise<void> {
  await sendEmail({
    to: opts.to,
    subject: "⚠️ Multiple Failed Login Attempts — Power Veg Exim Admin",
    html: emailWrapper(`
      <h2 style="color:#ef4444;margin-top:0;">⚠️ Security Alert: Failed Login Attempts</h2>
      <p>Hello <strong>${opts.name}</strong>,</p>
      <p>There have been <strong style="color:#ef4444;">${opts.attempts} failed login attempts</strong> on your admin account. The account has been temporarily locked.</p>
      <div style="${ALERT_STYLE}">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:4px 0;color:#94a3b8;width:120px;">Time</td><td style="color:#e2e8f0;">${opts.timestamp}</td></tr>
          <tr><td style="padding:4px 0;color:#94a3b8;">IP Address</td><td style="color:#e2e8f0;">${opts.ip}</td></tr>
        </table>
      </div>
      <p>If this was not you, someone may be attempting to access your admin account. Please reset your password immediately.</p>
    `),
  });
}
