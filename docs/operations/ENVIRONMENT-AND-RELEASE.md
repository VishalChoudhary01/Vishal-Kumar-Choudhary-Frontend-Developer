# Environment, Local Setup and Release Verification

**Runtime target:** Vercel Node.js deployment; project configuration reports Node 22.x.  
**Environment template:** .env.example.  
**Important:** .env.example contains at least one stale contact-mail note (see section 4). Follow the actual route handler until that mismatch is resolved in a separate config-only change.

## 1. Current scripts and build pipeline

package.json scripts:
- npm run dev: Next.js development server.
- npm run build: sequential Node test suites, SEO validation, then next build.
- npm start: next start.
- npm run lint: eslint.
- npm run validate:seo: scripts/validate-seo.cjs.
- npm run db:ensure-labs-public-indexes: provision public Labs pagination indexes.
- npm run db:ensure-portfolio-analytics-indexes: provision portfolio analytics indexes.

Build pre-step:
- predev and prebuild invoke scripts/copy-monaco-assets.mjs.
- Build runs test suites for Labs public hero/featured/collection/source-only/navigation/pagination/Monaco/source reader/source creator/history/media/analytics; scroll policy/reset safety; Portfolio Analytics foundation/ingestion/tracker/reports/dashboard/polling/deletion/privacy; then SEO validation and Next build.

Use the exact package.json at the branch being audited as the command authority. Build script content may change; update this document when scripts change.

## 2. Local developer setup

1. Use the Node version supported by the current Vercel project (currently Node 22.x).
2. Install dependencies with npm ci using package-lock.json.
3. Copy .env.example to .env.local.
4. Fill only the variables needed for the flow being tested.
5. Do not commit .env.local or secret values.
6. For local Auth tests, use a dedicated non-production Mongo database and distinct Better Auth secret.
7. Start with npm run dev.
8. The predev script copies same-origin Monaco assets to public/monaco/vs; confirm this has succeeded if the editor's worker fails to load.
9. Run focused Node test scripts first, then npm run lint and npm run build.

Do not use production credentials or production user data for local testing.

## 3. Environment variable catalogue

### MongoDB and Better Auth

| Variable | Required for | Notes |
|---|---|---|
| MONGODB_URI | Auth, Labs models, Analytics | Server-only connection string. |
| MONGODB_DB_NAME | Auth/Labs/Analytics | Explicit database name. |
| BETTER_AUTH_SECRET | Better Auth and HMAC verification flow | Server-only secret. |
| BETTER_AUTH_URL | Auth base/callback construction | Must match the current deployment origin. |
| BETTER_AUTH_TRUSTED_ORIGINS | Additional allowed origins | Comma-separated approved origins, never wildcard broadly. |
| BETTER_AUTH_API_KEY | Optional Better Auth Dash plugin | Server-only; Dash is only registered when present. |
| AUTH_TRUSTED_IP_HEADER | Registration rate limit | Defaults in code to x-vercel-forwarded-for. |
| AUTH_SMTP_HOST/PORT/USER/PASSWORD/SECURE | Labs verification/reset email | Keep all SMTP values server-only. |
| AUTH_EMAIL_FROM | Labs auth mail sender | Use an authorized sender address. |
| LABS_OWNER_USER_ID | Singleton owner identity | Preferred stable Better Auth ID. |
| LABS_OWNER_EMAIL | Optional owner bootstrap identity | Code allows this verified email alternative; not currently listed in .env.example. |

OAuth:
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must both exist for Google provider registration.
- GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must both exist for GitHub provider registration.
See future/GOOGLE-GITHUB-OAUTH.md.

### Cloudinary and Blob

| Variable | Purpose |
|---|---|
| CLOUDINARY_CLOUD_NAME | Cloudinary account identifier |
| CLOUDINARY_API_KEY | Server-side authenticated API credential |
| CLOUDINARY_API_SECRET | Secret for signed upload/asset operations |
| CLOUDINARY_LABS_IMAGE_UPLOAD_PRESET | Signed image upload preset |
| CLOUDINARY_LABS_VIDEO_UPLOAD_PRESET | Signed video upload preset |
| LABS_MEDIA_MAX_UPLOAD_BYTES | Required integer byte ceiling |
| BLOB_READ_WRITE_TOKEN | Vercel Blob token used by Blob SDK (confirm token is attached to target Vercel project/environment) |

Cloudinary presets must be configured as the expected authenticated signed presets. Never expose CLOUDINARY_API_SECRET or BLOB_READ_WRITE_TOKEN to NEXT_PUBLIC_ variables.

### Portfolio Analytics

| Variable | Purpose |
|---|---|
| PORTFOLIO_ANALYTICS_ENABLED | Server-side feature enable flag; config.mjs returns disabled unless exactly true |
| PORTFOLIO_ANALYTICS_HMAC_SECRET | HMAC key; minimum 32 bytes when enabled |
| NEXT_PUBLIC_SITE_URL | Canonical host allowlist and canonical site URL |
| PORTFOLIO_ANALYTICS_ALLOW_LOCAL | Explicit local-only opt-in |
| NEXT_PUBLIC_PORTFOLIO_ANALYTICS_ENABLED | Public-side gate documented in .env.example; confirm deferred tracker behavior before changing |

