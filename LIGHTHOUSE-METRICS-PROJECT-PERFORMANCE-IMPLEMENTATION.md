# Lighthouse Metrics — Project Performance Implementation Plan

## Purpose

Implement a production-ready Lighthouse Metrics integration for the portfolio project-detail page.

The feature should automatically use:

```js
project.links.live
```

as the URL to measure and display the latest Lighthouse results for:

- Mobile
- Desktop

The feature must feel like part of the existing portfolio case-study experience, not like a generic analytics dashboard.

---

# 1. Source of Truth

## Project URL

Do not add a second manually maintained URL field if `project.links.live` already exists.

Example:

```js
const projectUrl = project?.links?.live;
```

If the project has no valid live URL, the Performance section should not render.

## API

Use the official Lighthouse Metrics API documentation as the API contract:

```text
https://lighthouse-metrics.com/docs/api
```

The implementation must use the documented:

```text
POST /v1/lighthouse/checks
```

flow and retrieve the resulting Lighthouse run data.

Supported device values used by this feature:

```text
mobile
desktop
```

Default region:

```text
asia-south1
```

---

# 2. Final User Experience

The project detail page should communicate:

> This project is not only visually presented — its deployed experience has been measured.

Recommended content hierarchy:

```text
PERFORMANCE

Measured, Not Claimed.

Real Lighthouse measurements from the deployed experience,
tested across mobile and desktop.

             MOBILE          DESKTOP

Performance    92               98
Accessibility  96              100
Best Practices 100             100
SEO            100             100

Core Web Vitals

LCP            1.8s            1.1s
FCP            1.2s            0.8s
CLS            0.02             0.01
TBT            120ms             40ms

Lighthouse · Asia South · Updated recently
```

The exact visual layout can adapt to the existing portfolio design system.

---

# 3. Architecture

Recommended structure:

```text
app/
├── api/
│   └── projects/
│       └── [slug]/
│           └── performance/
│               └── route.js
│
├── projects/
│   └── [slug]/
│       └── components/
│           └── performance/
│               ├── ProjectPerformance.jsx
│               ├── PerformanceHeader.jsx
│               ├── PerformanceDeviceToggle.jsx
│               ├── PerformanceScore.jsx
│               ├── PerformanceScoreRing.jsx
│               ├── PerformanceMetricGrid.jsx
│               ├── PerformanceMetric.jsx
│               ├── PerformanceStatus.jsx
│               ├── PerformanceSkeleton.jsx
│               └── performance.utils.js
│
└── lib/
    └── lighthouse/
        ├── client.js
        ├── checks.js
        ├── runs.js
        ├── normalize.js
        └── constants.js
```

Before creating these files, inspect the existing project architecture and reuse existing utilities where appropriate.

Do not duplicate an existing API client, cache utility, Motion utility, Skeleton component, theme token, or project lookup mechanism.

---

# PHASE 0 — ARCHITECTURE AUDIT

## Objective

Understand the existing project before modifying it.

Inspect:

- project data structure
- `ProjectDetail`
- `ProjectSnapshot`
- existing section patterns
- existing Skeleton component
- existing Motion utilities
- existing `useReducedMotion`
- Tailwind v4 configuration
- theme tokens
- existing API routes
- project lookup utilities
- existing caching utilities
- existing error handling
- existing responsive conventions

Confirm that:

```js
project.links.live
```

is the live project URL source.

## Implementation

Do not change production behavior in this phase.

Create a short implementation map for yourself:

```text
Project data source:
Project lookup:
API conventions:
Theme tokens:
Motion conventions:
Skeleton:
Reduced motion:
Cache:
```

## Parameters of Done

- [ ] Existing project architecture inspected.
- [ ] `project.links.live` confirmed as the URL source.
- [ ] Existing project lookup mechanism identified.
- [ ] Existing theme tokens identified.
- [ ] Existing Motion conventions identified.
- [ ] Existing Skeleton component identified.
- [ ] Existing reduced-motion mechanism identified.
- [ ] Existing API/caching patterns identified.
- [ ] No duplicate infrastructure planned unnecessarily.

