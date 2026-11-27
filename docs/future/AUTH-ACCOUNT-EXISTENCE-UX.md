# Labs Account Existence-Safe Signup and Login UX

**Status:** Implemented on `feature/auth-account-existence-ux`; automated regression coverage added. Local test/build execution and Preview browser verification are still pending.  
**Target baseline:** `main`  
**Scope:** Make signup and login outcomes understandable for new and returning users without exposing whether an email address is registered.

## 1. Product goal

The authentication experience must help two groups reach the correct next step:

- A new visitor who attempts to sign in before creating a Labs account should be guided to account creation.
- A returning visitor who submits an address already associated with Labs should be guided to sign in or recover access, rather than being told that registration succeeded.

The UI must not claim that an account was created or that an email was delivered unless the application can prove that outcome.

## 2. Security principle: do not reveal account existence

Do not expose whether an email address is registered through a different public response, status code, error code, timing pattern or message.

A message such as **"This account does not exist"** is not acceptable as the result of an email/password login attempt. An attacker could submit a list of addresses and use that difference to discover Labs users.

Use the same public login failure state for:
- an email address that has no Labs account;
- an existing account with an incorrect password;
- other credential failures that should not be distinguishable to the visitor.

The same principle applies to signup and password recovery. The public response must not disclose whether the email address already exists.

**Desired product outcome:** Give users an obvious **Create an account** action after an unsuccessful login, but phrase the message conditionally (for example, "New to Labs? Create an account") rather than claiming the submitted address is not registered.

## 3. Current implementation baseline

The following behavior was observed on `main` during this documentation pass:

### Signup

- UI: `src/app/components/labs/auth/SignupForm.js`
- Endpoint: `POST /api/labs/register`
- The form already has a loading state and changes the submit label to `Creating account…`.
- HTTP 202 with `{ ok: true }` switches the form to a `Check your email` completion state.
- The form currently says: "If an account can be created with this address, you'll receive an email with the next steps."
- Other responses are shown as validation or service errors.

The registration endpoint deliberately uses a generic HTTP 202 response for account-existence collisions. It also converts Better Auth registration results that represent a non-delivery-related registration outcome into the generic response. Email-delivery/service failures remain failures. Therefore, HTTP 202 must be treated as **a generic accepted response**, not proof that a new account was created, that a verification email was sent, or that the mailbox received it.

### Login

- UI: `src/app/components/labs/auth/LoginForm.js`
- Authentication call: `authClient.signIn.email()`
- Non-verification credential failures currently use the generic message: "Check your email and password, then try again."
- A 403 verification-required response has a separate message and a **Verify your email** action.
- The page already has a persistent **Don't have an account? Create an account** link.
- The generic credential error does not yet provide a contextual create-account action beside the error.

The current implementation therefore already avoids an explicit "account does not exist" response, but can do a better job guiding new visitors at the point of failure.

## 2.1 Implementation delivered on this branch

The first implementation pass includes:

- A reusable `SignupConfirmation.js` view inside the existing auth page/modal, not a nested modal.
- Generic accepted-request copy with sign-in, forgot-password and use-another-email actions.
- Safe `returnTo` preservation, focus transfer and reduced-motion-aware transition.
- A synchronous signup submit lock and `aria-busy` state.
- Generic email/password login failure guidance with a contextual **Create an account** action.
- Separate verification-required and rate-limit messages.
- Regression tests in `tests/auth-account-existence-ux.test.mjs`, included in the build test chain.

The registration API contract and social account-linking security policy remain unchanged.

## 2.2 Password strength feedback consistency fix

The signup password meter and validation utility now share a single derived tone/status assessment:

- Fewer than eight characters: `Too short`, with the exact remaining-character guidance.
- Eight or more characters with only some checks passed: `Weak` or `Fair`, with the first missing requirement.
- Four of five checks passed: `Almost there` (not `Good`), with the exact missing requirement.
- All five checks passed: `Strong` and `All requirements met`.

The meter consumes the utility's tone rather than independently recalculating thresholds. Its accessible meter text includes both the status and current guidance.

The inline meter remains visible only while the password field is focused. A document-level outside-pointer handler also closes it when the user clicks a non-focusable area or another element; the existing focus/blur handling remains for keyboard navigation. This avoids leaving stale strength feedback visible after the user leaves the field.

