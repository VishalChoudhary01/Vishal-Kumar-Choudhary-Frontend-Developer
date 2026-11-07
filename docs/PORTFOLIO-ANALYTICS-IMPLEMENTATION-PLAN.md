# Portfolio Analytics — Implementation Plan

**Status:** Approved implementation baseline · **Implementation:** Phases 1–3 committed; public tracking remains disabled by default  
**Target branch:** `feat/labs-platform-integration`  
**Scope:** First-party analytics for the public portfolio homepage, project detail pages, Labs collection and Lab detail pages.  
**Stack:** Existing Next.js App Router, JavaScript, Tailwind CSS v4, Motion (`motion/react`), MongoDB/Mongoose and Vercel hosting.

> This document defines the implementation contract and rollout phases. It does not claim that tracking, MongoDB collections, APIs or the dashboard have already been implemented. Do not begin implementation until the owner approves this plan and the Phase 0 repository/privacy review is complete.

---

## 1. Product objective

Build a small, first-party portfolio analytics system so the owner can understand:

- How many public page views and browser sessions the portfolio receives.
- Which page types and individual projects/experiments receive attention.
- Approximate visitor country, region and city.
- Device category: desktop, mobile, tablet or unknown.
- Referrer host and allowlisted campaign parameters.
- Estimated time a page remained visible.
- Recent page visits and aggregate traffic trends.
- How to remove individual visits, visits in a selected period, or all portfolio analytics data.

The first release covers only:

1. Homepage: `/`
2. Project details: `/projects/[slug]`
3. Labs collection: `/labs`
4. Lab details: `/labs/[slug]`

Do not record admin, authentication, account, private source, API, static asset, 404 or other unrelated routes as portfolio page views.

The owner dashboard lives at:

`/admin/portfolio/analytics`

Portfolio Analytics is a separate data domain from the existing Labs source-engagement analytics. Reuse the current owner-access mechanism and UI conventions, but do not merge visit data with source opens, code copies, likes or Lab audit events.

## 2. Non-negotiable product and engineering rules

1. **The public page wins.** Analytics must never delay, block or gate the homepage, project pages or Labs pages.
2. No database read or analytics aggregation is added to the server-render path of public pages.
3. Tracking is first-party and asynchronous. If tracking fails, the page still works normally.
4. No raw IP address is persisted in MongoDB.
5. No device fingerprint, exact GPS coordinates, postal code, full user-agent string, full referrer URL or arbitrary query string is stored.
6. Only a small allowlist of public routes is trackable.
7. A browser tab/session is not a person. Dashboard labels must say **sessions**, not claim a count of unique people.
8. Visible time is an estimate based on server-accepted heartbeats, not proof that someone was looking at the screen.
9. Dashboard polling runs only while the Analytics page is open and visible.
10. No WebSocket, SSE service, third-party analytics SDK, new animation library or separate Express service is required for the first release.
11. Existing portfolio design, animation, SEO, theme behavior, Labs routes, navbar, project interactions and public page-loader behavior must remain unchanged.
12. Every API mutation performs server-side validation, authorization and rate limiting. Client-side controls are never security boundaries.

## 3. Performance architecture — protect the public portfolio

This is the highest-priority design requirement. The tracking mechanism must be effectively invisible to normal browsing.

### 3.1 What must not happen

- Do not put a MongoDB query in `src/app/page.js`, `projects/[slug]/page.js`, `labs/page.js` or `labs/[slug]/page.js` just to count a view.
- Do not await a tracking request before rendering a page, completing the intro loader, navigating between routes or displaying a project.
- Do not import the dashboard, Chart.js, MotionNumber, MongoDB/Mongoose models, analytics aggregation code or admin modules into public page bundles.
- Do not add a tracking script to the document head or make it render-blocking.
- Do not add a new global provider or state store solely for analytics.
- Do not run page polling on the public homepage.
- Do not make React state update on every pointer, heartbeat or timing tick.
- Do not add a third-party IP lookup request from the browser or server.

### 3.2 Preferred tracker placement

The inspected app already has public client shells:

- `src/app/components/HomePage.js`
- `src/app/projects/[slug]/ProjectPageView.js`
- `src/app/components/labs/LabsPageShell.js`

Prefer mounting the small tracker from these public shells rather than importing it unconditionally into `AppProviders` for every route. The Labs shell is shared by the Labs collection and Lab detail pages. Track only after the current route is confirmed to be in the four-route allowlist.

This avoids adding analytics work to unrelated routes such as sign-in, admin, privacy, terms or account pages. Do not change page composition to accommodate tracking.

### 3.3 Deferred client loading

- Keep the tracker as a small, dependency-free Client Component.
- Load its code in a separate chunk using a deliberate lazy/dynamic import after hydration and an idle opportunity.
- Use `requestIdleCallback` with a bounded timeout where available; use a short `setTimeout` fallback.
- A short activation delay is acceptable. The initial HTML, CSS, fonts, image loading, LCP element and intro transition must not wait for the tracker.
- Do not download or initialize analytics charting libraries on public routes.
- Do not use an external analytics SDK, geolocation SDK or cookie-management dependency just for this feature.

