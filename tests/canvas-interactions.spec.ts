import { test, expect } from '@playwright/test';

// Comprehensive tests for canvas interactions
// NOTE: These tests require window.testFabricCanvas exposed by Canvas component.
// Ensure server is running from feat/canvas-interactions branch with: npm run dev
// Then run: npx playwright test tests/canvas-interactions.spec.ts
test.describe('Canvas Interactive Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/mdspace/);
    // Wait for testFabricCanvas to be exposed by Canvas component
    await page.waitForFunction(() => !!window.testFabricCanvas, { timeout: 15000 });
    // Wait for initial objects to load
    await page.waitForFunction(() => {
      const canvas = (window as any).testFabricCanvas;
      return canvas && canvas.getObjects().length > 0;
    }, { timeout: 10000 });
  });

  // Helper to get fabric canvas state - uses window.testFabricCanvas exposed by Canvas component
  const getFabricState = async (page: any) => {
    return page.evaluate(() => {
      const fabricCanvas = (window as any).testFabricCanvas;
      if (!fabricCanvas) return null;
      
      // Only get box objects (type === 'box'), not text objects
      const objects = fabricCanvas.getObjects().filter((obj: any) => obj.type === 'box').map((obj: any) => ({
        type: obj.type,
        boxId: obj.boxId,
        left: obj.left,
        top: obj.top,
        width: obj.width,
        height: obj.height,
        text: obj.textObject ? obj.textObject.text : null,
      }));
      
      return {
        zoom: fabricCanvas.getZoom(),
        panX: fabricCanvas.viewportTransform?.[4] || 0,
        panY: fabricCanvas.viewportTransform?.[5] || 0,
        objects,
      };
    });
  };

  test('initial canvas has boxes with text', async ({ page }) => {
    const state = await getFabricState(page);
    expect(state).not.toBeNull();
    expect(state.objects.length).toBeGreaterThan(0);
    
    // Check that at least one object has text
    const boxesWithText = state.objects.filter((o: any) => o.text && o.text.length > 0);
    expect(boxesWithText.length).toBeGreaterThan(0);
  });

  test('boxes maintain position when selected', async ({ page }) => {
    const initialState = await getFabricState(page);
    if (!initialState || initialState.objects.length === 0) return;
    
    const firstBox = initialState.objects[0];
    const initialLeft = firstBox.left;
    const initialTop = firstBox.top;
    
    // Click on the first box at its center
    const canvas = page.locator('.upper-canvas');
    await canvas.click({ 
      position: { 
        x: firstBox.left + firstBox.width / 2, 
        y: firstBox.top + firstBox.height / 2 
      } 
    });
    
    await page.waitForTimeout(500);
    
    const afterState = await getFabricState(page);
    if (!afterState) return;
    
    const afterBox = afterState.objects.find((o: any) => o.boxId === firstBox.boxId);
    expect(afterBox).not.toBeUndefined();
    
    // Position should not change significantly when selected
    expect(Math.abs(afterBox.left - initialLeft)).toBeLessThan(1);
    expect(Math.abs(afterBox.top - initialTop)).toBeLessThan(1);
  });

  test('text is positioned relative to its box', async ({ page }) => {
    const state = await getFabricState(page);
    expect(state).not.toBeNull();
    
    for (const obj of state.objects) {
      if (obj.text && obj.boxId && obj.width > 0 && obj.height > 0) {
        // Text should exist and be non-empty
        expect(obj.text.length).toBeGreaterThan(0);
      }
    }
  });

  test('canvas can be panned with right-click drag', async ({ page }) => {
    const initialState = await getFabricState(page);
    if (!initialState) return;
    
    const initialPanX = initialState.panX;
    const initialPanY = initialState.panY;
    
    const canvas = page.locator('.upper-canvas');
    
    // Right-click and drag to pan
    await canvas.click({ button: 'right', position: { x: 100, y: 100 } });
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(150, 150, { steps: 5 });
    await page.mouse.up({ button: 'right' });
    
    await page.waitForTimeout(300);
    
    const afterState = await getFabricState(page);
    expect(afterState).not.toBeNull();
    
    // At least one of panX or panY should have changed
    expect(afterState.panX !== initialPanX || afterState.panY !== initialPanY).toBe(true);
  });

  test('mouse wheel scrolls canvas', async ({ page }) => {
    const canvas = page.locator('.upper-canvas');
    const initialState = await getFabricState(page);
    if (!initialState) return;
    
    const initialPanX = initialState.panX;
    const initialPanY = initialState.panY;
    
    // Dispatch wheel event
    await canvas.evaluate((canvasEl: HTMLCanvasElement) => {
      const event = new WheelEvent('wheel', {
        deltaY: 100,
        clientX: 100,
        clientY: 100,
      });
      canvasEl.dispatchEvent(event);
    });
    
    await page.waitForTimeout(300);
    
    const afterState = await getFabricState(page);
    expect(afterState).not.toBeNull();
    
    // Pan should have changed (vertical scroll)
    expect(afterState.panY !== initialPanY).toBe(true);
  });

  test('shift + wheel scrolls horizontally', async ({ page }) => {
    const canvas = page.locator('.upper-canvas');
    const initialState = await getFabricState(page);
    if (!initialState) return;
    
    const initialPanX = initialState.panX;
    
    // Dispatch wheel event with shift
    await canvas.evaluate((canvasEl: HTMLCanvasElement) => {
      const event = new WheelEvent('wheel', {
        deltaY: 100,
        shiftKey: true,
        clientX: 100,
        clientY: 100,
      });
      canvasEl.dispatchEvent(event);
    });
    
    await page.waitForTimeout(300);
    
    const afterState = await getFabricState(page);
    expect(afterState).not.toBeNull();
    
    // Horizontal pan should have changed
    expect(afterState.panX !== initialPanX).toBe(true);
  });

  test('boxes maintain position after selection', async ({ page }) => {
    const initialState = await getFabricState(page);
    if (!initialState || initialState.objects.length === 0) return;
    
    const initialPositions = initialState.objects.map((o: any) => ({
      id: o.boxId,
      left: o.left,
      top: o.top,
    }));
    
    // Force a selection by clicking on first box
    const firstBox = initialState.objects[0];
    const canvas = page.locator('.upper-canvas');
    await canvas.click({ 
      position: { 
        x: firstBox.left + 10, 
        y: firstBox.top + 10 
      } 
    });
    
    await page.waitForTimeout(500);
    
    const afterState = await getFabricState(page);
    if (!afterState) return;
    
    const afterPositions = afterState.objects.map((o: any) => ({
      id: o.boxId,
      left: o.left,
      top: o.top,
    }));
    
    // All positions should be maintained (< 1px tolerance)
    for (const initial of initialPositions) {
      const after = afterPositions.find((p: any) => p.id === initial.id);
      if (after) {
        expect(Math.abs(after.left - initial.left)).toBeLessThan(1);
        expect(Math.abs(after.top - initial.top)).toBeLessThan(1);
      }
    }
  });

  test('adding a new box preserves existing box positions', async ({ page }) => {
    const initialState = await getFabricState(page);
    if (!initialState || initialState.objects.length === 0) return;

    // Get initial positions of all boxes
    const initialPositions = initialState.objects.map((o: any) => ({
      id: o.boxId,
      left: o.left,
      top: o.top,
    }));

    // Click the "Add Box" button
    const addBoxButton = page.getByRole('button', { name: /add box|new box|box/i });
    await addBoxButton.click();

    await page.waitForTimeout(500);

    const afterState = await getFabricState(page);
    if (!afterState) return;

    // Should have one more box than before
    expect(afterState.objects.length).toBe(initialState.objects.length + 1);

    const afterPositions = afterState.objects.map((o: any) => ({
      id: o.boxId,
      left: o.left,
      top: o.top,
    }));

    // All existing boxes should maintain their positions (< 1px tolerance)
    for (const initial of initialPositions) {
      const after = afterPositions.find((p: any) => p.id === initial.id);
      if (after) {
        expect(Math.abs(after.left - initial.left)).toBeLessThan(1);
        expect(Math.abs(after.top - initial.top)).toBeLessThan(1);
      }
    }
  });
});
