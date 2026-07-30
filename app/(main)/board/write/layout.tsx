import type { ReactNode } from 'react';
import { requireApprovedPageUser } from '@/lib/page-auth';

export default async function BoardWriteLayout({ children }: { children: ReactNode }) {
  await requireApprovedPageUser('/board/write', '/board');
  return children;
}
