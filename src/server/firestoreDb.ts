/**
 * Firestore Database Layer
 * Drop-in replacement for the local db.json file-based store.
 * 
 * Each top-level key in db.json becomes a Firestore collection,
 * except scalar objects (website_settings, company_profile) which
 * are stored as a single document in a "settings" collection.
 *
 * Collections:
 *   products            → /products/{id}
 *   gallery             → /gallery/{id}
 *   certifications      → /certifications/{id}
 *   countries           → /countries/{id}
 *   inquiries           → /inquiries/{id}
 *   admins              → /admins/{id}
 *   login_logs          → /login_logs/{id}
 *   settings            → /settings/website_settings
 *                         /settings/company_profile
 *
 * USAGE:
 *   import { firestoreDb } from './firestoreDb.js'
 *   const products = await firestoreDb.getCollection('products')
 *   await firestoreDb.setDocument('products', item.id, item)
 *   await firestoreDb.deleteDocument('products', id)
 */

import { getApps, getApp, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from './firebaseAdmin.js';

// ── Singleton Firestore instance ─────────────────────────────────────────────

let _db: Firestore | null = null;

function getDb(): Firestore {
  if (_db) return _db;

  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error(
      '[FirestoreDb] Firebase Admin SDK not initialized. ' +
      'Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY in your environment.'
    );
  }

  _db = getFirestore(app);
  return _db;
}

// ── Default seed data (mirrors INITIAL_DB in server.ts) ──────────────────────

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Fresh Red Onion',
    sizeRange: '45mm - 60mm',
    packaging: '10kg, 20kg, 40kg Mesh Bags',
    shelfLife: 'Up to 6 Months (under optimal storage)',
    availability: 'Year-Round (Peak: Jan - June & Oct - Dec)',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80',
    description: 'Premium quality red onions prized for their magnificent color, long shelf life, and balanced water content. Handpicked directly from top growers of Nashik.'
  },
  {
    id: 'prod-2',
    name: 'Premium Export Grade Onion',
    sizeRange: '55mm - 80mm',
    packaging: '20kg & 40kg Ventilated Mesh Bags',
    shelfLife: 'Up to 6 Months',
    availability: 'Year-Round',
    imageUrl: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80',
    description: 'Strictly graded double-skin onions selected specifically for overseas maritime transit. Excellent pungency and shape uniformity.'
  },
  {
    id: 'prod-3',
    name: 'Small Size Onion (Golta)',
    sizeRange: '25mm - 35mm',
    packaging: '10kg & 20kg Red Mesh Bags',
    shelfLife: 'Up to 5 Months',
    availability: 'Year-Round',
    imageUrl: 'https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?auto=format&fit=crop&w=800&q=80',
    description: 'Premium baby red onions (Golta) with a highly concentrated pungent aroma. Exceptionally popular in Bangladesh, Nepal, and Sri Lanka markets.'
  },
  {
    id: 'prod-4',
    name: 'Medium Size Onion (Golti)',
    sizeRange: '35mm - 45mm',
    packaging: '10kg, 20kg, 40kg Mesh Bags',
    shelfLife: 'Up to 6 Months',
    availability: 'Year-Round',
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80',
    description: 'Medium-sized export-grade onions perfect for packing in retail cases or supermarkets. Firm, healthy stock, highly customizable packaging.'
  },
  {
    id: 'prod-5',
    name: 'Large Size Onion',
    sizeRange: '60mm - 90mm',
    packaging: '5kg & 10kg Bags or Cartons',
    shelfLife: 'Up to 5 Months',
    availability: 'Feb - July',
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80',
    description: 'Jumbo selected red onions primarily customized for Middle East and supermarket segments seeking bold visual presence and mild savory sweet flavor.'
  }
];

