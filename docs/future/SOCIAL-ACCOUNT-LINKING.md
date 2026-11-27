# Labs Social Account Linking — Implementation Contract

**Status:** SOURCE IMPLEMENTATION COMPLETE on `feature/auth-social-account-linking`; automated and deployed Preview verification pending.
**Scope:** Allow one verified Labs user to use email/password, Google and GitHub to access the same Better Auth user.
**Authentication engine:** Better Auth (pinned by the repository lockfile), MongoDB adapter.

This document is the implementation contract for the feature. It does not claim that the UI or behavior is already deployed.

## 1. User experience

A user who registered with email and password should be able to add Google and GitHub later without creating a second Labs account.

The flow is explicit:

1. The user signs in with an existing method.
2. The user opens **Account** → **Account settings** → **Sign-in methods**.
3. The page shows the verified Labs email and the methods currently attached to that Labs account.
4. The user selects **Connect Google** or **Connect GitHub**.
5. Better Auth starts the provider authorization flow for the already-authenticated user.
6. After the provider callback, the user returns to the security page and sees the provider marked as connected.
7. The connected provider can then be used on the normal Labs login page.

A successful link attaches the external provider account to the existing Better Auth user ID. It must not create a second application user, change ownership of Labs data, or merge user records by email in application code.

## 2. Account-linking security policy

The server configuration must use the following policy:

```js
account: {
  accountLinking: {
    enabled: true,
    disableImplicitLinking: true,
    requireLocalEmailVerified: true,
    allowDifferentEmails: false,
    allowUnlinkingAll: false,
  },
},
```

Rules:

- Linking is enabled only as an authenticated, user-initiated action.
- Implicit linking during a logged-out OAuth sign-in is disabled. The login page must not silently attach a provider identity to an existing account.
- The existing Labs account's email must already be verified before provider linking.
- A provider must return a verified email matching the signed-in Labs account email. Different-email linking stays disabled.
- Google and GitHub provider verification requirements remain enabled.
- GitHub must continue selecting a verified email from `/user/emails`, preferring the primary verified address.
- A provider identity already attached to another Labs user must be rejected. Never auto-merge users or transfer their records.
- Keep `allowUnlinkingAll: false`; Better Auth must prevent removing the final authentication method.
- Do not add `trustedProviders` to bypass verified-email checks.
- Do not trust client-provided IDs, email addresses, provider profile fields or `emailVerified` values to authorize linking.

The explicit local verification option is intentionally set to `true` even though it is the secure Better Auth default. This makes the account policy visible and resistant to accidental config drift.

## 3. Routes and ownership

### Account Security page

- Route: `/labs/account/security`
- The page is private and dynamic.
- Resolve the session on the server with `getCurrentAuthSession()`.
- Guests are redirected to `/labs/login?returnTo=...`.
- Accounts without a verified local email are directed to `/labs/verify-email?returnTo=...`.
- Do not put this route inside the shared auth-screen route group/layout.
- The page is a sign-in-method management surface, not an owner/admin workspace.

### Account menu

Add **Account settings** to the existing signed-in Labs account dropdown. It should be available to verified non-owner and owner accounts alike. Preserve current owner workspace destinations, email-verification entry, responsive menu behavior and sign-out flow.

## 4. Client API contract

Use the installed Better Auth React client; do not implement a parallel OAuth callback or manually write account records.

- `authClient.listAccounts()` loads the methods linked to the current authenticated user.
- `authClient.linkSocial({ provider, callbackURL, errorCallbackURL })` starts explicit linking for Google or GitHub.
- `authClient.unlinkAccount({ accountId })` may be exposed for disconnecting an existing social provider. Use the account record `id` returned by `listAccounts()`, not the provider's external account ID.

The session must remain active when the linking flow starts and when the provider callback returns. Re-fetch the account list after returning; do not assume a redirect parameter proves that linking succeeded.

Only offer providers that are configured on the server. The browser must never receive OAuth client secrets.

## 5. Login behavior and error handling

Normal provider sign-in remains available for users who already connected that provider. Explicit provider signup remains distinct from login.

When a user tries Google/GitHub login for an existing email/password account that has not linked that provider, explain that they must first sign in with their original method, verify their email, and connect the provider in Account settings. This is the expected result when implicit linking is disabled; it is not a reason to weaken account-linking security.

Provide clear, non-sensitive messages for:

- provider not configured;
- account not linked (sign in with the original method and connect it from settings);
- local email not verified;
- provider email missing, unverified or different from the Labs email;
- provider identity already linked to another Labs account;
- OAuth cancellation, expired state or expired session;
- temporary provider/network failure.

Never display raw OAuth tokens, authorization codes, account records or internal exception details.

## 6. Disconnect policy

The UI may allow a user to disconnect Google or GitHub only when another valid sign-in method remains. The UI must not offer a disconnect action that would leave the user with no authentication method. Better Auth remains the server-side enforcement layer; hiding a button is not sufficient authorization.

Do not introduce a self-service password creation/change flow as part of this feature. Credential setup for social-only accounts is a separate scope.

## 7. Test and release acceptance

### Automated checks

- Assert the account-linking server configuration explicitly disables implicit linking and requires local email verification.
- Assert different-email linking and unlinking all methods remain disabled.
- Assert the account-security route performs server-side session and email-verification checks.
- Assert account-menu settings entry is present without removing owner destinations or sign-out.
- Assert the UI obtains linked account IDs from `listAccounts()` and passes the Better Auth account record ID to unlinking.
- Run authentication, account-control and build tests.

### Preview browser checks

For a verified email/password test account:

- [ ] Connect Google with the exact same verified email.
- [ ] Return to Account settings and confirm Google is connected.
- [ ] Sign out, sign in with Google and confirm the same Labs user/data is loaded.
- [ ] Repeat for GitHub, including a private GitHub primary email.
- [ ] Confirm all methods resolve to the same Better Auth user ID.
- [ ] Confirm another email cannot be used to link.
- [ ] Confirm an unverified local account cannot link a provider.
- [ ] Confirm a provider already linked to another user is rejected.
- [ ] Confirm cancel, callback-state expiry and session expiry fail safely.
- [ ] Confirm disconnecting one provider preserves access through the remaining method.
- [ ] Confirm the final remaining authentication method cannot be unlinked.
- [ ] Confirm owner permissions and Labs data ownership are unchanged.

Test both provider flows on the Preview deployment before Production. Provider console credentials, callback URLs, SMTP delivery and actual OAuth provider behavior are external deployment checks and cannot be proven by a source-only test.

## 8. Out of scope

- Linking accounts with different email addresses.
- Automatic merging of separate Labs users or their data.
- Account deletion, profile editing or password setup for social-only users.
- Changing owner authorization or source-access rules.
- Changing OAuth provider credentials or deployment secrets.
