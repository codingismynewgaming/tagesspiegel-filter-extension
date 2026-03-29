import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const htmlPath = join(__dirname, 'popup-screenshots.html');
const outputDir = 'D:\personaldata\vibe-coding-projekte\tagesspiegel-extension\chrome\marketing\screenshots'.replace(/\\\\/g, '/');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--force-color-profile=srgb']
  });
  
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });
  
  // Load the HTML file
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });
  
  // Wait for fonts and styles
  await page.waitForTimeout(1000);
  
  // Define tabs to capture
  const tabs = [
    { id: 'filter', name: '01-filter-tab' },
    { id: 'active', name: '02-active-tab' },
    { id: 'stats', name: '03-stats-tab' },
    { id: 'settings', name: '04-settings-tab' },
    { id: 'info', name: '05-info-tab' }
  ];
  
  for (const tab of tabs) {
    // Click the tab button
    await page.click(\[data-tab="\"]\);
    await page.waitForTimeout(300);
    
    // Take screenshot
    const screenshotPath = join(outputDir, \\.png\);
    await page.screenshot({ 
      path: screenshotPath,
      fullPage: false,
      type: 'png',
      quality: 100
    });
    
    console.log(\✅ Captured: \.png\);
  }
  
  await browser.close();
  console.log('\\n🎉 All screenshots captured successfully!');
})();