Next.js documents that lazy-loading Client Components can reduce the JavaScript needed for initial rendering. Use the actual App Router/client-boundary behavior after inspecting the current code; do not assume a dynamic import is automatically deferred if it is rendered eagerly. See the official [Next.js lazy-loading guide](https://nextjs.org/docs/app/guides/lazy-loading).

### 3.4 Public-page request budget

| Work | Target |
|---|---|
| New render-blocking scripts | 0 |
| New public-route database reads | 0 |
| New third-party requests | 0 |
| New runtime dependencies | 0 |
| Tracker code | Target ≤ 4 KB gzip, excluding shared framework runtime |
| Initial tracking request | 1 per page visit, deferred and fire-and-forget |
| Heartbeat | 1 every 15 seconds while visible |
| Heartbeats per active minute | At most 4 per tab |
| Heartbeat payload | Target ≤ 0.5 KB |
| Tracking mutation payload | Target ≤ 1 KB |
| React state updates per heartbeat | 0 in the tracker unless a visible UI needs them |
| Analytics polling on public routes | 0 |

The bundle-size and request figures are engineering budgets to verify, not current measured results. If the tracker cannot fit the budget, reduce its functionality or defer a feature instead of weakening the public page.

### 3.5 Failure isolation

- Tracker import failure: silently disable tracking for that page.
- Tracking API unavailable: keep page rendering and navigation unaffected.
- MongoDB unavailable: return a bounded non-2xx response; never throw into a page render.
- Heartbeat timeout: keep last successful visit state; do not loop retries aggressively.
- Browser storage disabled: skip persistent tab-session grouping and use a best-effort visit record, or skip tracking according to the approved privacy mode.
- A blocker, offline browser or rejected request is an accepted loss of analytics data. Never use a blocking retry.

### 3.6 Performance verification gate

Record a baseline before implementation and compare after each tracking phase:

- Lighthouse mobile and desktop on homepage, project detail, Labs collection and Lab detail.
- Core Web Vitals where available: LCP, INP and CLS.
- Initial JavaScript transfer and route-specific JS chunks.
- Main-thread long tasks during hydration and intro animation.
- Number and timing of public-route network requests.
- MongoDB reads/writes generated by a single visit.

Acceptance: no tracker request is on the critical rendering path, no public page waits for analytics, no new LCP/CLS regression is attributable to the tracker, and tracker code is outside the dashboard/chart bundle. Any material regression blocks rollout until fixed.

## 4. IP, location and privacy model

### 4.1 Server-side location resolution

Do not ask the browser to discover its IP or call a public IP lookup service.

The tracking Route Handler may read trusted Vercel request metadata:

- `x-vercel-ip-country`: country code.
- `x-vercel-ip-country-region`: first-level region code.
- `x-vercel-ip-city`: approximate city.
- `x-forwarded-for`: public client IP as documented by Vercel; use only transiently when a security/rate-limit need requires it.

Vercel documents these request headers and their meanings in its [Request Headers reference](https://vercel.com/docs/headers/request-headers).

Rules:

- Read location headers on the server only.
- Store country/region codes and a sanitized, decoded city name only.
- Do not store latitude, longitude, postal code or raw IP.
- If Vercel does not provide location metadata, store `unknown`; do not make another network request to guess it.
- Never treat IP-derived city as a precise physical location. VPNs, carrier NAT, corporate gateways and routing can make it incorrect.
- Do not expose IP headers or raw request headers to the browser or owner dashboard.

If transient IP processing is used for abuse prevention, do not log it. A keyed, short-lived HMAC may be used only if a specific abuse-control need is demonstrated; use a server-only secret and rotation/expiry policy. Do not create a permanent IP fingerprint.

### 4.2 Visitor/session identity

- Generate a random opaque tab-session ID with a browser cryptographic UUID API.
- Keep it in `sessionStorage` so it is scoped to the tab session and survives same-tab route changes/reloads.
- Send it only to the first-party tracking endpoint.
- Hash it server-side with HMAC using a server-only secret before persistence.
- Never store the raw tab-session ID in MongoDB.
- Do not combine the ID with account IDs, email addresses, IP addresses or browser fingerprint attributes.
- Do not call it a unique person. Multiple tabs/devices can produce separate sessions.

If `sessionStorage` is unavailable, use a one-visit fallback or skip tracking; do not fall back to a long-lived fingerprint.

### 4.3 Device classification

Classify the request into a small enum:

- `desktop`
- `mobile`
- `tablet`
- `unknown`

Use request metadata/user-agent parsing in memory only. Persist the classification, not the raw user-agent string or a detailed browser fingerprint. Do not add a new parser library unless the repository audit demonstrates it is needed.

### 4.4 Referrer and campaign attribution

- Store only the referrer hostname, never the full referrer URL or path.
- Classify traffic as `direct`, `referral`, `campaign` or `internal`.
- Allowlist only `utm_source`, `utm_medium` and `utm_campaign`.
- Trim, normalize and length-limit values. Reject control characters and suspicious payloads.
- Do not persist arbitrary query parameters. They may contain email addresses, tokens or other private values.
- Capture external landing attribution on the first page view in a tab session; subsequent portfolio route changes are `internal` navigation.
- Do not store the portfolio's own host as an external referrer.

### 4.5 Privacy release gate

Before enabling tracking in production:

- Update `/privacy` with page analytics, approximate IP-derived location, session identifier, device category, referrer/campaign fields, visible-duration estimation, MongoDB storage, access controls, retention and deletion behavior.
- Review whether consent or another legal basis/notice is required for the audiences and jurisdictions served. Do not assume first-party analytics is automatically exempt.
- Provide a clear first-party analytics opt-out/disabled state if required by the approved privacy decision.
- Confirm any Do Not Track / Global Privacy Control behavior as part of the privacy decision; do not treat a browser signal as a substitute for legal review.
- Update `PRIVACY_VERSION` when the published notice changes materially.
- Document provider/backups retention separately; deleting an application record does not prove that every provider backup has been erased immediately.

This is an engineering/privacy implementation plan, not a legal compliance certification.

## 5. Data model — MongoDB

### 5.1 Primary collection: `portfolio_visits`

One document represents one page view within a browser tab session. It is created once and updated by heartbeat/pause/end mutations. Heartbeats must not create new documents.

Proposed fields:

| Field | Type | Purpose |
|---|---|---|
| `visitId` | String/ObjectId | Random, unique server-issued visit reference |
| `sessionHash` | String | Server HMAC of temporary tab-session ID |
| `pageType` | Enum | `home`, `project`, `labs_index`, `lab_detail` |
| `path` | String | Canonical allowlisted route path only |
| `slug` | String/null | Project or Lab slug when applicable |
| `sourceType` | Enum | `direct`, `referral`, `campaign`, `internal` |
| `referrerHost` | String/null | Sanitized external hostname |
| `utmSource` | String/null | Allowlisted campaign source |
| `utmMedium` | String/null | Allowlisted campaign medium |
| `utmCampaign` | String/null | Allowlisted campaign name |
| `countryCode` | String/null | Approximate country |
| `regionCode` | String/null | Approximate first-level region |
| `city` | String/null | Sanitized approximate city |
| `deviceType` | Enum | Desktop/mobile/tablet/unknown |
| `startedAt` | Date | Server timestamp when visit is created |
| `lastHeartbeatAt` | Date | Last accepted active/visible heartbeat |
| `activeSeconds` | Number | Server-calculated estimated visible duration |
| `status` | Enum | `active`, `paused`, `ended`, `expired` |
| `endedAt` | Date/null | Server timestamp when visit is paused/ended |
| `expiresAt` | Date | Start timestamp plus 65-day retention window |
| `schemaVersion` | Number | Future-safe schema evolution |

Do not add raw IP, full URL, full query string, raw user-agent, email, name, password, account ID, clipboard data, exact geolocation or arbitrary client-submitted metadata.

### 5.2 Indexes

Create only indexes that support actual dashboard and lifecycle queries:

- Unique index on `visitId`.
- Descending index on `startedAt`.
- Compound index on `pageType + startedAt`.
- Compound index on `slug + startedAt` for project/Lab breakdown.
- Index on `sessionHash + startedAt` only if session journey queries need it.
- TTL index on `expiresAt` with `expireAfterSeconds: 0`.

Do not add an index for every filter. Measure query plans and index write cost before adding more.

### 5.3 Retention

- Set `expiresAt = startedAt + 65 days` at record creation.
- Do not extend retention on every heartbeat.
- The owner dashboard offers 7, 30 and 60-day reporting windows.
- Keep 65 days of raw visit records so at least two months remain available.
- TTL is a background cleanup mechanism, not exact-time deletion. Expired records may remain briefly after the expiry timestamp while MongoDB's TTL monitor processes them. See [MongoDB TTL indexes](https://www.mongodb.com/docs/manual/core/index-ttl/).
- Do not add a second cron job that scans and deletes the same records unless TTL monitoring is shown to be insufficient.
- Manual deletion must work independently of TTL.

For this first version, use raw visit documents plus indexed aggregation. Do not add daily rollup collections prematurely. If traffic volume or query latency exceeds the Phase 3 thresholds, introduce rollups as a separately reviewed optimisation with deletion/reconciliation behavior specified.

## 6. Visit lifecycle and duration calculation

### 6.1 Start

When a supported public route is active and the tracker has loaded:

1. Resolve the allowlisted page type/path/slug.
2. Get or create the tab-session ID in `sessionStorage`.
3. Send one small, non-blocking start request.
4. The server validates the route and metadata, resolves trusted location/device data, hashes the session ID, and writes one visit record.
5. The server returns the visit ID and current lifecycle state.
6. The client retains the visit ID in memory for that route.

Use an idempotency key/unique route-visit token so React Strict Mode, hydration retries or duplicate start requests do not create duplicate page views. The server must enforce idempotency with a unique index or equivalent atomic insert contract.

### 6.2 Heartbeat

- Send one heartbeat every 15 seconds only while `document.visibilityState === "visible"`.
- Heartbeat updates the existing visit document only.
- The server uses its own clock to compute the accepted time delta.
- Cap any single accepted delta (target maximum 20 seconds) and enforce a minimum heartbeat interval/rate limit (target 10 seconds) to limit replay/spam.
- Reject or ignore heartbeats for missing, ended, expired or unknown visit IDs.
- Do not accept client-provided `activeSeconds`, `startedAt`, `lastHeartbeatAt` or `endedAt`.

### 6.3 Pause and resume

- On `visibilitychange` to hidden, send a small pause/end-of-active-segment message and stop the heartbeat timer.
- On visibility returning to visible, resume the same visit by updating the server-side heartbeat baseline. Do not count hidden time.
- On route change, close/pause the previous page visit and start a new visit for the next allowlisted path.
- Use `navigator.sendBeacon()` for the final small payload when appropriate, with a same-origin `fetch({ keepalive: true })` fallback where needed.
- Use `visibilitychange` as the primary lifecycle signal. Do not rely on `unload` or `beforeunload` for correctness; MDN documents their reliability and back/forward-cache limitations. See [sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) and [visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event).

### 6.4 Duration definition

Call the metric **Estimated visible time**.

- Duration accumulates from server-accepted visible heartbeat intervals only.
- Do not count time while the document is hidden.
- The final interval is capped so a missing heartbeat does not turn an unattended/closed tab into hours of engagement.
- A lost final beacon may undercount slightly; this is preferable to inventing time.
- A page with no accepted heartbeat can still have a valid page view with zero/unknown visible time.
- Display the metric as an estimate, not proof of human attention.

## 7. HTTP API contract

All endpoints use same-origin requests, bounded JSON payloads, no-store response headers for private analytics data, and common safe error shapes. Validate `Content-Type`, body size, schema, origin and rate limits.

### 7.1 Public ingestion

**POST `/api/v1/portfolio/visits`**

One endpoint with an explicit action enum:

- `start`
- `heartbeat`
- `pause`
- `end`

The request accepts only fields required for that action. Reject unknown keys. Never accept arbitrary IP, city, country, duration, timestamps, path type or database fields from the client.

`start` receives a supported route path, temporary tab-session ID, idempotency token and allowlisted campaign fields. The server determines authoritative page type and canonical path from the allowlist.

`heartbeat`, `pause` and `end` receive only the visit ID and minimal action metadata. The server resolves the corresponding record and calculates timestamps/duration.

The public endpoint is intentionally unauthenticated, so it requires rate limiting, request-size caps, strict validation, idempotency, same-origin/origin checks and generic errors. It must not reveal whether a visit ID belongs to another session.

### 7.2 Owner analytics

**GET `/api/v1/admin/portfolio/analytics?days=7|30|60`**

Returns a compact summary:

- page views
- distinct tab sessions (not unique people)
- estimated visible time and average
- daily trend
- page-type and slug ranking
- country/region/city breakdown
- device breakdown
- referrer/campaign breakdown
- generation timestamp and selected range

**GET `/api/v1/admin/portfolio/analytics/visits`**

Returns a cursor-paginated recent-visit list. Default page size 25, hard maximum 50. Supports a validated date range and safe filters. Never return all 65 days of raw records in one response.

Every owner endpoint calls the existing server-side auth/session and owner-access guard. The dashboard is private and has no public cache.

### 7.3 Deletion

**DELETE `/api/v1/admin/portfolio/analytics/visits`**

Supported explicit deletion scopes:

- Selected visit IDs, capped per request.
- A validated start/end date range.
- All portfolio analytics visit records.

For bulk deletion, require a confirmation token/phrase generated by the UI and validate the scope on the server. Never accept a collection name or raw Mongo query from the client.

Record minimal administrative audit metadata (owner ID, action, selected scope, timestamp and deleted count) separately from visitor records if the existing audit policy requires it. Do not preserve visitor identity in the deletion audit.

After deletion, return the deleted count and new generation timestamp; the dashboard then refetches all summary data. If a future aggregate/rollup collection is added, its delete/rebuild semantics must be designed before shipping that collection.

## 8. Analytics aggregation and query performance

### 8.1 First release strategy

- Query only the selected time window (maximum 60 days).
- Start MongoDB aggregation with an indexed `$match` on `startedAt`.
- Use `$group` and `$project` to return only summary fields.
- Use separate bounded pipelines for summary and recent rows if a single `$facet` becomes harder to maintain or tune.
- Use `$sort + _id cursor + $limit` for recent visit pagination; never use deep unbounded `skip`.
- Use `$count`/distinct session aggregation only over the selected range.
- Do not return session hashes or raw visit IDs in aggregate chart payloads.
- Keep timezone handling explicit: store UTC timestamps and group daily totals in UTC initially. Display local time in Asia/Kolkata on the dashboard, and label the chart timezone.
- Validate numeric data and cap response sizes.

### 8.2 Polling and refresh

Follow the proven lifecycle pattern in `LabsLiveAnalyticsDashboard.js`, but keep this implementation in the Portfolio Analytics domain:

| Setting | Rule |
|---|---|
| Initial data | Server-render a bounded owner-only summary on the dashboard route |
| Summary polling | Every 10 seconds while the dashboard tab is visible |
| Recent visits | Refresh every 30 seconds, with cursor pagination |
| Visibility | Stop timers and abort in-flight requests when hidden |
| Focus return | Schedule one immediate refresh, not duplicate overlapping calls |
| In-flight requests | One per data resource; no overlap |
| Success | Reset backoff and update last-successful timestamp |
| Failure | Keep last good data and show a restrained stale/error state |
| Backoff | 20s, 40s, then maximum 60s after repeated failures |
| Manual refresh | Available; disabled while the same request is running |
| Cache | Private/no-store response; do not leak owner data through shared caches |

Use `AbortController`, a single timer per resource, visibility detection and exponential backoff. Polling must be disabled when the analytics page is unmounted or hidden. Do not keep a socket alive for this low-volume first release; reassess SSE/WebSockets only if measured latency or throughput requires them.

### 8.3 Query/load guardrails

- Maximum dashboard date range: 60 days.
- Maximum recent rows per page: 50.
- Request date bounds and filter enums are validated on the server.
- Add query execution timing to server logs without logging visit/session identifiers.
- Inspect `explain("executionStats")` for date range, page-type and slug queries on realistic fixture data.
- If query latency or database work exceeds agreed thresholds, first tune indexes and aggregation shape. Only then consider rollups.
- Poll the summary separately from the table so a chart refresh does not reload 50 visit rows every 10 seconds.

## 9. Dashboard information architecture

Route: `/admin/portfolio/analytics`

Reuse the existing owner access guard and ThemeToggle conventions, but keep the portfolio analytics navigation and data independent from Labs source analytics.

### Overview
- Page views.
- Tab sessions.
- Estimated visible time / average visible time.
- Countries represented in the selected range.
- Traffic-over-time chart.

### Pages
- Homepage.
- Project details ranked by page views.
- Labs collection.
- Individual Lab details.
- Page type and slug filters.

### Traffic sources
- Direct.
- Internal navigation.
- External referrer host.
- Campaign source/medium/name.

### Locations
- Country.
- Region.
- City.
- Label approximate IP-derived location and provide an unknown/unavailable group.

### Devices
- Desktop.
- Mobile.
- Tablet.
- Unknown.

### Recent visits
A compact, cursor-paginated table/list with:
- visit time
- page/project name and path
- approximate location
- device category
- source/referrer host
- estimated visible time

Do not display raw session hashes, IP addresses, user-agent strings or internal database IDs.

### Controls
- Date filters: 7 days, 30 days, 60 days.
- Manual refresh and last-updated timestamp.
- Filters for page type, slug, country and device.
- Selected-visit delete.
- Delete selected date range.
- Delete all data.
- Owner-only preference to exclude this browser from analytics, if included in the approved privacy behavior.

## 10. Visual and Motion standards

Follow the existing portfolio design system; do not create a new dashboard palette.

- Existing semantic light/dark theme tokens.
- Manrope for UI text, Newsreader only for appropriate display headings, Azeret Mono for compact technical metadata.
- Restrained 8/12/16 px geometry; no oversized pill controls.
- Subtle borders and existing elevation tokens; no generic glass panels or rainbow gradients.
- KPI values may reuse the existing MotionNumber component.
- Chart transitions are short and data-faithful; do not replay the entire chart on every poll.
- New recent rows may fade/translate 4–6 px once.
- Refresh icon rotates only while a request is active.
- Status indicators use text plus semantic status; no flashing live dots.
- Destructive actions use a deliberate confirmation dialog and clear completion/error message.
- Respect reduced motion. Static values and chart summaries must remain readable without animation.
- On mobile, KPI cards collapse to a readable grid and recent visits become stacked rows or a carefully designed compact table with no horizontal page overflow.
- Maintain visible focus, keyboard operation and 44 px minimum interactive targets.

## 11. Phase-by-phase implementation

Every phase ends with tests and a review gate. Do not skip ahead if a phase changes the data contract.

### Phase 0 — Repository audit, privacy decision and baseline

**Tasks**
1. Re-check current route shells, `AppProviders`, `usePathname`, auth/session utilities, owner guard, Mongoose connection/model conventions and deployment environment.
2. Confirm the production hostname and how preview deployments will be excluded.
3. Confirm the privacy/consent/opt-out behavior before collecting visitor data.
4. Record before-change Lighthouse/Web Vitals, bundle-size and request-count baselines for the four public route types.
5. Confirm whether an existing request-rate-limit utility can be reused.
6. Confirm the 65-day retention policy and 7/30/60-day dashboard filters.

**Deliverables**
- Approved route allowlist.
- Approved data minimisation/privacy decision.
- Baseline performance report.
- Final API and schema contract.

**Exit criteria**
No code is added until the owner approves the privacy behavior, data fields and performance budget.

### Phase 1 — MongoDB model, validation and server domain services

**Tasks**
1. Add `PortfolioVisit` Mongoose model in the repository's existing domain conventions.
2. Add JSDoc schemas/validators for start, heartbeat, pause, end, date-range and deletion requests.
3. Add server-only route normalisation, slug allowlist, location sanitisation, device classification and referrer/UTM normalisation.
4. Add HMAC session hashing with a server-only secret; do not retain raw session IDs.
5. Add idempotent visit creation and atomic/rate-limited heartbeat update logic.
6. Add minimal query helpers and indexes, including TTL on `expiresAt`.
7. Add a feature flag so ingestion can remain disabled until the release gate passes.

**Tests**
- Schema/enum and body-size validation.
- Unsupported/private route rejected.
- Sanitization of malformed city/referrer/UTM values.
- Raw IP and raw session ID never appear in persisted document.
- Duplicate start is idempotent.
- Heartbeat cannot create another record or accept client duration.
- Hidden/pause/end state transitions and rate limits.
- TTL index definition and index creation.

**Exit criteria**
Model and server helpers are tested independently; public pages are not yet instrumented.

### Phase 2 — Public ingestion API and visit lifecycle

**Tasks**
1. Implement `POST /api/v1/portfolio/visits` with start/heartbeat/pause/end actions.
2. Add strict same-origin/origin checks, rate limits, payload caps, enum validation and generic error responses.
3. Resolve IP-derived location on the server from trusted Vercel headers only.
4. Persist only coarse location fields and device category.
5. Implement server-computed active duration with capped heartbeat deltas.
6. Make start idempotent and heartbeat updates atomic/monotonic.
7. Add request/operation logging that excludes visitor identifiers and raw headers.

**Tests**
- Start, duplicate start, heartbeat, pause, resume and end.
- Invalid visit IDs cannot read or mutate other visitors' records.
- Cross-origin, oversized and malformed bodies are rejected.
- Rate limit blocks heartbeat floods.
- Database outage returns bounded failure and does not affect page rendering.
- No raw IP is stored or logged.

**Exit criteria**
API passes tests with feature flag off/on; no public route changes yet.

### Phase 3 — Deferred tracker and public route instrumentation

**Tasks**
1. Build a tiny `PortfolioVisitTracker` Client Component using `usePathname` or the existing route-shell boundaries.
2. Mount it only in HomePage, ProjectPageView and the shared public Labs shell; avoid unconditional global AppProviders instrumentation.
3. Lazy-load the tracker after hydration/idle; no head script, synchronous work or third-party dependency.
4. Use tab-scoped `sessionStorage` ID and server HMAC.
5. Start one visit per route; heartbeat every 15 seconds only while visible.
6. Pause on `visibilitychange`; resume when visible; use `sendBeacon`/keepalive for final lifecycle update.
7. On SPA route change, end the previous visit and start the new allowlisted route without blocking navigation.
8. Skip admin/auth/private routes, preview hosts, opted-out browser state and unsupported pages.
9. Make the tracker fail silently and avoid React rerender per heartbeat.

**Tests**
- Each of the four route types records exactly one page view.
- Strict Mode/hydration/repeated effect does not duplicate a visit.
- SPA route changes close/start the correct visit.
- Hidden tabs stop heartbeat; visible tabs resume.
- 404, admin, auth, static and API routes are not tracked.
- Tracker blocked/offline/storage disabled does not break page behavior.
- No tracker request blocks page navigation or route rendering.

**Exit criteria**
Public route behavior is unchanged and performance budget is met before enabling production tracking.

### Phase 4 — Analytics aggregations and retention verification

**Tasks**
1. Build server-only aggregation services for the 7/30/60-day windows.
2. Aggregate page views, distinct tab sessions, visible time, daily trend, page rankings, country/city, device and source breakdowns.
3. Keep every aggregation bounded with an indexed date match.
4. Build cursor-paginated recent visits (25 default, 50 hard cap).
5. Verify date/timezone rules and chart response shape.
6. Provision and verify MongoDB indexes, including TTL.
7. Test TTL expiry on a dedicated fixture/temporary collection and document deletion delay.

**Tests**
- Aggregation against deterministic fixture data.
- Date boundaries, UTC daily grouping and local display formatting.
- Page views versus sessions are counted correctly.
- Unknown city/device/source is represented safely.
- Cursor pagination has no duplicate or skipped rows.
- TTL expires based on original `startedAt + 65 days`, not heartbeat.
- Query plans use intended indexes and response sizes are bounded.

**Exit criteria**
Analytics data is numerically correct and query latency is acceptable with a realistic 65-day fixture.

### Phase 5 — Owner-only Portfolio Analytics dashboard

**Tasks**
1. Add `/admin/portfolio/analytics` with server-side owner verification before any private data query.
2. Reuse ThemeToggle, theme tokens, MotionNumber and proven chart conventions without importing Labs data/business logic.
3. Server-render the initial bounded summary only on this admin route.
4. Add Overview, Pages, Traffic Sources, Locations, Devices and Recent Visits sections.
5. Add 7/30/60-day filters and clear empty/error/loading states.
6. Add cursor pagination to recent visits.
7. Make dashboard and visit APIs private/no-store; prevent caching across users.

**Tests**
- Unauthenticated, unverified, wrong-owner and not-configured paths.
- Owner-only API authorization (not just hidden navigation).
- All totals and breakdowns match fixtures.
- Empty data, no location data and partial database failure.
- Mobile/tablet/desktop layout, keyboard and screen reader labels.
- No dashboard/chart code enters public page chunks.

**Exit criteria**
Only the configured owner can read analytics; public routes remain unaffected.

### Phase 6 — Polling, Motion, refresh and failure recovery

**Tasks**
1. Reuse the Labs dashboard polling pattern: one in-flight request, AbortController, visibility-aware scheduling, backoff and manual refresh.
2. Poll summary every 10 seconds while visible.
3. Refresh recent visits every 30 seconds or when explicitly requested.
4. Abort requests and clear timers when the page becomes hidden/unmounted.
5. Preserve last successful dashboard data on failure and show a restrained stale/error state.
6. Animate only changed KPI values and newly inserted rows; do not replay complete charts on every poll.
7. Keep polling and chart libraries entirely inside the admin dashboard route.

**Tests**
- No overlapping requests.
- Hidden tab stops polling.
- Focus return schedules one refresh.
- Aborted request is not displayed as a failure.
- Backoff reaches but does not exceed 60 seconds.
- Manual refresh does not create duplicate requests.
- Polling failure preserves last known good data.
- Reduced-motion mode and mobile touch controls work.

**Exit criteria**
Stable refresh under slow network, tab switching, repeated errors and rapid filter changes.

### Phase 7 — Owner deletion and privacy controls

**Tasks**
1. Add selected-visit deletion with bounded IDs.
2. Add date-range deletion with server-side range validation.
3. Add full visit-data deletion with explicit typed confirmation.
4. Require owner authorization and origin/CSRF protections for every delete.
5. Recompute/refetch dashboard summary after deletion.
6. Add owner-browser opt-out if included in the approved privacy decision.
7. Update `/privacy` and increment `PRIVACY_VERSION`.
8. Verify TTL retention, manual deletion and application/provider backup wording.

**Tests**
- Selected IDs can be deleted only within allowed limits.
- Date filters cannot delete outside the confirmed scope.
- Full delete requires confirmation and owner auth.
- Non-owner cannot delete even by direct API call.
- Deleted visits disappear from all dashboard aggregates.
- Privacy page accurately matches actual data fields and retention.
- Opt-out stops new visits and heartbeats.

**Exit criteria**
Owner can reliably remove data and the privacy notice describes the real implementation.

### Phase 8 — Performance, security, production rollout and monitoring

**Tasks**
1. Run full production build, lint and all relevant test suites.
2. Compare Lighthouse/Web Vitals and JS/network budgets against Phase 0.
3. Test real browser route changes, mobile tab background/resume, beacon behavior and BFCache navigation.
4. Test Vercel production headers and location values; verify missing headers degrade to unknown.
5. Verify MongoDB indexes and TTL on the actual target database.
6. Verify production domain allowlist and preview-host exclusion.
7. Enable the feature flag in a controlled release only after privacy and owner-access gates pass.
8. Monitor API error rate, MongoDB write latency, aggregation latency, heartbeat volume and dropped/duplicate start rates.
9. Provide a rollback switch that disables ingestion without breaking public routes or dashboard access to already-collected data.

**Release criteria**
- No public page rendering dependency on analytics.
- No material public Web Vitals or route-bundle regression.
- No raw IP/session ID persistence.
- Owner authorization and deletion verified against real database.
- Retention index verified.
- Production hostname only; preview/test traffic excluded.
- Privacy notice and opt-out/consent decision complete.
- Build and browser regression checks pass.

## 12. Performance monitoring thresholds

These are proposed release targets. They must be measured and may be tightened after the Phase 0 baseline.

| Signal | Target / guardrail |
|---|---|
| Public route DB reads for tracking | 0 |
| Render-blocking analytics resources | 0 |
| External analytics/geolocation requests | 0 |
| Tracker gzip size | ≤ 4 KB target |
| Public tracker start | After hydration/idle, never awaited |
| Heartbeat rate | 15 seconds while visible only |
| Public route render wait caused by tracker | 0 ms (no dependency) |
| Summary polling | 10 seconds only on visible admin dashboard |
| Recent visits polling | 30 seconds, paginated |
| Maximum report period | 60 days |
| Recent visit page size | 25 default / 50 maximum |
| Aggregation | Indexed range-first pipelines |
| Retention | 65 days from visit start |
| Error behavior | Fail open for public site; fail closed for owner data access |

If the 4 KB target cannot be met without making implementation brittle, the tracker may exceed it only after measured bundle review and approval. A performance budget is a guardrail, not justification for an unsafe or unmaintainable implementation.

## 13. Security and abuse prevention checklist

- Same-origin and request-origin validation for mutations.
- Strict schema and unknown-field rejection.
- Small request-body limit.
- Route type/path/slug allowlist.
- Server-issued visit ID and idempotent start token.
- Rate limit start/heartbeat/end; cap heartbeat increments.
- Do not allow the client to choose location, device, timestamp, duration, owner ID or Mongo filters.
- Do not reveal whether another visitor's visit ID exists.
- HMAC session hashing and secret rotation plan.
- No raw IP, session ID, referrer URL or raw user-agent in persisted data or logs.
- Server-side owner verification on every read/delete endpoint.
- Private/no-store cache headers on owner endpoints.
- Deletion request Origin/CSRF protection and server-validated scope.
- Feature flag and kill switch for ingestion.

## 14. Future extension boundary

The first version is deliberately narrow. Future fields/features may include:

- Portfolio section engagement (About, Skills, Experience, Contact).
- CTA interaction counts.
- Project outbound-link clicks.
- Download/resume events.
- Search/filter usage in Labs.
- Session journey/funnel reports.
- Aggregate campaign comparisons.

Do not collect these in Phase 1. Each future event needs a defined purpose, privacy field review, data contract, retention decision and performance impact assessment. Do not add scroll heatmaps, keystroke capture, form-content capture, fingerprinting or individual visitor surveillance.

## 15. Definition of done

Portfolio Analytics is complete only when:

- All four public page types are tracked with no duplicate visit creation.
- Active time is server-calculated and hidden time is excluded.
- Approximate location is derived server-side and raw IP is not stored.
- Sessions are labelled honestly and are not represented as unique people.
- 65-day retention is enforced through a verified TTL index.
- Owner dashboard supports 7/30/60-day ranges, accurate aggregation and paginated visits.
- Dashboard polling is visibility-aware, abortable and failure-tolerant.
- Selected/date-range/all deletion works through owner-authorized server APIs.
- Privacy notice and consent/opt-out behavior match the real system.
- Public route performance budgets pass against the recorded baseline.
- Build, tests, lint, security tests and browser QA pass.
- A production deployment confirms trusted Vercel headers and MongoDB behavior.

## 16. Official technical references

- [Vercel Request Headers](https://vercel.com/docs/headers/request-headers) — documented forwarded IP and IP-derived geolocation headers.
- [Next.js Lazy Loading](https://nextjs.org/docs/app/guides/lazy-loading) — lazy loading Client Components and libraries.
- [MDN Navigator.sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon) — small analytics payload delivery during page lifecycle.
- [MDN visibilitychange](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event) — visibility lifecycle and hidden-state handling.
- [MongoDB TTL Indexes](https://www.mongodb.com/docs/manual/core/index-ttl/) — background TTL deletion behavior and delayed expiry.


### Phase 1 security refinement

Lifecycle mutations include the temporary tab-session identifier. The server HMACs it and matches both `visitId` and `sessionHash`, so a visit ID alone cannot be used to heartbeat, pause, resume or end another tab's visit. Raw tab-session identifiers are never persisted.

The production-host check uses the hostname from the runtime request URL rather than preferring forwarded-host headers. Resume resets the heartbeat baseline even when the pause beacon was lost, preventing the next heartbeat from counting hidden-tab time.


---

## Phase 2 implementation record — ingestion API and private owner page

**Status:** Implemented in source; ingestion remains disabled by the default feature flag.

Added:
- `POST /api/v1/portfolio/visits` with `start`, `heartbeat`, `pause`, `resume` and `end`.
- Exact same-origin validation and canonical production-host gating.
- A streamed 1 KB JSON request limit; unsupported content types, malformed bodies and unknown fields are rejected.
- Session-scoped and per-action trusted-IP rate buckets. Rate-limit keys are HMACs; raw proxy addresses are never persisted. The separate rate-limit collection has a 15-minute TTL index.
- Generic bounded errors, private/no-store response headers, Retry-After on rate limits and no visit-ID existence disclosure for lifecycle mutations.
- An owner-only page at `/admin/portfolio/analytics`. It checks the existing verified Labs owner identity on the server and returns not-found to unauthenticated/non-owner requests. The page is excluded from search indexing.
- A Portfolio Analytics link in the existing owner navigation only. The public navbar and public routes do not expose this destination.

Verification:
- Phase 2 ingestion tests: 7 passed.
- Phase 1 foundation tests: 13 passed.
- Targeted ESLint: passed.
- Full production build, existing Labs suites and SEO validation: passed.
- Vercel check for commit `60f41372285f2b57c54eefc3ec38946e72b1c286`: success.

The public tracker is still not installed. No public page is querying MongoDB or sending analytics requests. `PORTFOLIO_ANALYTICS_ENABLED` remains false by default.

**Operational gate:** run `npm run db:ensure-portfolio-analytics-indexes` against the intended MongoDB database before enabling the public tracker. This provisions both the visit-retention TTL index and the short-lived rate-limit TTL index. 


---

## Phase 3 implementation record — deferred public page tracker

**Status:** Implemented in source; not enabled by default.

The tracker is mounted only from these existing client shells:
- Homepage: `HomePage`
- Project detail: `ProjectPageView`
- Labs collection and Lab detail: shared `LabsPageShell`

It is not mounted in the root layout, `AppProviders`, navbar, admin pages or authentication routes.

Implementation:
- `PortfolioAnalyticsDeferred` waits for hydration and a browser idle opportunity (`requestIdleCallback`, timeout 2.2 seconds; fallback delay 900 ms) before importing the separate tracker chunk.
- The module import is cached after first load, so subsequent SPA navigation does not wait through another idle period.
- A tab-scoped random UUID is kept in `sessionStorage`; when storage is blocked, tracking is skipped instead of using a fingerprint.
- Every eligible page visit has a fresh idempotency UUID. The server HMACs the tab-session and idempotency data before persistence.
- Only `/`, `/projects/[slug]`, `/labs` and `/labs/[slug]` are accepted.
- First landing attribution retains only external referrer hostname and the allowlisted UTM source/medium/campaign values. Later same-tab routes are marked internal; arbitrary query parameters and full referrer URLs are omitted.
- Heartbeats run every 15 seconds while visible. Hidden tabs pause; visible tabs resume. BFCache pagehide/pageshow is handled separately from a true page exit.
- The module-level lease/grace period handles React Strict Mode effect replay and overlapping public shell transitions. Pending starts are ended if their visit ID arrives after the user has already navigated away.
- Heartbeat requests do not overlap; public tracking failures remain silent and do not block rendering or navigation.

The client build-time flag `NEXT_PUBLIC_PORTFOLIO_ANALYTICS_ENABLED` is separate from the server flag `PORTFOLIO_ANALYTICS_ENABLED`. Both remain false by default. Client code never receives `PORTFOLIO_ANALYTICS_HMAC_SECRET`. The browser also checks the canonical hostname; the server independently checks its production host and secret.

No route layout, server render function, database query, root provider or public navigation waits for analytics. The tracker code is separately imported after idle. The 4 KB gzip goal and actual Web Vitals impact are not claimed as measured; Phase 8 must measure them on the four public routes.

Tests cover route allowlisting, private-route exclusion, UTM filtering, referrer hostname minimisation, same-tab attribution, deferred import and exact shell mount scope.

**Activation remains blocked** until the MongoDB TTL indexes are provisioned, privacy notice/consent behavior is approved and both feature flags are intentionally set only in the canonical Production environment.
