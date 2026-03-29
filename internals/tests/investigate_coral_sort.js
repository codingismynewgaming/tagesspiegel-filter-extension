const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const pathToExtension = path.join(process.cwd(), 'chrome');
  const storagePath = path.join(__dirname, 'storage_state.json');
  let storageState;
  
  if (fs.existsSync(storagePath)) {
    console.log('Loading existing storage state...');
    try {
      storageState = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
    } catch (e) {}
  }

  const browser = await chromium.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  });
  
  const context = await browser.newContext({ storageState });
  const page = await context.newPage();
  
  // Listen for console logs from all frames
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type()}] ${msg.text()}`);
  });
  
  console.log('Navigating to page...');
  await page.goto('https://www.tagesspiegel.de/berlin/ulmen-geht-gegen-spiegel-bericht-vor-anwalt-widerspricht-einseitigen-gewalthandlungen-und-berichtet-uber-festnahme-von-fernandes-15409273.html');
  
  // Wait for and click comment button if needed
  try {
    const selector = 'button[data-gtm-class="open-community"]';
    console.log('Waiting for comment button...');
    await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
    
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, selector);
    
    await page.waitForTimeout(2000);
    
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.click();
    }, selector);
    
    console.log('Clicked comment button');
  } catch (e) {
    console.log('Comment button click failed: ' + e.message);
  }

  console.log('Waiting for Coral iframe to appear and settle...');
  await page.waitForTimeout(10000);

  // List all frames to see what we have
  const frames = page.frames();
  console.log(`Total frames found: ${frames.length}`);
  for (const frame of frames) {
    console.log(`Frame URL: ${frame.url()}`);
  }

  const coralFrame = frames.find(f => f.url().includes('coral.tagesspiegel.de'));
  if (coralFrame) {
    console.log('Coral iframe FOUND!');
    try {
      await coralFrame.waitForSelector('button[id^="tab-"]', { timeout: 20000 });
      const activeSort = await coralFrame.locator('button[id^="tab-"][aria-selected="true"]').textContent();
      console.log('ACTIVE_SORT_TEXT: ' + activeSort);
      
      const tabs = await coralFrame.locator('button[id^="tab-"]').allTextContents();
      console.log('Available tabs: ' + tabs.join(', '));
    } catch (e) {
      console.log('Could not find sort tabs in frame: ' + e.message);
    }
  } else {
    console.log('Coral iframe NOT FOUND in frame list.');
  }

  await page.screenshot({ path: 'internals/tests/coral_investigation_final.png', fullPage: true });
  console.log('Screenshot saved.');

  console.log('Keeping browser open for 30 seconds for manual inspection...');
  await page.waitForTimeout(30000);
  await browser.close();
})();


