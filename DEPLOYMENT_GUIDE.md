# 🚀 Power Veg Exim — Deployment Guide (Vercel + Firebase)

**Time to complete:** ~20 minutes  
**Cost:** Free (Vercel Hobby + Firebase Spark plan)

---

## Overview

```
Your PC (GitHub push) → Vercel (auto-deploy)
                            ├── Frontend: React SPA (static files)
                            ├── Backend: Express → Vercel Serverless Function
                            └── Database: Google Firestore (cloud)
```

---

## PART 1 — Firebase Setup (database & file storage)

Firebase is the cloud database that replaces the local `data/db.json` file.

### 1.1 Create a Firebase Project

1. Go to **https://console.firebase.google.com**
2. Click **"Add project"**
3. Name it: `power-veg-exim` (or anything)
4. Disable Google Analytics (not needed) → **Create project**

---

### 1.2 Enable Firestore Database

1. In your Firebase project, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select region: **`asia-south1` (Mumbai)** → click **"Enable"**

---

### 1.3 Set Firestore Security Rules

In Firestore → **Rules** tab, paste this and click Publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{id}       { allow read: if true; allow write: if false; }
    match /gallery/{id}        { allow read: if true; allow write: if false; }
    match /certifications/{id} { allow read: if true; allow write: if false; }
    match /countries/{id}      { allow read: if true; allow write: if false; }
    match /settings/{id}       { allow read: if true; allow write: if false; }
    match /{document=**}       { allow read, write: if false; }
  }
}
```

---

### 1.4 Enable Firebase Storage (for image/PDF uploads)

1. Click **"Storage"** in the left sidebar → **"Get started"**
2. Start in production mode → select region → **"Done"**
3. Go to **Rules** tab in Storage and paste, then Publish:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

### 1.5 Generate Firebase Admin SDK Key (for your server)

1. Firebase Console → **Project Settings** (gear icon) → **Service Accounts** tab
2. Click **"Generate new private key"** → **"Generate Key"**
3. A JSON file downloads — **NEVER commit this file to git**
4. From the JSON, note these 3 values:
   - `"project_id"` → `FIREBASE_PROJECT_ID`
   - `"client_email"` → `FIREBASE_CLIENT_EMAIL`
   - `"private_key"` → `FIREBASE_PRIVATE_KEY`

---

### 1.6 Get Firebase Client Config (for the browser)

1. Firebase Console → **Project Settings** → **General** tab → **"Your apps"**
2. Click **"Add app"** → Web (`</>` icon)
3. Register app (nickname: `power-veg-web`) → copy the config object values

---

## PART 2 — GitHub Setup

### 2.1 Create a GitHub Repository

1. Go to **https://github.com/new**
2. Name: `power-veg-exim` → set to **Private** → **Create repository**

### 2.2 Push Your Code

Open PowerShell in `F:\power-veg-exim (1)\` and run:

```powershell
git init
git add .
git commit -m "Initial commit — Power Veg Exim"
git remote add origin https://github.com/YOUR_USERNAME/power-veg-exim.git
git branch -M main
git push -u origin main
```

> ✅ `.gitignore` already excludes `.env`, `data/db.json`, and `node_modules`.

---

## PART 3 — Vercel Deployment

### 3.1 Connect to Vercel

1. Go to **https://vercel.com** → sign up/login with GitHub
2. Click **"Add New Project"** → Import `power-veg-exim`
3. Leave framework settings as-is
4. **DO NOT click Deploy yet** — add environment variables first

### 3.2 Set Environment Variables in Vercel

Add all of the following in the Vercel project setup → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | (64 random hex chars — run: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `FIREBASE_PROJECT_ID` | from Admin SDK JSON |
| `FIREBASE_CLIENT_EMAIL` | from Admin SDK JSON |
| `FIREBASE_PRIVATE_KEY` | from Admin SDK JSON (paste full value with BEGIN/END lines) |
| `FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_API_KEY` | from Firebase Client Config |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | from Firebase Client Config |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | from Firebase Client Config |
| `VITE_FIREBASE_APP_ID` | from Firebase Client Config |
| `SMTP_USER` | your Gmail (optional, for email alerts) |
| `SMTP_PASS` | Gmail App Password (optional) |
| `ADMIN_NOTIFICATION_EMAIL` | admin email (optional) |

> ⚠️ For `FIREBASE_PRIVATE_KEY`: paste the raw value — Vercel handles newlines automatically.

### 3.3 Deploy

Click **"Deploy"**. After ~1 minute your site will be live at:  
`https://power-veg-exim-abc123.vercel.app`

---

## PART 4 — Create Admin Account in Firestore

After first deploy, run this **once** from your PC to create the admin login:

### 4.1 Fill in `.env` with Firebase credentials

Open `F:\power-veg-exim (1)\.env` and fill in the `FIREBASE_*` values.

### 4.2 Run the setup script

```powershell
npm run setup:admin:firestore
```

Follow prompts → enter your name, email, phone, and password.  
This writes the admin account directly into Firestore.

---

## PART 5 — Test Your Live Site

1. Visit `https://your-site.vercel.app` → homepage loads with product data
2. Visit `/admin/login` → log in with the credentials from Step 4
3. Submit a test inquiry → check Firestore Console → `inquiries` collection ✅

---

## PART 6 — Custom Domain (optional)

1. Buy a domain (e.g. `powervegexim.com`)
2. Vercel → your project → **Domains** → **"Add Domain"**
3. Enter your domain → Vercel shows DNS records to configure
4. Add those records in your domain registrar
5. Wait 10–30 minutes → domain is live with HTTPS ✅

---

## Quick Commands

```powershell
# Development (local)
npm run dev

# Test production build locally
npm run build:vercel

# Create admin in Firestore (run once)
npm run setup:admin:firestore

# Deploy update (auto-triggers Vercel build)
git add . && git commit -m "update" && git push
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Data doesn't appear on live site | Vercel dashboard → Functions tab → check API logs |
| Admin login fails | Re-run `npm run setup:admin:firestore` |
| Image uploads fail | Ensure `FIREBASE_STORAGE_BUCKET` is set in Vercel env vars |
| `FIREBASE_PRIVATE_KEY` error | Paste the raw key value — Vercel handles `\n` automatically |
| Build fails | Check Vercel build logs — usually a missing env var |
