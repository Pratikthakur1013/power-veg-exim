/**
 * Vercel Serverless API Handler
 * 
 * This file exports the Express app for use as a Vercel Serverless Function.
 * All /api/* requests are routed here via vercel.json.
 *
 * Key differences from server.ts (dev server):
 *  - No Vite middleware (Vite builds static files separately)
 *  - No filesystem DB (uses Firestore)
 *  - No disk-based multer (uses in-memory + Firebase Storage)
 *  - No app.listen() — Vercel calls the handler per-request
 */

// ⚠️ Load .env FIRST in local dev
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';

import { globalRateLimiter } from '../src/server/rateLimiter.js';
import { requireAuth } from '../src/server/authMiddleware.js';
import authRoutesFactory from '../src/server/routes/authRoutesFirestore.js';
import { firestoreDb } from '../src/server/firestoreDb.js';
import { uploadToFirebaseStorage } from '../src/server/firebaseStorage.js';

const app = express();

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://www.gstatic.com',
        'https://apis.google.com',
        'https://translate.google.com',
        'https://translate.googleapis.com',
        'https://translate-pa.googleapis.com',
      ],
      frameSrc: [
        "'self'",
        'https://www.google.com',
        'https://accounts.google.com',
        'https://translate.google.com',
        'https://translate.googleapis.com',
        'https://translate.googleusercontent.com',
      ],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:', 'https://www.gstatic.com', 'https://translate.googleapis.com'],
      connectSrc: [
        "'self'",
        'https://*.googleapis.com',
        'https://*.firebaseapp.com',
        'https://*.firebaseio.com',
        'https://translate.googleapis.com',
        'https://translate.google.com',
        'https://translate-pa.googleapis.com',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://translate.googleapis.com'],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
        'https://translate.googleapis.com',
        'https://www.gstatic.com',
      ],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cookieParser());
app.use('/api', globalRateLimiter);
app.use(express.json());

// ── In-memory multer (no disk writes — Vercel is read-only) ─────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// ── Seed Firestore on cold start ─────────────────────────────────────────────
let seeded = false;
async function ensureSeeded() {
  if (seeded) return;
  try {
    await firestoreDb.seedIfEmpty();
    seeded = true;
  } catch (err) {
    console.error('[API] Seed failed:', err);
  }
}

// ── Auth Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutesFactory());

// ── Public Data Endpoint ─────────────────────────────────────────────────────
app.get('/api/public/data', async (req, res) => {
  try {
    await ensureSeeded();
    const [products, gallery, certifications, countries, company_profile, website_settings] =
      await Promise.all([
        firestoreDb.getCollection('products'),
        firestoreDb.getCollection('gallery'),
        firestoreDb.getCollection('certifications'),
        firestoreDb.getCollection('countries'),
        firestoreDb.getCompanyProfile(),
        firestoreDb.getWebsiteSettings(),
      ]);
    res.json({ products, gallery, certifications, countries, company_profile, website_settings });
  } catch (err: any) {
    console.error('[API] /public/data error:', err);
    res.status(500).json({ error: 'Failed to load data.' });
  }
});

// ── Inquiry: Submit (Public) ─────────────────────────────────────────────────
app.post('/api/inquiries', async (req, res) => {
  const { name, company, email, phone, country, quantity, message } = req.body;

  if (!name || !email || !phone || !country || !quantity) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  try {
    const newInquiry = {
      id: `inq-${Date.now()}`,
      name,
      company: company || 'Not Specified',
      email,
      phone,
      country,
      quantity,
      message: message || 'No custom message.',
      createdAt: new Date().toISOString(),
    };

    await firestoreDb.setDocument('inquiries', newInquiry.id, newInquiry);
    return res.json({ success: true, inquiry: newInquiry });
  } catch (err: any) {
    console.error('[API] /inquiries POST error:', err);
    return res.status(500).json({ error: 'Failed to save inquiry.' });
  }
});

// ── Admin: Inquiries ─────────────────────────────────────────────────────────
app.get('/api/admin/inquiries', requireAuth, async (req, res) => {
  try {
    const inquiries = await firestoreDb.getCollection('inquiries');
    const sorted = [...inquiries].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load inquiries.' });
  }
});

app.delete('/api/admin/inquiries/:id', requireAuth, async (req, res) => {
  try {
    await firestoreDb.deleteDocument('inquiries', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete inquiry.' });
  }
});

// ── Admin: Logo Upload ───────────────────────────────────────────────────────
app.post('/api/admin/upload-logo', requireAuth, upload.single('logo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  try {
    const fileUrl = await uploadToFirebaseStorage(
      req.file.buffer,
      req.file.originalname,
      'logos',
      req.file.mimetype
    );
    await firestoreDb.updateWebsiteSettings({ logoUrl: fileUrl });
    res.json({ success: true, fileUrl });
  } catch (err: any) {
    console.error('[API] upload-logo error:', err);
    res.status(500).json({ error: 'Failed to upload logo.' });
  }
});

// ── Admin: PDF Company Profile Upload ────────────────────────────────────────
app.post('/api/admin/upload-pdf', requireAuth, upload.single('pdf'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded.' });

  try {
    const fileUrl = await uploadToFirebaseStorage(
      req.file.buffer,
      req.file.originalname,
      'pdfs',
      req.file.mimetype
    );
    const company_profile = {
      pdfUrl: fileUrl,
      fileName: req.file.originalname,
      updatedAt: new Date().toISOString(),
    };
    await firestoreDb.setCompanyProfile(company_profile);
    res.json({ success: true, company_profile });
  } catch (err: any) {
    console.error('[API] upload-pdf error:', err);
    res.status(500).json({ error: 'Failed to upload PDF.' });
  }
});

