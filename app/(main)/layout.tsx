import BottomNav from '@/components/BottomNav';
import PullToRefresh from '@/components/PullToRefresh';
import { Analytics } from '@vercel/analytics/react';
import { getOptionalApprovedUser } from '@/lib/server-auth';

export default async function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const viewer = await getOptionalApprovedUser();

    return (
        <>
            <main className="max-w-md mx-auto min-h-screen bg-white pb-20">
                <PullToRefresh>
                    {children}
                </PullToRefresh>
            </main>
            <BottomNav isAuthenticated={Boolean(viewer)} />
            <Analytics />
        </>
    );
}
