# Analytics Engineering — Portfolio Visits vs Labs Engagement

**Status:** Both analytics domains have code in the audited branch. They are independent systems with different event semantics, storage, privacy and dashboards.

## 1. Two different products

| Dimension | Portfolio Analytics | Labs Engagement Analytics |
|---|---|---|
| Purpose | Understand public website traffic and page visits | Understand interaction with published Labs experiments and protected source |
| Dashboard | /admin/portfolio/analytics | /admin/labs/analytics and /admin/labs/analytics/[slug] |
| Main collection | portfolio_visits | lab_analytics_events plus lab_likes/lab_guest_likes |
| Actor model | Browser tab/session visit | Guest or verified user action |
| Main lifecycle | start, heartbeat, pause, resume, end | event record plus current active like state |
| Tracked meaning | page visit/session with approximate metadata and visible time | source opens, copy actions, likes/unlikes as instrumented |
| Identity | HMAC'd visit/session keys, no person identity claim | verified account ID for verified events; hashed guest key only for current guest-like state |
| Public tracking routes | Homepage, project details, Labs collection, Lab detail | Public Labs source/engagement actions |
| Must not be mixed | Never merge with source opens, copies, likes or audit events | Never relabel as general portfolio visits |

A page view is not a unique person. An accepted source_open is not proof that the source was read or understood. A code_copy event is not proof code was pasted, run or shipped. A like is an active state transition and not an endorsement of project quality.

## 2. Portfolio Analytics — route and tracking lifecycle

### Public route allowlist

The current tracker is integrated from:
- src/app/components/HomePage.js
- src/app/projects/[slug]/ProjectPageView.js
- src/app/components/labs/LabsPageShell.js

The accepted page types are:
- home: /
- project: /projects/[slug]
- labs_index: /labs
- lab_detail: /labs/[slug]

Do not record admin/auth/API/static asset/404/privacy/terms/unrelated routes. The deferred tracker is not an eager app-wide analytics provider. PortfolioAnalyticsDeferred mounts a separate small tracker client on the approved public shells.

### Lifecycle

POST /api/v1/portfolio/visits accepts an action:
- start
- heartbeat
- pause
- resume
- end

Start creates a visit after validating a strict route payload and allowed host. The start key and tab session key are HMAC'd using a server secret. A unique start key prevents duplicate visit starts. Subsequent lifecycle actions must match the visit/session identity and accepted timing window. Mismatches are deliberately returned as not accepted rather than exposing whether a supplied visit ID belongs to someone else.

Client lifecycle behavior:
- session-scoped tab identity in sessionStorage;
- active visibility state;
- periodic heartbeat (15-second client cadence);
- pause when page/tab is no longer visible;
- resume when it becomes active;
- end on lifecycle exit using a sendBeacon-compatible path where available;
- only active, visible time contributes to activeSeconds.

The server clamps accepted elapsed time per heartbeat (minimum and maximum intervals) to prevent a client from inflating visit time. Heartbeat time is an estimate of visible page presence, not proof of attention.

### Privacy and anti-abuse controls

- No raw IP persisted.
- No full user-agent persisted.
- No device fingerprint.
- No precise GPS.
- No full referrer URL.
- No arbitrary query string.
- Referrer is reduced to host and only approved UTM fields are stored.
- Country/region/city are approximate provider/deployment metadata where available.
- Device category is a low-cardinality classification.
- session/start identifiers are HMACs and hidden from normal model projection.
- endpoint validates host and payload shape.
- endpoint applies per-action request rate limit.
- previews/noncanonical hosts are suppressed unless explicit local development configuration permits.
- tracking is feature-gated.

### Required configuration

The config module requires:
- PORTFOLIO_ANALYTICS_ENABLED=true;
- a sufficiently strong PORTFOLIO_ANALYTICS_HMAC_SECRET (minimum 32 bytes);
- canonical public site origin configured with NEXT_PUBLIC_SITE_URL;
- deployment host matching canonical production rules.

The tracker must fail closed and not break the public page when config is missing or invalid. Exact environment names and current defaults remain in src/app/lib/portfolio-analytics/config.mjs and .env.example.

### PortfolioVisit persisted data

See architecture/DATA-MODEL-CATALOG.md. Summary:
- UUID visitId;
- HMAC startKeyHash/sessionHash;
- allowlisted pageType/path/slug;
- sourceType, referrerHost, UTM values;
- approximate country/region/city;
- deviceType;
- startedAt, lastHeartbeatAt, activeSeconds;
- status active/paused/ended/expired;
- endedAt and expiresAt;
- schemaVersion.

TTL expiry is applied to expiresAt. The current retention value is 65 days.

## 3. Portfolio Analytics owner reporting

Route: /admin/portfolio/analytics.

The page:
1. reads Better Auth session;
2. checks singleton owner through isLabsOwner;
3. returns notFound for non-owner/unavailable session;
4. normalizes days to 7, 30 or 60 (default 30);
5. reads summary and recent visits server-side;
6. passes report, recent visit cursor and recoverable errors into PortfolioAnalyticsDashboard.

