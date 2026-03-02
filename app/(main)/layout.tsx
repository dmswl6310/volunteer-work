import { createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import PullToRefresh from '@/components/PullToRefresh';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createServerSupabaseClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // 승인 상태 확인
    const { data: dbUser } = await supabase
        .from('users')
        .select('is_approved')
        .eq('id', user.id)
        .maybeSingle();

    if (!dbUser || !dbUser.is_approved) {
        redirect('/auth/login?error=approval_pending');
    }

    return (
        <>
            <main className="max-w-md mx-auto min-h-screen bg-white pb-20">
                <PullToRefresh>
                    {children}
                </PullToRefresh>
            </main>
            <BottomNav />
        </>
    );
}
