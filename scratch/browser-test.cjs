const { chromium } = require('playwright');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER UNCAUGHT EXCEPTION] ${err.message}`);
    console.error(err.stack);
  });

  console.log("Navigating to login page...");
  try {
    await page.goto('http://localhost:3000/admin/login', { timeout: 10000, waitUntil: 'load' });
    console.log("Page loaded. Title:", await page.title());
    const content = await page.content();
    console.log("HTML content length:", content.length);
  } catch (err) {
    console.error("Navigation error:", err.message);
  }

  await browser.close();
  console.log("Browser closed.");
})();
