import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '라자봉 앱 다운로드',
  description: '라자봉 PWA 앱 설치 안내',
};

const installSteps = [
  {
    platform: 'Android',
    browser: 'Chrome',
    steps: ['QR 스캔 후 Chrome으로 사이트 열기', '오른쪽 상단 점 세 개 메뉴 누르기', '홈 화면에 추가 선택하기'],
    note: 'Android에서는 화면 안의 앱 설치 버튼이 아니라 Chrome 메뉴에서 홈 화면에 추가를 눌러주세요.',
    screenshots: [
      {
        src: '/images/android-add-home-menu-button.jpg',
        alt: 'Chrome 오른쪽 상단 점 세 개 메뉴 위치',
        caption: '1. 오른쪽 상단 점 세 개 메뉴를 눌러요.',
      },
      {
        src: '/images/android-add-home-menu-item.jpg',
        alt: 'Chrome 메뉴의 홈 화면에 추가 항목',
        caption: '2. 메뉴에서 홈 화면에 추가를 선택해요.',
      },
    ],
  },
  {
    platform: 'iPhone',
    browser: 'Safari',
    steps: ['QR 스캔 후 Safari로 열기', '공유 버튼 누르기', '홈 화면에 추가 선택'],
    screenshots: [],
  },
];

export default function QrPage() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-stone-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col items-center justify-center gap-8 px-5 py-8 sm:px-8 lg:grid lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:py-10">
        <div className="flex w-full flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-xl font-bold text-orange-700 sm:text-2xl">발대식 참여자 안내</p>
          <h1 className="mt-3 text-5xl font-black leading-tight text-stone-950 sm:text-7xl lg:text-8xl">
            라자봉 앱<br />
            설치하기
          </h1>
          <p className="mt-5 max-w-2xl text-2xl font-semibold leading-snug text-stone-700 sm:text-3xl">
            QR을 찍고 홈 화면에 추가하면 앱처럼 바로 사용할 수 있어요.
          </p>
          <div className="mt-8 inline-flex items-center justify-center rounded-full bg-orange-600 px-7 py-4 text-2xl font-black text-white shadow-lg shadow-orange-200 sm:text-3xl">
            https://volunteer-work.vercel.app/
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-6">
          <div className="w-full max-w-[560px] rounded-[2rem] border-8 border-orange-500 bg-white p-5 shadow-2xl shadow-orange-100 sm:p-8">
            <Image
              src="/images/launch-qr.jpg"
              alt="라자봉 앱 다운로드 QR 코드"
              width={1000}
              height={1000}
              priority
              className="h-auto w-full"
            />
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2">
            {installSteps.map((item) => (
              <section
                key={item.platform}
                className="rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-lg shadow-orange-100"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-3xl font-black text-stone-950">{item.platform}</h2>
                  <p className="text-xl font-bold text-orange-700">{item.browser}</p>
                </div>
                <ol className="mt-4 space-y-3">
                  {item.steps.map((step, index) => (
                    <li key={step} className="flex gap-3 text-xl font-bold leading-tight text-stone-800">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-orange-600 text-lg font-black text-white">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                {'note' in item ? (
                  <p className="mt-4 rounded-xl bg-orange-50 px-4 py-3 text-lg font-bold leading-snug text-orange-800">
                    {item.note}
                  </p>
                ) : null}
                {item.screenshots.length > 0 ? (
                  <div className="mt-4 grid gap-3">
                    {item.screenshots.map((screenshot) => (
                      <figure key={screenshot.src} className="overflow-hidden rounded-xl border border-orange-100 bg-orange-50">
                        <Image
                          src={screenshot.src}
                          alt={screenshot.alt}
                          width={921}
                          height={2048}
                          className="h-auto w-full"
                        />
                        <figcaption className="px-3 py-2 text-base font-bold leading-snug text-stone-800">
                          {screenshot.caption}
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
