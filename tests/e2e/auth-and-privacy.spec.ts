import { expect, test } from '@playwright/test';

test.describe('public browsing and privacy guards', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/auth/login?next=%2Fboard%2Fwrite&back=%2Freviews');

    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
    await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
    await expect(page.getByRole('button', { name: '이전 화면으로 돌아가기' })).toBeVisible();
    await expect(page.getByRole('link', { name: '로그인 없이 둘러보기' })).toHaveAttribute('href', '/board');

    await page.getByRole('button', { name: '이전 화면으로 돌아가기' }).click();
    await expect(page).toHaveURL(/\/reviews$/);
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

  test('root and board are publicly browseable', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/board/);
    await expect(page.getByRole('heading', { name: '봉사활동 찾기' })).toBeVisible();
    await expect(page.getByRole('link', { name: '내 정보, 로그인 필요' })).toHaveAttribute(
      'href',
      '/auth/login?next=%2Fmypage&back=%2Fboard'
    );
    await expect(page.getByRole('link', { name: '로그인', exact: true })).toHaveCount(0);
  });

  test('reviews are publicly browseable', async ({ page }) => {
    await page.goto('/reviews');

    await expect(page).toHaveURL(/\/reviews/);
    await expect(page.getByRole('heading', { name: '봉사활동 후기' })).toBeVisible();
  });

  test('guest detail does not advertise protected organizer contact', async ({ page }) => {
    await page.goto('/board?status=all');

    const postCards = page.getByTestId('post-card');
    await expect(postCards.first()).toBeVisible();
    const detailHref = await postCards.first().getAttribute('href');
    expect(detailHref).toBeTruthy();

    await page.goto(detailHref!);
    await expect(page.getByText('참여 승인 후 연락처를 확인할 수 있어요')).toHaveCount(0);
    await expect(page.getByText('승인되면 주최자 연락 방법을 확인할 수 있어요')).toHaveCount(0);
  });

  test('activity creation redirects guests to login and preserves destination', async ({ page }) => {
    await page.goto('/board/write');

    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/auth/login' &&
        url.searchParams.get('next') === '/board/write' &&
        url.searchParams.get('back') === '/board'
    );
    await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  });

  test('mypage redirects guests to login', async ({ page }) => {
    await page.goto('/mypage');

    await expect(page).toHaveURL(
      (url) =>
        url.pathname === '/auth/login' &&
        url.searchParams.get('next') === '/mypage' &&
        url.searchParams.get('back') === '/board'
    );
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
