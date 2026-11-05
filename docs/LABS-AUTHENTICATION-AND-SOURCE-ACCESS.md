# Labs Authentication and Protected Source — Setup and Provisioning

**Status:** Implementation runbook; production rollout is configuration- and test-gated.  
**Scope:** Better Auth + MongoDB Adapter, Labs account flows, email delivery, Google and GitHub OAuth, Terms/registration cleanup, private source snapshots and verified-account source-access migration.  
**Related:** `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, `ARCHITECTURE.md`, `API-CONTRACTS.md`, `THREAT-MODEL.md`.

## 1. Selected implementation

- Better Auth `1.7.15` with `@better-auth/mongo-adapter` `1.7.15`.
- Native MongoDB driver for Better Auth persistence; existing Mongoose module remains responsible for application models and repository queries.
- Next.js App Router route handlers; no Express server.
- Email/password with email verification and password reset remains supported.
- Google OAuth is currently login-only when both credentials are configured; provider signup is not yet enabled.
- GitHub OAuth is not yet configured. The approved target is Google and GitHub registration/login alongside email/password; see docs/LABS-AUTHENTICATION-PROVIDERS-AND-LEGAL-CLEANUP-PLAN.md.
- Public Labs browsing and code-owned demos remain available without sign-in.
- **Target policy (locked 2026-11-04):** any signed-in account with `emailVerified === true` can read all published source automatically. Guests and signed-in unverified accounts cannot read or copy source. Anonymous visitors and verified accounts can like/unlike; signed-in unverified accounts cannot. There is no per-user grant workflow. The legacy `LabSourceGrant` model remains for migration safety but is not queried by the integration-branch authorization service.

## 2. Required environment configuration

Copy the authentication variables from `.env.example` into the deployment environment:

| Variable | Required | Purpose |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB Atlas connection string. |
| `MONGODB_DB_NAME` | Yes | Database shared by Mongoose and Better Auth. |
| `BETTER_AUTH_SECRET` | Yes | Long, random secret used by Better Auth and registration rate-limit HMAC. Generate a unique value for each environment. |
| `BETTER_AUTH_URL` | Yes in production | Canonical origin used for auth callbacks. |
| `BETTER_AUTH_TRUSTED_ORIGINS` | As needed | Comma-separated explicitly trusted preview/deployment origins. |
| `AUTH_TRUSTED_IP_HEADER` | Yes on proxy deployments | Trusted reverse-proxy header used for registration rate limiting. Vercel default is `x-vercel-forwarded-for`. |
| `AUTH_SMTP_HOST`, `AUTH_SMTP_PORT`, `AUTH_SMTP_USER`, `AUTH_SMTP_PASSWORD`, `AUTH_EMAIL_FROM` | Yes for registration/recovery | Authenticated SMTP transport for verification and password reset messages. |
| `AUTH_SMTP_SECURE` | Optional | Set true when SMTP uses implicit TLS (normally port 465). |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional | Enable Google OAuth after the provider expansion is implemented. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Optional | Planned; enable GitHub OAuth after implementation. |\n| `NEXT_PUBLIC_SITE_URL` | Yes for the canonical Privacy Policy link | The app derives `/privacy` from this site origin. |

The Privacy Policy is a first-party informational page at `/privacy` and its URL derives from `NEXT_PUBLIC_SITE_URL`. The Terms route, Terms checkbox and legal-consent receipt gate are scheduled for removal. Registration readiness must depend on database/auth and SMTP configuration, not Terms content. Registration remains unavailable until MongoDB/auth secrets and SMTP delivery are configured. In Vercel, the five SMTP values must be available to the `feat/labs-platform-integration` Preview branch specifically; values scoped only to `feat/labs-public-page` are not inherited by this branch.

### Google OAuth callback

Register the deployed callback path:

```text
https://<your-auth-origin>/api/auth/callback/google
```

Google is currently login-only and is hidden until both Google credentials are configured. The planned target adds explicit Google account creation from the signup route. Login and signup OAuth intents must remain separate and same-verified-email linking must remain enforced.

### GitHub OAuth callback — planned

Register the deployed callback path after GitHub provider configuration is implemented:

```text
https://<your-auth-origin>/api/auth/callback/github
```

The GitHub app should request identity/email only, including the user:email scope needed to retrieve a primary verified email when the profile email is private. Do not request repository access. The login action must not create new users implicitly; account creation is explicit from the signup route. Confirm installed Better Auth 1.7.15 behavior before implementing the signup intent.

### SMTP verification

Before enabling account registration, send a verification message and a password-reset message through the configured SMTP account. The mail transport is vendor-neutral Nodemailer SMTP; no Resend, Gmail or other vendor account is assumed.

## 3. Authentication routes and behavior

| User flow | Route / handler | Behavior |
| --- | --- | --- |
| Login | `/labs/login` | Email/password; target Google and GitHub login actions when configured; validated local return destination. |
| Registration | `/labs/signup` → `POST /api/labs/register` | Email/password remains; target explicit Google/GitHub account creation; generic response remains. No Terms checkbox or consent receipt. |
| Verification | `/labs/verify-email` | Verify-link callback confirmed against server-side flow state (Better Auth default token lifetime) and 30-second resend UX cooldown. |
| Resend verification | `POST /api/labs/verification/resend` | Generic response; creates an opaque flow ID and invokes Better Auth's privacy-safe resend handler. |
| Verification status | `GET /api/labs/verification/status?flow=:id` | No-store read of a random flow ID marked verified by the Better Auth post-verification hook. |
| Forgot password | `/labs/forgot-password` | Generic response for existing and unknown email addresses. |
| Reset password | `/labs/reset-password` | Valid token only; confirmation returns to Login; sessions are revoked. |
| Auth transport | `/api/auth/[...all]` | Better Auth-owned handlers; direct `/sign-up/email` is blocked to prevent consent bypass. |
| Session read | `GET /api/auth/get-session` | Server-backed session read; used by Labs account UI and protected-source revalidation. |

The registration endpoint must keep generic account-creation responses and the trusted-proxy-IP rate limit. Remove the Terms acceptedTerms field and consent-receipt write during the approved cleanup; retain a separate server-side verification flow for email verification. Better Auth also applies the route-specific rate limits configured in `src/app/lib/auth/auth.js`.

Return destinations must be relative paths under `/labs`. External URLs, protocol-relative URLs, malformed paths and authentication routes are rejected.

## 4. Private source snapshot format

Mongoose model: `src/app/lib/labs/models/LabSource.js`  
MongoDB collection: `lab_sources`

One record per experiment slug:

```javascript
{
  slug: "magnetic-interaction",
  version: "2026-11-03.1",
  published: true,
  files: [
    {
      path: "src/experiments/MagneticInteraction.jsx",
      language: "jsx",
      content: "<source text stored privately in Atlas>"
    }
  ]
}
```

Validation limits: 1–40 files, file paths must be safe relative paths, each file is limited to 500 KB, and the full response is capped at 1 MB. Do not store executable preview configuration, secrets, credentials or unrestricted runtime instructions in this collection. The endpoint only returns source text after authorization; it never evaluates the stored source.

## 5. Source-access policy and legacy grant migration

**LOCKED target policy (user approved 2026-11-04):**

- A valid Better Auth session with `emailVerified === true` is sufficient to read every published experiment source.
- Guests and signed-in unverified accounts cannot view or copy source.
- The owner does not grant/revoke source access for individual users. The owner controls availability globally per experiment using publish/unpublish.
- Verified accounts can open/copy source and like/unlike experiments. Anonymous guests can like/unlike without viewing source. Signed-in unverified accounts cannot open/copy/like source.
- The owner dashboard receives aggregate source opens, unique verified accounts, copies, active anonymous and verified likes, and separate like/unlike actions per experiment; it does not expose individual users' browsing/action histories.

**Integration-branch implementation status:** `feat/labs-platform-integration` removes the `LabSourceGrant` lookup from `src/app/lib/labs/source-access.js`; verified users are authorized from their server-side verified session, canonical Labs slug and published source state. The legacy model and collection are intentionally retained for migration safety. This code is not production behavior until the integration branch is released.

**Migration requirements:**

1. Inspect whether `lab_source_grants` exists and whether it contains records. Export/backup any existing records for rollback/audit before cleanup.
2. Remove the grant lookup from the protected source endpoint/domain service. Require verified Better Auth session + published source only.
3. Do not create new grant records and do not build grant/re-grant/revoke UI or APIs.
4. After the new endpoint is deployed and references are removed, retire the legacy `LabSourceGrant` model, indexes and collection through a reviewed idempotent migration. Do not drop data before confirming no active code path imports it.
5. Add owner source management and engagement collections/indexes through application bootstrap; do not manually create empty collections in Atlas.

## 6. Protected source endpoint

`GET /api/v1/labs/:slug/source`

Server checks, in order:
1. Valid experiment slug.
2. Better Auth session exists.
3. Account email is verified.
4. Target policy: require `session.user.emailVerified === true`; no grant lookup.
5. Published source snapshot exists and passes size/path validation.

Unauthorized responses never contain source. Successful responses use `private, no-store, no-cache` headers and are excluded from public page data. The source panel clears the loaded text when the session is signed out, reset or no longer verifiable; the current session is rechecked every 60 seconds and when the tab becomes visible.

## 7. Critical confidentiality limitation

The repository is public, and the current four public interactive demos are implemented as client-side code-owned runtimes. Code delivered to a browser can be inspected. A protected source endpoint cannot make code already present in a public GitHub repository, source map or browser bundle confidential.

The Atlas-backed source viewer protects separate source snapshots. Do not claim that it hides the source of the existing public demo runtimes. If source must remain confidential, keep its canonical snapshot private and do not ship it to the public client runtime. Any admin-managed/untrusted code execution requires the separate isolated preview architecture and threat-model gate; this implementation deliberately does not evaluate stored source.

## 8. Release verification checklist

- [ ] Atlas connectivity confirmed from the production deployment and Better Auth collections can be created/read.
- [ ] Authentication secret is unique, strong and stored only in server-side environment variables.
- [ ] Trusted origins and proxy IP header match the actual deployment.
- [ ] SMTP sends and delivers verification/password-reset messages successfully.
- [ ] The `/privacy` page is reachable on the deployed canonical origin and accurately describes account, provider, verification and Labs engagement data. No Terms consent receipt is required after the cleanup.
- [ ] Google and GitHub callbacks, verified-email requirement, explicit signup intent, login-only intent and safe same-email account linking are verified.
- [ ] Duplicate registration responses do not expose account existence.
- [ ] Registration, sign-in, reset and resend rate limits are tested.
- [ ] Safe return-path cases reject external/protocol-relative destinations.
- [ ] Guest and signed-in-unverified source requests are denied; every verified account can access any published source without a grant.
- [ ] Source responses carry private/no-store headers and source never appears in anonymous HTML, RSC payloads or public caches.
- [ ] Logout and password reset revoke access across tabs/devices; active source views clear on invalidation.
- [ ] Light/dark, mobile/keyboard, accessibility and existing portfolio regression checks pass.
- [ ] Production build and lint pass.

No deployment secrets are committed to this repository. This runbook does not certify that any external provider, Atlas cluster or browser test has been configured or passed.


## 9. Email-verification flow records and Terms cleanup

- The current implementation still contains `labs_registration_consents`, which stores a Terms version, Privacy version, server timestamp and account linkage. This receipt system is scheduled for removal with the Terms signup checkbox and Terms route. Do not remove it until its code references and database indexes are inventoried and a reviewed backup/migration is completed.
- `labs_verification_flows` stores a separate random flow ID, email digest, created/expiry timestamps and verified timestamp. It is required by email verification and must remain even after consent receipts are removed.
- Before deleting `registration-consent.js`, move its verification-flow functions into a separate server-only module and update Better Auth hooks/imports to use that module.
- The registration callback URL carries the flow ID. The Better Auth `afterEmailVerification` hook marks active flows for that email digest. The server-rendered verification page checks stored flow status; manually adding a query parameter cannot produce a verified state.
- Resend goes through `POST /api/labs/verification/resend`. The client receives a generic response and does not learn whether the email exists. The client cooldown is 30 seconds; Better Auth's server-side rate limits are authoritative.


## 10. Better Auth Dash ownership verification

The Better Auth Dash connection is separate from the core MongoDB authentication adapter.

- The project includes `@better-auth/infra` and registers the server-side `dash()` plugin only when `BETTER_AUTH_API_KEY` is present.
- The key is read only by `src/app/lib/auth/auth.js`; it is never exposed through a `NEXT_PUBLIC_*` variable or the browser auth client.
- Dash is not the Sentinel security plugin. Sentinel is not enabled by this change.
- The application does not enable Dash activity tracking, so no `lastActiveAt` schema field/migration is introduced.

### Connect the deployed project

1. In Better Auth Dash, open the project and copy its API key using the dashboard's **Copy key** action.
2. In Vercel, open the `vishal-kumar-choudhary-frontend-developer` project → **Settings** → **Environment Variables**.
3. Add `BETTER_AUTH_API_KEY` as a **Sensitive** environment variable. Paste the key directly into Vercel; do not commit it, place it in `.env.example` with a value, or send it in chat.
4. Select the environments you want connected (at minimum the deployment URL entered in Better Auth Dash; include Preview separately when using preview URLs).
5. Confirm `BETTER_AUTH_URL` or `NEXT_PUBLIC_SITE_URL` resolves to the exact deployed base URL entered in Better Auth Dash. The server uses `BETTER_AUTH_URL` first.
6. Redeploy the selected Vercel environment so the new server variable and plugin are loaded.
7. Return to Better Auth Dash and select **Retry connection**.

If the deployed server was already configured with `BETTER_AUTH_API_KEY`, a fresh deploy of this code is still required so the `dash()` plugin is registered.

### Important secret hygiene

A value had been committed in the tracked `.env.example` under `BETTER_AUTH_SECRET`. It has been removed from the example file and replaced with a blank placeholder. Treat the old value as exposed: generate a new unique Better Auth secret and replace `BETTER_AUTH_SECRET` in Vercel before enabling authentication. This runbook intentionally does not reproduce that value.

The API key is not available to the repository integration; it must be copied from the user's Better Auth Dash project directly into Vercel. Do not attempt to infer or generate a Dash API key.


## 11. Privacy Policy and Terms-page removal

The public Privacy Policy remains at `/privacy`. It is informational disclosure, not a mandatory checkbox or registration gate. Keep its footer/contact/sitemap links and update its provider disclosure to include Google and GitHub identity information when those providers are enabled.

The standalone Terms page at `/terms`, its 18+ signup acknowledgement, Terms-only footer/contact/sitemap/SEO links, Terms version configuration and consent-receipt gate are in the approved removal scope. Remove them together so no stale links or policy claims remain.

The current `labs_registration_consents` receipt collection and helpers are legacy cleanup targets. The separate `labs_verification_flows` collection and verification callback must remain. Split verification-flow functions out of `registration-consent.js` before removing consent-only code or retiring its collection/indexes.

The Privacy Policy must accurately disclose email/password accounts, Google/GitHub provider data, sessions, verification, source opens/copies, likes, cookies, security logs and retention after the Terms cleanup. Do not leave claims about Terms acceptance receipts in its text. This runbook does not certify legal compliance; confirm the final privacy disclosure and any applicable policy requirements before launch.


## 12. Vercel Preview origins and Better Auth Dash onboarding

- Preview deployments use Better Auth's dynamic `baseURL` allowlist. Accepted Preview hosts are restricted to this project's deployment host pattern and Vercel's branch-alias pattern for this team; arbitrary `*.vercel.app` hosts are not trusted.
- Registration and verification-resend callbacks use the current request's approved Preview origin. This prevents email links from pointing at the Production domain or a different deployment alias.
- `BETTER_AUTH_API_KEY` is a Better Auth Infrastructure credential, not an SMTP/Gmail/Resend credential. The `dash()` plugin is registered only when this value is non-empty.
- The current integration work is maintained on `feat/labs-platform-integration`; the Production domain on `main` does not expose the new Labs owner/source routes until the approved release. Use the integration branch Preview base URL for Preview testing. After merge and Production redeployment, use the canonical Production origin in Better Auth Dash.
- Vercel Deployment Protection is enabled for Previews. Do not disable SSO or broadly expose a Preview just to make external dashboard verification succeed. If Better Auth Dash cannot reach the protected Preview, complete its ownership check after the approved Production rollout or implement a narrowly scoped access path.
- After changing auth origin configuration, request a fresh verification email. Do not reuse a link generated by an earlier deployment if its callback host was not in the allowlist at that time.

## 13. Owner-managed source lifecycle — planning update (2026-11-04)

The original Sections 4–5 grant instructions have been superseded by the verified-account source-access decision. Section 5 is now a migration runbook, not an instruction to insert grant documents. These notes distinguish the legacy runtime from the approved target and must not be mistaken for completed owner management or immutable versioning.

Follow `docs/LABS-SOURCE-MANAGEMENT-SPEC.md` for the target owner capability and migration plan.

### Current state on `feat/labs-platform-integration`
- `LabSource` is the source head; `LabSourceVersion` stores immutable snapshots and draft/published pointers.
- `LabSourceGrant` remains as legacy transition state but is not queried by the new source authorization service.
- The protected source endpoint requires a verified Better Auth session, a canonical Labs experiment slug and a published source snapshot; no grant is required.
- Owner source inventory/editor, source create/save/version/restore/publish/unpublish/audit APIs, engagement models and aggregate analytics dashboard are implemented.
- Source records/files are not populated automatically. The owner must create a source head and add reviewed files before publishing.


### Remaining implementation and release order
1. Configure the branch-specific SMTP variables and `LABS_OWNER_USER_ID` in Vercel Preview; do not make secret variables global across unrelated Preview branches.
2. Verify the shared Preview MongoDB/Better Auth settings and run signup → verification → login → password-reset mail tests.
3. Inspect Atlas for existing `lab_sources` and `lab_source_grants` records; preserve a backup and migrate/reconcile before retiring legacy data.
4. Audit the canonical `magnetic-interaction` source file inventory; do not guess paths or include secrets. Populate the first reviewed draft from the owner editor.
5. Run the full Guest / Unverified / Verified / Owner, stale-version, like deduplication and private/no-store tests against Atlas.
6. Complete browser-based keyboard, responsive, focus, contrast and accessibility QA.
7. Keep live source execution deferred until separately approved and threat-modelled.

## 14. Provider expansion and Terms cleanup — plan status

The user-approved target preserves email/password and adds Google and GitHub registration/login. The current implementation remains behind that target: Google is login-only and GitHub is not configured. The same user decision removes the Terms signup checkbox, Terms page and Terms-only registration receipt logic. The Privacy Policy stays available as informational disclosure. Email-verification flow records remain separate and must be preserved.

Follow docs/LABS-AUTHENTICATION-PROVIDERS-AND-LEGAL-CLEANUP-PLAN.md for implementation, migration, file deletion, provider setup and release tests. Do not treat this runbook update as evidence that providers have been configured or that any code/data has been deleted.
