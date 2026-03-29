const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const storagePath = path.join(__dirname, 'storage_state.json');
  let storageState;
  
  if (fs.existsSync(storagePath)) {
    console.log('Loading existing storage state...');
    try {
      storageState = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
    } catch (e) {
      console.warn('Failed to parse storage state, starting fresh.');
    }
  }

  const browser = await chromium.launch({ headless: false });
  // Pass the state directly to newContext
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();

  console.log('Navigating to Tagesspiegel...');
  await page.goto('https://www.tagesspiegel.de');

  console.log('--- USER ACTION REQUIRED ---');
  console.log('Please log in or perform any actions needed in the browser.');
  console.log('When you are done, JUST LEAVE THE BROWSER OPEN and type "done" in the terminal (if possible) or I will save it when you close the window.');
  console.log('-----------------------------');

  // We'll save the state whenever the page is closed or browser is disconnected.
  browser.on('disconnected', async () => {
    // Actually, we need to save BEFORE disconnect.
    // So let's wait for page close instead.
  });

  page.on('close', async () => {
    console.log('Page closed, saving session state...');
    const state = await context.storageState();
    fs.writeFileSync(storagePath, JSON.stringify(state, null, 2));
    console.log('Session state saved to:', storagePath);
    process.exit(0);
  });

  // Keep process alive
  await new Promise(() => {}); 
})();
