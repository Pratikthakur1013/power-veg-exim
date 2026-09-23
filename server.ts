/**
 * Local Development Server
 *
 * Starts Vite's dev server and mounts the Express API on /api/* so that
 * both the React frontend (with HMR) and the backend API are accessible
 * from a single port during development.
 *
 * Usage: npm run dev   →   tsx server.ts
 */

// ⚠️ Load .env FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import { createServer as createViteServer } from 'vite';
import express from 'express';
import cookieParser from 'cookie-parser';

// Import the shared Express API app (same routes used by Vercel)
import apiApp from './api/index.js';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function main() {
  const app = express();

  // ── Cookie parser (needed before API routes) ──────────────────────────────
  app.use(cookieParser());

  // ── Mount the Express API at /api ─────────────────────────────────────────
  // Strip the /api prefix so the routes inside apiApp stay consistent.
  app.use('/api', (req, res, next) => {
    // Rewrite path so apiApp sees /api/... correctly
    // (apiApp already prefixes routes with /api, so we pass through as-is)
    next();
  });
  app.use(apiApp);

  // ── Create Vite dev server in middleware mode ─────────────────────────────
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Let Vite handle all non-API requests (React SPA + HMR)
  app.use(vite.middlewares);

  app.listen(PORT, () => {
    console.log(`\n  ✅  Dev server running at: http://localhost:${PORT}\n`);
  });
}

main().catch((err) => {
  console.error('Failed to start dev server:', err);
  process.exit(1);
});
