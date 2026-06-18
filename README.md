# 🤝 라자봉 - 게릴라 자원봉사

관리자 승인 기반으로 운영되는 모바일 중심 봉사활동 매칭 플랫폼입니다.  
봉사활동 모집글 등록, 신청/승인, 참여 확인, 포인트 적립, 후기, 고객 문의까지 한 흐름으로 연결되어 있습니다.

---

## 화면 미리보기

| 게시판 | 게시글 상세 | 마이페이지 | 관리자 |
|:---:|:---:|:---:|:---:|
| ![board](public/screenshots/board.png) | ![detail](public/screenshots/detail.png) | ![mypage](public/screenshots/mypage.png) | ![admin](public/screenshots/admin.png) |

---

## 참고 문서

- [AGENTS.md](AGENTS.md): 저장소 구조, 개발 명령어, 테스트, 커밋/PR 규칙을 정리한 기여자 가이드
- [LAUNCH_DEMO_PLAN.md](LAUNCH_DEMO_PLAN.md): 발대식 시연 동선, 데모 데이터, 리스크 대응 체크리스트

---

## 핵심 기능 요약

### 1. 인증 / 회원가입 / 관리자 승인
- 이메일·비밀번호 기반 회원가입
- 3단계 회원가입 폼과 이메일/닉네임 중복 확인
- 가입 직후 바로 서비스 이용이 아니라 **관리자 승인 후 접근 가능**
- 보호 라우트는 `app/(main)/layout.tsx`에서 서버 사이드로 일괄 차단

### 2. 봉사활동 게시판
- 모집글 목록 조회
- 검색, 카테고리 필터, 모집 상태 필터, 최신순/마감순 정렬
- 긴급 모집 섹션 분리 노출
- Intersection Observer 기반 무한 스크롤
- 게시글 상세에서 작성자 연락처, 모집 현황, 스크랩 상태 확인

### 3. 신청 / 승인 / 모집 관리
- 사용자는 게시글에 신청 가능
- 신청 상태는 `pending → approved / rejected`
- 작성자 또는 관리자가 신청 승인/거절 가능
- 승인 인원 기준으로 `posts.current_participants`를 동기화
- 모집 인원 초과, 중복 신청, 마감일 경과를 서버 액션에서 차단

### 4. 참여 확인 / 포인트 적립
- 활동 종료 이후 주최자가 참석자를 확정
- 참석 확인 시 PostgreSQL RPC `confirm_attendance_and_award_points` 호출
- 봉사 시간 기준으로 포인트 지급 (`봉사시간 × 2P`)
- 포인트 내역은 `point_transactions`에 적립 이력으로 저장

### 5. 후기 / 좋아요 / 기록 관리
- 실제 참여 확인된 사용자만 후기 작성 가능
- 동일 활동에 중복 후기 작성 방지
- 후기 좋아요 기능 제공
- 마이페이지에서 완료 활동, 후기, 스크랩 기록을 통합 조회

### 6. 마이페이지
- 신청 관리 현황
- 참여 완료 활동 + 후기 작성 여부
- 내가 올린 글 / 승인 대기 요청 / 참여 확인 대기 글
- 포인트 잔액 및 적립 내역
- 프로필 수정, 로그아웃
- 고객 문의 작성

### 7. 관리자 기능
- 가입 승인 대기 회원 목록 조회 및 승인
- 고객 문의 목록 조회
- 문의 상태 변경 (`pending / in_progress / resolved`)
- 관리자 메모 작성

### 8. 운영 편의 기능
- PWA/모바일 최적화 뷰포트
- 오프라인 표시 컴포넌트
- Pull to Refresh
- 상단 로딩 바
- 고객 문의 등록 시 이메일 알림 전송 지원

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend / BaaS | Supabase |
| Database | PostgreSQL |
| Auth | Supabase Auth |
| Client/Server DB Access | `@supabase/ssr`, `@supabase/supabase-js` |
| E2E Test | Playwright |
| Mail | Nodemailer |

---

## 아키텍처 개요

이 프로젝트는 별도 API 서버를 두지 않고, **Next.js App Router + Server Actions + Supabase** 조합으로 구성되어 있습니다.

```text
Client Component / Server Component
        ↓
Server Action / Server-side Supabase Client
        ↓
Supabase Auth + PostgreSQL
```

