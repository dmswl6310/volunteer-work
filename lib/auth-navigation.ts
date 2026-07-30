export const LOGIN_REQUIRED_CONFIRM_OPTIONS = {
  title: '로그인 필요',
  confirmLabel: '로그인하기',
} as const;

export function buildLoginHref(returnTo: string, backTo?: string) {
  const params = new URLSearchParams({ next: returnTo });
  if (backTo) {
    params.set('back', backTo);
  }
  return `/auth/login?${params.toString()}`;
}

export function getSafeReturnTo(value: string | null | undefined, fallback = '/board') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback;
  }

  try {
    const url = new URL(value, 'https://local.invalid');
    if (url.origin !== 'https://local.invalid') return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
