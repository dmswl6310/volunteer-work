# 🤝 봉사활동 매칭 플랫폼

관리자 승인 기반의 봉사활동 모집·신청 플랫폼입니다.  
봉사 단체가 활동을 게시하고, 봉사자가 신청하는 전체 흐름을 구현했습니다.

---

## 화면 미리보기

| 게시판 | 게시글 상세 | 마이페이지 | 관리자 |
|:---:|:---:|:---:|:---:|
| ![board](public/screenshots/board.png) | ![detail](public/screenshots/detail.png) | ![mypage](public/screenshots/mypage.png) | ![admin](public/screenshots/admin.png) |

---

## 주요 기능

### 👤 회원 인증 & 승인
- 이메일/비밀번호 회원가입
- **관리자 승인 후 서비스 이용** (미승인 유저는 로그인해도 접근 차단)
- 서버 레이아웃 단에서 승인 여부 체크 → 모든 보호 라우트에 자동 적용

### 📋 봉사활동 게시판
- 무한 스크롤 (Intersection Observer)
- 카테고리 / 최신순·마감순 필터
- 긴급 공고 별도 표시
- 게시글 스크랩(북마크)

### 📝 신청 & 관리
- 봉사 신청 `pending → approved → confirmed` 단계별 관리
- 모집 인원 초과 방지
- 마감 기한 자동 체크

### ✍️ 후기 시스템
- `confirmed` 상태(봉사 완료 확인)된 신청자만 후기 작성 가능
- 봉사 기간 종료 후에만 작성 가능

### 🛡️ 관리자 대시보드
- 미승인 회원 목록 조회 및 승인
- 신청 내역 승인/거절

---

## 기술 스택

| 분류 | 기술 | 선택 이유 |
|------|------|---------|
| Framework | **Next.js 16** (App Router) | Server Actions으로 별도 API 서버 없이 DB 직접 접근 |
| Database | **Supabase** (PostgreSQL) | Auth + DB + RLS를 하나의 서비스로 관리 |
| Auth | **Supabase Auth** | 세션 쿠키 기반, SSR 환경에서도 안전하게 동작 |
| Styling | **Tailwind CSS v4** | 빠른 UI 개발, 모바일 퍼스트 |
| Language | **TypeScript** | 타입 안전성 |

---

## 아키텍처 & 설계 포인트

### Server Actions 활용
별도 API Route 없이 Server Actions으로 모든 DB 쿼리를 처리합니다.  
클라이언트에서 함수처럼 호출 가능하고, TypeScript 타입이 그대로 유지됩니다.

```
클라이언트 컴포넌트 → Server Action 호출 → Supabase DB
(API Route 불필요, 타입 안전, 서버에서만 실행)
```

### 서버 사이드 인증 체크
`(main)/layout.tsx`에서 모든 보호 라우트에 대해 서버 단에서 인증 + 승인 여부를 체크합니다.  
클라이언트 사이드 체크에 의존하지 않아 우회가 불가능합니다.

### DB 구조 (주요 테이블)

```
auth.users (Supabase 관리)
    └── UUID 공유
public.users ──── posts ──── applications
                        ├─── reviews
                        └─── post_scraps
```

---

## 프로젝트 구조

```
app/
  auth/         # 로그인, 회원가입 (공개 라우트)
  (main)/       # 보호 라우트 (layout에서 인증/승인 체크)
    board/      # 게시글 목록·상세·작성
    mypage/     # 마이페이지
    admin/      # 관리자 대시보드
    reviews/    # 후기
actions/        # Server Actions (모든 DB 접근)
components/     # 공통 UI 컴포넌트
lib/
  supabase.ts   # 클라이언트·서버 Supabase 인스턴스
```
