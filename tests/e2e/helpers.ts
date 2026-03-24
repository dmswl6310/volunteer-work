import { expect, Page } from '@playwright/test';

export const testCredentials = {
  adminEmail: process.env.E2E_ADMIN_EMAIL,
  adminPassword: process.env.E2E_ADMIN_PASSWORD,
  userEmail: process.env.E2E_USER_EMAIL,
  userPassword: process.env.E2E_USER_PASSWORD,
};

export function hasAuthenticatedE2ECreds() {
  return Boolean(
    testCredentials.adminEmail &&
      testCredentials.adminPassword &&
      testCredentials.userEmail &&
      testCredentials.userPassword
  );
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.getByPlaceholder('이메일 주소').fill(email);
  await page.getByPlaceholder('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();

  await expect(page).not.toHaveURL(/\/auth\/login/, { timeout: 15_000 });
}
