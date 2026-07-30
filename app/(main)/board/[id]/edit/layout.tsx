import type { ReactNode } from 'react';
import { requireApprovedPageUser } from '@/lib/page-auth';

export default async function BoardEditLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: postId } = await params;
  await requireApprovedPageUser(`/board/${postId}/edit`, `/board/${postId}`);
  return children;
}
