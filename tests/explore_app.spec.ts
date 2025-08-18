import { test, expect } from '@playwright/test';

test('explore homepage', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle');

  const text = await page.textContent('body');
  console.log('--- Page Content: http://localhost:5173/ ---');
  console.log(text);

  const links = await page.$$eval('a', (as) => as.map((a) => a.href));
  console.log('--- Links ---');
  console.log(links);
});
