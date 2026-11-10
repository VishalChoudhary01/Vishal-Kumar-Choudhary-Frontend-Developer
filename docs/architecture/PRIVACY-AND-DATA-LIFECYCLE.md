# Privacy and Data Lifecycle — Engineering Map

**Audited branch:** `feat/labs-platform-integration`  
**Current-state date:** 2026-11-07  
**Public disclosure:** `/privacy`  
**Policy source:** `src/app/privacy/page.js` and `src/app/lib/legal/policies`

This guide maps the privacy disclosure to the implementation and identifies code/policy discrepancies. It is not legal advice and does not replace the public Privacy Policy.

## 1. Data-domain map

| Data | Current purpose | Storage / boundary | Retention behavior observed |
|---|---|---|---|
| Auth user, account and session records | Account identity, sign-in, session control | Better Auth MongoDB adapter | Kept while needed to operate/protect the account; session may expire or be revoked |
| Verification flow | Confirm the signup verification callback state without treating a URL parameter as proof | `labs_verification_flows`; stores random flow ID and keyed email digest, not raw email | Seven-day TTL |
| Registration rate-limit state | Abuse prevention | App MongoDB collection; keyed digest derived from trusted proxy IP | Approximately 24-hour expiry per Privacy Policy |
| Published source-access event | Measure verified source opens/copy actions | `lab_analytics_events`; event type, experiment, actor category, optional actor user ID, source version/path and time | No automatic TTL currently defined on the model |
| Verified like state | Persist one active like per account/experiment | `lab_likes`; account ID and experiment slug | Until unlike or account deletion under a future approved deletion process |
| Anonymous like state | Remember a guest like in one browser context | Signed HTTP-only cookie; DB stores a hash of the guest key plus experiment, active state and expiry | 180-day idle expiry, according to current Privacy Policy; DB TTL on `expiresAt` |
| Portfolio page visits | Understand public page traffic when explicitly enabled | `portfolio_visits`; HMAC'd visit/session identifiers and reduced page/referrer/device/location fields | 65-day TTL |
| Contact submission | Respond to the visitor's inquiry | Delivered by Gmail SMTP to the configured receiving inbox; no app-side contact-message collection was found in the endpoint | Email mailbox/provider retention rules |
| Theme and intro preferences | Preserve interface settings | Browser storage | User/browser controlled |
| Analytics opt-out preference | Remember browser-level preference | Browser local storage | User/browser controlled |

The model declarations and live database indexes are different things. A schema index or TTL declaration does not prove that the matching index exists in the active Atlas database; check the deployed database independently.

## 2. Authentication and verification data

Better Auth handles account authentication data, password hashing, provider accounts and sessions. The app does not store readable plaintext passwords in its own Labs models.

Email/password registration uses `POST /api/labs/register`; the generic response is designed to avoid revealing whether an email address already has an account. A random verification `flowId` maps to a keyed email digest. The record expires after seven days. The Better Auth post-verification hook marks matching unexpired flows; the browser asks the server-side verification-status endpoint for the state.

Google/GitHub identity details are handled only when the visitor chooses a configured provider. GitHub requests identity and email scopes, not repository access. OAuth provider credentials and callback URLs must be verified in the deployed provider consoles.

The current system does not implement self-service account deletion or a complete profile-management/dashboard area. The Privacy Policy describes how a person can request access/correction/deletion through Contact; do not describe that as an automated account-deletion endpoint.

## 3. Labs source and engagement data

### Protected source access

Every server-confirmed, email-verified Better Auth account may read a currently published source snapshot. Guests and unverified accounts do not receive source bytes. The source endpoint validates canonical experiment publication, the published pointer, file paths, language, secret patterns, file count and total response size. Source bytes must remain private/no-store and excluded from public HTML/RSC/client bundles.

The source-read event represents a successful authorized source response. The copy event is accepted only after a successful Clipboard API acknowledgement from the client and is not evidence that the code was pasted or used. Neither event collects the source text or clipboard contents.

### Verified and anonymous likes

A verified like is keyed to account ID and experiment and enforces one current state per pair. A guest like uses a random browser identity in a signed HTTP-only cookie; only a keyed hash is persisted with the experiment state. It is not a verified identity or unique-person count. Clearing cookies, changing browser or changing device may produce a separate guest identity.

The guest-like model has an `expiresAt` TTL index. The current public policy describes a 180-day idle expiry. Verified likes do not have an automatic TTL declaration in the current model.

### Analytics event records

Current Labs event types are `source_open`, `code_copy`, `like`, `unlike`, `guest_like` and `guest_unlike`. The event model has a unique event ID and date/actor indexes, but no TTL index is declared. Event retention and account-deletion treatment are open release decisions; do not invent a retention period or assume automatic deletion.

