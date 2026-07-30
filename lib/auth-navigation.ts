export function buildLoginHref(returnTo: string) {
  return `/auth/login?next=${encodeURIComponent(returnTo)}`;
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
