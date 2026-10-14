import { test, expect } from '@playwright/test';

test('/ sirve español y /en inglés', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
