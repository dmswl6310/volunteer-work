import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Volunteer Platform',
  description: '봉사활동 참여 및 관리 플랫폼',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <main className="max-w-md mx-auto min-h-screen bg-white pb-20">
            {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
