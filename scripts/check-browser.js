const { chromium } = require('playwright');

/**
 * Check how mdspace looks in a headless browser
 * This is a mandatory step to verify the app builds and works correctly
 */
async function checkBrowser(url = 'http://localhost:3000') {
  let browser;
  try {
    console.log(`\n🔍 Checking mdspace at: ${url}\n`);
    
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ 
      viewport: { width: 1280, height: 800 } 
    });
    const page = await context.newPage();

    console.log('🌐 Navigating to page...');
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Wait for fabric and app to initialize
    await page.waitForTimeout(5000);

    const title = await page.title();
    console.log(`\n✅ Page Title: ${title}`);

    // Take a screenshot
    const screenshotPath = 'screenshot.png';
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot saved to: ${screenshotPath}`);

    // Run comprehensive checks
    const checks = {
      'Title contains mdspace': title.includes('mdspace'),
      'Has toolbar': await page.locator('.toolbar').count() > 0,
      'Has canvas container': await page.locator('.canvas-container').count() > 0,
      'Has canvas element': await page.locator('canvas').count() > 0,
      'Has status bar': await page.locator('.status-bar').count() > 0,
      'Has menu toggle button': await page.locator('.menu-toggle-button').count() > 0,
      'Canvas has proper width': await page.evaluate(() => {
        const c = document.querySelector('canvas');
        return c ? c.width > 500 : false;
      }),
      'Body has grid background': await page.evaluate(() => {
        const body = document.body;
        const bg = getComputedStyle(body).backgroundImage;
        return bg.includes('radial-gradient');
      }),
      'Has Raleway font': await page.evaluate(() => {
        const body = document.body;
        const font = getComputedStyle(body).fontFamily;
        return font.includes('Raleway');
      }),
    };

    console.log('\n📋 Check Results:');
    let allPassed = true;
    for (const [name, passed] of Object.entries(checks)) {
      const status = passed ? '✅' : '❌';
      console.log(`  ${status} ${name}`);
      if (!passed) allPassed = false;
    }

    // Check canvas dimensions
    const canvasDims = await page.evaluate(() => {
      const c = document.querySelector('canvas');
      return c ? { width: c.width, height: c.height, offsetWidth: c.offsetWidth, offsetHeight: c.offsetHeight } : null;
    });
    console.log(`\n🎨 Canvas dimensions: ${canvasDims ? `${canvasDims.width}x${canvasDims.height}` : 'N/A'}`);
    console.log(`   Offset dimensions: ${canvasDims ? `${canvasDims.offsetWidth}x${canvasDims.offsetHeight}` : 'N/A'}`);

    if (allPassed) {
      console.log('\n✨ All checks passed! Service looks good in the browser.\n');
    } else {
      console.log('\n⚠️  Some checks failed. Please review the issues above.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Error checking service:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }
}

// Usage: node scripts/check-browser.js [url]
const url = process.argv[2] || 'http://localhost:3000';
checkBrowser(url);
