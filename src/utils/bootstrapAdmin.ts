/**
 * One-shot admin bootstrap — non-interactive.
 * Reads the existing db.json, replaces the admin record with
 * a fully-formed secure record, and writes it back.
 * Run once: npx tsx src/utils/bootstrapAdmin.ts
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";

const DB_FILE = path.join(process.cwd(), "data", "db.json");

// Read existing DB
const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));

const adminRecord = {
  id: "admin-" + crypto.randomUUID(),
  full_name: "Power Veg Exim Admin",
  email: "admin@powervegexim.com",
  // bcrypt hash of: PowerVeg@2026!  (cost 12)
  password_hash: "$2b$12$j5bgT95Cc9z5WvIOhWF5iO2vQVGOxcA/ogQDcxu3FKO4q6PpCkfAu",
  recovery_phone: "+919890761639",
  phone_verified: true,
  role: "admin" as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  last_login: null,
};

db.admins = [adminRecord];
db.login_logs = db.login_logs || [];

fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");

console.log("✅ Admin account bootstrapped successfully!");
console.log("   Email   : admin@powervegexim.com");
console.log("   Password: PowerVeg@2026!");
console.log("   Login at: http://localhost:3000/admin/login");
