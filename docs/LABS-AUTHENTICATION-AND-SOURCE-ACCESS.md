# Labs Authentication and Protected Source — Setup and Provisioning

**Status:** Implementation runbook; production rollout is configuration- and test-gated.  
**Scope:** Better Auth + MongoDB Adapter, Labs account flows, email delivery, Google OAuth, consent configuration and private source snapshot/grant provisioning.  
**Related:** `LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`, `ARCHITECTURE.md`, `API-CONTRACTS.md`, `THREAT-MODEL.md`.

## 1. Selected implementation

- Better Auth `1.7.15` with `@better-auth/mongo-adapter` `1.7.15`.
- Native MongoDB driver for Better Auth persistence; existing Mongoose module remains responsible for application models and repository queries.
- Next.js App Router route handlers; no Express server.
- Email/password with email verification and password reset. Google sign-in is enabled only when both OAuth credentials are configured.
- No GitHub sign-in.
- Public Labs browsing and code-owned demos remain available without sign-in.
- Full source is retrieved only from the private `lab_sources` collection after the server verifies an active `lab_source_grants` record.

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
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional | Enable the Google action and OAuth callback. |
| `NEXT_PUBLIC_TERMS_OF_SERVICE_URL` | Yes to enable registration | Published HTTPS Terms of Service document. |
| `NEXT_PUBLIC_PRIVACY_POLICY_URL` | Yes to enable registration | Published HTTPS Privacy Policy document. |
| `TERMS_OF_SERVICE_VERSION` | Yes to enable registration | Version accepted at account creation. |
| `PRIVACY_POLICY_VERSION` | Yes to enable registration | Version accepted at account creation. |

The current public registration route remains unavailable until MongoDB/auth secrets, SMTP delivery and both real legal documents/versions are configured. This is intentional; do not invent legal content or point the UI at placeholder links.

### Google OAuth callback

Register the deployed callback path:

```text
https://<your-auth-origin>/api/auth/callback/google
```

The app shows the Google action only when both Google credentials are present. The implementation disallows implicit Google account creation so the Google button does not bypass the required legal-consent registration route. Google sign-in requires the provider's verified email signal. Matching verified Google identities can link under Better Auth's verified-email linking behavior; no force-trusted-provider override is configured. Implicit Google sign-up is disabled so this action cannot bypass legal consent.

### SMTP verification

Before enabling account registration, send a verification message and a password-reset message through the configured SMTP account. The mail transport is vendor-neutral Nodemailer SMTP; no Resend, Gmail or other vendor account is assumed.

## 3. Authentication routes and behavior

| User flow | Route / handler | Behavior |
| --- | --- | --- |
| Login | `/labs/login` | Email/password; optional Google action; validated local return destination. |
| Registration | `/labs/signup` → `POST /api/labs/register` | Requires consent; generic confirmation whether or not an account already exists. |
| Verification | `/labs/verify-email` | Verify-link callback (provider default token lifetime) and 30-second resend UX cooldown. |
| Forgot password | `/labs/forgot-password` | Generic response for existing and unknown email addresses. |
| Reset password | `/labs/reset-password` | Valid token only; confirmation returns to Login; sessions are revoked. |
| Auth transport | `/api/auth/[...all]` | Better Auth-owned handlers; direct `/sign-up/email` is blocked to prevent consent bypass. |
| Session read | `GET /api/auth/get-session` | Server-backed session read; used by Labs account UI and protected-source revalidation. |

The registration endpoint records the server's current legal-document versions and acceptance time. The browser cannot choose these values. Registration has an additional five-attempts-per-minute trusted-proxy-IP limit. Better Auth also applies the route-specific rate limits configured in `src/app/lib/auth/auth.js`.

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

## 5. Create the required indexes and grant an account access to one experiment

Create or verify these indexes with a trusted Atlas administrative connection before provisioning source records:

```javascript
db.lab_sources.createIndex(
  { slug: 1 },
  { unique: true, name: "lab_source_slug_unique" }
);
db.lab_source_grants.createIndex(
  { userId: 1, experimentSlug: 1 },
  { unique: true, name: "lab_source_grant_user_experiment_unique" }
);
```

Mongoose models:
- `src/app/lib/labs/models/LabSource.js`
- `src/app/lib/labs/models/LabSourceGrant.js`

MongoDB collections: `lab_sources` and `lab_source_grants`.



Mongoose model: `src/app/lib/labs/models/LabSourceGrant.js`  
MongoDB collection: `lab_source_grants`

The policy is deny-by-default. A registered and verified user still receives 403 unless an operator explicitly creates a grant. The user ID must be read from the Better Auth user record; never accept a user ID supplied by the browser.

Example Atlas/Mongo shell operation (replace every placeholder with the verified values and use a trusted administrative connection):

```javascript
db.lab_source_grants.updateOne(
  {
    userId: "<Better Auth user id>",
    experimentSlug: "magnetic-interaction"
  },
  {
    $set: {
      active: true,
      grantedBy: "<trusted operator id>",
      expiresAt: null,
      revokedAt: null
    }
  },
  { upsert: true }
);
```

To revoke access:

```javascript
db.lab_source_grants.updateOne(
  {
    userId: "<Better Auth user id>",
    experimentSlug: "magnetic-interaction"
  },
  {
    $set: {
      active: false,
      revokedAt: new Date()
    }
  }
);
```

The unique user/experiment index prevents multiple active grant rows for the same account and experiment. Provisioning is currently a trusted operator task; no CMS/admin grant UI or public grant API has been added.

## 6. Protected source endpoint

`GET /api/v1/labs/:slug/source`

Server checks, in order:
1. Valid experiment slug.
2. Better Auth session exists.
3. Account email is verified.
4. Active grant matches the server-derived user ID and experiment slug and has not expired/revoked.
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
- [ ] Real Terms/Privacy URLs and versions are configured; registration is disabled if they are missing.
- [ ] Google callback, email verification requirement and trusted account linking are verified if Google is enabled.
- [ ] Duplicate registration responses do not expose account existence.
- [ ] Registration, sign-in, reset and resend rate limits are tested.
- [ ] Safe return-path cases reject external/protocol-relative destinations.
- [ ] Guest, unverified, verified-ungranted, granted, expired-grant and revoked-grant requests are tested.
- [ ] Source responses carry private/no-store headers and source never appears in anonymous HTML, RSC payloads or public caches.
- [ ] Logout and password reset revoke access across tabs/devices; active source views clear on invalidation.
- [ ] Light/dark, mobile/keyboard, accessibility and existing portfolio regression checks pass.
- [ ] Production build and lint pass.

No deployment secrets are committed to this repository. This runbook does not certify that any external provider, Atlas cluster or browser test has been configured or passed.
