import { redirect } from 'next/navigation';
import { buildLoginHref } from '@/lib/auth-navigation';
import { requireApprovedUser } from '@/lib/server-auth';

export async function requireApprovedPageUser(returnTo: string, backTo = '/board') {
  try {
    return await requireApprovedUser();
  } catch {
    redirect(buildLoginHref(returnTo, backTo));
  }
}
