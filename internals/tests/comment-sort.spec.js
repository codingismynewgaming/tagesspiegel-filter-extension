const { chromium } = require('playwright');
const path = require('path');

// Test script for Comment Sort Guidance Feature
// This tests the toast notification when Coral comments load

const TEST_URL = 'https://www.tagesspiegel.de/politik/merz-zeichnet-ein-falsches-bild-explodiert-die-gewalt-tatsachlich-wegen-der-migration-15402814.html';

(async () => {
  console.log('🧪 Starting Comment Sort Feature Test...\n');
  
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load extension (unpacked)
  const extensionPath = path.join(__dirname, '..');
  await context.grantPermissions(['storage']);

  console.log('📝 Test 1: Navigate to article with comments');
  await page.goto(TEST_URL, { waitUntil: 'networkidle', timeout: 30000 });
  console.log('✅ Article loaded\n');

  // Wait for Coral to load (usually takes 2-5 seconds)
  console.log('⏳ Waiting for Coral comments to load...');
  await page.waitForTimeout(5000);

  console.log('📝 Test 2: Check if Coral container exists');
  const coralContainer = await page.locator('#coral_talk_stream').first();
  const coralExists = await coralContainer.count() > 0;
  console.log(`✅ Coral container found: ${coralExists}\n`);

  if (!coralExists) {
    console.log('❌ Coral comments not found on this article');
    await browser.close();
    return;
  }

  console.log('📝 Test 3: Check for toast notification');
  
  // Wait for toast to appear (should appear 2 seconds after Coral loads)
  await page.waitForTimeout(3000);
  
  const toast = await page.locator('.ts-customizer-toast').first();
  const toastExists = await toast.count() > 0;
  
  if (toastExists) {
    console.log('✅ Toast notification appeared');
    
    const toastText = await toast.textContent();
    console.log(`📄 Toast message: "${toastText.trim().substring(0, 100)}..."`);
    
    // Verify toast contains expected text
    const hasExpectedText = toastText.includes('Sortieren') && 
                            toastText.includes('respektiert');
    console.log(`✅ Toast contains expected text: ${hasExpectedText}`);
    
    // Test click-to-dismiss
    console.log('\n📝 Test 4: Click toast to dismiss');
    await toast.click();
    await page.waitForTimeout(500);
    
    const toastAfterClick = await page.locator('.ts-customizer-toast').count();
    console.log(`✅ Toast dismissed: ${toastAfterClick === 0}\n`);
    
  } else {
    console.log('❌ Toast notification did not appear');
    console.log('💡 This might be expected if:');
    console.log('   - Feature is disabled in settings');
    console.log('   - Coral comments are not fully loaded');
    console.log('   - Extension is not loaded\n');
  }

  console.log('📝 Test 5: Verify setting persistence');
  
  // Reload page and check if toast appears again
  console.log('🔄 Reloading page...');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  
  const toastAfterReload = await page.locator('.ts-customizer-toast').first();
  const toastAfterReloadExists = await toastAfterReload.count() > 0;
  console.log(`✅ Toast appears on reload: ${toastAfterReloadExists}\n`);

  console.log('📊 === Test Summary ===');
  console.log(`Coral container found: ${coralExists ? '✅' : '❌'}`);
  console.log(`Toast appeared: ${toastExists ? '✅' : '❌'}`);
  console.log(`Toast has correct text: ${toastExists && hasExpectedText ? '✅' : '❌'}`);
  console.log(`Toast dismissible: ${toastExists && toastAfterClick === 0 ? '✅' : '❌'}`);
  console.log(`Toast on reload: ${toastAfterReloadExists ? '✅' : '❌'}`);
  
  // Take screenshot for documentation
  await page.screenshot({ 
    path: path.join(__dirname, '..', 'internals', 'test-comment-sort.png'),
    fullPage: false
  });
  console.log('\n📸 Screenshot saved to internals/test-comment-sort.png');

  await browser.close();
  console.log('\n✅ Test complete!');
})();
