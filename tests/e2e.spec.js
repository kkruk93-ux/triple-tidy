import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const shots = resolve(dirname(fileURLToPath(import.meta.url)), '../screenshots');
mkdirSync(shots, { recursive: true });

async function shot(page, name) {
  await page.screenshot({ path: resolve(shots, name), fullPage: false });
}

test.describe('Meadow Pile', () => {
  test('start, win level 1, lose, and offline play', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Meadow Pile' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
    await shot(page, '01-home.png');

    await page.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByRole('heading', { name: 'Level 1' })).toBeVisible();
    await expect(page.locator('.tile').first()).toBeVisible();
    await expect(page.locator('.tutorial-card')).toBeVisible();
    await expect(page.getByText('Tap a bright tile')).toBeVisible();
    await page.waitForTimeout(200);
    await shot(page, '02-tutorial.png');
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Three of a kind vanish')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('If the tray fills up')).toBeVisible();
    await page.getByRole('button', { name: 'Got it' }).click();
    await expect(page.locator('.tutorial-card')).toHaveCount(0);
    await shot(page, '03-level-1.png');

    const result = await page.evaluate(async () => {
      window.__TT__.setFast(true);
      return window.__TT__.playSolution(0);
    });
    expect(result.ok).toBeTruthy();
    expect(result.status).toBe('won');
    await expect(page.getByRole('heading', { name: 'Board tidied!' })).toBeVisible();
    await page.locator('.modal').waitFor({ state: 'visible' });
    await page.waitForTimeout(350);
    await shot(page, '04-win.png');

    await page.getByRole('button', { name: 'Replay' }).click();
    await expect(page.getByRole('heading', { name: 'Level 1' })).toBeVisible();
    await page.evaluate(() => window.__TT__.forceLose());
    await expect(page.getByRole('heading', { name: 'Tray is full' })).toBeVisible();
    await page.locator('.modal').waitFor({ state: 'visible' });
    await page.waitForTimeout(350);
    await shot(page, '05-lose.png');

    await page.getByRole('button', { name: 'Levels', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Levels' })).toBeVisible();
    await shot(page, '06-levels.png');

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Meadow Pile' })).toBeVisible();
    await page.waitForFunction(() => navigator.serviceWorker?.controller || navigator.serviceWorker?.ready);
    await page.evaluate(() => navigator.serviceWorker.ready);
    // Give the SW a moment to finish caching on first visit.
    await page.waitForTimeout(500);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Meadow Pile' })).toBeVisible();
    await page.getByRole('button', { name: /Play|Continue/ }).click();
    await expect(page.getByRole('heading', { name: /Level/ })).toBeVisible();
    await shot(page, '07-offline.png');
    await context.setOffline(false);
  });
});
