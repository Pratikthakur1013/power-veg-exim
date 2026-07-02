/**
 * Admin Setup Script — ONE-TIME USE
 * 
 * Creates or updates the admin account in data/db.json with a bcrypt-hashed password.
 * 
 * USAGE:
 *   npx tsx src/utils/adminSetup.ts
 * 
 * Then follow the interactive prompts.
 */
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import readline from "readline";
import crypto from "crypto";

const CWD = process.cwd();
const DATA_DIR = path.join(CWD, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

function validatePassword(password: string): string | null {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (!/[A-Z]/.test(password)) return "Must contain at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Must contain at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Must contain at least one special character.";
  return null;
}

async function main() {
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║   Power Veg Exim — Admin Account Setup  ║");
  console.log("╚══════════════════════════════════════════╝\n");
  console.log("⚠️  This script creates the single admin account.");
  console.log("    Run this ONCE before first login.\n");

  const fullName = await ask("Admin Full Name: ");
  const email = await ask("Admin Email: ");
  const recoveryPhone = await ask("Recovery Phone (include country code, e.g. +919876543210): ");

  let password = "";
  while (true) {
    password = await ask("Admin Password: ");
    const error = validatePassword(password);
    if (error) {
      console.log(`\n❌ ${error}\n`);
      continue;
    }
    const confirm = await ask("Confirm Password: ");
    if (password !== confirm) {
      console.log("\n❌ Passwords do not match.\n");
      continue;
    }
    break;
  }

  rl.close();

  console.log("\n🔐 Hashing password (bcrypt cost 12)...");
  const password_hash = await bcrypt.hash(password, 12);

  // Read existing DB or create fresh
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  let db: any = {};
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    } catch {
      db = {};
    }
  }

  const adminRecord = {
    id: `admin-${crypto.randomUUID()}`,
    full_name: fullName,
    email: email.toLowerCase(),
    password_hash,
    recovery_phone: recoveryPhone,
    phone_verified: true,
    role: "admin" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null,
  };

  // Replace or create admins array
  if (!db.admins || db.admins.length === 0) {
    db.admins = [adminRecord];
  } else {
    // Update existing admin
    db.admins = [{ ...db.admins[0], ...adminRecord, id: db.admins[0].id }];
    console.log("ℹ️  Existing admin account updated.");
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");

  console.log("\n✅ Admin account created successfully!");
  console.log(`   Name:  ${fullName}`);
  console.log(`   Email: ${email.toLowerCase()}`);
  console.log(`   Phone: ${recoveryPhone}`);
  console.log("\n   You can now log in at http://localhost:3000/admin/login\n");
}

main().catch((err) => {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
});