Regression coverage was extended in `tests/labs-signup-password-strength.test.mjs` for the four-of-five state, shared tone, accessible value text and outside-pointer dismissal. The existing build script already runs this test file. Test execution and Preview browser verification are still pending.

## 4. Signup experience

### 4.1 Submitting state

Keep the existing compact signup form visible while the request is in progress.

- Submit label: **Creating account…**
- Show the existing loading indicator.
- Disable form controls and social signup actions while email/password registration is pending.
- Add a synchronous submit lock (a ref) so double-clicks or repeated Enter presses cannot initiate concurrent submissions.
- Keep the loading state until the request resolves.
- Do not clear the entered email or password if the request fails and the form remains visible.

### 4.2 Generic confirmation state

When the endpoint returns the expected generic HTTP 202 accepted response, replace the form content with a confirmation view.

Suggested copy:

**Heading:** Check your email

**Body:** "If this email address can be used to create a Labs account, we'll send a message with the next steps. Check your inbox and spam folder."

**Returning-user guidance:** "Already use Labs? Sign in with your existing method or reset your password."

Actions:
1. **Continue to sign in** — link to `/labs/login?returnTo=<safe returnTo>`.
2. **Forgot password?** — link to `/labs/forgot-password?returnTo=<safe returnTo>`.
3. **Use another email** — return to the signup form without losing the safe return destination.

Do not label this state **Account created successfully** or **Email sent**. The endpoint intentionally does not confirm either fact. Do not reveal that the address was already registered.

A resend-verification action may be offered as a secondary path only through the existing generic verification-resend UX. It must not claim that an address is unverified or that an account exists.

### 4.3 Failure state

Do not show the confirmation view for non-success responses.

- `422`: show safe validation guidance.
- `429`: show the rate-limit message and retry guidance.
- `503`: show the delivery/service-unavailable message and allow retry.
- Network/response parsing failure: show a generic retry message.
- Keep the entered fields available for retry.
- Re-enable controls after the request finishes.

Do not convert an actual email-delivery failure into a success state.

## 5. Login experience

### 5.1 Loading

Keep the current loading behavior:
- Submit label: **Signing in…**
- Disable credential fields and submit controls.
- Keep the synchronous submission lock.
- Prevent concurrent email/password requests.
- Preserve the safe `returnTo` destination.

### 5.2 Generic credential failure with a contextual signup action

For an ordinary email/password credential failure, use one message for both an unknown email and an incorrect password.

Suggested copy:

**Heading:** Unable to sign in

**Body:** "We couldn't sign you in with those details. Check your email and password, or reset your password."

**Contextual action:** "New to Labs? Create an account."

The contextual action must link to:

`/labs/signup?returnTo=<safe returnTo>`

Keep the existing footer **Don't have an account? Create an account** link as a persistent alternative. Avoid rendering duplicate identical links in the same visual area; the contextual action can be placed inside the error message while the footer remains the stable page-level navigation, or the UX review can select one prominent placement.

Do not:
- say "This account does not exist";
- show a separate message for unknown email vs wrong password;
- change response status or body based on whether Better Auth found a user;
- make a preflight account-existence request from the browser;
- query the database from a public route to decide whether to show the signup link.

### 5.3 Verification-required login state

Keep the existing special handling when Better Auth explicitly reports that the account requires email verification.

Suggested copy:

**Heading:** Verify your email first

**Body:** "Your email address needs to be verified before you can sign in."

**Action:** **Verify your email** → `/labs/verify-email?returnTo=<safe returnTo>`

This state is justified by an authentication policy response and is distinct from ordinary credential failure. It must not be shown for an unknown email or incorrect password.

### 5.4 Social login errors

Keep provider-specific errors separate from email/password credential failures:
- `account_not_linked`: explain that the visitor should sign in using the original method and connect the provider from Account settings.
- OAuth cancellation/state/session/provider failures: show safe retry guidance.
- Do not silently enable implicit account linking or implicit signup to make the error disappear.
- Keep explicit social signup as a separate signup intent.

## 6. Shared confirmation and transition design

The signup confirmation should be a reusable auth-state component rather than a second modal.

Suggested component boundary:
- `SignupConfirmation`: neutral confirmation copy and actions.
- `SignupForm`: owns request state and switches to the confirmation component only for the accepted response.
- `LoginForm`: owns generic credential feedback and contextual signup/recovery actions.
- `AuthMessage` and `AuthLink`: reuse existing styling and navigation conventions.

