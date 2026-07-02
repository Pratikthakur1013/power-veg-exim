// ⚠️  Load .env FIRST — before any module reads process.env
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { globalRateLimiter } from "./src/server/rateLimiter.js";
import { requireAuth } from "./src/server/authMiddleware.js";
import authRoutes from "./src/server/routes/authRoutes.js";

const app = express();
const PORT = 3000;

// Ensure persistent folders exist
const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, "db.json");

// Default mock assets and initial seed data
const DEFAULT_PRODUCTS = [
  {
    id: "prod-1",
    name: "Fresh Red Onion",
    sizeRange: "45mm - 60mm",
    packaging: "10kg, 20kg, 40kg Mesh Bags",
    shelfLife: "Up to 6 Months (under optimal storage)",
    availability: "Year-Round (Peak: Jan - June & Oct - Dec)",
    imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
    description: "Premium quality red onions prized for their magnificent color, long shelf life, and balanced water content. Handpicked directly from top growers of Nashik."
  },
  {
    id: "prod-2",
    name: "Premium Export Grade Onion",
    sizeRange: "55mm - 80mm",
    packaging: "20kg & 40kg Ventilated Mesh Bags",
    shelfLife: "Up to 6 Months",
    availability: "Year-Round",
    imageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80",
    description: "Strictly graded double-skin onions selected specifically for overseas maritime transit. Excellent pungency and shape uniformity."
  },
  {
    id: "prod-3",
    name: "Small Size Onion (Golta)",
    sizeRange: "25mm - 35mm",
    packaging: "10kg & 20kg Red Mesh Bags",
    shelfLife: "Up to 5 Months",
    availability: "Year-Round",
    imageUrl: "https://images.unsplash.com/photo-1580201092675-a0a6a6cafbb1?auto=format&fit=crop&w=800&q=80",
    description: "Premium baby red onions (Golta) with a highly concentrated pungent aroma. Exceptionally popular in Bangladesh, Nepal, and Sri Lanka markets."
  },
  {
    id: "prod-4",
    name: "Medium Size Onion (Golti)",
    sizeRange: "35mm - 45mm",
    packaging: "10kg, 20kg, 40kg Mesh Bags",
    shelfLife: "Up to 6 Months",
    availability: "Year-Round",
    imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80",
    description: "Medium-sized export-grade onions perfect for packing in retail cases or supermarkets. Firm, healthy stock, highly customizable packaging."
  },
  {
    id: "prod-5",
    name: "Large Size Onion",
    sizeRange: "60mm - 90mm",
    packaging: "5kg & 10kg Bags or Cartons",
    shelfLife: "Up to 5 Months",
    availability: "Feb - July",
    imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80",
    description: "Jumbo selected red onions primarily customized for Middle East and supermarket segments seeking bold visual presence and mild savory sweet flavor."
  }
];

