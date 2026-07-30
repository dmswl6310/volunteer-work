'use client';

import type { MouseEvent, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buildLoginHref } from '@/lib/auth-navigation';
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
  const { showConfirm } = useToast();

  const handleClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) return;

    event.preventDefault();
    const shouldLogin = await showConfirm(message, {
      title: '로그인 필요',
      confirmLabel: '로그인하기',
    });

    if (shouldLogin) {
      router.push(buildLoginHref(href));
    }
  };

  return (
    <Link href={isAuthenticated ? href : buildLoginHref(href)} onClick={handleClick} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