The confirmation must work in both supported presentations:
- Full-page signup under the existing `AuthFrame`.
- Intercepted signup inside the existing `LabsAuthModal`.

Do not open a nested modal. Animate the content replacement inside the current page/card/dialog using the project's existing Motion conventions. Respect reduced-motion preferences.

Keep the design compact:
- one clear heading;
- one short explanation;
- one primary action;
- recovery/create-account alternatives as secondary actions;
- no large decorative illustration or extra vertical panel.

Use a success/status visual only to communicate **request received**, not account creation or email delivery.

## 7. Return destination and navigation rules

- Always derive the destination with the existing `getSafeReturnTo()` flow or the already-sanitized `returnTo` prop.
- Preserve `returnTo` when moving between signup, login, forgot-password and verification routes.
- Never construct an external redirect from user input.
- When returning to the signup form via **Use another email**, preserve the safe destination but do not restore a password value from browser storage or URL parameters.

## 8. Implementation boundaries

Do not change:
- Better Auth account-linking security policy;
- `disableImplicitLinking: true`;
- verified-email requirements;
- social provider explicit signup/login intent;
- password strength scoring or the eight-character minimum;
- server-side session authorization;
- registration and authentication rate limits;
- verification-flow token/UUID design.

Do not add a public "does this email exist?" endpoint.

The registration API should continue returning the same generic public accepted response for account-existence collisions. The login API/client should continue returning an indistinguishable generic credential failure for unknown email and incorrect password.

If a future change is needed to improve timing consistency, audit the whole public response path and delivery behavior. Do not add an artificial delay without measurement, and do not rely on timing padding as a substitute for generic responses.

## 9. Automated test contract

### Signup tests

- [ ] Accepted HTTP 202 switches to the generic confirmation state.
- [ ] Confirmation wording does not assert account creation or email delivery.
- [ ] Confirmation includes sign-in and password-recovery actions.
- [ ] All actions preserve the sanitized `returnTo`.
- [ ] Duplicate/existing-address and new-address paths have the same public response contract.
- [ ] `422`, `429`, `503`, network failures and malformed JSON do not show confirmation.
- [ ] Delivery failure remains an error and permits retry.
- [ ] Double click / repeated Enter does not submit twice.
- [ ] Fields remain available after failure and are disabled only while submitting.

### Login tests

- [ ] Unknown email and wrong password produce the same generic public message.
- [ ] Generic credential failure offers a visible create-account action.
- [ ] Signup link preserves the sanitized `returnTo`.
- [ ] Forgot-password action remains available.
- [ ] No account-existence preflight endpoint or client database lookup is introduced.
- [ ] Verification-required response still offers **Verify your email**.
- [ ] Provider `account_not_linked` remains distinct and does not enable implicit linking.
- [ ] Repeated submit is locked and loading state resets after failed sign-in.

### Visual and accessibility checks

- [ ] Works in full-page and intercepted-modal signup routes.
- [ ] Confirmation replaces the current content; no nested modal.
- [ ] Motion transition is subtle and respects reduced motion.
- [ ] Focus moves to the confirmation heading/status region when content changes, without stealing focus during ordinary validation.
- [ ] Status and error messages use appropriate live-region semantics.
- [ ] Keyboard navigation, mobile layout, tablet layout, light theme and dark theme work.
- [ ] Existing signup, login, OAuth linking, reset-password and verification journeys remain intact.

## 10. Release acceptance

- [ ] Run focused signup/login tests and the full repository build test chain.
- [ ] Verify new address signup in Preview and confirm verification email delivery separately.
- [ ] Repeat signup with an existing verified email and confirm the same generic accepted UI/response.
- [ ] Repeat signup with an existing unverified email and confirm no account-existence disclosure.
- [ ] Attempt login using a nonexistent email and a wrong password; confirm identical public failure copy.
- [ ] Confirm the login failure includes a working create-account action.
- [ ] Confirm valid but unverified login still reaches verification guidance.
- [ ] Test delivery failure, rate limit, retry and duplicate-submit behavior.
- [ ] Test both full-page and intercepted-modal layouts.
- [ ] Confirm Google/GitHub explicit login, signup and account linking still work.

Live email delivery, production account records and OAuth provider behavior must be verified in the actual Preview/Production environment; source tests alone cannot prove those external effects.
