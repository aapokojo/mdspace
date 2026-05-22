const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/Users/aapokojo/.cache/puppeteer/chrome/mac_arm-148.0.7778.167/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3002');
  const content = await page.content();
  console.log('SUCCESS: Page loaded, length:', content.length);
  await browser.close();
})();
