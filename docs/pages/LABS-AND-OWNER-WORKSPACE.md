# Public Labs and Owner Workspace — Functional Engineering Map

**Public:** /labs, /labs/[slug]  
**Owner:** /admin/labs/analytics, /admin/labs/analytics/[slug], /admin/labs/sources, /admin/labs/sources/[slug], /admin/labs/sources/import, /admin/labs/experiments/new, /admin/labs/experiments/[slug]/edit  
**Status:** Implemented in the audited branch; external-service setup and end-to-end release verification remain separate.

## 1. Public Labs route shell

The collection and detail routes use LabsPageShell. It composes:
- PortfolioAnalyticsDeferred for the separate portfolio page-visit tracker;
- PortfolioIntro while the shared PageLoaderProvider is loading;
- page content hidden until heroReady;
- Navbar in project context, with Labs account controls.

The Labs route family deliberately uses native document scrolling; it must not mount Lenis. Page-shell props may include initial auth user, session resolution and owner status. Client-visible owner flags are presentation hints, not authorization.

## 2. Public collection and pagination

GET /api/v1/labs is the custom public collection endpoint.
- Fixed page size is 18; a supplied limit is rejected.
- Optional category must match LAB_CATEGORIES.
- Optional cursor is decoded and validated.
- Public custom entries are retrieved through getPublishedCustomLabExperimentPage.
- Response shape: data.experiments and data.nextCursor.
- Cache-Control is private/no-store and Vary includes Cookie and Authorization.
- Unavailable collection returns 503 with PUBLIC_LABS_UNAVAILABLE.

The public collection combines the code-owned experiment catalogue and published custom experiments. They remain different data sources. Keep category, pagination, featured presentation and static card media separate from the interactive runtime.

Gallery cards are static. They must not create experiment iframes, mount custom React roots, execute source, or start compiler jobs.

## 3. Public detail workspace

LabWorkspace selects its runtime:
- runtimeKey defaults to experiment.slug;
- a runtimeUrl selects the published custom iframe path;
- otherwise hasLabRuntime(runtimeKey) resolves a reviewed built-in runtime.
- Built-in controls are shown only for supported registry experiments; custom iframe runtime does not use the built-in control panel.
- Restart/fullscreen controls are capability-gated; fullscreen is also browser-support-gated.
- LabCanvas handles configured mobile/desktop aspect ratio and fullscreen layout. Its fullscreen target includes the action row, preserving an explicit exit action.

LabRuntimeBoundary owns loading, unavailable, starting/handshake, ready and failed/retry states. It validates postMessage source against the iframe window and checks matching artifactId before accepting ready/error messages.

The detail page also composes:
- metadata/header;
- explanation;
- protected source access panel;
- likes/engagement;
- runtime workspace;
- media and other detail content where supplied.

## 4. Source access and security

GET /api/v1/labs/[slug]/source does not follow the public detail-page access policy. It requires:
1. valid slug;
2. published built-in or custom experiment;
3. Better Auth session;
4. user.emailVerified === true;
5. currently published LabSource pointer;
6. the exact publishedVersionId snapshot;
7. source file path/language/content/secret validation.

Guests can see published experiment metadata and explicitly public demos, but no source bytes. Unverified signed-in accounts receive an email-verification-required response.

Current policy is verified account + published source. LabSourceGrant remains as a legacy model, but an active per-user grant is not needed by getAuthorizedLabSource. Do not document grants as the current permission model.

All source responses use private/no-store semantics and vary by Cookie/Authorization.

## 5. Engagement and likes

GET/POST /api/v1/labs/[slug]/engagement.

Public response exposes aggregate totalLikes and the visitor's liked state. It does not expose user IDs or guest key hashes.

Guest likes:
- use a signed/hashed HTTP-only identity cookie;
- persist a hashed guest key in LabGuestLike;
- expire via expiresAt TTL;
- remain best-effort browser identity, not reliable cross-device unique people.

Verified likes:
- use LabLike with unique userId + experimentSlug;
- store current active state separately from event history.

When a verified user arrives with a guest cookie, the GET/POST flow can claim guest likes into the verified account and clear the guest cookie. Unverified signed-in users cannot mutate likes. POST validates public experiment, same-origin Origin, JSON boolean liked, actor permissions and rate limits.

POST /api/v1/labs/[slug]/source/events records verified source_open/code_copy events for a valid public source version. It validates origin, published state and request identity; event records are separate from page visits. A code_copy event does not prove paste, execution or use.

## 6. Owner identity and guarded routes

