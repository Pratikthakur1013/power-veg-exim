/**
 * Power Veg Exim - Dev Launcher (used by Windows Service)
 * Handles paths with spaces by using Node's spawn with proper argument arrays.
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const CWD = __dirname;

// Ensure data dir exists for log file
try {
  fs.mkdirSync(path.join(CWD, "data"), { recursive: true });
} catch (e) {}

const LOG_FILE = path.join(CWD, "data", "service.log");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    fs.appendFileSync(LOG_FILE, line + "\n");
  } catch (e) {}
}

function startServer() {
  log("Starting Power Veg Exim server...");

  // Use node directly to run tsx — avoids cmd.exe and spaces-in-path issues
  const nodePath = process.execPath;
  const tsxMain = path.join(CWD, "node_modules", "tsx", "dist", "cli.mjs");
  const serverScript = path.join(CWD, "server.ts");

  log(`node: ${nodePath}`);
  log(`tsx: ${tsxMain}`);
  log(`script: ${serverScript}`);

  // spawn node <tsx-cli> <server.ts> — all args are separate, no shell needed
  const child = spawn(nodePath, [tsxMain, serverScript], {
    cwd: CWD,
    env: {
      ...process.env,
      NODE_ENV: "development",
      PORT: "3000",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => {
    const text = data.toString().trim();
    if (text) log(text);
  });

  child.stderr.on("data", (data) => {
    const text = data.toString().trim();
    if (text) log("[ERR] " + text);
  });

  child.on("exit", (code, signal) => {
    log(`Server exited (code=${code}). Restarting in 5 seconds...`);
    setTimeout(startServer, 5000);
  });

  child.on("error", (err) => {
    log("Spawn error: " + err.message + ". Retrying in 5 seconds...");
    setTimeout(startServer, 5000);
  });

  log(`Server process started (PID: ${child.pid})`);
}

log("=== Power Veg Exim Windows Service Launcher ===");
log(`Working directory: ${CWD}`);
log("Website will be available at: http://localhost:3000");

startServer();

process.on("SIGTERM", () => { log("Stopping."); process.exit(0); });
process.on("SIGINT",  () => { log("Stopping."); process.exit(0); });