### 설계 포인트

#### 1) 보호 라우트 일괄 제어
- `app/(main)/layout.tsx`에서 로그인 여부와 `users.is_approved`를 검사합니다.
- 승인되지 않은 사용자는 `/auth/login?error=approval_pending`으로 리다이렉트됩니다.

#### 2) DB 접근의 중심은 Server Actions
- `actions/` 폴더에 게시글, 신청, 후기, 관리자, 지원 문의, 포인트 관련 로직이 모여 있습니다.
- 클라이언트는 직접 SQL을 호출하지 않고 서버 액션을 통해 비즈니스 규칙을 수행합니다.

#### 3) Supabase Auth + public.users 이중 구조
- 인증 주체는 `auth.users`
- 서비스 프로필/권한/승인 여부는 `public.users`
- 두 테이블은 동일한 사용자 ID를 공유합니다.

#### 4) 운영성 보강
- `scripts/*.sql`에 기능 추가/운영 보정용 SQL이 정리되어 있습니다.
- 이 저장소에서는 `supabase/migrations`보다 `scripts/`가 실제 운영 변경 이력을 더 많이 담고 있습니다.

---

## 전체 기능 흐름

### 사용자 흐름
1. 회원가입 요청
2. 관리자 승인 대기
3. 승인 후 로그인
4. 게시글 탐색 / 검색 / 스크랩
5. 봉사활동 신청
6. 주최자 또는 관리자가 신청 승인
7. 활동 종료 후 주최자가 참석 확인
8. 포인트 지급
9. 후기 작성 및 좋아요

### 주최자 흐름
1. 모집글 작성
2. 신청자 검토 및 승인/거절
3. 활동 종료 후 참석자 확정
4. 포인트 지급 처리
5. 모집글 및 참여 현황 관리

### 관리자 흐름
1. 신규 가입 회원 승인
2. 고객 문의 상태 관리
3. 필요 시 운영 SQL 스크립트 실행

---

## DB 구조 정리

이 프로젝트는 **Supabase PostgreSQL**을 사용하며, 코드와 SQL 스크립트에서 확인되는 핵심 엔터티는 아래와 같습니다.

### 관계도

```text
auth.users
  └─(same id)─ public.users
                 ├─ posts.author_id
                 ├─ applications.user_id
                 ├─ reviews.author_id
                 ├─ review_likes.user_id
                 ├─ post_scraps.user_id
                 ├─ support_tickets.user_id
                 └─ point_transactions.user_id

posts
  ├─ applications.post_id
  ├─ reviews.post_id
  ├─ post_scraps.post_id
  └─ point_transactions.post_id

reviews
  └─ review_likes.review_id

applications
  └─ point_transactions.application_id

RPC
  confirm_attendance_and_award_points(post_id, application_ids)
```

### 테이블별 역할

| 엔터티 | 역할 | 주요 연결 |
|------|------|---------|
| `auth.users` | Supabase 인증 계정 | `public.users.id`와 동일 ID 공유 |
| `public.users` | 서비스 프로필, 권한, 승인, 포인트 | `posts`, `applications`, `reviews`, `support_tickets`, `point_transactions` |
| `posts` | 봉사활동 모집글 | `author_id → users.id` |
| `applications` | 신청/승인/참석 처리 상태 | `user_id → users.id`, `post_id → posts.id` |
| `reviews` | 활동 후기 | `author_id → users.id`, `post_id → posts.id` |
| `review_likes` | 후기 좋아요 매핑 | `review_id → reviews.id`, `user_id → users.id` |
| `post_scraps` | 게시글 스크랩 매핑 | `post_id → posts.id`, `user_id → users.id` |
| `support_tickets` | 고객 문의 및 관리자 응답 상태 | `user_id → users.id` |
| `point_transactions` | 포인트 적립 이력 | `user_id → users.id`, `application_id → applications.id`, `post_id → posts.id` |

#### 1. `auth.users`
- Supabase Auth가 관리하는 인증 테이블
- 이메일/비밀번호 기반 로그인 주체
- 회원가입 시 생성되며 `public.users`와 동일 ID를 공유

#### 2. `public.users`
- 서비스에서 사용하는 사용자 프로필 테이블
- 주요 컬럼
  - `id`
  - `email`
  - `username`
  - `contact`
  - `address`
  - `job`
  - `role` (`user`, `admin`)
  - `is_approved`
  - `points`