---

# PHASE 1 — ENVIRONMENT AND SECURITY

## Objective

Create the server-only Lighthouse Metrics configuration.

Environment variable:

```env
LIGHTHOUSE_METRICS_API_TOKEN=your_token
```

Never use:

```env
NEXT_PUBLIC_LIGHTHOUSE_METRICS_API_TOKEN
```

The API token must never enter the browser bundle.

## Parameters of Done

- [ ] Token is stored server-side.
- [ ] Token is never returned by an API route.
- [ ] Token is never placed in client component code.
- [ ] Token is never logged.
- [ ] Token is never included in client-visible error messages.
- [ ] No public proxy exposes the Lighthouse API token.

---

# PHASE 2 — LIGHTHOUSE API CLIENT

## Objective

Create a small server-only API client.

File:

```text
lib/lighthouse/client.js
```

Responsibilities:

- Lighthouse API base URL
- Bearer authentication
- request helper
- response validation
- API error normalization
- timeout handling

Base URL:

```text
https://api.lighthouse-metrics.com
```

Authentication:

```text
Authorization: Bearer ${process.env.LIGHTHOUSE_METRICS_API_TOKEN}
```

Do not place authentication logic in React components.

## Parameters of Done

- [ ] API client runs only on the server.
- [ ] Bearer token is attached correctly.
- [ ] Missing token produces a safe configuration error.
- [ ] HTTP errors are normalized.
- [ ] Network failures are handled.
- [ ] Request timeout is bounded.
- [ ] Raw authorization information is never exposed.

---

# PHASE 3 — CREATE LIGHTHOUSE CHECKS

## Objective

Implement check creation.

File:

```text
lib/lighthouse/checks.js
```

Use:

```text
POST /v1/lighthouse/checks
```

Mobile payload:

```js
{
    url,
    regions: ["asia-south1"],
    device: "mobile",
}
```

Desktop payload:

```js
{
    url,
    regions: ["asia-south1"],
    device: "desktop",
}
```

Create independent mobile and desktop results.

## Parameters of Done

- [ ] Mobile check can be created.
- [ ] Desktop check can be created.
- [ ] URL comes from `project.links.live`.
- [ ] Region is configurable.
- [ ] Device is explicit.
- [ ] API errors are caught.
- [ ] Mobile and desktop failures can be handled independently.
- [ ] No client-side Lighthouse API request exists.

---

# PHASE 4 — RUN RETRIEVAL AND POLLING

## Objective

Handle asynchronous Lighthouse runs.

File:

```text
lib/lighthouse/runs.js
```

The implementation must:

1. receive run/check identifiers
2. retrieve run state
3. detect completion
4. retrieve final metrics
5. stop on failure
6. stop after a maximum timeout/attempt count

Conceptual flow:

```text
Create Check
    ↓
Run ID
    ↓
Get Run
    ↓
Pending?
 ┌───────┴────────┐
 YES              NO
 ↓                 ↓
Wait             Success/Failure
 ↓
Poll again
```

Do not poll forever.

Do not retry aggressively.

## Suggested configuration

```js
const POLL_INTERVAL = 1500;
const MAX_POLL_ATTEMPTS = 20;
```

These values should remain configurable.

## Parameters of Done

- [ ] Run status is checked.
- [ ] Successful runs return final data.
- [ ] Failed runs return a safe failure state.
- [ ] Polling is bounded.
- [ ] Timeout is bounded.
- [ ] No infinite loop exists.
- [ ] Rate-limit failures are handled.
- [ ] Mobile and desktop runs remain independent.

---

# PHASE 5 — NORMALIZATION LAYER

## Objective

Never expose the raw Lighthouse API response directly to the UI.

File:

```text
lib/lighthouse/normalize.js
```

Normalize to a stable structure:

