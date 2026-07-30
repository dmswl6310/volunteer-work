---
name: volunteer-platform-maintenance
description: Safely maintain the volunteer-work Next.js and Supabase application. Use for authentication or approval-flow changes, public versus protected route changes, Supabase RLS/RPC updates, organizer-contact privacy, or related README, AGENTS.md, and E2E test updates in this repository.
---

# Volunteer Platform Maintenance

## Inspect before editing

1. Read the repository `AGENTS.md` and the relevant application, action, test, and SQL files.
2. Preserve the existing identifier conventions:
   - Use `postId`, `applicationId`, `reviewId`, and `userId` in TypeScript.
   - Use `post_id`, `application_id`, `review_id`, and `user_id` in Supabase.
   - Treat the current related database IDs as `text`; verify the remote schema before changing types.
3. Inspect the existing RLS policies before replacing them. Never infer the live policy set only from `scripts/*.sql`.

## Enforce the access model

- Allow anonymous users to read volunteer posts, post details, and reviews.
- Require an approved authenticated user for applications, hosting, writing, editing, likes, scraps, mypage, and support actions.
- Preserve the intended destination with a validated relative `next` parameter when redirecting guests to login.
- Keep bottom navigation labels stable. Send a guest who selects `내 정보` to `/auth/login?next=%2Fmypage`.
- Expose public profile data through narrow RPCs that return only the required fields.
- Return organizer contact details only to the organizer, an approved participant for that post, or an approved admin.
- Do not solve contact display by granting every authenticated user direct access to all `public.users` rows.

## Change RLS safely

1. Confirm remote column types and current anonymous behavior without printing secrets or personal data.
2. Keep DDL idempotent and transactional.
3. Use schema-qualified references and an empty `search_path` in `security definer` functions.
4. Supabase may explicitly grant new functions to `anon`, `authenticated`, and `service_role` through default privileges. Revoke from `public`, `anon`, and `authenticated` before granting back only the required roles, then verify the live ACL.
5. Remember that permissive RLS policies are OR-combined. Add a restrictive privacy policy when an unknown existing permissive `users` policy could otherwise remain effective.
6. Do not apply live DDL with only the anon or service-role API key. Require a Supabase Management API token, linked CLI access, or a PostgreSQL connection URL.
7. After applying `scripts/enable-public-browsing-with-private-contacts.sql`, run `npm run verify:public-access`.

## Verify and document

Run:

```text
npm run lint
npm run typecheck
npm run build
npm run verify:public-access
npm run test:e2e
```

Extend `tests/e2e/auth-and-privacy.spec.ts` for authentication, privacy, and navigation changes. Update `README.md` when user-visible access rules or operational SQL changes, and update `AGENTS.md` when contributor workflow or security requirements change.
