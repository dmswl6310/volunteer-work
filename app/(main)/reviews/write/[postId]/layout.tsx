import type { ReactNode } from 'react';
import { requireApprovedPageUser } from '@/lib/page-auth';

export default async function ReviewWriteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  await requireApprovedPageUser(`/reviews/write/${postId}`, `/board/${postId}`);
  return children;
}