```js
{
    device: "mobile",

    status: "success",

    score: {
        performance: 92,
        accessibility: 98,
        bestPractices: 100,
        seo: 100,
    },

    metrics: {
        fcp: 1200,
        si: 1500,
        lcp: 1800,
        tti: 2200,
        tbt: 100,
        cls: 0.02,
    },

    url: "https://example.com/",
    region: "asia-south1",
    lighthouseVersion: "13.x.x",
    state: "succeeded",
    createdAt: 123456789,
}
```

Do not assume a field exists.

Use `null` when an optional metric is unavailable.

## Parameters of Done

- [ ] Raw API response is isolated from UI.
- [ ] Score fields normalized.
- [ ] Timing metrics normalized.
- [ ] CLS normalized.
- [ ] Missing metrics safely become `null`.
- [ ] Device is preserved.
- [ ] Region is preserved.
- [ ] Timestamp is preserved.
- [ ] Lighthouse version is preserved when available.
- [ ] Frontend does not depend on undocumented raw response structure.

---

# PHASE 6 — URL VALIDATION

## Objective

Validate the project URL before making external Lighthouse requests.

Rules:

- URL must exist.
- URL must be a string.
- URL must parse using `new URL()`.
- Protocol must be `http:` or `https:`.

Invalid state:

```js
{
    status: "unavailable",
    reason: "invalid-url"
}
```

Do not send invalid URLs to Lighthouse.

## Parameters of Done

- [ ] Missing URL handled.
- [ ] Malformed URL handled.
- [ ] Unsupported protocol handled.
- [ ] Lighthouse request is skipped for invalid URLs.
- [ ] No project page crash occurs.

---

# PHASE 7 — CACHE

## Objective

Do not run Lighthouse on every page visit.

Default cache freshness:

```text
12 hours
```

Configuration:

```js
const CACHE_DURATION = 12 * 60 * 60 * 1000;
```

Flow:

```text
Request
   ↓
Cache lookup
   ↓
Fresh?
 ┌───────┴───────┐
 YES             NO
 ↓                ↓
Return cache     Run Lighthouse
                  ↓
                Normalize
                  ↓
                Cache
                  ↓
                Return
```

Use the application's existing server-side cache mechanism if one exists.

Do not introduce a competing cache system unnecessarily.

## Parameters of Done

- [ ] Cached result returned when fresh.
- [ ] Fresh cache prevents new Lighthouse checks.
- [ ] Mobile and desktop results are cached together.
- [ ] Cache duration is configurable.
- [ ] Expired cache triggers refresh.
- [ ] Cache failures do not crash the page.
- [ ] Device switching never bypasses the cache.

---

# PHASE 8 — NEXT.JS PERFORMANCE API ROUTE

## Objective

Create:

```text
app/api/projects/[slug]/performance/route.js
```

Flow:

```text
GET /api/projects/[slug]/performance
        ↓
Resolve project
        ↓
Read project.links.live
        ↓
Validate URL
        ↓
Check cache
        ↓
Create mobile + desktop checks
        ↓
Poll runs
        ↓
Normalize results
        ↓
Cache
        ↓
Return stable response
```

Recommended response:

```js
{
    success: true,

    project: {
        slug,
        url,
    },

    mobile: {
        status: "success",
        ...
    },

    desktop: {
        status: "success",
        ...
    },

    updatedAt,
}
```

Partial response is allowed:

```js
{
    success: true,

    mobile: {
        status: "success",
        ...
    },

    desktop: {
        status: "error",
        reason: "run-failed",
    },

    updatedAt,
}
```

## Parameters of Done

- [ ] Route resolves the correct project.
- [ ] Route reads `project.links.live`.
- [ ] URL is validated.
- [ ] Cache is checked first.
- [ ] Mobile result is available when successful.
- [ ] Desktop result is available when successful.
- [ ] Partial failure is supported.
- [ ] Response is frontend-safe.
- [ ] API token never appears in response.
- [ ] Raw external API response is not leaked.

---

# PHASE 9 — PROJECT PERFORMANCE COMPONENT

