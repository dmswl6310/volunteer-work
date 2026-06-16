# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js 16 App Router project for a volunteer activity platform. Route files live in `app/`, with authenticated app pages grouped under `app/(main)` and auth flows under `app/auth`. Reusable UI belongs in `components/`, server actions in `actions/`, shared utilities and Supabase clients in `lib/` and `utils/`, and static/PWA assets in `public/`. Database maintenance SQL and operational scripts are in `scripts/`; E2E tests are in `tests/e2e`.

## Build, Test, and Development Commands

- `npm run dev`: start the local Next dev server on `127.0.0.1`.
- `npm run build`: create a production build.
- `npm run start`: serve the production build.
- `npm run lint`: run ESLint using Next core web vitals and TypeScript rules.
- `npm run typecheck`: run `tsc --noEmit`.
- `npm run test:e2e`: run Playwright tests; the config starts the app on port `3001`.
- `npm run test:e2e:headed`: run Playwright with a visible browser.

## Coding Style & Naming Conventions

Use TypeScript, React function components, and the existing App Router patterns. Keep server-side data changes in `actions/` and shared Supabase/auth logic in `lib/`. Name React components in PascalCase, hooks/utilities in camelCase, and route folders according to Next conventions (`page.tsx`, `layout.tsx`, `loading.tsx`, dynamic `[id]`). Prefer concise Tailwind classes in JSX and keep Korean user-facing copy consistent with nearby screens.

## Testing Guidelines

Playwright is the primary test framework. Add E2E specs under `tests/e2e` with the `*.spec.ts` suffix and reuse helpers from `tests/e2e/helpers.ts`. Run `npm run lint`, `npm run typecheck`, and relevant Playwright tests before submitting changes. For auth, privacy, or navigation updates, extend the matching existing spec instead of creating a disconnected duplicate.

## Commit & Pull Request Guidelines

Recent history uses short conventional prefixes such as `feat:` and `fix:` followed by concise summaries, often in Korean. Keep commits focused and imperative. Pull requests should include a clear description, linked issue when available, test results, and screenshots or recordings for visible UI changes. Mention any required Supabase SQL from `scripts/` and any new environment variables.

## Security & Configuration Tips

Keep secrets in `.env.local` and never commit production credentials. Review row-level security and server action authorization when touching Supabase access paths. Generated folders such as `.next/`, `test-results/`, and Playwright reports should remain out of commits.
