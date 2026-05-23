import { test, expect } from '@playwright/test';

// Test the mdspace canvas functionality
test.describe('mdspace Canvas UI', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/mdspace/);
    
    // Wait for fabric to load
    await page.waitForFunction(() => (window as any).fabric !== undefined, { timeout: 10000 });
  });

  test('page loads successfully', async ({ page }) => {
    // Basic smoke test - page loads
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('.toolbar')).toBeVisible();
    await expect(page.locator('.status-bar')).toBeVisible();
  });



  test('AI panel positioning', async ({ page }) => {
    const aiPanel = page.locator('.ai-panel');
    const statusBar = page.locator('.status-bar');
    
    await expect(statusBar).toBeVisible();
    
    // AI panel might not exist if no box is selected
    if (await aiPanel.count() > 0) {
      await expect(aiPanel).toBeVisible();
      
      // Check that AI panel is above the status bar
      const aiPanelBox = await aiPanel.boundingBox();
      const statusBarBox = await statusBar.boundingBox();
      
      if (aiPanelBox && statusBarBox) {
        // AI panel bottom should be above or at status bar top
        expect(aiPanelBox.y + aiPanelBox.height).toBeLessThanOrEqual(statusBarBox.y);
      }
    }
  });

  test('toolbar is visible', async ({ page }) => {
    const toolbar = page.locator('.toolbar');
    await expect(toolbar).toBeVisible();
  });

  test('no console errors on load', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Should have no errors
    expect(errors.length).toBe(0);
  });
});
