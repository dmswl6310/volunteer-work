import { expect, test } from '@playwright/test';
import { hasAuthenticatedE2ECreds, login, testCredentials } from './helpers';

test.describe('authenticated role-based flows', () => {
  test.skip(!hasAuthenticatedE2ECreds(), 'Authenticated E2E credentials are not configured.');

  test('approved user can log in, browse mypage surfaces, but not admin', async ({ page }) => {
    await login(page, testCredentials.userEmail!, testCredentials.userPassword!);

    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByRole('heading', { name: '봉사활동 찾기' })).toBeVisible();

    await page.goto('/mypage');
    await expect(page.getByText('내 포인트')).toBeVisible();

    await page.goto('/mypage/points');
    await expect(page.getByRole('heading', { name: '포인트 내역' })).toBeVisible();

    await page.goto('/mypage/history');
    await expect(page.getByRole('heading', { name: '관심/기록' })).toBeVisible();

    await page.goto('/mypage/profile');
    await expect(page.getByRole('heading', { name: '내 정보' })).toBeVisible();

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/mypage/);
    await expect(page.getByRole('heading', { name: '내 신청' })).toBeVisible();
  });

  test('admin can log in and access admin dashboard', async ({ page }) => {
    await login(page, testCredentials.adminEmail!, testCredentials.adminPassword!);

    await expect(page).toHaveURL(/\/board/);
    await page.goto('/mypage');
    await expect(page.getByText('내 포인트')).toBeVisible();
    await expect(page.getByRole('link', { name: '관리자 대시보드' })).toBeVisible();

    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: '관리자 대시보드' })).toBeVisible();
    await expect(page.getByText('가입 승인 대기 회원')).toBeVisible();
    await expect(page.getByRole('heading', { name: '고객 문의' })).toBeVisible();
  });
});
