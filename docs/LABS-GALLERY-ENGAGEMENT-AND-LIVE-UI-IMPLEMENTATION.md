# Labs Gallery, Engagement and Live UI — Implementation Record

**Status:** Code paths for this slice are committed to `feat/labs-platform-integration`. This is a repository implementation record, not deployed-release confirmation. A clean dependency install, automated tests, Next.js production build, Atlas-backed integration checks, authenticated browser QA and a new Preview deployment are still required before release.  
**Updated:** 2026-11-06  
**Related authorities:** [PRD](./PRD.md), [Analytics Design](./DESIGN-ANALYTICS.md), [API Contracts](./API-CONTRACTS.md), [Labs Source Management](./LABS-SOURCE-MANAGEMENT-SPEC.md), [Studio Runtime and Media Plan](./LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md), [Media Pipeline Phase 1](./LABS-MEDIA-PIPELINE-PHASE-1.md)

This document records the current implementation decisions for public Labs gallery cards, their likes, owner engagement analytics, public gallery posters, Chart.js activity trends and action toasts. It does not replace the detailed metric, source-lifecycle, runtime-isolation or media security authorities linked above.

## 1. Published gallery eligibility and preview rendering

A custom experiment is eligible for the public gallery only when all release references agree:

1. `LabExperiment.status === "published"`.
2. Its `LabSource` exists and has `published === true`.
3. The source has non-empty `publishedVersionId` and `publishedArtifactId`.
4. A ready `LabBuildArtifact` exists for the same experiment slug and its `sourceVersionId` equals the source's published version.

The public catalogue applies this gate. The owner Source Library now returns a `publicationReadiness` diagnostic for custom experiments (for example, missing artifact or artifact/version mismatch) so excluded cards can be investigated instead of guessed at. The gallery never executes code, mounts a React tree, starts an iframe, or invokes the compiler.

The public visual priority is:

1. A valid `galleryPreview` whose `artifactId` and `sourceVersionId` exactly match the current published release.
2. The existing generic Labs artwork/neutral placeholder.

**Automatic screenshots are not implemented.** The first public poster workflow is an explicit owner-selected still image. It is not an automatically generated screenshot of the isolated preview. Automatic capture remains deferred until a supported, isolated capture worker/browser and its artifact-binding/retry lifecycle are designed and verified.

## 2. Public gallery poster lifecycle

The existing Cloudinary media inventory remains a private upload library. Its short-lived preview URLs are owner-only and must never be copied to a public DTO.

An owner may explicitly promote one ready, experiment-owned JPEG, PNG, WebP or AVIF still image as the public gallery poster. The promotion server:

- requires the experiment to be published and the current source/artifact pointers to identify a ready immutable artifact;
- re-reads the Cloudinary resource as an authenticated asset and verifies the expected resource type, format, size (maximum 5 MB), and downloaded file signature;
- copies the verified bytes to a uniquely named public Vercel Blob object;
- saves only the public Blob URL and its exact artifact/version binding in `LabExperiment.galleryPreview`;
- audits the change without returning a private Cloudinary URL.

The owner UI labels this as public and states that anyone can view the promoted image. The owner supplies alt text. Only still-image formats listed above can be promoted; GIF and video remain private fallback uploads and cannot silently become public gallery media.

The new owner-only mutation is:

- `PUT /api/v1/admin/labs/experiments/:slug/media/gallery-preview`
- Body: `{ "assetId": "<owned ready image id>", "altText": "...", "fit": "cover" | "contain" }`
- Removal: `{ "assetId": null }`

The route applies the existing owner guard and same-origin mutation check. Removing/replacing a poster attempts to delete the previous public Blob object. Publishing a different artifact clears the old poster pointer and attempts cleanup after the source transaction; unpublishing clears the pointer and attempts cleanup; experiment deletion includes the poster URL in the Blob deletion set. Provider cleanup is best-effort and may need operational reconciliation if it fails. The public DTO still refuses to render a stale poster because it checks the artifact/version pair.

The private `fallback-preview` role remains separate and private. It is used only when the interactive detail runtime cannot run or is unsupported; it never replaces a working runtime and is not the gallery poster.

## 3. Like identity, state and public contract