- 로그인 가능 여부, 관리자 권한, 포인트 보유량이 여기에 저장됩니다.

#### 3. `posts`
- 봉사활동 모집글
- 주요 컬럼
  - `id`
  - `author_id`
  - `title`
  - `content`
  - `category`
  - `image_url`
  - `max_participants`
  - `current_participants`
  - `volunteer_hours`
  - `is_urgent`
  - `is_recruiting`
  - `due_date`
  - `views`
  - `scraps`

#### 4. `applications`
- 사용자의 봉사활동 신청 정보
- 주요 컬럼 / 상태
  - `post_id`
  - `user_id`
  - `status` (`pending`, `approved`, `rejected`)
  - `attended_at`
  - `attendance_marked_by`
  - `points_awarded_at`
- 단순 신청 테이블을 넘어서, 실제 참석 확정과 포인트 지급 처리 상태까지 함께 관리합니다.

#### 5. `reviews`
- 봉사활동 후기
- `post_id`, `author_id`, `content`, `created_at`
- 참석 확인된 사용자만 작성할 수 있습니다.

#### 6. `review_likes`
- 후기 좋아요 연결 테이블
- 한 사용자가 어떤 후기에 좋아요를 눌렀는지 저장합니다.

#### 7. `post_scraps`
- 게시글 북마크(스크랩) 연결 테이블
- 사용자가 관심 있는 모집글을 저장합니다.

#### 8. `support_tickets`
- 고객 문의 테이블
- 주요 컬럼
  - `category` (`inquiry`, `bug`, `feedback`)
  - `status` (`pending`, `in_progress`, `resolved`)
  - `title`
  - `content`
  - `username_snapshot`
  - `email_snapshot`
  - `admin_note`
  - `resolved_at`
- 관리자용 RLS 정책이 SQL로 함께 정의되어 있습니다.

#### 9. `point_transactions`
- 포인트 적립 이력
- 주요 컬럼
  - `user_id`
  - `application_id`
  - `post_id`
  - `points`
  - `transaction_type`
  - `description`
  - `created_at`
- 마이페이지 포인트 화면은 이 테이블을 기준으로 구성됩니다.

### RPC / 함수

#### `confirm_attendance_and_award_points`
- 활동 종료 후 참석자를 확정하고 포인트를 적립하는 PostgreSQL 함수입니다.
- 권한 체크, 활동 종료일 검증, 신청 상태 확인, 포인트 이력 생성, 사용자 포인트 누적까지 한 번에 수행합니다.

---

## DB 관련 운영 SQL 스크립트

`scripts/` 폴더에는 운영/보정 목적의 SQL이 존재합니다.

- `fix-signup-auth-sync.sql`
  - `auth.users`와 `public.users` 동기화 트리거 보정
- `add-points-and-attendance.sql`
  - 포인트 / 참석 처리 컬럼 및 `point_transactions` / RPC 추가
- `finalize-attendance-processing.sql`
  - 참석 처리 완료 플로우 보정
- `fix-point-transactions-access.sql`
  - 포인트 이력 RLS/권한 보정
- `add-support-tickets.sql`
  - 고객 문의 테이블 및 정책 추가
- `reconcile-post-counters.sql`
  - `posts.current_participants`, `posts.scraps` 카운터 재동기화
- `allow-post-author-contact.sql`
  - 게시글 상세에서 작성자 연락처 노출을 위한 정책 보정

---

## 프로젝트 구조

