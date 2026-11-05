# Labs Authentication Providers and Legal Cleanup Plan

**Status:** Planning only — no authentication implementation, provider credentials, database migration, or legal-page deletion has been performed by this plan.
**Branch:** feat/labs-platform-integration
**Date:** 2026-11-05
**Related source of truth:** docs/PRD.md, docs/LABS-AND-AUTHENTICATION-DESIGN-SPEC.md, docs/LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md and docs/IMPLEMENTATION-PLAN.md.

## 1. User-approved direction

1. **Keep email/password registration and login.** Do not replace it, remove it, or make OAuth mandatory.
2. **Add Google OAuth registration and login.**
3. **Add GitHub OAuth registration and login.**
4. A user may choose email/password, Google, or GitHub from the Labs account screens.
5. Keep the existing account-security lifecycle: email verification for password accounts, password reset, secure sessions, sign-out, rate limiting and safe returnTo navigation.
6. Remove the Terms/Conditions registration checkbox, standalone Terms page and Terms-only conditionals/files. Keep the Privacy Policy as an informational disclosure (not a mandatory acceptance gate) and retain email-verification state.

## 2. Current repository baseline

The integration branch currently contains:

- Better Auth 1.7.15 with @better-auth/mongo-adapter 1.7.15.
- Email/password registration through POST /api/labs/register, email/password login, verification, forgot-password and reset-password routes.
- Google OAuth credentials are read from GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET. The login page already has a Google button when configured.
- Google provider configuration currently sets disableSignUp: true, so it is login/linking only; the signup page has no Google button.
- GitHub OAuth is not configured and has no credential variables or UI.
- Better Auth account linking is enabled, disallows different emails, and does not use an explicit trusted-provider bypass.
- Signup currently requires a combined Terms/Privacy checkbox and an 18+ confirmation. Server registration writes a receipt to labs_registration_consents.
- src/app/lib/auth/registration-consent.js currently contains both consent-receipt functions and separate email-verification-flow functions. Those responsibilities must be separated before removing consent code.
- labs_verification_flows supports the email verification confirmation page and must remain even if legal consent receipts are retired.

These are code observations, not proof that Google OAuth, GitHub OAuth, SMTP or production callbacks are configured and tested.

## 3. Target authentication experience

### 3.1 Login — /labs/login

Keep the existing email/password form and Forgot password link. Add two optional provider actions:

- Continue with Google
- Continue with GitHub

The account screen should use one shared social-auth component/handler rather than duplicating provider-specific OAuth code in each form. Display a provider button only when that provider's server-side credentials are configured. Do not show disabled buttons for unconfigured providers.

**Login intent:** initiate OAuth for an existing account only. A login action must not silently create an account. If the provider identity is not linked to an existing Labs account, return a clear message that the user should use Create account.

### 3.2 Registration — /labs/signup

Keep the current email/password fields and Create account flow. Add:

- Continue with Google
- Continue with GitHub

**Registration intent:** explicitly request OAuth account creation. Use the Better Auth provider option disableImplicitSignUp: true and the explicit requestSignUp: true intent on the signup page, subject to verification against the installed 1.7.15 API/types. This keeps login-only OAuth calls from creating accounts accidentally.

If an OAuth identity already belongs to an existing verified account, the same-email account-linking policy may sign the user into/link that account; it must never create a duplicate local user for the same verified email.

### 3.3 Shared return and error handling

- Preserve the validated internal returnTo through Google/GitHub redirects and return users to the same Labs experiment after successful auth.
- Use the existing getSafeReturnTo() policy. Never accept provider-supplied external return URLs.
- Cover provider cancellation, denied consent, missing email, unverified email, existing-but-unlinked identity, callback/configuration failure, expired OAuth state and network failure.
- Do not expose provider access tokens, refresh tokens, OAuth state secrets or database details to the browser.
- Keep the current account menu and source-access rules. A verified email remains necessary for protected experiment source.

## 4. Provider setup and server configuration

| Provider | Server-only variables | Callback URL |
|---|---|---|
| Google | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET | https://<auth-origin>/api/auth/callback/google |
| GitHub | GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET | https://<auth-origin>/api/auth/callback/github |

- Configure the exact callback origin separately for local development, approved Preview and Production.
- Keep credentials server-only. Never use NEXT_PUBLIC_* for client secrets.
- Keep provider-availability checks centralized in the server auth configuration. The UI receives only booleans such as googleEnabled and githubEnabled, never credential values.
- Google requires the provider's verified-email signal before issuing an authenticated session.
- GitHub must request/read the primary verified email (the Better Auth GitHub integration documents the user:email scope). Handle private email correctly. If no usable verified email is returned, fail safely with a clear message; do not synthesize a placeholder email or trust an unverified email for source access/account linking.
- Keep OAuth scopes minimal: identity and email only. Do not request repository access or other GitHub permissions because Labs only needs authentication.
- Confirm Google and GitHub developer-console settings, callback allowlists and consent screens before enabling each provider.

