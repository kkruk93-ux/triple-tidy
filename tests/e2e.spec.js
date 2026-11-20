import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const shots = resolve(dirname(fileURLToPath(import.meta.url)), '../screenshots');
mkdirSync(shots, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: resolve(shots, name), fullPage: false });
}

test.describe('Triple Tidy', () => {
  test('start, win level 1, lose, and offline play', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Triple Tidy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
    await shot(page, '01-home.png');

    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByRole('heading', { name: 'Level 1' })).toBeVisible();
    await expect(page.locator('.tile').first()).toBeVisible();
    await shot(page, '02-level-1.png');

    const result = await page.evaluate(async () => {
      window.__TT__.setFast(true);
      return window.__TT__.playSolution(0);
    });
    expect(result.ok).toBeTruthy();
    expect(result.status).toBe('won');
    await expect(page.getByRole('heading', { name: 'Board tidied!' })).toBeVisible();
    await page.locator('.modal').waitFor({ state: 'visible' });
    await page.waitForTimeout(350);
    await shot(page, '03-win.png');

    await page.getByRole('button', { name: 'Replay' }).click();
    await expect(page.getByRole('heading', { name: 'Level 1' })).toBeVisible();
    await page.evaluate(() => window.__TT__.forceLose());
    await expect(page.getByRole('heading', { name: 'Tray is full' })).toBeVisible();
    await page.locator('.modal').waitFor({ state: 'visible' });
    await page.waitForTimeout(350);
    await shot(page, '04-lose.png');

    await page.getByRole('button', { name: 'Levels', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Levels' })).toBeVisible();
    await shot(page, '05-levels.png');

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Triple Tidy' })).toBeVisible();
    await page.waitForFunction(() => navigator.serviceWorker?.controller || navigator.serviceWorker?.ready);
    await page.evaluate(() => navigator.serviceWorker.ready);
    // Give the SW a moment to finish caching on first visit.
    await page.waitForTimeout(500);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Triple Tidy' })).toBeVisible();
    await page.getByRole('button', { name: /Play|Continue/ }).click();
    await expect(page.getByRole('heading', { name: /Level/ })).toBeVisible();
    await shot(page, '06-offline.png');
    await context.setOffline(false);
  });
});
