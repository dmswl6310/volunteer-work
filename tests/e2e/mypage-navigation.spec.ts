import { expect, test } from '@playwright/test';
import { hasAuthenticatedE2ECreds, login, testCredentials } from './helpers';

test.describe('mypage navigation smoke', () => {
  test.skip(!hasAuthenticatedE2ECreds(), 'Authenticated E2E credentials are not configured.');

  test('approved user can move across primary mypage tabs and subpages', async ({ page }) => {
    await login(page, testCredentials.userEmail!, testCredentials.userPassword!);

    await page.goto('/mypage');
    await expect(page.getByRole('heading', { name: '신청 관리' })).toBeVisible();

    await page.getByRole('link', { name: '관심/기록' }).click();
    await expect(page).toHaveURL(/\/mypage\/history/);
    await expect(page.getByRole('heading', { name: '관심/기록' })).toBeVisible();

    await page.getByRole('link', { name: '프로필 편집' }).click();
    await expect(page).toHaveURL(/\/mypage\/profile/);
    await expect(page.getByRole('heading', { name: '내 정보' })).toBeVisible();

    await page.getByRole('link', { name: '신청 관리' }).click();
    await expect(page).toHaveURL(/\/mypage$/);
    await expect(page.getByRole('heading', { name: '신청 관리' })).toBeVisible();
  });
});
