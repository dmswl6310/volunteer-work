# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router project for a volunteer activity platform. Route files live in `app/`, with the public app shell and feature pages grouped under `app/(main)` and auth flows under `app/auth`. Reusable UI belongs in `components/`, server actions in `actions/`, shared utilities and Supabase clients in `lib/` and `utils/`, and static/PWA assets in `public/`. Database maintenance SQL and operational scripts are in `scripts/`; E2E tests are in `tests/e2e`.

`app/(main)` is not globally authenticated: the board list, board detail, and review list are public. Put authentication and approval guards on the specific write, edit, mypage, support, and admin route boundaries that require them. For authentication, public-access, or RLS work, also follow `.agents/skills/volunteer-platform-maintenance/SKILL.md`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next dev server on `127.0.0.1`.
- `npm run build`: create a production build.
- `npm run start`: serve the production build.
- `npm run lint`: run ESLint using Next core web vitals and TypeScript rules.
- `npm run typecheck`: run `tsc --noEmit`.
- `npm run test:e2e`: run Playwright tests; the config starts the app on port `3001`.
- `npm run test:e2e:headed`: run Playwright with a visible browser.
- `npm run verify:public-access`: verify live Supabase anonymous browsing and privacy boundaries without printing row data.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and the existing App Router patterns. Keep server-side data changes in `actions/` and shared Supabase/auth logic in `lib/`. Name React components in PascalCase, hooks/utilities in camelCase, and route folders according to Next conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, dynamic `[id]`). Prefer concise Tailwind classes in JSX and keep Korean user-facing copy consistent with nearby screens.

Use semantic identifiers such as `postId`, `applicationId`, `reviewId`, and `userId` in TypeScript even when a Next.js route parameter is named `id`. Preserve the existing Supabase snake_case names (`post_id`, `application_id`, `review_id`, `user_id`) and verify live column types before writing SQL; the current related IDs are `text`.

## Testing Guidelines

Playwright is the primary test framework. Add E2E specs under `tests/e2e` with the `*.spec.ts` suffix and reuse helpers from `tests/e2e/helpers.ts`. Run `npm run lint`, `npm run typecheck`, and relevant Playwright tests before submitting changes. For auth, privacy, or navigation updates, extend `tests/e2e/auth-and-privacy.spec.ts` instead of creating a disconnected duplicate. After applying public-access RLS changes, also run `npm run verify:public-access` against the target Supabase project.

## Commit & Pull Request Guidelines

Recent history uses short conventional prefixes such as `feat:` and `fix:` followed by concise summaries, often in Korean. Keep commits focused and imperative. Pull requests should include a clear description, linked issue when available, test results, and screenshots or recordings for visible UI changes. Mention any required Supabase SQL from `scripts/` and any new environment variables.

## Security & Configuration Tips

Keep secrets in `.env.local` and never commit production credentials. Review row-level security and server action authorization when touching Supabase access paths. An anon key or service-role key does not authorize DDL: inspect and apply live RLS with the Supabase SQL Editor, authenticated CLI/Management API access, or a PostgreSQL connection URL. Keep SQL idempotent and transactional, use schema-qualified references plus a fixed `search_path` for `security definer` functions, and account for permissive policies being OR-combined. Supabase default privileges can explicitly grant new functions to `anon`; revoke unwanted role grants and verify the live function ACL after applying SQL. Public screens must use narrow RPCs for usernames and aggregates; organizer contact is limited to the organizer, an approved participant for that post, or an approved admin. Generated folders such as `.next/`, `test-results/`, and Playwright reports should remain out of commits.