const DEFAULT_GALLERY = [
  { id: 'gal-1', imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80', title: 'Harvesting Red Onions', category: 'Farms' },
  { id: 'gal-2', imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80', title: 'Pristine Sorted Onions', category: 'Onions' },
  { id: 'gal-3', imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80', title: 'Global Shipping Containers', category: 'Logistics' },
  { id: 'gal-4', imageUrl: 'https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=800&q=80', title: 'Vessel Heading Abroad', category: 'Logistics' },
  { id: 'gal-5', imageUrl: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80', title: 'Sorting at Pimpalgaon Hub', category: 'Farms' },
  { id: 'gal-6', imageUrl: 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80', title: 'Premium Packaging Line', category: 'Onions' }
];

const DEFAULT_CERTIFICATIONS = [
  { id: 'cert-1', name: 'APEDA Registered Exporter', description: 'Agricultural and Processed Food Products Export Development Authority registration, certifying full quality adherence for global agricultural items.' },
  { id: 'cert-2', name: 'Import Export Code (IEC)', description: 'Registered directly with the Ministry of Commerce & Industry, Government of India, certifying clear international trading credentials.' },
  { id: 'cert-3', name: 'FSSAI Certified', description: 'Food Safety and Standards Authority of India certified packing operations, guaranteeing absolute food safety, pest-free environments, and sanitization.' }
];

const DEFAULT_COUNTRIES = [
  { id: 'cnt-1', name: 'Malaysia', flag: '🇲🇾', description: 'Vast importer of medium-size Nashik onions with customizable loose packing options.' },
  { id: 'cnt-2', name: 'UAE & Middle East', flag: '🇦🇪', description: 'Premium jumbo large red onions delivered highly optimized for supermarket displays.' },
  { id: 'cnt-3', name: 'Bangladesh', flag: '🇧🇩', description: 'High volume daily logistics dispatch of Golta & Golti onions via land border rail/truck routes.' },
  { id: 'cnt-4', name: 'Sri Lanka', flag: '🇱🇰', description: 'Strong maritime shipping pipeline of premium red onions with optimized dry packing ventilations.' },
  { id: 'cnt-5', name: 'Nepal', flag: '🇳🇵', description: 'Border-side farm collection point dispatch directly from Lasalgaon to major cities.' },
  { id: 'cnt-6', name: 'Singapore', flag: '🇸🇬', description: 'Strict grading criteria onions arriving via cold-chain maritime vessel with high shelf-life security.' }
];

const DEFAULT_WEBSITE_SETTINGS = {
  logoUrl: '',
  whatsappNumber: '+919890761639',
  email: 'export@powervegexim.com',
  phone: '+91 98907 61639',
  address: 'Lasalgaon Road, Pimpalgaon Baswant, Nashik, Maharashtra, India - 422209',
  bannerTitle: 'PREMIUM NASHIK ONIONS EXPORTED WORLDWIDE',
  bannerSubtitle: "Sourcing the finest quality red onions directly from Nashik's fertile farms. We deliver export-grade onions to global markets with unmatched logistics efficiency.",
  facebookUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  twitterUrl: ''
};

const DEFAULT_COMPANY_PROFILE = {
  pdfUrl: '',
  fileName: 'PowerVegExim_Company_Profile.pdf',
  updatedAt: '2026-06-16T12:00:00Z'
};

// ── Core CRUD helpers ────────────────────────────────────────────────────────

/**
 * Get all documents from a collection as an array.
 */
async function getCollection(collection: string): Promise<any[]> {
  const db = getDb();
  const snapshot = await db.collection(collection).get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Get a single document by ID.
 */
async function getDocument(collection: string, id: string): Promise<any | null> {
  const db = getDb();
  const doc = await db.collection(collection).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Set (create or overwrite) a document.
 */
async function setDocument(collection: string, id: string, data: any): Promise<void> {
  const db = getDb();
  const { id: _id, ...rest } = data; // strip id from stored data
  await db.collection(collection).doc(id).set(rest, { merge: false });
}

/**
 * Update (partial merge) a document.
 */
async function updateDocument(collection: string, id: string, data: any): Promise<void> {
  const db = getDb();
  const { id: _id, ...rest } = data;
  await db.collection(collection).doc(id).set(rest, { merge: true });
}

/**
 * Delete a document.
 */
async function deleteDocument(collection: string, id: string): Promise<void> {
  const db = getDb();
  await db.collection(collection).doc(id).delete();
}

/**
 * Add a document (auto-ID). Returns the new document ID.
 */
async function addDocument(collection: string, data: any): Promise<string> {
  const db = getDb();
  const { id: _id, ...rest } = data;
  const ref = await db.collection(collection).add(rest);
  return ref.id;
}

// ── High-level DB API (matches old readDb()/writeDb() patterns) ──────────────

/**
 * Seed all default data into Firestore (only adds if collection is empty).
 * Call this once on first deploy.
 */
async function seedIfEmpty(): Promise<void> {
  const db = getDb();

  const collections = [
    { name: 'products', data: DEFAULT_PRODUCTS },
    { name: 'gallery', data: DEFAULT_GALLERY },
    { name: 'certifications', data: DEFAULT_CERTIFICATIONS },
    { name: 'countries', data: DEFAULT_COUNTRIES },
  ];

  for (const { name, data } of collections) {
    const snap = await db.collection(name).limit(1).get();
    if (snap.empty) {
      const batch = db.batch();
      for (const item of data) {
        const { id, ...rest } = item;
        batch.set(db.collection(name).doc(id), rest);
      }
      await batch.commit();
      console.log(`[FirestoreDb] Seeded collection: ${name}`);
    }
  }

  // Seed settings
  const wsSnap = await db.collection('settings').doc('website_settings').get();
  if (!wsSnap.exists) {
    await db.collection('settings').doc('website_settings').set(DEFAULT_WEBSITE_SETTINGS);
    console.log('[FirestoreDb] Seeded settings: website_settings');
  }

  const cpSnap = await db.collection('settings').doc('company_profile').get();
  if (!cpSnap.exists) {
    await db.collection('settings').doc('company_profile').set(DEFAULT_COMPANY_PROFILE);
    console.log('[FirestoreDb] Seeded settings: company_profile');
  }
}

/**
 * Get website settings document.
 */
async function getWebsiteSettings(): Promise<any> {
  const db = getDb();
  const doc = await db.collection('settings').doc('website_settings').get();
  if (!doc.exists) return DEFAULT_WEBSITE_SETTINGS;
  return doc.data();
}

/**
 * Update website settings (partial merge).
 */
async function updateWebsiteSettings(data: Partial<typeof DEFAULT_WEBSITE_SETTINGS>): Promise<any> {
  const db = getDb();
  await db.collection('settings').doc('website_settings').set(data, { merge: true });
  return getWebsiteSettings();
}

/**
 * Get company profile document.
 */
async function getCompanyProfile(): Promise<any> {
  const db = getDb();
  const doc = await db.collection('settings').doc('company_profile').get();
  if (!doc.exists) return DEFAULT_COMPANY_PROFILE;
  return doc.data();
}

/**
 * Set company profile document.
 */
async function setCompanyProfile(data: any): Promise<void> {
  const db = getDb();
  await db.collection('settings').doc('company_profile').set(data, { merge: false });
}

/**
 * Add a login log entry. Keeps only last 500.
 */
async function addLoginLog(log: any): Promise<void> {
  const db = getDb();
  await db.collection('login_logs').doc(log.id).set(log);
  // Trim to last 500 (async, best-effort — no blocking)
  trimLoginLogs().catch(() => {});
}

async function trimLoginLogs(): Promise<void> {
  const db = getDb();
  const snap = await db.collection('login_logs').orderBy('timestamp', 'desc').offset(500).get();
  if (snap.empty) return;
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
}

/**
 * Get login logs (newest first, limit 100).
 */
async function getLoginLogs(limit = 100): Promise<any[]> {
  const db = getDb();
  const snap = await db.collection('login_logs').orderBy('timestamp', 'desc').limit(limit).get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ── Admin helpers ────────────────────────────────────────────────────────────

async function getAdminByEmail(email: string): Promise<any | null> {
  const db = getDb();
  const snap = await db.collection('admins')
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

async function getAdminById(id: string): Promise<any | null> {
  return getDocument('admins', id);
}

async function updateAdmin(id: string, data: any): Promise<void> {
  return updateDocument('admins', id, data);
}

/**
 * Get recent consecutive login failures for lockout check.
 */
async function getRecentLoginEvents(adminId: string, limit = 10): Promise<any[]> {
  const db = getDb();
  const snap = await db.collection('login_logs')
    .where('admin_id', '==', adminId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();
  return snap.docs.map(doc => doc.data());
}

// ── Named export ─────────────────────────────────────────────────────────────

export const firestoreDb = {
  // Generic CRUD
  getCollection,
  getDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  addDocument,

  // Domain-specific
  getWebsiteSettings,
  updateWebsiteSettings,
  getCompanyProfile,
  setCompanyProfile,
  addLoginLog,
  getLoginLogs,

  // Admin
  getAdminByEmail,
  getAdminById,
  updateAdmin,
  getRecentLoginEvents,

  // Seeding
  seedIfEmpty,
};
