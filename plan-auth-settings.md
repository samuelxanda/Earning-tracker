# Implementation Plan — Full Auth + Settings Screens

## What we are building
Wire email/password auth through the entire app using InsForge's SSR auth pattern, then build the three settings screens (Profile, Tax Settings, Export Data) that require that auth foundation.

## Language we agreed on
- **Auth flow**: Sign up with email verification (code or link, determined by backend config), then sign in with email + password. Server sets httpOnly refresh cookie; browser client uses access token cookie.
- **RLS filtering**: Database queries are scoped to the logged-in user via RLS policies (`auth.uid()`), not by client-side `.eq()` filters. Existing pages work mostly unchanged once the right SDK client is wired.
- **Settings hub**: `/earnings/settings` becomes a menu page linking to Profile, Platforms, Tax Settings, and Export Data sub-pages.

## Decisions made
- **Auth scope**: Full-app auth. Sign-in, sign-up, email verification, password reset, route protection via middleware.
- **OAuth**: Skipped — email/password only, as specified.
- **Export format**: CSV only. No PDF library dependency.
- **Tab bar**: Updated to accept `usePathname()` so the Settings tab appears active on any settings sub-page.
- **Settings page**: Restructured as a hub menu (Profile, Platforms, Tax Settings, Export Data).

## How to build it

### Phase 1 — Auth infrastructure

1. **Add `NEXT_PUBLIC_APP_URL`** to `.env.local` for redirect URLs
2. **Create two SDK clients**:
   - `lib/insforge/client.ts` — `createBrowserClient()` for client components
   - `lib/insforge/server.ts` — `createServerClient()` for route handlers/server actions
3. **Create auth API routes** (all under `app/api/auth/`):
   - `sign-up/route.ts` — POST: calls `client.auth.signUp()`, sets cookies via `setAuthCookies()`
   - `sign-in/route.ts` — POST: calls `client.auth.signInWithPassword()`, sets cookies
   - `sign-out/route.ts` — POST: calls `client.auth.signOut()`, clears cookies
   - `refresh/route.ts` — POST: `createRefreshAuthRouter()` for token refresh
   - `verify-email/route.ts` — POST: calls `client.auth.verifyEmail()`
   - `reset-password/route.ts` — POST: calls `client.auth.sendResetPasswordEmail()`
4. **Create `middleware.ts`** in project root — runs `updateSession()` on every request to keep cookies fresh, redirects unauthenticated users from `/earnings/*` to `/auth/sign-in`
5. **Create `components/AuthProvider.tsx`** — wraps children, calls `insforge.auth.getCurrentUser()` on mount, provides `{ user, loading }` via context
6. **Create auth pages** (all under `app/auth/`):
   - `sign-in/page.tsx` — email + password form, links to sign-up and reset password
   - `sign-up/page.tsx` — email + password + name form, handles verification flow
   - `verify-email/page.tsx` — 6-digit code input (if code method), or "check your email" state (if link method)
   - `reset-password/page.tsx` — email input to trigger reset, then new password form
7. **Update `app/layout.tsx`** — wrap with `<AuthProvider>`
8. **Update `app/page.tsx`** — redirect to `/earnings` stays as-is (middleware handles auth check)
9. **Update existing settings page** — restructure to hub menu
10. **Update `EarningsTabBar.tsx`** — use `usePathname()` to highlight active tab

### Phase 2 — Database schema + RLS

11. **Run `npx @insforge/cli metadata --json`** to check auth config (verification method, etc.)
12. **Create migration**: `profiles` table
13. **Create migration**: `tax_settings` table
14. **Create migration**: RLS policies on all 5 tables (`earnings_entries`, `expenses`, `platforms`, `profiles`, `tax_settings`) — owner-only access via `auth.uid()`
15. **Update `insforge.toml`** with new table definitions
16. **Apply migrations**

### Phase 3 — Settings screens

17. **Profile page** (`/earnings/settings/profile/page.tsx`):
    - Fetch current profile from `profiles` table (or create on first visit)
    - Editable display name and phone
    - Email shown as read-only (from `user.email`)
    - "Change password" sends reset email
    - "Sign out" button calls sign-out API
    - "Delete account" as destructive action (or stub)

18. **Tax Settings page** (`/earnings/settings/taxes/page.tsx`):
    - Fetch current config from `tax_settings` table
    - Fields: estimated tax rate (%), mileage rate ($/mile)
    - Save with validation (0-100 for tax rate, positive for mileage)
    - "Reset to defaults" button

19. **Export Data page** (`/earnings/settings/export/page.tsx`):
    - Date range inputs (start/end)
    - Platform multi-select (fetched from `platforms` table)
    - "Export CSV" button
    - Queries `earnings_entries` + `expenses`, formats as CSV, triggers browser download
    - Empty state: "No data to export for selected period"
    - Error handling for failed queries/generation

### Phase 4 — Cleanup & verification

20. Remove old `lib/insforge.ts` or update to delegate to new client
21. Verify existing pages still work: Today, History, Analytics, Expenses, Entry forms
22. Run `npm run build` to confirm no errors
