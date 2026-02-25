javascript:(function() {
  /* Tagesspiegel Section Finder - Debug Bookmarklet */
  /* Created for Tagesspiegel Customizer Extension */
  
  try {
    console.log('=== Tagesspiegel Section Finder ===');
    console.log('Scanning page for sections...');
    
    /* Find all potential section containers */
    const sections = document.querySelectorAll('section, article, aside, [class*="teaser-pool"], [class*="c-teaser"], [data-automodule], div[class*="pool"]');
    
    console.log(`Found ${sections.length} potential section elements`);
    
    /* Extract section names */
    const sectionData = [];
    
    sections.forEach((el, index) => {
      /* Get text content from headlines */
      const headline = el.querySelector('h1, h2, h3, h4, h5, h6, .headline, .title');
      const headlineText = headline ? headline.textContent.trim() : '';
      
      /* Get class names */
      const classes = el.className || '';
      
      /* Get data attributes */
      const automodule = el.getAttribute('data-automodule') || '';
      
      /* Only log if there's identifying information */
      if (headlineText || automodule || classes.includes('teaser-pool') || classes.includes('c-teaser')) {
        sectionData.push({
          index: index,
          tag: el.tagName,
          classes: classes.split(' ').filter(c => c.startsWith('c-') || c.includes('pool')).join(' '),
          automodule: automodule,
          headline: headlineText.substring(0, 50),
          element: el
        });
        
        console.log(`\n--- Section ${index} ---`);
        console.log('Tag:', el.tagName);
        console.log('Classes:', classes);
        console.log('data-automodule:', automodule);
        console.log('Headline:', headlineText);
        console.log('Element:', el);
      }
    });
    
    /* Highlight sections on page */
    console.log(`\n=== Summary: ${sectionData.length} identifiable sections ===`);
    
    /* Add visual indicators */
    sectionData.forEach((section, i) => {
      if (section.headline) {
        const highlight = document.createElement('div');
        highlight.style.cssText = 'position:absolute;top:0;left:0;background:rgba(255,0,0,0.3);color:white;padding:2px 5px;font-size:10px;z-index:999999;pointer-events:none;';
        highlight.textContent = section.headline.substring(0, 30);
        section.element.style.position = 'relative';
        section.element.appendChild(highlight);
      }
    });
    
    console.log('\n✓ Section scan complete!');
    console.log('Check console output for section details');
    console.log('Red overlays show section headlines');
    
    /* Copy to clipboard */
    const summary = sectionData.map(s => `${s.headline} - ${s.automodule} - ${s.classes}`).join('\n');
    navigator.clipboard.writeText(summary).then(() => {
      console.log('✓ Section list copied to clipboard!');
    }).catch(err => {
      console.log('Could not copy to clipboard:', err);
    });
    
  } catch (error) {
    console.error('Tagesspiegel Section Finder Error:', error);
    alert('Error: ' + error.message);
  }
})();
