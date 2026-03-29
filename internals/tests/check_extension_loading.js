const { chromium } = require('playwright');
const path = require('path');
const os = require('os');
const fs = require('fs');

(async () => {
  const pathToExtension = path.join(process.cwd(), 'chrome');
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'playwright-user-data-'));
  const storagePath = path.join(__dirname, 'storage_state.json');
  let storageState;
  
  if (fs.existsSync(storagePath)) {
    console.log('Loading existing storage state...');
    try {
      storageState = JSON.parse(fs.readFileSync(storagePath, 'utf8'));
    } catch (e) {}
  }
  
  console.log('Launching browser with extension...');
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    storageState: storageState,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  });
  
  const page = await context.newPage();
  
  // Monitor all console logs
  page.on('console', msg => console.log(`[BROWSER ${msg.type()}] ${msg.text()}`));
  
  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('coral.tagesspiegel.de/api/graphql')) {
      console.log(`[GRAPHQL REQUEST] ${request.method()} ${request.url()}`);
      const postData = request.postData();
      if (postData) {
        console.log(`[GRAPHQL DATA] ${postData.substring(0, 500)}`);
      }
    }
  });
  
  console.log('Navigating to page...');
  await page.goto('https://www.tagesspiegel.de/berlin/ulmen-geht-gegen-spiegel-bericht-vor-anwalt-widerspricht-einseitigen-gewalthandlungen-und-berichtet-uber-festnahme-von-fernandes-15409273.html', { waitUntil: 'networkidle' });
  
  // Click comment button using evaluate
  try {
    const selector = 'button[data-gtm-class="open-community"]';
    console.log('Waiting for comment button...');
    await page.waitForSelector(selector, { state: 'visible', timeout: 15000 });
    
    await page.evaluate((sel) => {
       const el = document.querySelector(sel);
       if (el) {
         el.scrollIntoView({ block: 'center' });
         el.click();
       }
    }, selector);
    
    console.log('Clicked comment button');
  } catch (e) {
    console.log('Comment button click failed: ' + e.message);
  }

  // Wait for things to happen
  console.log('Waiting for 30 seconds for manual check...');
  await page.waitForTimeout(30000);
  
  await context.close();
})();


