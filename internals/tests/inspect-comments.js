const { chromium } = require('playwright');

const TARGET_URL = 'https://www.tagesspiegel.de/politik/merz-zeichnet-ein-falsches-bild-explodiert-die-gewalt-tatsachlich-wegen-der-migration-15402814.html';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  console.log('🔍 Navigating to article...');
  await page.goto(TARGET_URL, {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('📸 Taking full page screenshot...');
  await page.screenshot({ 
    path: 'D:\\personaldata\\vibe-coding-projekte\\tagesspiegel-extension\\internals\\article-full.png', 
    fullPage: true 
  });

  // Wait for comments section to load (may be lazy-loaded)
  console.log('⏳ Waiting for comments section to load...');
  await page.waitForTimeout(5000);

  // Scroll to bottom where comments usually are
  console.log('📜 Scrolling to bottom...');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000);

  await page.screenshot({ 
    path: 'D:\\personaldata\\vibe-coding-projekte\\tagesspiegel-extension\\internals\\article-bottom.png'
  });

  // Search for comment-related elements
  console.log('\n=== 🔎 Searching for comment-related elements ===\n');
  
  const searchSelectors = [
    '[data-testid*="comment"]',
    '[class*="comment"]',
    '[id*="comment"]',
    '[class*="kommentar"]',
    '[id*="kommentar"]',
    'button[aria-label*="comment"]',
    'button[aria-label*="kommentar"]',
    'button[aria-label*="sort"]',
    'button[aria-label*="sortieren"]',
    'select[class*="sort"]',
    'select[class*="order"]'
  ];

  for (const selector of searchSelectors) {
    try {
      const count = await page.locator(selector).count();
      if (count > 0) {
        console.log(`✅ "${selector}": ${count} element(s)`);
        
        const first = page.locator(selector).first();
        const text = await first.textContent().catch(() => '[no text]');
        console.log(`   Text: "${text?.trim().substring(0, 80)}"`);
        
        const details = await first.evaluate(el => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          'data-testid': el.getAttribute('data-testid'),
          'aria-label': el.getAttribute('aria-label'),
          role: el.getAttribute('role'),
          type: el.type || el.getAttribute('type')
        }));
        console.log(`   Details:`, JSON.stringify(details, null, 2));
      }
    } catch (e) {
      // Selector not valid, continue
    }
  }

  // Find all buttons with relevant text
  console.log('\n=== 🔘 All buttons (filtering for comment/sort related) ===\n');
  const allButtons = await page.locator('button').all();
  console.log(`Total buttons found: ${allButtons.length}`);
  
  const relevantButtons = [];
  for (let i = 0; i < allButtons.length; i++) {
    const btn = allButtons[i];
    const text = await btn.textContent().catch(() => '');
    const trimmed = text?.trim().toLowerCase() || '';
    
    if (trimmed.includes('kommentar') || 
        trimmed.includes('comment') ||
        trimmed.includes('sort') ||
        trimmed.includes('beliebt') ||
        trimmed.includes('neu') ||
        trimmed.includes('alt')) {
      relevantButtons.push({ index: i, text: trimmed });
    }
  }
  
  console.log(`Relevant buttons: ${relevantButtons.length}`);
  for (const btnInfo of relevantButtons) {
    const btn = allButtons[btnInfo.index];
    const text = await btn.textContent();
    console.log(`\n  Button: "${text?.trim()}"`);
    
    const details = await btn.evaluate(el => ({
      tagName: el.tagName,
      className: el.className,
      id: el.id,
      'data-testid': el.getAttribute('data-testid'),
      'aria-label': el.getAttribute('aria-label'),
      role: el.getAttribute('role'),
      outerHTML: el.outerHTML.substring(0, 300)
    }));
    console.log(`    ${JSON.stringify(details, null, 2)}`);
  }

  // Find all select dropdowns
  console.log('\n=== 📋 All select dropdowns ===\n');
  const selects = await page.locator('select').all();
  console.log(`Total selects: ${selects.length}`);
  
  for (let i = 0; i < selects.length; i++) {
    const select = selects[i];
    const isVisible = await select.isVisible().catch(() => false);
    if (!isVisible) continue;
    
    const label = await select.evaluate(el => {
      const labelEl = el.closest('label')?.textContent || 
                      el.previousElementSibling?.textContent || 
                      el.parentElement?.querySelector('span')?.textContent || 
                      '';
      return labelEl.trim().substring(0, 80);
    });
    
    const options = await select.locator('option').all();
    const optionTexts = [];
    for (const opt of options) {
      const txt = await opt.textContent();
      const val = await opt.getAttribute('value');
      optionTexts.push({ value: val, text: txt?.trim() });
    }
    
    console.log(`\n  Select ${i}: Label="${label}"`);
    console.log(`    Options:`, JSON.stringify(optionTexts, null, 2));
  }

  // Search for elements containing specific German sort terms
  console.log('\n=== 🔤 Searching for sort-related text ===\n');
  
  const sortTerms = ['Sortieren', 'beliebte', 'neueste', 'älteste', 'Relevanz'];
  for (const term of sortTerms) {
    try {
      const elements = await page.locator(`text=${term}`).all();
      if (elements.length > 0) {
        console.log(`\n✅ Found ${elements.length} elements with "${term}":`);
        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const info = await elements[i].evaluate(el => ({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            text: el.textContent?.trim().substring(0, 100),
            'data-testid': el.getAttribute('data-testid'),
            outerHTML: el.outerHTML.substring(0, 200)
          }));
          console.log(`  ${i}:`, JSON.stringify(info));
        }
      }
    } catch (e) {
      console.log(`Error searching for "${term}":`, e.message);
    }
  }

  // Get URL and check for parameters
  console.log('\n=== 🌐 Current URL ===\n');
  const currentUrl = page.url();
  console.log(currentUrl);
  
  // Try to find comments container in main content
  console.log('\n=== 📦 Main content structure ===\n');
  const mainContent = await page.locator('main#main-content').first();
  if (await mainContent.count() > 0) {
    console.log('✅ Found main#main-content');
    
    // Look for section with comments in aria or heading
    const sections = await page.locator('main#main-content section').all();
    console.log(`Sections in main: ${sections.length}`);
    
    for (let i = 0; i < Math.min(sections.length, 10); i++) {
      const section = sections[i];
      const ariaLabel = await section.getAttribute('aria-label').catch(() => null);
      const heading = await section.locator('h2, h3, h4').first().textContent().catch(() => null);
      
      if (ariaLabel?.toLowerCase().includes('kommentar') || 
          heading?.toLowerCase().includes('kommentar')) {
        console.log(`\n✅ Potential comments section at index ${i}:`);
        console.log(`   Aria-label: ${ariaLabel}`);
        console.log(`   Heading: ${heading}`);
        
        const sectionDetails = await section.evaluate(el => ({
          className: el.className,
          id: el.id,
          'data-testid': el.getAttribute('data-testid'),
          childCount: el.children.length
        }));
        console.log(`   Details:`, JSON.stringify(sectionDetails, null, 2));
        
        // Look for sort controls inside this section
        const sortControls = await section.locator('button, select, [role="button"]').all();
        console.log(`   Sort controls found: ${sortControls.length}`);
        
        for (let j = 0; j < Math.min(sortControls.length, 5); j++) {
          const control = sortControls[j];
          const controlText = await control.textContent();
          const controlDetails = await control.evaluate(el => ({
            tagName: el.tagName,
            text: el.textContent?.trim(),
            className: el.className,
            'data-testid': el.getAttribute('data-testid'),
            'aria-label': el.getAttribute('aria-label'),
            'aria-expanded': el.getAttribute('aria-expanded'),
            'aria-haspopup': el.getAttribute('aria-haspopup')
          }));
          console.log(`     Control ${j}:`, JSON.stringify(controlDetails, null, 2));
        }
      }
    }
  }

  // Save page HTML for analysis
  console.log('\n=== 💾 Saving page HTML ===\n');
  const pageHtml = await page.content();
  const fs = require('fs');
  fs.writeFileSync(
    'D:\\personaldata\\vibe-coding-projekte\\tagesspiegel-extension\\internals\\page-source.html',
    pageHtml,
    'utf8'
  );
  console.log('✅ Saved full page HTML to internals/page-source.html');

  console.log('\n=== ✅ Inspection complete ===');
  console.log('📁 Outputs saved to internals/ folder:');
  console.log('   - article-full.png (full page screenshot)');
  console.log('   - article-bottom.png (bottom section screenshot)');
  console.log('   - page-source.html (full HTML source)');
  
  await browser.close();
  console.log('\n🎉 Browser closed. Review the outputs to understand comment sorting mechanism.');
})();