```text
app/
├─ layout.tsx                     # 루트 레이아웃, 메타데이터, PWA/서비스워커 등록
├─ globals.css
├─ auth/
│  ├─ login/page.tsx              # 로그인
│  └─ signup/                     # 3단계 회원가입
├─ (main)/
│  ├─ layout.tsx                  # 보호 라우트 레이아웃 (로그인 + 승인 체크)
│  ├─ page.tsx                    # 루트 진입 시 /board 리다이렉트
│  ├─ board/                      # 게시판 목록/상세/작성/수정
│  ├─ reviews/                    # 후기 목록/작성
│  ├─ mypage/                     # 내 정보, 신청, 기록, 포인트, 주최관리, 문의
│  └─ admin/                      # 관리자 대시보드
│
actions/
├─ auth.ts                        # 회원가입, 이메일/닉네임 중복 확인
├─ posts.ts                       # 게시글 목록 조회
├─ get-post.ts                    # 게시글 상세 조회
├─ create-post.ts                 # 게시글 작성
├─ update-post.ts                 # 게시글 수정
├─ apply.ts                       # 신청 / 승인 / 거절 / 취소
├─ review.ts                      # 후기 / 후기 좋아요
├─ attendance.ts                  # 참석 확인 + 포인트 지급 RPC 호출
├─ support.ts                     # 문의 등록 / 관리자 상태 변경
├─ admin.ts                       # 회원 승인
├─ user.ts                        # 마이페이지 집계 데이터
├─ user-mypage.ts                 # 마이페이지 파생 로직
└─ user-update.ts                 # 프로필 수정

components/
├─ PostCard.tsx
├─ InfiniteScrollBoard.tsx
├─ ReviewList.tsx
├─ ReviewLikeButton.tsx
├─ ScrapButton.tsx
├─ AttendanceConfirmationCard.tsx
├─ ToastProvider.tsx
├─ BottomNav.tsx
├─ PullToRefresh.tsx
└─ support/
   ├─ SupportTicketForm.tsx
   └─ SupportTicketAdminList.tsx

lib/
├─ supabase.ts                    # 브라우저/서버 Supabase 클라이언트
├─ server-auth.ts                 # 인증/승인/관리자 권한 검증 헬퍼
├─ support.ts                     # 문의 타입/상태 정의
├─ post-status.ts
├─ date-kst.ts
└─ format-date.ts

scripts/
├─ create-admin.ts                # 관리자 계정 부트스트랩
├─ seed-posts.ts                  # 더미 게시글 시드
├─ cleanup-db.ts                  # 비관리자 데이터 정리
└─ *.sql                          # 운영용 SQL 스크립트

tests/
└─ e2e/                           # Playwright E2E 테스트
```

---

## 실행 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

코드에서 직접 확인되는 환경 변수는 아래와 같습니다.

```bash
cp .env.example .env.local
```

#### 기본 실행에 필요한 값
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 회원가입/관리자/운영 스크립트에서 사용하는 값
- `SUPABASE_SERVICE_ROLE_KEY`

#### 메타데이터 / 사이트 URL
- `NEXT_PUBLIC_SITE_URL`

#### 고객 문의 메일 알림(선택)
- `SUPPORT_NOTIFY_EMAILS`
- `SUPPORT_SMTP_USER`
- `SUPPORT_SMTP_PASS`

#### 관리자 부트스트랩 스크립트용(선택)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_USERNAME`
- `ADMIN_CONTACT`
- `ADMIN_ADDRESS`
- `ADMIN_JOB`

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드

```bash
npm run build
npm run start
```

---

## 사용 가능한 스크립트

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test:e2e
npm run test:e2e:headed
```

### 참고
- E2E 테스트는 Playwright 설정을 사용합니다.
- `playwright.config.ts` 기준으로 개발 서버는 `127.0.0.1:3001`에서 실행됩니다.

---

## 시드 / 운영 스크립트

### 관리자 계정 생성

```bash
npx tsx scripts/create-admin.ts
```

### 더미 게시글 생성

```bash
npx tsx scripts/seed-posts.ts
```

### 비관리자 데이터 정리

```bash
npx tsx scripts/cleanup-db.ts
```

> 위 스크립트들은 Supabase 서비스 키 기반으로 동작하므로 운영 환경에서는 주의해서 사용해야 합니다.

---

## 현재 문서가 다루는 범위

이 README는 저장소에 실제로 존재하는 코드와 SQL 스크립트를 기준으로 작성되었습니다.

- 게시글 / 신청 / 후기 / 스크랩 / 포인트 / 고객 문의 / 관리자 승인 흐름 반영
- Supabase 기반 인증 및 PostgreSQL 구조 반영
- `scripts/`에 있는 운영 SQL 반영
- 실제 `package.json` 스크립트와 Playwright 설정 반영

추가로 원하시면 다음도 정리해드릴 수 있습니다.
- ERD 스타일 DB 다이어그램
- 기능별 화면 흐름도
- 배포 체크리스트
- 테이블/액션 기준 API-like 문서