The like target is one published Labs experiment identified by its canonical `slug`. It is not a nested visual component or a source file.

There is one Like button. When active, it becomes Unlike; Unlike only reverses the current like state. It is not a negative vote and there is no separate dislike counter/model.

- Verified users have one unique state record per `userId + experimentSlug`, enforced by the `LabLike` unique index. The account identity is server-derived from Better Auth.
- Anonymous visitors have one unique state record per signed browser-cookie identity + experiment slug, enforced by the `LabGuestLike` unique index. The raw cookie identifier is HMAC-protected and only its keyed digest is stored.
- Anonymous identity is browser-profile scope, not proof of a real-world person. Different devices, browsers, private sessions or cleared cookies may produce additional anonymous identities. Do not use IP addresses or browser fingerprinting to pretend otherwise.
- When a verified session is seen with the same guest cookie, active guest likes are transactionally claimed by that account. A pre-existing active account like wins; the guest state is deactivated so the total does not double-count. This state migration creates no synthetic verified action event; historical events retain the actor category under which they were originally recorded.
- Current active counts are calculated from active state records. Historical like/unlike events are a separate measure.

The public GET/POST DTO exposes only `totalLikes`, the current actor's `liked` state, and the relevant `likeAllowed`/actor status. It does **not** expose verified-versus-anonymous counts. Owner analytics retains aggregate verified/anonymous totals and action counts.

The gallery count uses the shared `MotionNumber` component, and the heart/button interaction uses `motion/react` with the project's reduced-motion hook. Optimistic updates are reconciled with the server response and show an error if the mutation fails. Missing server-rendered engagement snapshots trigger a client GET rather than leaving a permanently disabled button.

## 4. Owner active verified-liker drilldown

The experiment analytics page has an owner-only current-state panel for verified accounts that currently like that experiment. It joins active `LabLike` rows to Better Auth's `user` collection and returns only account name, email and like timestamp—never raw user IDs. Results are paginated and searchable by name/email; emails are masked in the UI.

This is not a historical user-action export. If an account unlikes, it leaves the active list; historical action reporting remains aggregate. Anonymous browser identities stay aggregate-only and are never exposed as a list of guest identifiers.

## 5. Analytics chart and toast behavior

The engagement trend chart is a lazy-loaded Chart.js single-metric column chart. The owner selects one measure at a time so unlike units are not overlaid on a shared scale. It supports UTC daily buckets for shorter reporting windows and weekly buckets for longer windows, semantic series colors, hover/selection readouts, a tabular equivalent, an empty-data state, reduced-motion-aware updates and a retry action if Chart.js cannot be loaded. The data table remains available when the canvas chart fails.

The shared action toast provider uses Motion entry/exit transitions and a bounded queue: up to three visible notifications and twenty pending notifications. Duplicate messages are suppressed briefly; timers begin only when a toast becomes visible and pause while it is hovered or focused. Errors use an assertive live region; informational/success messages use a polite live region. Reduced-motion preferences shorten the transition. The queue drops only the oldest pending item when full, never an already-visible notification.

## 6. Verification and release gates

Code changes are present on `feat/labs-platform-integration`; do not infer build or runtime success from that fact. Before release:

- run the Labs analytics Node test suite, lint, SEO validation and full Next.js production build against a clean install;
- add/execute tests for public DTO privacy, guest-to-account migration, duplicate/race handling, exact-artifact poster eligibility, owner-only route access, cleanup failure behavior and toast/chart lifecycle;
- verify the Better Auth MongoDB `user` collection lookup against the actual Atlas adapter schema;
- perform authenticated owner tests for like/unlike, guest-to-verified merge, current liker search/pagination, poster promotion/removal, publish/unpublish and deletion;
- verify public cards for built-in and custom experiments, including missing/mismatched artifact diagnostics and stale poster suppression;
- verify light/dark themes, touch interaction, reduced motion, screen-reader announcements and responsive/zoom behavior;
- build and test a new Vercel Preview for the exact branch commit. Older Preview deployments do not verify these changes.

No automatic generated poster, public GIF/video poster delivery, public runtime-fallback media delivery, WebSocket analytics transport or person-level anonymous identity is included in this implementation slice. Existing dashboard refresh/polling remains the transport until a measured requirement justifies a different approach.