Portfolio page analytics is separate. It may be enabled only through its explicit configuration and stores pseudonymous visit/session keys plus reduced technical attribution rather than account identity. The current model/policy describes 65-day expiry. A page visit is not a unique person and an active-time estimate is not proof of attention.

## 4. Owner analytics privacy contract

**Accepted target policy (2026-11-07): aggregate-only Labs owner analytics.** Owner reports may show totals, trends, experiment rankings and aggregate counts. They must not expose individual user names, masked email addresses, per-user like timestamps, a searchable active-liker directory, or user-level source/copy/like histories. Anonymous identities must never be enumerated.

**Current code discrepancy:** the Labs experiment Analytics detail page currently has an active verified-liker panel that resolves `LabLike` records to Better Auth user names and masked email addresses with timestamp and search/pagination. This is narrower than a historical activity log, but it still exposes account-level data and does not match the accepted aggregate-only decision or the current Privacy Policy wording. Remove/redesign this panel before claiming the implementation and policy are aligned.

The public Privacy Policy must describe actual data collection and owner-facing disclosure; do not weaken its aggregate-only promise to accommodate an unapproved UI exception.

## 5. Contact information

The Contact endpoint accepts name, email, project type and message, validates them server-side, then sends the message through Gmail SMTP to the configured inbox. The endpoint shown in this branch does not write a contact-message record to MongoDB. The receiving email mailbox and provider systems may retain the message under their own settings.

Observed hardening items remain separate engineering tasks: the contact route has no explicit route-level rate limiter, no explicit same-origin check and no explicit request byte ceiling; the transporter is closed on the success path but not in a `finally` block. See `pages/CONTACT-FORM-AND-EMAIL-ENGINEERING.md`. Do not store SMTP secrets in client variables or logs.

## 6. Browser storage and cookies

Current browser-side storage purposes include:
- theme preference (through the theme system);
- introductory/animation preference state;
- optional Portfolio Analytics preference in local storage;
- Better Auth session cookies;
- anonymous Labs-like signed HTTP-only cookie.

Disabling Portfolio Analytics in the browser affects future tracking in that browser; it does not delete already stored visits. Clearing browser data can sign a person out, reset preferences or cause a new anonymous-like identity.

## 7. Providers and transfer boundary

The Privacy Policy currently identifies Vercel, MongoDB, Better Auth, configured email providers, and optional Google/GitHub sign-in providers. Labs media/build infrastructure also uses Cloudinary, Vercel Blob and Vercel Sandbox; confirm the user-facing policy and provider notices accurately explain any personal data or content those services process before production use.

Provider terms, infrastructure locations, logs and backup retention can change. This repository audit does not establish the current regional location or exact retention configuration of any external provider.

## 8. Retention and deletion decisions

| Item | Current implementation/policy | Required follow-up |
|---|---|---|
| Verification flows | Seven-day TTL | Verify deployed index and cleanup behavior |
| Registration rate-limit rows | Approximately 24-hour TTL in policy | Verify actual collection/index |
| Anonymous likes | 180-day idle expiry; TTL index | Verify cleanup and cookie refresh behavior |
| Portfolio visits | 65-day TTL; owner deletion controls | Verify deployed TTL and manual-delete flows |
| Labs analytics events | No model TTL | Approve retention period and account deletion treatment |
| Verified likes | Persist until unlike | Define deletion behavior if/when account deletion is implemented |
| Source versions/build artifacts/audit rows | Immutable/release-linked records; no general user dashboard | Define lifecycle/backup policy before destructive cleanup |
| Contact emails | Receiving inbox/provider retention | Mailbox policy is external to MongoDB |
| Account deletion | No self-service route/workflow found | Implement only after an explicit data-retention/deletion plan |

Never infer that a record is gone immediately when a TTL expiry is reached; MongoDB TTL cleanup is asynchronous. Never delete media or historical artifacts without reference checks and an approved retention policy.

## 9. Required privacy/release checks

- [ ] Compare the public `/privacy` wording to actual fields, event producers, cookies and owner dashboard output.
- [ ] Remove the active verified-liker identity panel to enforce the accepted aggregate-only decision.
- [ ] Verify no email, user name or account-level history is sent to aggregate dashboard DTOs.
- [ ] Confirm source text and clipboard contents are absent from analytics, logs and contact telemetry.
- [ ] Verify current cookie flags, secure settings, same-site behavior and expiry in the deployed environment.
- [ ] Verify all declared TTL indexes in active Atlas, including verification flows, registration limits, guest likes and portfolio visits.
- [ ] Decide Labs event retention and account deletion semantics before production analytics is enabled.
- [ ] Document a safe account deletion workflow before offering self-service account deletion.
- [ ] Verify provider disclosures and international processing information in the public Privacy Policy.
- [ ] Test analytics preference behavior and confirm opt-out does not delete historical records.

No legal review, provider audit, Atlas TTL inspection or deletion workflow is claimed by this engineering map.
