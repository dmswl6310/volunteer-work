import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

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
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
           <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <Link href="/" className="font-bold text-xl text-indigo-600">Together</Link>
              <div className="hidden md:flex space-x-4 text-sm font-medium text-gray-600">
                  <Link href="/board" className="hover:text-indigo-600">봉사활동</Link>
                  <Link href="/reviews" className="hover:text-indigo-600">후기</Link>
              </div>
              <div className="flex space-x-3 text-sm">
                   <Link href="/auth/login" className="px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition">로그인</Link>
                   <Link href="/auth/signup" className="px-3 py-1.5 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition">회원가입</Link>
              </div>
           </div>
        </nav>
        <main className="max-w-5xl mx-auto min-h-screen bg-white">
            {children}
        </main>
      </body>
    </html>
  );
}