## Objective

Create the UI entry point:

```text
ProjectPerformance.jsx
```

Recommended location:

```text
projects/[slug]/components/performance/
```

It should:

- fetch internal API
- manage loading
- manage success
- manage partial failure
- manage unavailable state
- manage selected device
- render child components

It should not contain the entire formatting system.

## Integration

Current flow:

```jsx
<ProjectHero project={project} />

<ProjectSnapshot project={project} />

<ProjectContext />
```

New flow:

```jsx
<ProjectHero project={project} />

<ProjectSnapshot project={project} />

<ProjectPerformance project={project} />

<ProjectContext />
```

If no valid `project.links.live` exists, do not render the section.

## Parameters of Done

- [ ] Section integrated into ProjectDetail.
- [ ] Existing sections remain unchanged.
- [ ] No Lighthouse failure crashes ProjectDetail.
- [ ] No live URL means no unnecessary empty section.
- [ ] Client only calls the internal API route.

---

# PHASE 10 — PERFORMANCE UI DESIGN

## Objective

Create a premium editorial performance section.

Recommended structure:

```text
PERFORMANCE

Measured, Not Claimed.

Real Lighthouse measurements from the deployed experience,
tested across mobile and desktop.

        [ Mobile ] [ Desktop ]

             92
        PERFORMANCE
          Excellent

Performance       92
Accessibility     96
Best Practices   100
SEO              100

Core Web Vitals

LCP              1.8s
FCP              1.2s
CLS              0.02
TBT              120ms

Lighthouse · Asia South · Updated recently
```

Desktop can present mobile and desktop side-by-side where appropriate.

Mobile should display one selected device at a time.

Do not squeeze two complete dashboards into mobile.

## Parameters of Done

- [ ] UI matches existing portfolio design.
- [ ] No generic admin dashboard appearance.
- [ ] No excessive cards.
- [ ] No excessive pills.
- [ ] No excessive glassmorphism.
- [ ] No giant gauges.
- [ ] Light mode works.
- [ ] Dark mode works.
- [ ] Mobile works.
- [ ] Desktop works.
- [ ] No horizontal overflow.

---

# PHASE 11 — DEVICE TOGGLE

Create:

```text
PerformanceDeviceToggle.jsx
```

Controls:

```text
Mobile
Desktop
```

Use a restrained segmented control.

Active indicator should use Motion `layoutId`.

Concept:

```jsx
<motion.div
    layoutId="performance-device-indicator"
/>
```

The device switch changes displayed data only.

It must NOT create another Lighthouse request.

## Parameters of Done

- [ ] Mobile selectable.
- [ ] Desktop selectable.
- [ ] Keyboard accessible.
- [ ] Focus state visible.
- [ ] Active state clear.
- [ ] Motion indicator works.
- [ ] Switching device does not fetch new API data.
- [ ] No layout jump.

---

# PHASE 12 — SCORE COMPONENT

Create:

```text
PerformanceScore.jsx
PerformanceScoreRing.jsx
```

Primary Performance score receives strongest visual emphasis.

Example:

```text
92
PERFORMANCE
Excellent
```

Do not create a giant dashboard gauge.

Score bands:

```text
90–100 → Excellent
75–89  → Good
50–74  → Needs improvement
0–49   → Poor
```

Semantic colors:

```text
90–100 → success
75–89  → brand/info
50–74  → warning
0–49   → error
```

Use existing semantic theme tokens.

Do not invent another color system.

## Parameters of Done

- [ ] Score is actual API data.
- [ ] Score is readable without color.
- [ ] Score label is available.
- [ ] Score visualization is restrained.
- [ ] Light mode works.
- [ ] Dark mode works.
- [ ] Missing score is handled.
- [ ] No fake production values.

---

# PHASE 13 — CORE METRICS

Create:

```text
PerformanceMetricGrid.jsx
PerformanceMetric.jsx
```

Show:

- Performance
- Accessibility
- Best Practices
- SEO

Then show core timing metrics:

- LCP
- FCP
- CLS
- TBT
- SI
- TTI

Only show metrics that are available.

Use readable formatting.

Examples:

```text
1200 → 1.2s
1800 → 1.8s
0.02 → 0.02
92 → 92
```

## Parameters of Done

- [ ] Metric names are understandable.
- [ ] Values are correctly formatted.
- [ ] Missing values do not display `undefined`.
- [ ] Metrics remain readable on mobile.
- [ ] No unnecessary charting.
- [ ] No fake values.

---

# PHASE 14 — MOTION SYSTEM

Use:

```js
import {
    motion,
    AnimatePresence,
} from "motion/react";
```

Do not add GSAP.

Do not add another animation library.

Animation must communicate:

- section entering
- score becoming visible
- score counting
- metrics revealing
- device switching
- state transitions

Animation must not be decorative noise.

## Parameters of Done

- [ ] Motion is subtle.
- [ ] Motion is purposeful.
- [ ] Motion uses existing project conventions.
- [ ] No excessive bouncing.
- [ ] No aggressive scaling.
- [ ] No distracting parallax.
- [ ] Reduced motion is supported.

---

# PHASE 15 — SECTION ENTRANCE MOTION

Sequence:

```text
Eyebrow
   ↓
Heading
   ↓
Description
   ↓
Score
   ↓
Metrics
```

Suggested:

```js
initial={{
    opacity: 0,
    y: 18,
}}

animate={{
    opacity: 1,
    y: 0,
}}
```

Use viewport detection.

The section should not replay excessively.

## Parameters of Done

- [ ] Entrance starts when section enters viewport.
- [ ] Heading is crisp after animation.
- [ ] No excessive movement.
- [ ] Animation does not affect layout.
- [ ] Reduced-motion mode disables unnecessary movement.

---

# PHASE 16 — SCORE COUNTING MOTION

Animate:

```text
0 → actual score
```

Suggested duration:

```text
0.9–1.2 seconds
```

Use controlled easing or a restrained spring.

Ring progress and number must complete together.

Do not start the animation while the component is offscreen.

## Parameters of Done

- [ ] Counter starts only when visible.
- [ ] Counter ends at exact API score.
- [ ] Ring matches final score.
- [ ] No overshoot that produces incorrect final values.
- [ ] Reduced motion shows final score immediately.

---

# PHASE 17 — METRIC STAGGER

Reveal metric items sequentially.

Suggested stagger:

```text
50–80ms
```

Keep it subtle.

Do not delay the user unnecessarily.

## Parameters of Done

- [ ] Metrics reveal smoothly.
- [ ] Stagger is short.
- [ ] No layout shift.
- [ ] Reduced motion removes unnecessary stagger.

---

# PHASE 18 — DEVICE SWITCH MOTION

When switching:

```text
Mobile → Desktop
```

use:

```jsx
<AnimatePresence mode="wait">
```

Changing values can use:

```text
opacity
y
```

Do not use large horizontal slides.

The active indicator uses:

```jsx
layoutId
```

## Parameters of Done

- [ ] Old values leave cleanly.
- [ ] New values enter cleanly.
- [ ] No flashing.
- [ ] No layout jump.
- [ ] Device state remains accessible.
- [ ] No API request occurs during switch.

---

# PHASE 19 — LOADING STATE

Use the existing Skeleton component.

Create:

```text
PerformanceSkeleton.jsx
```

The skeleton should mirror the final structure.

Example:

```text
PERFORMANCE

████████████████
██████████████████████

████████
████████

████████  ████████
████████  ████████
████████  ████████
```

Use subtle shimmer/pulse.

Do not use an isolated:

```text
Loading...
```

message.

Reserve enough space to avoid layout shift.

## Parameters of Done

- [ ] Skeleton resembles final layout.
- [ ] No large layout shift.
- [ ] Existing Skeleton component reused.
- [ ] Loading animation is subtle.
- [ ] Reduced motion is respected.

---