const DEFAULT_GALLERY = [
  { id: "gal-1", imageUrl: "https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80", title: "Harvesting Red Onions", category: "Farms" },
  { id: "gal-2", imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80", title: "Pristine Sorted Onions", category: "Onions" },
  { id: "gal-3", imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80", title: "Global Shipping Containers", category: "Logistics" },
  { id: "gal-4", imageUrl: "https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=800&q=80", title: "Vessel Heading Abroad", category: "Logistics" },
  { id: "gal-5", imageUrl: "https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=800&q=80", title: "Sorting at Pimpalgaon Hub", category: "Farms" },
  { id: "gal-6", imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=800&q=80", title: "Premium Packaging Line", category: "Onions" }
];

const DEFAULT_CERTIFICATIONS = [
  { id: "cert-1", name: "APEDA Registered Exporter", description: "Agricultural and Processed Food Products Export Development Authority registration, certifying full quality adherence for global agricultural items." },
  { id: "cert-2", name: "Import Export Code (IEC)", description: "Registered directly with the Ministry of Commerce & Industry, Government of India, certifying clear international trading credentials." },
  { id: "cert-3", name: "FSSAI Certified", description: "Food Safety and Standards Authority of India certified packing operations, guaranteeing absolute food safety, pest-free environments, and sanitization." }
];

const DEFAULT_COUNTRIES = [
  { id: "cnt-1", name: "Malaysia", flag: "🇲🇾", description: "Vast importer of medium-size Nashik onions with customizable loose packing options." },
  { id: "cnt-2", name: "UAE & Middle East", flag: "🇦🇪", description: "Premium jumbo large red onions delivered highly optimized for supermarket displays." },
  { id: "cnt-3", name: "Bangladesh", flag: "🇧🇩", description: "High volume daily logistics dispatch of Golta & Golti onions via land border rail/truck routes." },
  { id: "cnt-4", name: "Sri Lanka", flag: "🇱🇰", description: "Strong maritime shipping pipeline of premium red onions with optimized dry packing ventilations." },
  { id: "cnt-5", name: "Nepal", flag: "🇳🇵", description: "Border-side farm collection point dispatch directly from Lasalgaon to major cities." },
  { id: "cnt-6", name: "Singapore", flag: "🇸🇬", description: "Strict grading criteria onions arriving via cold-chain maritime vessel with high shelf-life security." }
];

const INITIAL_DB = {
  products: DEFAULT_PRODUCTS,
  gallery: DEFAULT_GALLERY,
  certifications: DEFAULT_CERTIFICATIONS,
  countries: DEFAULT_COUNTRIES,
  company_profile: {
    pdfUrl: "",
    fileName: "PowerVegExim_Company_Profile.pdf",
    updatedAt: "2026-06-16T12:00:00Z"
  },
  website_settings: {
    logoUrl: "",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+919890761639",
    email: "export@powervegexim.com",
    phone: "+91 98907 61639",
    address: "Lasalgaon Road, Pimpalgaon Baswant, Nashik, Maharashtra, India - 422209",
    bannerTitle: "PREMIUM NASHIK ONIONS EXPORTED WORLDWIDE",
    bannerSubtitle: "Sourcing the finest quality red onions directly from Nashik's fertile farms. We deliver export-grade onions to global markets with unmatched logistics efficiency.",
    facebookUrl: "",
    instagramUrl: "",
    linkedinUrl: "",
    twitterUrl: ""
  },
  inquiries: [
    {
      id: "inq-default",
      name: "Ahmed Al-Mansoor",
      company: "Gulf Food Distributors LLC",
      email: "ahmed@gulffoods.ae",
      phone: "+971 50 123 4567",
      country: "UAE",
      quantity: "50 Metric Tons",
      message: "Looking for customized 10kg mesh bag packaging for fresh red onions (size 55mm+). Please reply with FOB Nhava Sheva Port price quote.",
      createdAt: "2026-06-15T08:30:00Z"
    }
  ],
  admins: [
    {
      id: "admin-1",
      email: "admin@powerveg.com",
      password: "admin"
    }
  ]
};

// Database Read/Write Utility
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf8");
      return INITIAL_DB;
    }
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading db file, using initial memory db:", err);
    return INITIAL_DB;
  }
}

function writeDb(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to db file:", err);
  }
}

// Ensure database is initialized on boot
readDb();

// Multer storage engine for file uploads (Logo, Product, Gallery, PDF)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

// Configure static file serving for uploaded files
// Uploads are stored in /data/uploads but can be accessed as /uploads/*
// ── Security Middleware ──────────────────────────────────────────────────
// Helmet: sets secure HTTP headers (XSS, clickjacking, etc.)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://www.gstatic.com",
        "https://apis.google.com",
        // Google Translate widget
        "https://translate.google.com",
        "https://translate.googleapis.com",
        "https://translate-pa.googleapis.com",
      ],
      frameSrc: [
        "'self'",
        "https://www.google.com",
        "https://accounts.google.com",
        // Google Translate iframe
        "https://translate.google.com",
        "https://translate.googleapis.com",
        "https://translate.googleusercontent.com",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        // Google Translate toolbar icons
        "https://www.gstatic.com",
        "https://translate.googleapis.com",
      ],
      connectSrc: [
        "'self'",
        "https://*.googleapis.com",
        "https://*.firebaseapp.com",
        "https://*.firebaseio.com",
        // Google Translate API calls
        "https://translate.googleapis.com",
        "https://translate.google.com",
        "https://translate-pa.googleapis.com",
        // Vite HMR websocket in development
        "ws://localhost:*",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://translate.googleapis.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        // Google Translate injects styles
        "https://translate.googleapis.com",
        "https://www.gstatic.com",
      ],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for Firebase Phone Auth reCAPTCHA
}));