// ── Admin: Website Settings ──────────────────────────────────────────────────
app.post('/api/admin/website-settings', requireAuth, async (req, res) => {
  try {
    const website_settings = await firestoreDb.updateWebsiteSettings(req.body);
    res.json({ success: true, website_settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// ── Admin: Products CRUD ─────────────────────────────────────────────────────
app.post('/api/admin/products', requireAuth, upload.single('productImage'), async (req, res) => {
  const { name, sizeRange, packaging, shelfLife, availability, description, imageUrl } = req.body;

  try {
    let finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80';
    if (req.file) {
      finalImageUrl = await uploadToFirebaseStorage(
        req.file.buffer,
        req.file.originalname,
        'products',
        req.file.mimetype
      );
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
      name: name || 'New Product',
      sizeRange: sizeRange || 'Not Specified',
      packaging: packaging || 'Custom Packing Available',
      shelfLife: shelfLife || 'Not Specified',
      availability: availability || 'Year-Round',
      imageUrl: finalImageUrl,
      description: description || '',
    };

    await firestoreDb.setDocument('products', newProduct.id, newProduct);
    res.json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error('[API] POST /products error:', err);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

app.put('/api/admin/products/:id', requireAuth, upload.single('productImage'), async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await firestoreDb.getDocument('products', id);
    if (!existing) return res.status(404).json({ error: 'Product not found.' });

    const { name, sizeRange, packaging, shelfLife, availability, description, imageUrl } = req.body;
    let finalImageUrl = imageUrl || existing.imageUrl;

    if (req.file) {
      finalImageUrl = await uploadToFirebaseStorage(
        req.file.buffer,
        req.file.originalname,
        'products',
        req.file.mimetype
      );
    }

    const updated = {
      ...existing,
      name: name || existing.name,
      sizeRange: sizeRange || existing.sizeRange,
      packaging: packaging || existing.packaging,
      shelfLife: shelfLife || existing.shelfLife,
      availability: availability || existing.availability,
      imageUrl: finalImageUrl,
      description: description || existing.description,
    };

    await firestoreDb.setDocument('products', id, updated);
    res.json({ success: true, product: updated });
  } catch (err: any) {
    console.error('[API] PUT /products/:id error:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

app.delete('/api/admin/products/:id', requireAuth, async (req, res) => {
  try {
    await firestoreDb.deleteDocument('products', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// ── Admin: Gallery CRUD ──────────────────────────────────────────────────────
app.post('/api/admin/gallery', requireAuth, upload.single('galleryImage'), async (req, res) => {
  const { title, category, imageUrl } = req.body;

  try {
    let finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80';
    if (req.file) {
      finalImageUrl = await uploadToFirebaseStorage(
        req.file.buffer,
        req.file.originalname,
        'gallery',
        req.file.mimetype
      );
    }

    const newItem = {
      id: `gal-${Date.now()}`,
      title: title || 'Gallery Image',
      category: category || 'Onions',
      imageUrl: finalImageUrl,
    };

    await firestoreDb.setDocument('gallery', newItem.id, newItem);
    res.json({ success: true, item: newItem });
  } catch (err: any) {
    console.error('[API] POST /gallery error:', err);
    res.status(500).json({ error: 'Failed to add gallery item.' });
  }
});

app.delete('/api/admin/gallery/:id', requireAuth, async (req, res) => {
  try {
    await firestoreDb.deleteDocument('gallery', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete gallery item.' });
  }
});

// ── Admin: Certifications CRUD ───────────────────────────────────────────────
app.post('/api/admin/certifications', requireAuth, async (req, res) => {
  const { name, description } = req.body;
  try {
    const newCert = {
      id: `cert-${Date.now()}`,
      name: name || 'New Certificate',
      description: description || '',
    };
    await firestoreDb.setDocument('certifications', newCert.id, newCert);
    res.json({ success: true, certification: newCert });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create certification.' });
  }
});

app.put('/api/admin/certifications/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await firestoreDb.getDocument('certifications', id);
    if (!existing) return res.status(404).json({ error: 'Certificate not found.' });
    const updated = {
      ...existing,
      name: req.body.name || existing.name,
      description: req.body.description || existing.description,
    };
    await firestoreDb.setDocument('certifications', id, updated);
    res.json({ success: true, certification: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update certification.' });
  }
});

app.delete('/api/admin/certifications/:id', requireAuth, async (req, res) => {
  try {
    await firestoreDb.deleteDocument('certifications', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete certification.' });
  }
});

// ── Admin: Countries CRUD ────────────────────────────────────────────────────
app.post('/api/admin/countries', requireAuth, async (req, res) => {
  const { name, flag, description } = req.body;
  try {
    const newCountry = {
      id: `cnt-${Date.now()}`,
      name: name || 'New Country',
      flag: flag || '🌐',
      description: description || '',
    };
    await firestoreDb.setDocument('countries', newCountry.id, newCountry);
    res.json({ success: true, country: newCountry });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create country.' });
  }
});

app.put('/api/admin/countries/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await firestoreDb.getDocument('countries', id);
    if (!existing) return res.status(404).json({ error: 'Country not found.' });
    const updated = {
      ...existing,
      name: req.body.name || existing.name,
      flag: req.body.flag || existing.flag,
      description: req.body.description || existing.description,
    };
    await firestoreDb.setDocument('countries', id, updated);
    res.json({ success: true, country: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update country.' });
  }
});

app.delete('/api/admin/countries/:id', requireAuth, async (req, res) => {
  try {
    await firestoreDb.deleteDocument('countries', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete country.' });
  }
});

// ── Export for Vercel ─────────────────────────────────────────────────────────
export default app;
