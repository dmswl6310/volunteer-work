import { ImageResponse } from 'next/og';

export const alt = '라자봉 - 게릴라 자원봉사';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fef3c7 0%, #f59e0b 44%, #b45309 100%)',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="300"
          height="300"
        >
          <path fill="#7c2d12" opacity="0.18" d="M126 390c40 56 219 59 262-3 35-50 10-148-52-193-50-36-117-39-170-6-66 42-78 149-40 202Z" />
          <path fill="#f97316" d="M113 347c0 84 64 131 143 131s143-47 143-131c0-104-64-187-143-187s-143 83-143 187Z" />
          <path fill="#fbbf24" d="M143 333c0 63 50 105 113 105s113-42 113-105c0-82-50-146-113-146s-113 64-113 146Z" opacity="0.88" />
          <path fill="#92400e" d="M239 120h34v72h-34z" rx="17" />
          <path fill="#15803d" d="M269 132c37-55 91-71 136-46-14 52-64 82-127 63-7-2-11-10-9-17Z" />
          <path fill="#65a30d" d="M238 140c-42-36-84-39-119-11 20 39 63 55 112 29 7-4 11-13 7-18Z" />
          <g fill="#ea580c" opacity="0.62">
            <circle cx="202" cy="286" r="9" />
            <circle cx="273" cy="256" r="7" />
            <circle cx="316" cy="331" r="8" />
            <circle cx="232" cy="371" r="7" />
          </g>
        </svg>
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
            fontFamily: 'sans-serif',
          }}
        >
          라자봉 - 게릴라 자원봉사
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
