import { expect, test } from '@playwright/test';

test.describe('public auth and privacy guards', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/auth/login');

    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  });

  test('signup page renders onboarding steps', async ({ page }) => {
    await page.goto('/auth/signup');

    await expect(page.getByRole('heading', { name: '회원가입' })).toBeVisible();
    await expect(page.getByText('계정 정보')).toBeVisible();
    await expect(page.getByText('로그인에 사용할 이메일과 비밀번호를 입력해주세요.')).toBeVisible();
    await expect(page.getByLabel('이메일 (아이디)')).toBeVisible();
    await expect(page.getByPlaceholder('6자 이상 입력해주세요')).toBeVisible();
    await expect(page.getByPlaceholder('비밀번호를 한번 더 입력해주세요')).toBeVisible();
  });

  test('protected board redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/board');

    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  });

  test('admin route is not publicly reachable', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('public admin bootstrap route is removed', async ({ request }) => {
    const response = await request.get('/api/setup-admin');

    expect(response.status()).toBe(404);
  });
});
