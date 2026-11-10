# Authentication and Account Engineering — Current Implementation

**Audited branch:** `feat/labs-platform-integration`  
**Current-state date:** 2026-11-07  
**Core implementation:** Better Auth with the MongoDB adapter. Authentication is a Labs account capability; it is not a general Portfolio CMS identity system.

## 1. System boundary

Authentication is implemented in server-only modules under `src/app/lib/auth/`. The application uses:
- Better Auth for credentials, sessions, email verification, password reset and optional social providers;
- MongoDB through Better Auth's Mongo adapter for auth-managed records;
- the application Mongoose connection for custom verification-flow and rate-limit records;
- SMTP through the configured auth email transport for verification and password-reset messages;
- server-side `getCurrentAuthSession()` to derive the current actor from request headers.

Do not trust a client-supplied user ID, emailVerified flag, owner role or provider profile as authorization evidence. Protected page/API handlers must read the session on the server and check the relevant policy.

## 2. Readiness and environment gates

The auth runtime requires the configured MongoDB URI, database name and Better Auth secret. Email/password registration additionally requires the auth email-delivery configuration. OAuth providers are independently enabled only when both client ID and client secret for that provider are present.

Relevant environment variable names are maintained in `operations/ENVIRONMENT-AND-RELEASE.md` and `.env.example`, including:
- `MONGODB_URI`, `MONGODB_DB_NAME`;
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `BETTER_AUTH_TRUSTED_ORIGINS`;
- `AUTH_SMTP_HOST`, `AUTH_SMTP_PORT`, `AUTH_SMTP_USER`, `AUTH_SMTP_PASSWORD`, `AUTH_EMAIL_FROM`, optional `AUTH_SMTP_SECURE`;
- `AUTH_TRUSTED_IP_HEADER`;
- optional `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.

The app uses a local placeholder during static build initialization when the real auth database/secret configuration is absent. That placeholder is not a valid production auth configuration: auth handlers return an unavailable response when the real database/secret readiness check fails. Never copy placeholder secrets into deployment configuration.

## 3. Authentication routes and flow

| Flow | UI route / endpoint | Current behavior |
|---|---|---|
| Login | `/labs/login` | Email/password and configured provider options; safe local return destination |
| Signup | `/labs/signup` → `POST /api/labs/register` | Dedicated registration endpoint; generic response to avoid account enumeration |
| Email verification | `/labs/verify-email` | Confirms Better Auth verification through server-side flow state |
| Resend verification | `POST /api/labs/verification/resend` | Generic response; creates an opaque flow ID and requests another message |
| Verification status | `GET /api/labs/verification/status?flow=...` | No-store lookup of a random UUID flow |
| Forgot password | `/labs/forgot-password` | Generic result for known and unknown addresses |
| Reset password | `/labs/reset-password` | Uses Better Auth reset token; configured to revoke sessions after password reset |
| Auth API | `/api/auth/[...all]` | Better Auth transport; direct email signup endpoint is deliberately blocked |
| Session read | Better Auth session API / server helper | Server-derived session used by protected UI and APIs |

Email/password signup is not sent directly to Better Auth's public `/sign-up/email` route. `POST /api/labs/register` validates email/password, checks delivery readiness, applies a trusted-proxy-IP registration rate limit, validates `returnTo`, creates a verification-flow record and invokes Better Auth. The browser receives a generic accepted response rather than an account-existence signal.

Password constraints in the current Better Auth configuration are 8–128 characters. Email/password registration requires verification and does not automatically sign the user in. Password reset revokes sessions.

### 3.1 Verification flow

The custom `labs_verification_flows` record stores:
- random UUID `flowId`;
- keyed HMAC digest of the normalized email;
- `createdAt`, `expiresAt` and nullable `verifiedAt`.

A seven-day TTL index is created for `expiresAt`. Better Auth's post-verification hook marks matching unexpired flows verified. The success UI checks `/api/labs/verification/status`; a URL parameter by itself is not proof of email ownership. Resend responses remain generic.

### 3.2 Safe return destinations

Return destinations are restricted to local paths under `/labs`. External origins, protocol-relative values, malformed paths and auth routes are rejected by the return-to helper. Never use a request-provided URL as an unrestricted redirect target.

## 4. Social provider contract

Google and GitHub are optional and are added to the Better Auth config only when both credentials for the provider are present.

- Google requires verified email and uses explicit account selection.
- GitHub requests `read:user` and `user:email`, fetches the profile and email list, and requires a verified provider email (preferring primary verified email).
- Both providers require verified email.
- Both have implicit signup disabled. Account creation is an explicit signup intent; login must not silently create an account.
- Account linking is allowed only for a matching verified email; different-email linking is disabled.

Credential presence only proves that the code path can be configured. Provider app registration, callback URLs, Vercel Preview/Production variables, same-email linking and full browser journeys remain external verification gates. See `future/GOOGLE-GITHUB-OAUTH.md`.

## 5. Source access and owner authorization are separate policies

**Published source access:** every registered account with a server-confirmed verified email can read any currently published source. Guests and email-unverified accounts cannot. The source service no longer uses per-user `LabSourceGrant` lookups; the legacy model may remain in the repository for migration safety.

**Owner access — accepted target:** only the server-only `LABS_OWNER_USER_ID` matching the stable Better Auth user ID can access owner routes/APIs, after normal verified-session checks. No first-user, email, display-name or client-role fallback is part of the target policy.

**Current code discrepancy:** `src/app/lib/labs/owner-access.js` still accepts a matching configured `LABS_OWNER_EMAIL` as an alternative to the ID. Remove that fallback before the current implementation is described as ID-only. Check deployed Preview/Production variables first; this documentation change does not alter the code or environment.

## 6. Account capabilities that are not implemented

The following PRD capabilities are not present as a complete user-account product in the current route tree:
- account profile editing;
- self-service account deletion;
- personal user dashboard;
- personal activity history, recently viewed labs or recently accessed components.

The owner Labs Analytics dashboard is not a substitute for a user dashboard. Privacy/account deletion requests are currently described on `/privacy` as requests made through the Contact channel; there is no self-service delete workflow documented as implemented.

## 7. Privacy and operational limits

- Auth email templates avoid logging recipient addresses, contents, reset URLs or tokens.
- Registration, sign-in, social sign-in, reset and verification flows have Better Auth or application rate limits.
- Session lifetime/concurrency policy and deployed cookie behavior still require environment/browser verification.
- The custom verification-flow record expires after seven days; this is not an account deletion or analytics retention policy.
- The Privacy Policy is a user-facing contract. Keep it aligned with actual data collection and the owner dashboard. See `architecture/PRIVACY-AND-DATA-LIFECYCLE.md`.
- Do not claim live OAuth delivery, Atlas indexes, SMTP delivery or complete account deletion based only on code presence.

## 8. Release acceptance

- [ ] Verify MongoDB and Better Auth readiness in the exact Preview/Production deployment.
- [ ] Deliver verification and password-reset emails through configured SMTP.
- [ ] Test generic duplicate/unknown-email responses and application/provider rate limits.
- [ ] Test signup, verification, resend, login, logout, forgot/reset and expired/revoked sessions.
- [ ] Test Google and GitHub login-only vs explicit signup intent and verified-email linking.
- [ ] Test malformed, external and protocol-relative return destinations.
- [ ] Test Guest / unverified / verified / owner direct page and API permissions.
- [ ] Replace email-based owner fallback with the accepted ID-only policy after checking deployed owner provisioning.
- [ ] Test session refresh and source-viewer clearing on sign-out/verification changes.
- [ ] Confirm public pages and project detail remain unaffected by auth failures.

No browser, SMTP, OAuth-console or Atlas verification is claimed by this source-document pass.