## 5. Account-linking and identity rules

- Keep Better Auth account linking enabled.
- Keep allowDifferentEmails: false.
- Do not add providers to trustedProviders merely to bypass email verification.
- Allow an OAuth identity to link to an existing email/password account only when the provider's email is verified and matches the local account email under Better Auth's normal safe-linking behavior.
- Verify what happens when a user has an existing password account and chooses Google/GitHub for the first time. The user must retain one Labs account and its existing source/like data.
- Never merge accounts based only on a display name, GitHub username, avatar or unverified email.
- Do not build a provider-management/settings page in this scope. Account unlinking and manual linking UI remain deferred.

## 6. Terms/Conditions cleanup — approved deletion scope

**User-approved direction:** remove the mandatory Terms/Conditions checkbox and Terms-only registration gate, remove the standalone Terms page and its related references/files, and keep the Privacy Policy as an informational disclosure rather than a required acceptance checkbox. The following files/data have mixed responsibilities, so deletion must be selective.

### Remove from the registration flow

- Remove the combined Terms/Privacy/18+ checkbox from SignupForm.
- Remove client-only acceptedTerms, consentError, and checkbox-required validation.
- Remove the acceptedTerms request property and its validation from POST /api/labs/register.
- Remove Terms-specific registration readiness from getAuthRegistrationReadiness(); registration readiness should depend on required database/auth and email delivery, not a Terms page.
- Do not keep a social-signup-only consent blocker if Terms acceptance is being removed from email/password registration. All account methods must follow the same approved registration policy.

### Related code/data to retire only after the usage audit

- Terms-specific configuration in src/app/lib/legal/policies.js, including TERMS_VERSION.
- Consent-only functions in src/app/lib/auth/registration-consent.js: recordRegistrationConsent, linkLatestRegistrationConsent, markRegistrationConsentVerified, and discardUnlinkedRegistrationConsent.
- The labs_registration_consents collection and its indexes only after backup, reference removal and a reviewed migration.
- Consent-only imports and hooks in src/app/lib/auth/auth.js and src/app/api/labs/register/route.js.
- The standalone src/app/terms/page.js route, Terms-only UI links, footer/contact references, sitemap entry, SEO metadata and Terms policy version references.
- Update the Privacy Policy so it no longer claims that a Terms page or Terms/Privacy consent receipt exists. Keep accurate disclosures about account creation, email/password, Google/GitHub identity data, verification, sessions, source engagement and retention.

### Must remain

- /privacy and its public disclosure. Update it to name Google and GitHub as optional identity providers and accurately describe provider data received.
- Email-verification behavior, generic registration response, rate limiting, password reset and secure session behavior.
- The verification-flow collection and its functions. Move them out of registration-consent.js into a narrowly named module (for example registration-flows.js) before deleting consent-only code.
- Privacy disclosures for account/session data, provider information, source opens/copies, likes, cookies, security logs and retention.
- The shared LegalDocumentPage component while it is still used by the Privacy Policy.

### Deletion boundary

The Terms page, Terms checkbox and 18+ acknowledgement are in the approved removal scope. Remove the 18+ checkbox and its matching Terms-only registration clause at the same time; do not leave a signup age gate in a second file after removing its confirmation. Keep an accurate Privacy Policy at /privacy. This records the requested product/UI cleanup and is not legal advice.


## 7. Phased implementation plan

### Phase A — Auth baseline and contracts

- Re-read the current branch and pinned Better Auth 1.7.15 declarations/docs before implementation.
- Verify requestSignUp, disableImplicitSignUp, provider email mapping, account-linking behavior and callback error handling for the installed version.
- Inventory every Terms link, consent helper import, database hook, API field, readiness check, sitemap entry and collection reference.
- Lock the Terms-page deletion boundary before deleting files or records.

**Gate:** a file-by-file change list and provider flow matrix are reviewed. No auth behavior changes in this phase.

### Phase B — Google + GitHub server configuration

- Add GitHub server configuration and provider readiness alongside Google.
- Replace implicit/disabled OAuth registration behavior with explicit signup intent per route.
- Keep providers optional and independently configured.
- Confirm exact callback origins for local, Preview and Production.
- Preserve verified-email requirements and safe same-email linking.

**Gate:** configuration builds without credentials; each provider remains hidden until configured; no provider secret enters client output.

### Phase C — Shared social-auth UI and route integration

- Build one reusable SocialAuthButtons component and one shared provider sign-in helper.
- Render Google and GitHub on both login and signup screens when configured.
- Login calls use existing-account intent; signup calls use explicit account-creation intent.
- Keep email/password form behavior, validation, reset links and loading states unchanged.
- Show provider-specific but privacy-safe errors and preserve returnTo.

