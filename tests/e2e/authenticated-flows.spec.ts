import { expect, test } from '@playwright/test';
import { hasAuthenticatedE2ECreds, login, testCredentials } from './helpers';

test.describe('authenticated role-based flows', () => {
  test.skip(!hasAuthenticatedE2ECreds(), 'Authenticated E2E credentials are not configured.');

  test('approved user can log in and access board, but not admin', async ({ page }) => {
    await login(page, testCredentials.userEmail!, testCredentials.userPassword!);

    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByRole('heading', { name: '봉사활동 찾기' })).toBeVisible();

    await page.goto('/mypage');
    await expect(page.getByText('내 포인트')).toBeVisible();

    await page.goto('/admin');
    await expect(page).toHaveURL(/\/mypage/);
    await expect(page.getByRole('heading', { name: '내 정보' })).toBeVisible();
  });

  test('admin can log in and access admin dashboard', async ({ page }) => {
    await login(page, testCredentials.adminEmail!, testCredentials.adminPassword!);

    await expect(page).toHaveURL(/\/board/);
    await page.goto('/mypage');
    await expect(page.getByText('내 포인트')).toBeVisible();
    await expect(page.getByRole('link', { name: '관리자 대시보드 접속' })).toBeVisible();

    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: '관리자 대시보드' })).toBeVisible();
    await expect(page.getByText('가입 승인 대기 회원')).toBeVisible();
    await expect(page.getByText('봉사 신청 승인 대기')).toBeVisible();
  });
});