// Cookie parser (required for JWT HttpOnly cookies)
app.use(cookieParser());

// Global API rate limiter
app.use("/api", globalRateLimiter);

app.use("/uploads", express.static(UPLOADS_DIR));
app.use("/sequence", express.static(path.join(process.cwd(), "sequence")));
app.use("/webp", express.static(path.join(process.cwd(), "webp")));
app.use("/mobp", express.static(path.join(process.cwd(), "mobp")));
app.use("/public", express.static(path.join(process.cwd(), "public")));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.json());

// ── Auth Routes (Public — no auth required) ──────────────────────────────
app.use("/api/auth", authRoutes);

// API: GET public data
app.get("/api/public/data", (req, res) => {
  const db = readDb();
  res.json({
    products: db.products,
    gallery: db.gallery,
    certifications: db.certifications,
    countries: db.countries,
    company_profile: db.company_profile,
    website_settings: db.website_settings
  });
});

// API: POST new inquiry (Public)
app.post("/api/inquiries", (req, res) => {
  const { name, company, email, phone, country, quantity, message } = req.body;

  // Simple validation
  if (!name || !email || !phone || !country || !quantity) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  const db = readDb();
  const newInquiry = {
    id: "inq-" + Date.now(),
    name,
    company: company || "Not Specified",
    email,
    phone,
    country,
    quantity,
    message: message || "No custom message.",
    createdAt: new Date().toISOString()
  };

  db.inquiries.push(newInquiry);
  writeDb(db);

  return res.json({ success: true, inquiry: newInquiry });
});

// ── Legacy admin login removed — use /api/auth/login instead ────────────
// All /api/admin/* routes are now protected by JWT auth middleware.

// ── Protected Admin Routes (require valid JWT session) ──────────────────
app.get("/api/admin/inquiries", requireAuth, (req, res) => {
  const db = readDb();
  // Simply return sorted by latest
  const sorted = [...db.inquiries].reverse();
  res.json(sorted);
});