**Gate:** both screens behave consistently on desktop/mobile, keyboard and reduced-motion settings; email/password is unchanged.

### Phase D — Terms/consent cleanup

- Remove the mandatory registration checkbox and acceptedTerms payload/validation.
- Separate verification-flow functions from consent receipts.
- Remove Terms-only readiness and unused imports.
- Remove the Terms page and all references; update sitemap/footer/contact/SEO/legal copy together.
- Back up and retire labs_registration_consents after splitting verification-flow helpers, removing all code references and completing a reviewed migration.
- Retain and verify labs_verification_flows and the Privacy Policy.

**Gate:** no broken links, no stale policy claims, no orphaned imports/index creation, and email verification still works.

### Phase E — Account linking, provider-edge and security tests

Test at minimum:

- Existing email/password account signs in with email/password.
- New email/password account registers and verifies by email.
- Existing Google account signs in.
- New Google account can be created from signup.
- Existing GitHub account signs in.
- New GitHub account can be created from signup.
- Existing password account links Google when the verified email matches.
- Existing password account links GitHub when the verified primary email matches.
- Different/unverified emails are never force-linked.
- GitHub private email, missing email, revoked user:email consent and multiple email addresses.
- Provider not configured, OAuth cancellation, denial, expired state, callback error and invalid returnTo.
- One provider linked to an account does not create a duplicate user when another provider returns the same verified email.
- Verified source access works after OAuth sign-in; unverified/failed OAuth sessions cannot access source.
- Rate limits and generic responses do not reveal whether an account exists.

### Phase F — Deployment and release

- Configure Google/GitHub OAuth apps and Preview credentials.
- Verify callback URLs against the exact Vercel Preview host and the canonical Production host.
- Run the complete email/password + Google + GitHub flow in a browser against MongoDB.
- Review provider-specific Privacy Policy wording and account-data disclosures.
- Run production build, lint, auth regression tests and the Labs source-access matrix.
- Keep Production untouched until explicit release approval.

## 8. Expected file impact (planning inventory)

| File / area | Planned change |
|---|---|
| src/app/lib/auth/auth.js | Add GitHub credentials/provider; explicit OAuth sign-up intent; preserve email/password and verification |
| src/app/components/labs/auth/LoginForm.js | Keep email/password, replace single Google handler with shared social actions |
| src/app/components/labs/auth/SignupForm.js | Keep email/password, add Google/GitHub; remove Terms checkbox only after approved |
| New shared SocialAuthButtons.js / provider helper | Reuse provider buttons, pending state, callback and errors |
| src/app/labs/(auth)/login/page.js | Pass Google/GitHub enabled flags |
| src/app/labs/(auth)/signup/page.js | Pass Google/GitHub flags; remove Terms-only readiness/props if approved |
| src/app/api/labs/register/route.js | Keep generic email/password registration; remove acceptedTerms/consent only after approved |
| src/app/lib/auth/registration-consent.js | Split verification-flow responsibilities before removing consent-only helpers |
| src/app/lib/auth/auth.js | Remove consent hooks only after verification flow has its own module |
| src/app/lib/legal/policies.js | Retain Privacy version/config; retire Terms-only parts only if /terms is deleted |
| src/app/terms/page.js and global links | Delete the Terms route and all Terms-only footer/contact/sitemap/SEO references |
| src/app/privacy/page.js | Update provider and registration-data disclosures; retain page |
| .env.example and auth runbook | Document GitHub variable names and callback; no secrets |
| Auth docs, PRD and implementation tracker | Update provider requirements and staged acceptance criteria |

No package replacement is planned. better-auth, @better-auth/mongo-adapter, MongoDB, React and existing UI/icon packages remain. Do not uninstall react-icons or other packages simply because an auth icon import changes; first prove they are unused across the repository.

## 9. Explicitly out of scope

- Removing email/password authentication.
- Adding Apple, Facebook, Discord or other providers.
- GitHub repository access/scopes or GitHub API features.
- New user profile fields, username/passwordless flows or multi-factor authentication.
- Account-linking management UI or account unlinking.
- Replacing Better Auth or the MongoDB adapter.
- Removing Privacy Policy disclosures or email verification.
- Deleting MongoDB collections without backup and a reviewed migration.
- Production deployment or release without approval.

## 10. Official implementation references

Verify these against the installed Better Auth 1.7.15 version before coding; current online documentation may describe a newer version.

- Better Auth OAuth/provider setup: https://better-auth.com/docs/concepts/oauth
- Better Auth account linking: https://better-auth.com/docs/concepts/users-accounts
- Better Auth GitHub provider notes: https://better-auth.com/docs/1.6/authentication/github

**Completion status:** Planning document created. The OAuth providers are not yet added, the UI is not yet changed, and Terms/consent files or database records have not been removed.
