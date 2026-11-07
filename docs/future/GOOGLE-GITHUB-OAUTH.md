# Future Verification — Google and GitHub OAuth

**Status:** CODE PRESENT; ENVIRONMENT CONFIGURATION AND END-TO-END VERIFICATION PENDING.  
**Auth implementation:** src/app/lib/auth/auth.js using Better Auth and MongoDB adapter.  
**Catch-all API:** src/app/api/auth/[...all]/route.js.

Do not mark either OAuth provider complete solely because its config exists in source code. Better Auth only registers a provider when both of that provider's credential environment variables are present.

## 1. Implemented provider configuration

### Google

The server reads:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET

When both exist, the Better Auth socialProviders.google configuration is included with:
- requireEmailVerification: true;
- disableImplicitSignUp: true;
- prompt: select_account.

If either credential is missing, Google is omitted from active provider configuration.

### GitHub

The server reads:
- GITHUB_CLIENT_ID
- GITHUB_CLIENT_SECRET

When both exist, socialProviders.github is included with:
- scope: read:user, user:email;
- requireEmailVerification: true;
- disableImplicitSignUp: true;
- custom getUserInfo profile loader.

The custom loader:
1. requires an access token;
2. fetches GitHub /user and /user/emails with cache:no-store and 10-second request timeout;
3. requires both responses to succeed;
4. requires profile ID and an email list;
5. selects a primary verified email, otherwise the first verified email;
6. rejects identities without a verified email;
7. normalizes email to lower case;
8. returns provider profile plus normalized verified identity.

## 2. Existing account/session policy

Better Auth config currently includes:
- account linking enabled;
- disableImplicitLinking false;
- allowDifferentEmails false;
- email/password enabled;
- requireEmailVerification true;
- autoSignIn false;
- min password 8 and max 128;
- revoke sessions on password reset;
- rate limiting for sign-in/social, reset-password and verification operations;
- secure cookies in production;
- trusted origins assembled from configured auth base URL and BETTER_AUTH_TRUSTED_ORIGINS.

The provider config disables implicit sign-up. The UI should preserve the distinction between signing into an existing account and explicitly choosing provider account creation. Confirm actual Better Auth behavior with the installed version and browser tests before changing account linking.

## 3. Better Auth endpoint wiring

Both GET and POST /api/auth/[...all] delegate to toNextJsHandler(auth), after checking isAuthRuntimeConfigured. The direct /sign-up/email path is blocked so email registration must go through /api/labs/register, which owns rate limit and verification flow.

The exact provider callback URL must be taken from the configured Better Auth base URL and provider instructions for the installed Better Auth version. Do not guess callback paths/URLs while registering the provider console app. Verify exact redirect URI per Preview and Production deployment.

## 4. Configuration checklist

### Google Cloud Console
- Create/verify OAuth client for the correct application.
- Configure consent screen and authorized application origins.
- Register exact redirect URL reported by Better Auth for the current base URL.
- Add server-only GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to Preview and Production environments.
- Ensure the secret is never prefixed NEXT_PUBLIC_ or sent to a browser.
- Confirm the deployment has BETTER_AUTH_SECRET, Mongo URI/database and trusted origin config.

### GitHub OAuth App
- Create/verify an OAuth App for the intended application/URL.
- Register exact callback URL reported by Better Auth.
- Ensure the app can return read:user and user:email scopes.
- Add server-only GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to Preview and Production environments.
- Confirm the custom GitHub email lookup returns a verified email for accounts whose primary email is private or differs from their public profile email.

### Environment matrix

| Variable | Local | Preview | Production | Purpose |
|---|---|---|---|---|
| GOOGLE_CLIENT_ID | OPEN | Required for Google tests | Required for Google release | Google OAuth public client identifier (server config) |
| GOOGLE_CLIENT_SECRET | OPEN | Required for Google tests | Required for Google release | Google OAuth confidential secret |
| GITHUB_CLIENT_ID | OPEN | Required for GitHub tests | Required for GitHub release | GitHub OAuth client identifier |
| GITHUB_CLIENT_SECRET | OPEN | Required for GitHub tests | Required for GitHub release | GitHub OAuth confidential secret |
| BETTER_AUTH_SECRET | Required | Required | Required | Session/signature secret |
| BETTER_AUTH_TRUSTED_ORIGINS | Verify | Verify | Verify | Allowed web origins |
| BETTER_AUTH_URL / configured auth base | Verify | Exact preview base | Canonical production base | Callback and secure URL construction |
| MONGODB_URI / MONGODB_DB_NAME | Required | Required | Required | Better Auth user/session storage |

This table records variable purpose/status, not actual secret values. Use .env.example and auth/base-url.js to confirm the canonical variable names and any supported aliases before configuring deployment.

## 5. Required end-to-end test matrix

Run separately for Google and GitHub; run against the actual Preview URL and the canonical Production domain.

| Scenario | Expected |
|---|---|
| Provider credentials absent | Provider is not offered/configured; email/password path still works |
| New provider identity, explicit account-creation intent | Provider account creation follows the app's explicit-signup policy and verified-email rule |
| Existing account with matching verified email | Linking follows the configured Better Auth account-linking rule; no silent cross-email merge |
| Existing account with different email | Linking is rejected or follows documented safe collision behavior; no accidental account takeover |
| Provider returns no verified email | Provider flow fails with safe user-facing message |
| GitHub private primary email | Custom user-info loader uses a verified email from /user/emails |
| User cancels provider consent | Returns to a safe sign-in state; no broken session or endless redirect |
| OAuth callback state mismatch / expired | Request is rejected; no account linking |
| Provider API timeout/5xx | Safe failure, no raw token or server error leaked |
| Verified provider sign-in | Better Auth session is active and verified-user Labs source access works |
| Unverified email/password login | Protected source remains denied until verification completes |
| Owner account signs in | Owner identity still depends on LABS_OWNER_USER_ID/LABS_OWNER_EMAIL, not provider name |
| Logout | Session is cleared across supported route contexts |
| Session expiration/revocation | Protected APIs deny access even if client UI still shows a cached user |

## 6. Acceptance evidence to record

For each environment, record:
- branch/commit and deployment URL;
- exact callback URL configured in provider console (safe URL, no secrets);
- whether provider credential pair is present (boolean only);
- tested flow: sign-in, first-time provider identity, explicit signup intent, account linking, logout, error/cancel;
- verified email outcome;
- session state after callback;
- direct source API result for guest/unverified/verified test users;
- owner access check using the configured singleton owner identity;
- screenshots or test logs with access tokens, refresh tokens, authorization codes and secrets removed.

Do not paste OAuth client secrets, authorization codes, access tokens, refresh tokens or raw session cookies into source control, documentation, tickets or chat.

## 7. What remains open

- Actual provider console applications and ownership.
- Preview and Production credentials/callback configuration.
- Whether both providers are available in current deployments.
- Full test of explicit provider sign-up intent.
- Cross-provider account linking and collision cases.
- Email/private-account handling in real provider responses.
- Session/logout/expiry acceptance in the deployed browser.
- Review of Better Auth version-specific defaults on callback and account-linking behavior.

Treat OAuth as CODE PRESENT / VERIFICATION PENDING until the checklist has evidence for both providers.