// Admin Route: Delete Inquiry
app.delete("/api/admin/inquiries/:id", requireAuth, (req, res) => {
  const db = readDb();
  db.inquiries = db.inquiries.filter((i: any) => i.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Admin Route: Logo Upload
app.post("/api/admin/upload-logo", requireAuth, upload.single("logo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const db = readDb();
  const fileUrl = `/uploads/${req.file.filename}`;
  db.website_settings.logoUrl = fileUrl;
  writeDb(db);
  res.json({ success: true, fileUrl });
});

// Admin Route: PDF Company Profile Upload
app.post("/api/admin/upload-pdf", requireAuth, upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No PDF file uploaded" });
  }
  const db = readDb();
  const fileUrl = `/uploads/${req.file.filename}`;
  db.company_profile = {
    pdfUrl: fileUrl,
    fileName: req.file.originalname,
    updatedAt: new Date().toISOString()
  };
  writeDb(db);
  res.json({ success: true, company_profile: db.company_profile });
});

// Admin Route: Update settings
app.post("/api/admin/website-settings", requireAuth, (req, res) => {
  const db = readDb();
  db.website_settings = {
    ...db.website_settings,
    ...req.body
  };
  writeDb(db);
  res.json({ success: true, website_settings: db.website_settings });
});

// CRUD: Products
app.post("/api/admin/products", requireAuth, upload.single("productImage"), (req, res) => {
  const db = readDb();
  const { name, sizeRange, packaging, shelfLife, availability, description, imageUrl } = req.body;
  
  let finalImageUrl = imageUrl || "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80";
  if (req.file) {
    finalImageUrl = `/uploads/${req.file.filename}`;
  }

  const newProduct = {
    id: "prod-" + Date.now(),
    name: name || "New Product",
    sizeRange: sizeRange || "Not Specified",
    packaging: packaging || "Custom Packing Available",
    shelfLife: shelfLife || "Not Specified",
    availability: availability || "Year-Round",
    imageUrl: finalImageUrl,
    description: description || ""
  };

  db.products.push(newProduct);
  writeDb(db);
  res.json({ success: true, product: newProduct });
});

app.put("/api/admin/products/:id", requireAuth, upload.single("productImage"), (req, res) => {
  const db = readDb();
  const index = db.products.findIndex((p: any) => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const { name, sizeRange, packaging, shelfLife, availability, description, imageUrl } = req.body;
  let finalImageUrl = imageUrl || db.products[index].imageUrl;
  if (req.file) {
    finalImageUrl = `/uploads/${req.file.filename}`;
  }

  db.products[index] = {
    ...db.products[index],
    name: name || db.products[index].name,
    sizeRange: sizeRange || db.products[index].sizeRange,
    packaging: packaging || db.products[index].packaging,
    shelfLife: shelfLife || db.products[index].shelfLife,
    availability: availability || db.products[index].availability,
    imageUrl: finalImageUrl,
    description: description || db.products[index].description
  };

  writeDb(db);
  res.json({ success: true, product: db.products[index] });
});

app.delete("/api/admin/products/:id", requireAuth, (req, res) => {
  const db = readDb();
  db.products = db.products.filter((p: any) => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// CRUD: Gallery
app.post("/api/admin/gallery", requireAuth, upload.single("galleryImage"), (req, res) => {
  const db = readDb();
  const { title, category, imageUrl } = req.body;
  
  let finalImageUrl = imageUrl || "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=800&q=80";
  if (req.file) {
    finalImageUrl = `/uploads/${req.file.filename}`;
  }

  const newItem = {
    id: "gal-" + Date.now(),
    title: title || "Gallery Image",
    category: category || "Onions",
    imageUrl: finalImageUrl
  };

  db.gallery.push(newItem);
  writeDb(db);
  res.json({ success: true, item: newItem });
});

app.delete("/api/admin/gallery/:id", requireAuth, (req, res) => {
  const db = readDb();
  db.gallery = db.gallery.filter((g: any) => g.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// CRUD: Certifications
app.post("/api/admin/certifications", requireAuth, (req, res) => {
  const db = readDb();
  const { name, description } = req.body;
  const newCert = {
    id: "cert-" + Date.now(),
    name: name || "New Certificate",
    description: description || ""
  };
  db.certifications.push(newCert);
  writeDb(db);
  res.json({ success: true, certification: newCert });
});

app.put("/api/admin/certifications/:id", requireAuth, (req, res) => {
  const db = readDb();
  const index = db.certifications.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Certificate not found" });
  }
  db.certifications[index] = {
    ...db.certifications[index],
    name: req.body.name || db.certifications[index].name,
    description: req.body.description || db.certifications[index].description
  };
  writeDb(db);
  res.json({ success: true, certification: db.certifications[index] });
});

app.delete("/api/admin/certifications/:id", requireAuth, (req, res) => {
  const db = readDb();
  db.certifications = db.certifications.filter((c: any) => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// CRUD: Countries
app.post("/api/admin/countries", requireAuth, (req, res) => {
  const db = readDb();
  const { name, flag, description } = req.body;
  const newCountry = {
    id: "cnt-" + Date.now(),
    name: name || "New Country",
    flag: flag || "🌐",
    description: description || ""
  };
  db.countries.push(newCountry);
  writeDb(db);
  res.json({ success: true, country: newCountry });
});

app.put("/api/admin/countries/:id", requireAuth, (req, res) => {
  const db = readDb();
  const index = db.countries.findIndex((c: any) => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: "Country not found" });
  }
  db.countries[index] = {
    ...db.countries[index],
    name: req.body.name || db.countries[index].name,
    flag: req.body.flag || db.countries[index].flag,
    description: req.body.description || db.countries[index].description
  };
  writeDb(db);
  res.json({ success: true, country: db.countries[index] });
});

app.delete("/api/admin/countries/:id", requireAuth, (req, res) => {
  const db = readDb();
  db.countries = db.countries.filter((c: any) => c.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Serving index.html - Dev/Prod handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Power Veg Exim platform running on http://localhost:${PORT}`);
  });
}

startServer();
