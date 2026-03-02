import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import OfflineIndicator from '@/components/OfflineIndicator';

const inter = Inter({ subsets: ['latin'] });

/** 모바일 viewport 최적화 (확대 방지, iOS safe-area 대응) */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#4f46e5',
};

export const metadata: Metadata = {
  title: 'Together | 봉사활동 플랫폼',
  description: '함께하는 봉사활동 참여 및 관리 플랫폼',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Together',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon.svg" />
      </head>
      <body className={inter.className}>
        <ToastProvider>
          <OfflineIndicator />
          {children}
        </ToastProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