# PHASE 20 — ERROR AND PARTIAL STATES

## Full failure

Show:

```text
Performance data unavailable

Lighthouse could not complete this measurement right now.
```

Do not show raw API errors.

## Partial failure

Example:

```text
Mobile
92

Desktop
Unavailable
```

Do not hide successful data because the other device failed.

## Parameters of Done

- [ ] Full failure handled.
- [ ] Mobile-only success handled.
- [ ] Desktop-only success handled.
- [ ] Both failure handled.
- [ ] Raw errors hidden.
- [ ] Page remains usable.
- [ ] Retry, if implemented, is bounded.

---

# PHASE 21 — LIVE URL METADATA

Show a compact reference to the tested deployment:

```text
Tested URL
your-project.vercel.app ↗
```

Use the actual `project.links.live`.

Do not expose long URLs if they damage the layout.

Use truncation where necessary.

## Parameters of Done

- [ ] URL is actual project URL.
- [ ] Link opens the live project.
- [ ] Long URL does not overflow.
- [ ] Accessible link label exists.

---

# PHASE 22 — LIGHT/DARK THEME

Use existing semantic tokens.

Preferred semantic classes:

```text
bg-background
text-foreground
bg-surface-1
bg-surface-2
border-border
text-text-primary
text-text-secondary
text-brand
text-success
text-warning
text-error
```

Do not introduce a second color system.

The performance section must feel native in both themes.

## Parameters of Done

- [ ] Light mode tested.
- [ ] Dark mode tested.
- [ ] Score states remain distinguishable.
- [ ] Borders remain visible.
- [ ] Secondary text remains readable.
- [ ] No hard-coded competing palette.

---

# PHASE 23 — RESPONSIVE DESIGN

Test at:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

Mobile:

- one selected device at a time
- compact spacing
- readable metrics
- no horizontal scrolling

Desktop:

- efficient two-device comparison where appropriate
- spacious editorial layout
- no giant dashboard feel

## Parameters of Done

- [ ] 320px works.
- [ ] 375px works.
- [ ] 390px works.
- [ ] 430px works.
- [ ] 768px works.
- [ ] 1024px works.
- [ ] 1280px works.
- [ ] 1440px works.
- [ ] No horizontal overflow.
- [ ] No excessive whitespace.
- [ ] No text collision.
- [ ] No layout shift.

---

# PHASE 24 — ACCESSIBILITY

Requirements:

- semantic section
- proper heading hierarchy
- keyboard accessible device control
- visible focus
- screen-reader labels
- sufficient contrast
- no color-only meaning
- reduced motion

Examples:

```text
aria-label="Mobile Lighthouse results"
```

where appropriate.

## Parameters of Done

- [ ] Keyboard navigation works.
- [ ] Focus states visible.
- [ ] Screen-reader labels exist where needed.
- [ ] Scores are available as text.
- [ ] Color is not the only indicator.
- [ ] Reduced motion works.

---

# PHASE 25 — REDUCED MOTION

Reuse the existing:

```text
useReducedMotion
```

if available.

Reduced motion behavior:

- no score counting
- no ring animation
- no large stagger
- no layout animation
- immediate or minimal content reveal

Functionality must remain unchanged.

## Parameters of Done

- [ ] Reduced-motion preference detected.
- [ ] Score appears immediately.
- [ ] Ring animation disabled.
- [ ] Stagger disabled.
- [ ] Device switching remains functional.

---

# PHASE 26 — REQUEST DEDUPLICATION

Prevent duplicate requests caused by:

- React Strict Mode
- repeated renders
- route transitions
- device switching

The UI should fetch once for the project and receive both device results.

Device switching must only switch local UI state.

## Parameters of Done

- [ ] One internal API request per uncached project load.
- [ ] No request when switching device.
- [ ] React Strict Mode does not cause uncontrolled Lighthouse checks.
- [ ] Cache protects against repeated server checks.

---

# PHASE 27 — PARTIAL FAILURE AND RATE LIMITING

