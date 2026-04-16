import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { ChevronRight, ExternalLink, MessageSquareText, PencilLine } from 'lucide-react';

const RELEASE_NOTES_URL = 'https://www.notion.so/34378c2336a080438bfad481f935c596';

const SETTINGS_LINKS = [
  {
    href: '/mypage/profile',
    label: '내 정보',
    description: '연락처, 주소, 직업 정보를 수정합니다.',
    icon: PencilLine,
  },
  {
    href: '/mypage/support/new',
    label: '문의하기',
    description: '서비스 이용 중 궁금한 점이나 불편한 점을 남겨주세요.',
    icon: MessageSquareText,
  },
] as const;

export default function MyPageSettingsPage() {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200/80 bg-white px-5 py-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Settings</p>
        <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em] text-slate-900">설정</h2>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.04)] divide-y divide-slate-100">
        {SETTINGS_LINKS.map((item) => {
          const Icon = item.icon;

          return (
            <Link key={item.href} href={item.href} className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/70">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
          );
        })}

        <a
          href={RELEASE_NOTES_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-slate-50/70"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
            <ExternalLink className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-900">업데이트 내역</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">새 탭에서 릴리즈 노트와 패치 내역을 확인할 수 있어요.</p>
          </div>
          <ExternalLink className="h-4 w-4 text-slate-300" />
        </a>
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white px-4 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <div className="rounded-2xl bg-slate-50/70 p-1 text-slate-500">
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
