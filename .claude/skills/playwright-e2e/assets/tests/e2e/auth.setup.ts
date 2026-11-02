import { expect, test as setup } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.E2E_USER_EMAIL ?? '');
  await page.getByLabel('Password').fill(process.env.E2E_USER_PASSWORD ?? '');
  await page.getByRole('button', { name: 'Accedi' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await mkdir(dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
