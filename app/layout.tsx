import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import OfflineIndicator from '@/components/OfflineIndicator';

/** 모바일 viewport 최적화 (확대 방지, iOS safe-area 대응) */
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#d97706',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: '라자봉 - 게릴라 자원봉사',
  description: '라자봉과 함께하는 게릴라 자원봉사 참여 및 관리 플랫폼',
  openGraph: {
    title: '라자봉 - 게릴라 자원봉사',
    description: '라자봉과 함께하는 게릴라 자원봉사 참여 및 관리 플랫폼',
  },
  twitter: {
    card: 'summary_large_image',
    title: '라자봉 - 게릴라 자원봉사',
    description: '라자봉과 함께하는 게릴라 자원봉사 참여 및 관리 플랫폼',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '라자봉',
  },
};

import NextTopLoader from 'nextjs-toploader';

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
      <body>
        <NextTopLoader
          color="#d97706"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #d97706,0 0 5px #d97706"
        />
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
