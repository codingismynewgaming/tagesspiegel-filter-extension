const { chromium } = require('playwright');

const TARGET_URL = 'https://www.tagesspiegel.de/';

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();

  console.log('🔍 Navigating to Tagesspiegel...');
  await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  console.log('📊 Finding "Neues aus Berlin" structure...\n');

  // Find by heading text "Neues aus Berlin"
  const allHeadings = await page.locator('h2, h3, h4').all();
  console.log(`Total headings found: ${allHeadings.length}\n`);
  
  for (let i = 0; i < allHeadings.length; i++) {
    const h = allHeadings[i];
    const text = await h.textContent();
    if (text.includes('Neues aus Berlin')) {
      console.log(`✅ FOUND heading: "${text.trim()}"\n`);
      
      // Get the section container
      let container = h;
      for (let level = 0; level < 5; level++) {
        container = container.locator('..').first();
        const tag = await container.evaluate(el => el.tagName);
        const id = await container.evaluate(el => el.id);
        const classes = await container.evaluate(el => [...el.classList]);
        const linkCount = await container.locator('a[href]').count();
        const isSection = tag === 'SECTION' || tag === 'ASIDE';
        
        console.log(`Level ${level} up: ${tag}${id ? '#' + id : ''} class="${classes.slice(0,4).join(' ')}" links=${linkCount}`);
        
        if (isSection && linkCount >= 2 && linkCount <= 10) {
          console.log(`\n🎯 VALID MODULE CONTAINER FOUND!\n`);
          const outerHTML = await container.evaluate(el => el.outerHTML.substring(0, 500));
          console.log('Outer HTML (first 500 chars):');
          console.log(outerHTML);
          
          // Check heading structure
          const headingEl = await container.locator('h2, h3, h4').first();
          const headingTag = await headingEl.evaluate(el => el.tagName);
          const headingClass = await headingEl.evaluate(el => el.className);
          console.log(`\nHeading: ${headingTag} class="${headingClass}"`);
          
          // Check if heading is inside a link
          const headingParent = await headingEl.locator('..').first();
          const parentTag = await headingParent.evaluate(el => el.tagName);
          const parentHref = await headingParent.evaluate(el => el.getAttribute('href'));
          console.log(`Heading parent: ${parentTag}${parentHref ? ' href="' + parentHref + '"' : ''}`);
          
          break;
        }
      }
      
      break;
    }
  }

  await browser.close();
  console.log('\n✅ Done!');
})();
