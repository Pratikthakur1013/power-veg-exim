/**
 * Power Veg Exim - Startup Launcher
 * Called by start-silent.vbs at Windows login.
 * Starts the server and keeps it alive with auto-restart.
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const CWD = "F:\\power-veg-exim (1)";

try { fs.mkdirSync(path.join(CWD, "data"), { recursive: true }); } catch (e) {}

const LOG_FILE = path.join(CWD, "data", "service.log");

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  try { fs.appendFileSync(LOG_FILE, line + "\n"); } catch (e) {}
}

const nodePath = process.execPath;
const tsxMain = path.join(CWD, "node_modules", "tsx", "dist", "cli.mjs");
const serverScript = path.join(CWD, "server.ts");

log("=== Power Veg Exim Startup Launcher ===");
log(`node: ${nodePath}`);

let restartCount = 0;

function startServer() {
  restartCount++;
  log(`Starting server (attempt #${restartCount})...`);

  const child = spawn(nodePath, [tsxMain, serverScript], {
    cwd: CWD,
    env: { ...process.env, NODE_ENV: "development", PORT: "3000" },
    stdio: "ignore",
  });

  child.on("exit", (code) => {
    log(`Server exited (code=${code}). Restarting in 5 seconds...`);
    setTimeout(startServer, 5000);
  });

  child.on("error", (err) => {
    log("Spawn error: " + err.message + ". Retrying in 5 seconds...");
    setTimeout(startServer, 5000);
  });

  log(`Server PID: ${child.pid} - http://localhost:3000`);
}

startServer();

// Keep this launcher alive so it can restart the server if it crashes
// This process stays running silently in background (hidden by VBScript)
process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