The API can return rate-limit errors.

Handle:

```text
429
```

without aggressive retries.

Behavior:

```text
Fresh cache → return cache
No cache + 429 → safe unavailable state
```

Do not repeatedly hammer the API.

## Parameters of Done

- [ ] 429 handled.
- [ ] No infinite retries.
- [ ] Cache is preferred.
- [ ] UI remains functional.
- [ ] Raw rate-limit response is not exposed.

---

# PHASE 28 — SECURITY QA

Verify:

```text
API token
    ↓
server only
    ↓
Lighthouse Metrics
```

Never:

```text
browser
    ↓
Lighthouse token
```

Test production build and inspect client bundle/environment usage.

## Parameters of Done

- [ ] Token absent from client bundle.
- [ ] Token absent from rendered HTML.
- [ ] Token absent from API JSON.
- [ ] Token absent from browser network requests.
- [ ] Token absent from console logs.

---

# PHASE 29 — PERFORMANCE QA

The Performance section itself must be lightweight.

Avoid:

- large chart libraries
- expensive SVG systems
- unnecessary dependencies
- large DOM trees
- continuous animation
- heavy visual effects

The feature must not meaningfully damage the portfolio's own performance.

Check:

```text
JavaScript bundle
network requests
layout shift
long tasks
animation cost
DOM size
```

## Parameters of Done

- [ ] No unnecessary dependency added.
- [ ] No continuous animation.
- [ ] No significant CLS introduced.
- [ ] No excessive DOM.
- [ ] No Lighthouse request on every device switch.
- [ ] Portfolio remains performant.

---

# PHASE 30 — PROJECT DETAIL RESILIENCE

Lighthouse is an enhancement, not a dependency for the entire page.

If Lighthouse Metrics is down:

```text
Hero
Snapshot
Context
Approach
Design
Engineering
Motion
Responsive
Showcase
Reflection
Navigation
```

must continue working.

## Parameters of Done

- [ ] Lighthouse failure cannot crash ProjectDetail.
- [ ] API timeout cannot block the entire page.
- [ ] Rendering error is isolated.
- [ ] Other sections remain functional.

---

# PHASE 31 — TEST PROJECTS

Test all projects with:

```js
project.links.live
```

including examples such as:

```text
ClassFuse
Spendwise
System Canvas
```

Projects without live URLs must not initiate Lighthouse checks.

## Parameters of Done

- [ ] At least three eligible projects tested where available.
- [ ] Project without URL tested.
- [ ] Mobile tested.
- [ ] Desktop tested.
- [ ] Cache tested.
- [ ] Partial failure tested.

---

# PHASE 32 — FINAL QA MATRIX

## Data

- [ ] Live URL comes from `project.links.live`.
- [ ] No duplicate URL configuration.
- [ ] Mobile result works.
- [ ] Desktop result works.
- [ ] Data normalized.
- [ ] Timestamp handled.
- [ ] Region handled.
- [ ] Lighthouse version handled.

## API

- [ ] Server-side authentication.
- [ ] Check creation.
- [ ] Mobile device.
- [ ] Desktop device.
- [ ] Run polling.
- [ ] Timeout.
- [ ] Rate limit.
- [ ] Error normalization.

## Cache

- [ ] Cache implemented.
- [ ] 12-hour default freshness.
- [ ] Configurable duration.
- [ ] No duplicate checks.
- [ ] Mobile + desktop cached together.

## UI

- [ ] Premium editorial design.
- [ ] Mobile/desktop toggle.
- [ ] Performance score.
- [ ] Accessibility score.
- [ ] Best Practices score.
- [ ] SEO score.
- [ ] Core metrics.
- [ ] Timestamp.
- [ ] Tested URL.

## Motion

- [ ] Entrance animation.
- [ ] Score count.
- [ ] Score ring.
- [ ] Metric stagger.
- [ ] Device transition.
- [ ] Active indicator.
- [ ] Hover microinteraction.
- [ ] Reduced motion.

## Responsive

