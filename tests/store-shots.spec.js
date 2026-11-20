import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const shots = resolve(dirname(fileURLToPath(import.meta.url)), '../store/screenshots');
mkdirSync(shots, { recursive: true });

test.use({
  viewport: { width: 1080, height: 1920 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
});

async function shot(page, name) {
  await page.screenshot({ path: resolve(shots, name), fullPage: false });
}

test('Play Store phone screenshots 1080x1920', async ({ page }) => {
  await page.goto('/?store=1');
  await expect(page.getByRole('heading', { name: 'Meadow Pile' })).toBeVisible();
  await page.waitForTimeout(400);
  await shot(page, '01-home.png');

  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.locator('.tutorial-card')).toBeVisible();
  await page.waitForTimeout(350);
  await shot(page, '02-tutorial.png');

  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Got it' }).click();
  await expect(page.locator('.tutorial-card')).toHaveCount(0);
  await page.waitForTimeout(200);
  await shot(page, '03-board.png');

  await page.evaluate(() => {
    window.__TT__.setFast(true);
    const ids = window.__TT__.getState().officialLeft.slice(0, 6);
    for (const id of ids) window.__TT__.collect(id);
    window.__TT__.refresh();
  });
  await expect(page.locator('.tray .slot.filled').first()).toBeVisible();
  await page.waitForTimeout(200);
  await shot(page, '04-tray.png');

  const result = await page.evaluate(async () => {
    window.__TT__.setFast(true);
    return window.__TT__.playSolution(0);
  });
  expect(result.ok).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Board tidied!' })).toBeVisible();
  await page.waitForTimeout(350);
  await shot(page, '05-win.png');

  await page.getByRole('button', { name: 'Levels', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Levels' })).toBeVisible();
  await page.waitForTimeout(200);
  await shot(page, '06-levels.png');
});
