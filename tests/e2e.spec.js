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
  test('campaign, worlds, daily, settings, and offline play', async ({ page, context }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Meadow Pile' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Play' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Worlds' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Daily Puzzle' })).toBeVisible();
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
    await expect(page.getByText('Meadow')).toBeVisible();
    await shot(page, '06-levels.png');

    await page.getByRole('button', { name: 'Back to worlds' }).click();
    await expect(page.getByRole('heading', { name: 'Worlds' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Meadow/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Orchard locked/ })).toBeDisabled();
    await shot(page, '08-worlds.png');

    await page.evaluate(() => window.__TT__.startLevel(21));
    await expect(page.getByRole('heading', { name: 'Level 21' })).toBeVisible();
    await expect(page.locator('.mechanic-card')).toBeVisible();
    await expect(page.getByText(/locked tile/i)).toBeVisible();
    await expect(page.locator('.tile.locked-tile').first()).toBeVisible();
    await shot(page, '09-lock-tip.png');
    await page.getByRole('button', { name: 'Got it' }).click();
    await expect(page.locator('.mechanic-card')).toHaveCount(0);
    const orchard = await page.evaluate(async () => {
      window.__TT__.setFast(true);
      return window.__TT__.playSolution(0);
    });
    expect(orchard.ok).toBeTruthy();

    await page.evaluate(() => window.__TT__.startLevel(61));
    await expect(page.getByRole('heading', { name: 'Level 61' })).toBeVisible();
    await expect(page.locator('.tile.ice').first()).toBeVisible();
    await expect(page.locator('.mechanic-card')).toBeVisible();
    const pond = await page.evaluate(async () => {
      window.__TT__.setFast(true);
      window.__TT__.dismissTip();
      window.__TT__.dismissTip();
      return window.__TT__.playSolution(0);
    });
    expect(pond.ok).toBeTruthy();

    await page.evaluate(() => window.__TT__.go('daily'));
    await expect(page.getByRole('heading', { name: 'Daily Puzzle' })).toBeVisible();
    await page.getByRole('button', { name: /Play today|Play again/ }).click();
    const daily = await page.evaluate(async () => {
      window.__TT__.setFast(true);
      window.__TT__.dismissTip();
      return window.__TT__.playSolution(0);
    });
    expect(daily.ok).toBeTruthy();
    await expect(page.getByRole('heading', { name: 'Board tidied!' })).toBeVisible();

    await page.evaluate(() => window.__TT__.go('stats'));
    await expect(page.getByRole('heading', { name: 'Stats' })).toBeVisible();
    await expect(page.getByText('Badges')).toBeVisible();

    await page.evaluate(() => window.__TT__.go('settings'));
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
    await page.getByRole('button', { name: 'Disable vibration' }).click();
    await expect(page.getByRole('button', { name: 'Enable vibration' })).toBeVisible();

    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Meadow Pile' })).toBeVisible();
    await page.waitForFunction(() => navigator.serviceWorker?.controller || navigator.serviceWorker?.ready);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForTimeout(500);
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Meadow Pile' })).toBeVisible();
    await page.getByRole('button', { name: /Play|Continue/ }).click();
    await expect(page.getByRole('heading', { name: /Level|Daily Puzzle/ })).toBeVisible();
    await shot(page, '07-offline.png');
    await context.setOffline(false);
  });
});