On Vercel, tracking is accepted only when VERCEL_ENV is production and request host exactly matches canonical NEXT_PUBLIC_SITE_URL host. Preview deployments are rejected. In non-production local runtime, tracking only accepts localhost/127.0.0.1/::1 when PORTFOLIO_ANALYTICS_ALLOW_LOCAL=true. Retention is 65 days.

### Contact form

Current route implementation src/app/api/contact/route.js requires:
- GMAIL_USER
- GMAIL_APP_PASSWORD
- CONTACT_TO_EMAIL

It creates a Gmail SMTP Nodemailer transporter using smtp.gmail.com, port 465, secure true. GMAIL_APP_PASSWORD is a Google App Password, not the normal account password.

The complete contact lifecycle—including client validation and status, POST /api/contact request/response contract, email template, replyTo semantics and current hardening gaps—is documented in [Contact Form and Email Engineering](../pages/CONTACT-FORM-AND-EMAIL-ENGINEERING.md).

### Public domain

NEXT_PUBLIC_SITE_URL is used for canonical site metadata and Portfolio Analytics host validation. In deployed auth flows, BETTER_AUTH_URL/trusted origins must be exact and match provider callback configuration.

## 4. Confirmed stale .env.example mismatch

The current .env.example header says “Contact form email — Resend” and lists RESEND_API_KEY plus CONTACT_TO_EMAIL. The current src/app/api/contact/route.js does not use Resend; it imports Nodemailer and requires GMAIL_USER, GMAIL_APP_PASSWORD and CONTACT_TO_EMAIL.

This is a real config-documentation mismatch. During this docs-only task, application/environment files have not been changed. Until a separate authorized config cleanup resolves it:
- use the route's required Gmail variable names for contact delivery;
- do not assume RESEND_API_KEY powers the current contact route;
- consider correcting .env.example and any unused Resend reference in a dedicated configuration change.

Also .env.example currently lists LABS_OWNER_USER_ID but does not list the code-supported LABS_OWNER_EMAIL fallback. Treat owner email as code-supported but absent from the template.

## 5. Database bootstrap and indexes

Mongoose schema definitions declare indexes, but production indexes must be verified in MongoDB. Specific scripts exist for:
- public Labs pagination indexes;
- Portfolio Analytics indexes.

Before release:
- inspect the exact target database name;
- confirm required collections;
- compare actual indexes with DATA-MODEL-CATALOG.md;
- check TTL index creation and unique index conflicts;
- check migration/backfill state before deleting legacy collections or fields.

Never run destructive cleanup against production without a reviewed backup and rollback plan.

## 6. Vercel deployment checks

For each Preview/Production deployment:
1. Inspect deployment's Git branch and commit SHA.
2. Confirm Node runtime 22.x or current configured runtime.
3. Confirm environment target variables are present without printing values.
4. Confirm the app has required owner identity and auth callback origin.
5. Confirm database network/credentials/DB name.
6. Confirm Cloudinary presets/quotas and Blob token.
7. Confirm Sandbox availability and compiler files are included in deployment/runtime.
8. Confirm the build ran all package.json pre-build tests.
9. Check Vercel function maximum duration for long compiler/publish endpoints.
10. Run authenticated browser QA on the exact deployed commit.

Do not rely on an older READY deployment as evidence for a newer branch head.

## 7. Verification levels — record separately

| Level | Evidence | Does not prove |
|---|---|---|
| Source inspection | Actual handler/component/model exists | It works with deployed credentials |
| Unit/regression test | Named test command passes | Atlas, SMTP, provider or browser integration works |
| Lint | ESLint passes | Runtime behavior is correct |
| Production build | Next build completes | Every interaction or user role works |
| Service integration | Mongo/SMTP/Cloudinary/Blob/Sandbox calls verified | All viewport and accessibility behavior works |
| Browser QA | Direct route, interactions, mobile/desktop, failures checked | Production configuration identical unless tested there |
| Production verification | Canonical deployment and environment tested | Ongoing future deployment remains valid |

## 8. Release regression matrix

### Public portfolio
- Homepage first/revisit intro.
- Hero scroll transforms and Education pin.
- Lenis wheel/touch and route transition cleanup.
- About/Skills/Experience/Projects/Contact interactions.
- Responsive breakpoints, theme, reduced motion, keyboard and 200% zoom.
- Project static metadata, canonical URL, JSON-LD and unknown slug 404.

### Labs
- Public collection pagination and built-in/custom detail.
- Guest vs verified source access.
- Like/unlike and guest claim.
- Source file validation/save/version/restore.
- Unsaved Run.
- Published artifact delivery and CSP.
- Media upload/finalization/poster.
- Owner route guards.
- Native scroll through full inventory/editor pages.

### Analytics
- Portfolio feature flag/canonical host/privacy/retention.
- Portfolio visit lifecycle and deletion.
- Labs event separation/current like state.
- Dashboard polling, chart selection and accessible data table.

### Authentication
- Email/password sign-up, verification, login, reset and logout.
- Google/GitHub credential gates and callback.
- Account collision/linking, verified email and owner identity.
- Direct API denial after logout/expired session.

