const { chromium } = require('playwright');
const fs = require('fs');

const TARGET_URL = 'https://www.tagesspiegel.de/politik/merz-zeichnet-ein-falsches-bild-explodiert-die-gewalt-tatsachlich-wegen-der-migration-15402814.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('🔍 Loading article...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Find comments button and click via JS
  console.log('🔎 Looking for comments button...');
  
  const commentsClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const commentsBtn = buttons.find(btn => btn.textContent.includes('Kommentare'));
    
    if (commentsBtn) {
      console.log('Found comments button:', commentsBtn.outerHTML.substring(0, 200));
      commentsBtn.click();
      return true;
    }
    return false;
  });
  
  if (commentsClicked) {
    console.log('✅ Clicked comments button via JS');
    await page.waitForTimeout(5000);
    
    // Save HTML
    const html = await page.content();
    fs.writeFileSync('D:\\personaldata\\vibe-coding-projekte\\tagesspiegel-extension\\internals\\comments-opened.html', html);
    console.log('✅ Saved HTML');
    
    // Now look for sort controls
    console.log('\n🔎 Analyzing sort controls...');
    
    const sortInfo = await page.evaluate(() => {
      const results = {
        sortButtons: [],
        selects: [],
        beliebteElements: [],
        ariaSort: [],
        allButtons: []
      };
      
      // Find sort-related buttons
      const buttons = Array.from(document.querySelectorAll('button'));
      results.sortButtons = buttons
        .filter(btn => {
          const text = btn.textContent.toLowerCase();
          return text.includes('sort') || text.includes('belieb') || text.includes('relevanz');
        })
        .map(btn => ({
          text: btn.textContent.trim(),
          className: btn.className,
          ariaLabel: btn.getAttribute('aria-label'),
          ariaExpanded: btn.getAttribute('aria-expanded'),
          outerHTML: btn.outerHTML.substring(0, 300)
        }));
      
      // Find selects
      const selects = Array.from(document.querySelectorAll('select'));
      results.selects = selects.map(select => ({
        label: select.previousElementSibling?.textContent || select.parentElement?.querySelector('span')?.textContent || '',
        options: Array.from(select.querySelectorAll('option')).map(opt => ({
          value: opt.value,
          text: opt.textContent.trim()
        }))
      }));
      
      // Find elements with "beliebte"
      const allElements = Array.from(document.querySelectorAll('*'));
      results.beliebteElements = allElements
        .filter(el => el.textContent && el.textContent.toLowerCase().includes('beliebte'))
        .slice(0, 10)
        .map(el => ({
          tagName: el.tagName,
          text: el.textContent.trim().substring(0, 100),
          className: el.className,
          id: el.id,
          parentHTML: el.parentElement?.outerHTML.substring(0, 200)
        }));
      
      // Find aria-sort elements
      const ariaSort = Array.from(document.querySelectorAll('[aria-sort], [aria-label*="sort"], [aria-label*="Sort"]'));
      results.ariaSort = ariaSort.map(el => ({
        tagName: el.tagName,
        text: el.textContent?.trim(),
        ariaLabel: el.getAttribute('aria-label'),
        ariaSort: el.getAttribute('aria-sort'),
        className: el.className,
        outerHTML: el.outerHTML.substring(0, 200)
      }));
      
      // All buttons with short text
      results.allButtons = buttons
        .filter(btn => {
          const text = btn.textContent.trim();
          return text.length > 0 && text.length < 40;
        })
        .slice(0, 50)
        .map(btn => ({
          text: btn.textContent.trim(),
          className: btn.className,
          ariaLabel: btn.getAttribute('aria-label')
        }));
      
      return results;
    });
    
    console.log('\n=== Sort Buttons ===');
    console.log(JSON.stringify(sortInfo.sortButtons, null, 2));
    
    console.log('\n=== Selects ===');
    console.log(JSON.stringify(sortInfo.selects, null, 2));
    
    console.log('\n=== Elemente mit "beliebte" ===');
    console.log(JSON.stringify(sortInfo.beliebteElements, null, 2));
    
    console.log('\n=== Aria Sort ===');
    console.log(JSON.stringify(sortInfo.ariaSort, null, 2));
    
    console.log('\n=== All Buttons (first 50) ===');
    console.log(JSON.stringify(sortInfo.allButtons, null, 2));
    
  } else {
    console.log('❌ Comments button not found');
  }

  await browser.close();
  console.log('\n✅ Done!');
})();
