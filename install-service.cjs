/**
 * Power Veg Exim - Windows Service Installer
 * Run this script ONCE with: node install-service.cjs
 * After running, the website will be available at http://localhost:3000
 * and will auto-start every time Windows starts — no terminal needed!
 */

const { Service } = require("node-windows");
const path = require("path");

const svc = new Service({
  name: "PowerVegExim",
  description: "Power Veg Exim website - auto-starts at http://localhost:3000 on every Windows boot",
  // Points to dev-launcher.cjs which runs npm run dev and auto-restarts if it crashes
  script: path.join(__dirname, "dev-launcher.cjs"),
  nodeOptions: [],
  env: [
    { name: "NODE_ENV", value: "development" },
    { name: "PORT", value: "3000" }
  ],
  maxRestarts: 99,    // Restart up to 99 times if it crashes
  wait: 3,           // Wait 3 seconds before restarting
  grow: 0.25,        // Slightly increase wait time each restart
  workingdirectory: path.join(__dirname),
});

svc.on("install", function () {
  console.log("✅ Service installed successfully!");
  console.log("🚀 Starting the service...");
  svc.start();
});

svc.on("start", function () {
  console.log("✅ Service started!");
  console.log("🌐 Website is running at: http://localhost:3000");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✨ Setup complete! From now on:");
  console.log("   • Turn on your PC → open http://localhost:3000");
  console.log("   • No terminal. No commands. Just works. ✅");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});

svc.on("alreadyinstalled", function () {
  console.log("ℹ️  Service already installed. Restarting...");
  svc.start();
});

svc.on("error", function (err) {
  console.error("❌ Service error:", err);
});

console.log("📦 Installing Power Veg Exim as a Windows Service...");
svc.install();
