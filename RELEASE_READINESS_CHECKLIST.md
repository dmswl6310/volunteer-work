# Release Readiness Checklist

## Code / app validation

- [ ] `npm run build`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run test:e2e`

## Accounts / auth

- [ ] Regular approved user can log in and reach `/board`
- [ ] Regular user can access `/mypage`, `/mypage/history`, `/mypage/profile`, `/mypage/points`
- [ ] Regular user is redirected away from `/admin`
- [ ] Admin user can access `/admin`
- [ ] Signup still creates a pending user and does not auto-approve

## Data integrity

- [ ] Run `scripts/reconcile-post-counters.sql` once before launch to sync `posts.current_participants` and `posts.scraps`
- [ ] Verify there are no duplicate `(post_id, user_id)` rows in `applications`
- [ ] Verify there are no duplicate `(post_id, user_id)` rows in `post_scraps`
- [ ] Manually test: approve application, reject application, cancel pending application, scrap toggle

## Permissions / privacy

- [ ] Re-check Supabase RLS policies for `users`, `applications`, `post_scraps`, `reviews`, `point_transactions`
- [ ] Confirm author/admin-only flows cannot be called by an approved non-owner user
- [ ] Review whether exposing `contact`, `email`, and `address` to authenticated users matches the intended privacy policy

## Admin / operations

- [ ] Verify admin approval flow works with real pending users
- [ ] Verify attendance confirmation awards points exactly once
- [ ] Verify remaining pending applications can be bulk rejected safely
- [ ] Confirm Vercel environment variables are set in production
- [ ] Confirm Supabase redirect URLs and site URL match the production domain

## Performance / UX

- [ ] Smoke test homepage, board list, board detail, signup, mypage on mobile width
- [ ] Check LCP candidates: homepage hero/urgent cards and board detail hero image
- [ ] Confirm no broken images or layout shifts on key screens
- [ ] Confirm no full page reload is required for request approval or attendance confirmation flows

## Recommended next improvements after launch

- Replace counter-sync patterns with database RPC/transaction-based mutations
- Add automated coverage for admin approval, attendance confirmation, and point-award flows
- Tighten broad `users` select policy if privacy requirements become stricter
- Replace any remaining multi-step mutation flows with server-side transactional procedures
