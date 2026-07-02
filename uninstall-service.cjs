/**
 * Power Veg Exim - Windows Service Uninstaller
 * Run this script ONCE with: node uninstall-service.cjs
 * This will stop and remove the Windows Service.
 */

const { Service } = require("node-windows");
const path = require("path");

const svc = new Service({
  name: "PowerVegExim",
  script: path.join(__dirname, "dist", "server.cjs"),
});

svc.on("uninstall", function () {
  console.log("✅ Service uninstalled successfully.");
  console.log("ℹ️  The website will no longer auto-start. Run install-service.cjs to reinstall.");
});

svc.on("stop", function () {
  console.log("🛑 Service stopped.");
  svc.uninstall();
});

console.log("🛑 Stopping and uninstalling Power Veg Exim service...");
svc.stop();