- [ ] 320px.
- [ ] 375px.
- [ ] 390px.
- [ ] 430px.
- [ ] 768px.
- [ ] 1024px.
- [ ] 1280px.
- [ ] 1440px.

## Accessibility

- [ ] Keyboard.
- [ ] Focus.
- [ ] Semantic HTML.
- [ ] Screen-reader labels.
- [ ] Color-independent meaning.
- [ ] Reduced motion.

## Security

- [ ] Token server-only.
- [ ] No public token.
- [ ] No raw API response leakage.
- [ ] URL validation.
- [ ] Sanitized errors.

## Code quality

- [ ] No debug logs.
- [ ] No fake production data.
- [ ] No unused imports.
- [ ] No dead components.
- [ ] No duplicate utilities.
- [ ] No unnecessary dependency.
- [ ] Build passes.
- [ ] Lint passes.
- [ ] Existing project sections remain unaffected.

---

# PHASE 33 — FINAL CLEANUP

Before declaring complete:

Remove:

```text
console.log
temporary mocks
debug flags
unused imports
unused helpers
unused components
temporary API bypasses
```

Run:

```text
lint
build
```

and any existing project checks.

## Parameters of Done

- [ ] Production build passes.
- [ ] Lint passes.
- [ ] No console errors.
- [ ] No console warnings caused by this feature.
- [ ] No broken existing sections.
- [ ] No fake data.
- [ ] No debug code.

---

# FINAL ACCEPTANCE CRITERIA

The implementation is considered DONE only when:

1. A project with `project.links.live` automatically receives Lighthouse measurements.
2. Mobile and desktop results are supported.
3. Lighthouse API authentication is server-side only.
4. The external API is never called directly from the browser.
5. Results are cached.
6. The API is not called on every project visit.
7. Device switching does not create another Lighthouse run.
8. The UI supports partial mobile/desktop failures.
9. Loading, success, timeout, rate-limit, and error states are handled.
10. Scores and metrics are actual API values.
11. No fake production values exist.
12. The section works in light and dark mode.
13. The section works from 320px through large desktop widths.
14. Motion feels premium and restrained.
15. Reduced-motion users receive an equivalent functional experience.
16. The feature does not introduce significant layout shift.
17. The feature does not materially degrade the portfolio's performance.
18. The Lighthouse token never reaches the browser.
19. Lighthouse failure cannot break the project detail page.
20. Existing project-detail architecture remains intact.

---

# DESIGN QUALITY BAR

The final section should feel like:

```text
Editorial
Technical
Measured
Premium
Quiet
Precise
```

It should NOT feel like:

```text
Generic dashboard
Admin panel
Gaming UI
SaaS analytics template
Over-animated marketing section
```

The goal is to make Lighthouse data feel like credible engineering evidence inside the case study.

---

# IMPLEMENTATION ORDER

Execute strictly in this order:

```text
PHASE 0
Architecture Audit
        ↓
PHASE 1
Environment + Security
        ↓
PHASE 2
API Client
        ↓
PHASE 3
Create Checks
        ↓
PHASE 4
Run Polling
        ↓
PHASE 5
Normalization
        ↓
PHASE 6
URL Validation
        ↓
PHASE 7
Cache
        ↓
PHASE 8
Next.js API Route
        ↓
PHASE 9
ProjectPerformance
        ↓
PHASE 10
UI
        ↓
PHASE 11
Device Toggle
        ↓
PHASE 12
Score
        ↓
PHASE 13
Metrics
        ↓
PHASE 14–18
Motion
        ↓
PHASE 19–20
Loading + Error
        ↓
PHASE 21–25
Metadata + Theme + Responsive + Accessibility
        ↓
PHASE 26–28
Request + Rate Limit + Security
        ↓
PHASE 29–30
Performance + Resilience
        ↓
PHASE 31–33
Testing + QA + Cleanup
```

Do not skip phases merely because the UI appears to work.

The implementation is complete only when the corresponding parameters of done have been verified.
