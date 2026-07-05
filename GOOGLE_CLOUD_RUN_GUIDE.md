# 🚀 Deploying to Google Cloud Run (Containerized Production)

**Time to complete:** ~15 minutes  
**Cost:** Free tier covers up to 2 million requests/month (requires a billing account to activate APIs).

This project includes a multi-stage **Dockerfile** and a dedicated **`server-prod.ts`** production entrypoint. It runs a single high-performance container serving both your **Vite React frontend SPA** and your **Firestore-backed Express API**.

---

## Prerequisites

1. A Google Cloud account (get $300 free credits at [console.cloud.google.com](https://console.cloud.google.com)).
2. A Google Cloud project with **Billing enabled**.
3. Install the **Google Cloud CLI** on your PC ([Google Cloud CLI Installation Guide](https://cloud.google.com/sdk/docs/install)).

---

## Step 1 — Setup Google Cloud CLI & APIs

Open your terminal (PowerShell) and log in to your Google account:

```powershell
# 1. Log in to your Google Cloud account
gcloud auth login

# 2. List projects and set your active project
gcloud projects list
gcloud config set project YOUR_PROJECT_ID

# 3. Enable necessary Google Cloud services (Cloud Run, Cloud Build, and Container Registry)
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       containerregistry.googleapis.com
```

---

## Step 2 — Set Up Firestore & Storage (GCP Console)

Since Cloud Run containers are serverless and ephemeral, data is saved in **Google Cloud Firestore**.

1. In the GCP Console, search for **Firestore** and click **Create Database**.
2. Select **Native Mode** (recommended) and choose your region (e.g. `asia-south1` for Mumbai).
3. Set your Firestore rules (in the **Rules** tab of Firestore) to permit public reads on public content:
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
4. Search for **Cloud Storage** in the GCP Console, click **Create Bucket**, and configure public access. Make sure to apply Storage Rules allowing public reads:
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

## Step 3 — Generate Service Account Key (for Local / CLI admin tools)

To run the local Firestore admin bootstrap tool (`npm run setup:admin:firestore`), you need credentials.

1. Go to **IAM & Admin** → **Service Accounts** in your Google Cloud Console.
2. Click **Create Service Account** (name: `cloudbuild-admin`).
3. Grant it the role **Cloud Datastore Owner** (provides full Firestore access).
4. Click the newly created Service Account → **Keys** tab → **Add Key** → **Create new key** (JSON).
5. Open this downloaded JSON and copy the keys to your local `.env` file (see Step 5 below).

---

## Step 4 — Build and Deploy Container (2-line Deploy)

We build the Docker image in the cloud using Google Cloud Build (no local Docker installation needed) and deploy to Cloud Run:

```powershell
# 1. Submit your code to Google Cloud Build (creates the container image in Container Registry)
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/power-veg-exim

# 2. Deploy the container image to Cloud Run
gcloud run deploy power-veg-exim \
  --image gcr.io/YOUR_PROJECT_ID/power-veg-exim \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated
```

---

## Step 5 — Configure Cloud Run Environment Variables

Once deployed, you need to provide your API secrets and environment variables to the Cloud Run service.

1. In the Google Cloud Console, navigate to **Cloud Run** and click on your service `power-veg-exim`.
2. Click **Edit & Deploy New Revision**.
3. Under the **Variables** tab, add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Enables production static asset delivery |
| `JWT_SECRET` | (64 random hex characters) | Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `FIREBASE_PROJECT_ID` | `YOUR_PROJECT_ID` | Your GCP Project ID |
| `FIREBASE_CLIENT_EMAIL` | `cloudbuild-admin@...` | The service account email |
| `FIREBASE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\n...` | Service account private key (enclose in double quotes) |
| `FIREBASE_STORAGE_BUCKET` | `your-bucket-name.appspot.com` | Your Cloud Storage bucket name |
| `VITE_FIREBASE_API_KEY` | (client api key) | From your Firebase Web App configuration |
| `VITE_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` | From Web App config |
| `VITE_FIREBASE_PROJECT_ID` | `YOUR_PROJECT_ID` | From Web App config |
| `VITE_FIREBASE_STORAGE_BUCKET` | `your-bucket-name.appspot.com` | From Web App config |

4. Click **Deploy**. Your service will restart with the new variables active.

---

## Step 6 — Create your Admin Account

To log in to `/admin/login` on the live site, run the following setup script on your local machine:

1. Update your local `.env` with the service account keys (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`).
2. Run:
   ```powershell
   npm run setup:admin:firestore
   ```
3. Input your email, phone, and secure password. The utility will write the admin credentials straight to your live Firestore database.

---

## Step 7 — Set Up a Custom Domain (Optional)

To map a domain (e.g. `powervegexim.com`) directly to your Cloud Run container:

1. Go to **Cloud Run** → click your service `power-veg-exim` → **Integrations** tab.
2. Click **Add Integration** → Select **Custom domains (Global load balancer)**.
3. Enter your domain name and follow the DNS verification steps. Google will automatically provision an SSL certificate (HTTPS) for you.
