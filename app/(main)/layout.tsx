import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Check approval status directly from DB (bypassing RLS)
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { isApproved: true }
    });

    if (!dbUser || !dbUser.isApproved) {
        // Create a way to sign out?
        // Since this is server component, we can't easily sign out client-side.
        // But we can redirect to a page that handles sign out, or back to login with error.
        redirect('/auth/login?error=approval_pending');
    }

    return (
        <>
            <main className="max-w-md mx-auto min-h-screen bg-white pb-20">
                {children}
            </main>
            <BottomNav />
        </>
    );
}