GET /api/v1/admin/portfolio/analytics accepts view=summary or recent, validated period, cursor and other approved filters. It returns aggregate data or a paginated recent-visit page, with private/no-store behavior. DELETE /api/v1/admin/portfolio/analytics/visits is owner-only and same-origin protected; it accepts a validated deletion scope and deletes matching visit records. Never allow client-selected arbitrary Mongo filters.

The dashboard reports sessions/visits, page types/pages, source, device and approximate location where the data supports it. The Portfolio Analytics lab_detail page-visit record is separate from Labs Engagement event instrumentation; it cannot be used to claim per-experiment detail-view/preview event coverage. Date boundaries and labels must be read from read-query/report-service code; do not substitute a different timezone or imply unique people.

The report service uses server-side Mongo aggregation. Aggregate reports should not send raw event records to the browser when aggregate buckets are enough. Recent-visit pagination uses a cursor; recent visit data is more sensitive than aggregates and stays owner-only.

## 4. Labs Engagement Analytics

Event model: LabAnalyticsEvent in lab_analytics_events. Current event types:
- source_open
- code_copy
- like
- unlike
- guest_like
- guest_unlike

Each event is attached to experimentSlug, actorCategory, optional actorUserId, optional sourceVersion/filePath and occurredAt. eventId is unique for deduplication. Only allowlisted event types and metadata should be recorded.

Current instrumentation scope:
- source_open: successful protected source open for verified users.
- code_copy: accepted source copy action for verified user.
- like/unlike and guest_like/guest_unlike: active like state transitions.
- preview start/interactions are not universal metrics for all built-in and custom runtimes unless an instrumented producer exists. Do not promise these as complete analytics metrics.

Current active likes live in separate collections:
- lab_likes: one account per experiment, active boolean.
- lab_guest_likes: hashed browser key, active and TTL.

A transition writes or updates current state and records an analytics event according to the engagement service. Guest likes are not cross-device people. On verified sign-in, active guest likes can be claimed into the account, which changes how current active counts are attributed.

### Labs Analytics pages

Landing: /admin/labs/analytics
- days selector uses 7,30,90,365;
- server loads summary before returning the page;
- client LabsLiveAnalyticsDashboard refreshes;
- summary cards use MotionNumber;
- event rankings link to experiment detail;
- chart is a single-metric Chart.js canvas selected by the user, with data table alternative;
- polling begins at 10 seconds and backs off to maximum 60 seconds on failures;
- loading/empty/error/retry feedback must be retained.

Detail: /admin/labs/analytics/[slug]
- owner-only;
- summary metrics and trend for one experiment;
- the accepted 7 November privacy contract is aggregate-only: the detail page may display aggregate totals, trends and rankings, but not names, masked emails, like timestamps tied to individual accounts, searchable active-liker rows or individual source/copy/like histories;
- **Current implementation discrepancy:** the branch still contains an active verified-liker panel that resolves account names and masked emails with timestamps and search/pagination. Remove/redesign it and keep the server DTO aggregate-only before claiming compliance;
- never expose raw user IDs or guest identities.

### Event aggregation boundaries

The Labs Analytics system must distinguish:
- current active likes (state now);
- like/unlike transitions during selected window (event history);
- source opens;
- code copy events.

A current like count should not be shown as if it were the number of likes created during the selected date period. Conversely, event totals should not be described as currently active likes.

## 5. Error, empty and time-range behavior

For either dashboard:
- Loading should not render fake zero values.
- No-data should be explicit, not an error.
- Query failure should preserve shell and show retryable state.
- Time-range controls must only send server-accepted periods.
- Polling should stop/slow when document is hidden/unmounted according to dashboard hook behavior.
- Server timestamps and chart buckets must have a documented timezone. Verify actual aggregation timezone before changing chart grouping.
- Chart must have table/text alternative and respect reduced motion.
- Polling must never be added to public homepage/project pages.

## 6. Important release checks

Portfolio Analytics:
- confirm feature flag and canonical host in target deployment;
- verify preview and localhost suppression/opt-in;
- verify no IP or full UA in stored docs;
- verify start idempotency and visible-time accounting;
- test heartbeats, pause/resume/end, unload and rate limit;
- verify summary, recent cursor and all deletion scopes;
- verify TTL retention and required indexes;
- confirm dashboard is private and not indexed.

Labs Engagement Analytics:
- verify source_open only after authorized source response;
- verify code_copy event only after successful clipboard write is accepted;
- verify event IDs deduplicate;
- verify guest cookies are HTTP-only/secure and hashed identities never appear in API response;
- verify migration after verified login;
- verify active like count vs event-window count;
- verify active verified-liker identity panel is owner-only/masked;
- verify the Chart.js table equivalent, selection and failure retry;
- verify 10-second poll/backoff does not run indefinitely in hidden tab.