src/app/lib/labs/owner-access.js is the shared policy:
- Better Auth user ID must exist;
- emailVerified must be true;
- user must match LABS_OWNER_USER_ID or LABS_OWNER_EMAIL;
- when neither is configured status is not-configured;
- a mismatch returns account-mismatch.

Owner pages resolve session on the server and either redirect to login with returnTo, display LabsOwnerAccessNotice, or fetch owner data. Every mutation endpoint must still use server-side getLabsOwnerUser / isLabsOwner checks. Hiding a button is not access control.

## 7. Labs Analytics

/admin/labs/analytics loads a normalized day period (7/30/90/365), owner session, initial getLabsOwnerAnalytics data, and LabsLiveAnalyticsDashboard.

The current dashboard has:
- aggregate metric cards using MotionNumber;
- rankings built from instrumented event types;
- a lazy single-metric Chart.js trend visualization with accessible data-table equivalent;
- updated timestamp/refresh feedback;
- loading, empty and error states;
- a client refresh/polling loop with 10-second normal interval and up to 60-second backoff on errors.

The experiment detail route /admin/labs/analytics/[slug] displays per-experiment reporting and a limited owner-only current active verified-liker panel. The identity exception is only current active verified likes for that experiment (display name, masked email, time). It is not a historic individual engagement timeline. Guest identity remains aggregate-only.

## 8. Source Library and the removed action

/admin/labs/sources currently renders LabsOwnerNavigation and LabSourceInventory.

Inventory filters:
- all experiments;
- no source;
- draft;
- published;
- custom not in gallery.

It also supports search, refresh/loading/error feedback, source creation and cleanup/deletion confirmation.

The former top-level “Initialize sources” link and FileCode2 import were removed from src/app/admin/labs/sources/page.js in commit 063df83c543a4bec0d996c5029928d07a07c66d5. Do not describe it as a visible current action.

This does not delete the direct import workflow:
- /admin/labs/sources/import remains a direct owner-protected route.
- LabRuntimeImportPanel remains.
- POST /api/v1/admin/labs/sources/import-runtime remains.
- POST /api/v1/admin/labs/sources/import-magnetic-button remains.

## 9. Source Workspace

/admin/labs/sources/[slug] loads source aggregate, immutable versions and recent audit events in parallel, after owner authorization.

LabSourceEditor owns:
- file tree/list and active file;
- add/import, edit, rename and delete;
- working-copy dirty state;
- source validation;
- save draft;
- unsaved Run;
- version history and restore;
- publish/unpublish;
- audit history;
- media library/attachment controls.

LabCodeEditor dynamically loads Monaco with SSR disabled. Its worker/assets are served from same-origin /monaco/vs instead of relying on Monaco's default CDN. If Monaco fails, a plain textarea editing fallback is available. Editor theme follows the active application theme.

The source editor accepts javascript, jsx, typescript, tsx, css, html, json, markdown, text and svg. Validation limits snapshots to 1–40 files, validates safe relative paths and supported languages, rejects secrets/restricted paths and enforces content/size constraints.

Saving creates a new immutable LabSourceVersion; it does not publish automatically. Preview runs the current working copy in a temporary sandbox. Publish builds an exact saved version and updates the public pointer to the resulting artifact. Restore creates a new version based on the old version rather than mutating history.

## 10. Experiment metadata editor

New custom experiment: /admin/labs/experiments/new → LabExperimentCreateForm → POST /api/v1/admin/labs/experiments. Successful creation uses the server-returned workspace destination; do not invent a slug route on the client.

Edit custom experiment: /admin/labs/experiments/[slug]/edit. PATCH /api/v1/admin/labs/experiments/[slug] updates title, description, explanation, category and technologies with expectedUpdatedAt/requestId concurrency hints. DELETE requires a matching confirmSlug.

Metadata is independent from source code. Editing title/description/category/technologies does not modify source files or an immutable published artifact.

## 11. Rebuild and verification checklist

- Public built-in and custom gallery cards remain static; no runtime iframe in cards.
- Test every built-in runtime and custom published detail runtime.
- Verify guest/unverified/verified/owner source-access outcomes via direct requests.
- Verify guest likes, verified likes, unlike, migration and aggregate privacy.
- Verify fixed 18-item collection pagination, category validation and cursors.
- Verify owner API denial for non-owner accounts.
- Verify source validation, secret rejection, save/version/restore/Run/publish/unpublish/audit.
- Confirm published pointers resolve to exact immutable artifact and version.
- Verify Cloudinary uploads, Blob poster/artefact URLs and cleanup behavior.
- Check loading, empty, error, retry, keyboard and reduced-motion states.
- Verify native document scrolling through long Source Library and Source Workspace pages; Monaco/editor/canvas must not hijack page wheel scrolling.
