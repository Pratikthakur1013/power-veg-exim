/**
 * One-shot Firestore Admin Bootstrap
 *
 * Creates the admin account in Firestore (used on Vercel — no local db.json).
 *
 * USAGE (run locally with Firebase credentials set):
 *   Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in your .env
 *   then run: npx tsx scripts/setupAdminFirestore.ts
 *
 * The script will prompt you for name, email, phone, and password.
 */

import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import crypto from "crypto";
import readline from "readline";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ── Firebase Admin Init ───────────────────────────────────────────────────────

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error("\n❌ Missing Firebase Admin credentials in .env:");
  console.error("   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
  console.error(
    "\n   Get these from Firebase Console → Project Settings → Service Accounts → Generate new private key\n"
  );
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

// ── CLI Prompt Helpers ────────────────────────────────────────────────────────

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(q: string): Promise<string> {
  return new Promise((resolve) => rl.question(q, (a) => resolve(a.trim())));
}

function validatePassword(p: string): string | null {
  if (p.length < 12) return "Password must be at least 12 characters.";
  if (!/[A-Z]/.test(p)) return "Must contain at least one uppercase letter.";
  if (!/[a-z]/.test(p)) return "Must contain at least one lowercase letter.";
  if (!/[0-9]/.test(p)) return "Must contain at least one number.";
  if (!/[^A-Za-z0-9]/.test(p)) return "Must contain at least one special character.";
  return null;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║   Power Veg Exim — Firestore Admin Bootstrap    ║");
  console.log("╚══════════════════════════════════════════════════╝\n");
  console.log("✅ Firebase connected to project:", FIREBASE_PROJECT_ID);
  console.log("⚠️  This creates the admin account used for /admin/login\n");

  // Check if admin already exists
  const existingSnap = await db.collection("admins").limit(1).get();
  if (!existingSnap.empty) {
    const overwrite = await ask("⚠️  An admin already exists. Overwrite? (yes/no): ");
    if (overwrite.toLowerCase() !== "yes") {
      console.log("\n❌ Aborted. Existing admin not changed.\n");
      rl.close();
      return;
    }
    // Delete existing admin(s)
    const batch = db.batch();
    existingSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log("   ✓ Existing admin deleted.\n");
  }

  const fullName = await ask("Admin Full Name       : ");
  const email = await ask("Admin Email           : ");
  const recoveryPhone = await ask("Recovery Phone (+91…) : ");

  let password = "";
  while (true) {
    password = await ask("Admin Password        : ");
    const err = validatePassword(password);
    if (err) {
      console.log(`\n❌ ${err}\n`);
      continue;
    }
    const confirm = await ask("Confirm Password      : ");
    if (password !== confirm) {
      console.log("\n❌ Passwords do not match.\n");
      continue;
    }
    break;
  }

  rl.close();

  console.log("\n🔐 Hashing password (bcrypt cost 12)...");
  const password_hash = await bcrypt.hash(password, 12);

  const adminId = `admin-${crypto.randomUUID()}`;
  const adminRecord = {
    full_name: fullName,
    email: email.toLowerCase(),
    password_hash,
    recovery_phone: recoveryPhone,
    phone_verified: true,
    role: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: null,
  };

  await db.collection("admins").doc(adminId).set(adminRecord);

  console.log("\n✅ Admin account created in Firestore!");
  console.log(`   Name  : ${fullName}`);
  console.log(`   Email : ${email.toLowerCase()}`);
  console.log(`   Phone : ${recoveryPhone}`);
  console.log("\n   Login at: https://your-site.vercel.app/admin/login\n");
}

main().catch((err) => {
  console.error("\n❌ Setup failed:", err.message);
  process.exit(1);
});
