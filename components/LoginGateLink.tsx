'use client';

import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { buildLoginHref, LOGIN_REQUIRED_CONFIRM_OPTIONS } from '@/lib/auth-navigation';
import { useToast } from '@/components/ToastProvider';

type LoginGateLinkProps = {
  href: string;
  isAuthenticated: boolean;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  message?: string;
};

export default function LoginGateLink({
  href,
  isAuthenticated,
  children,
  className,
  ariaLabel,
  message = '로그인 후 이용할 수 있어요. 로그인 페이지로 이동할까요?',
}: LoginGateLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { showConfirm } = useToast();
  const loginHref = buildLoginHref(href, pathname);

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return;

    event.preventDefault();
    const shouldLogin = await showConfirm(message, LOGIN_REQUIRED_CONFIRM_OPTIONS);

    if (shouldLogin) {
      router.push(loginHref);
    }
  };

  return (
    <Link href={isAuthenticated ? href : loginHref} onClick={handleClick} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
