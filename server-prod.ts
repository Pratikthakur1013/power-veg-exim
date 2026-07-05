/**
 * Production Server Entrypoint (Google Cloud Run / general node environments)
 *
 * Reuses the Express app from api/index.ts (configured for Firestore)
 * and mounts the production static asset routing and SPA wildcard fallback.
 */

import app from "./api/index.js";
import express from "express";
import path from "path";

const PORT = process.env.PORT || 8080; // Google Cloud Run defaults to 8080
const distPath = path.join(process.cwd(), "dist");

// Serve Vite production assets
app.use(express.static(distPath));

// SPA fallback for client-side routing (React Router)
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[Server] Production container platform running on http://0.0.0.0:${PORT}`);
});
