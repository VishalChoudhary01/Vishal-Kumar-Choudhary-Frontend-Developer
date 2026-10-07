# LABS UI / UX IMPLEMENTATION SPECIFICATION

## Purpose

Implement the new **Labs** area inside the existing Next.js portfolio without breaking the completed portfolio.

The portfolio is already considered complete. **Do not redesign, refactor, or disturb existing portfolio pages.** This specification is only for:

1. `/labs` — dynamic Labs index/listing page.
2. `/labs/[slug]` — dynamic Lab detail page.
3. Lab-specific visual system: layout, spacing, typography, theme tokens, layering, media, motion, and responsive behavior.
4. Dynamic Lab content rendering for:
   - code components
   - video
   - GIF
   - image
   - mixed media
5. Future authenticated source-code access without exposing source code publicly.
6. Safe incremental implementation with phase gates so existing portfolio routes remain unchanged.

---

# 1. NON-NEGOTIABLE ARCHITECTURE

## 1.1 Portfolio remains untouched

The existing portfolio is already complete.

Do NOT:

- rewrite existing portfolio layouts;
- replace existing portfolio components;
- move portfolio routes unnecessarily;
- change existing typography tokens globally;
- change existing theme behavior globally;
- change existing project detail rendering;
- add Lab dependencies to portfolio components;
- make the root layout load Lab runtime code;
- import Monaco into portfolio routes;
- load Lab media on the homepage;
- convert the entire application to Client Components.

The Labs system must be additive.

---

## 1.2 Route structure

Use:

```text
src/app/
├── (portfolio)/
│   ├── page.jsx
│   ├── about/
│   ├── experience/
│   ├── projects/
│   │   └── [slug]/
│   └── contact/
│
└── labs/
    ├── page.jsx
    └── [slug]/
        └── page.jsx
```

If the current repository does not use route groups, preserve the existing structure and add:

```text
src/app/labs/page.jsx
src/app/labs/[slug]/page.jsx
```

Do not perform a route-group migration merely for Labs.

---

# 2. LABS PRODUCT MODEL

Labs is a first-class experimental area.

```text
Portfolio
  └── professional proof

Labs
  ├── experiments
  ├── live demos
  ├── media
  ├── interaction
  ├── source access
  └── analytics
```

A Lab is not a portfolio project.

The Lab index should answer:

> What have I experimented with?

The Lab detail page should answer:

> What is this experiment, how does it behave, and how can I inspect/use it?

---

# 3. VISUAL DIRECTION

The Labs UI should feel like an **experimental engineering studio**, not another project grid.

Desired characteristics:

- premium;
- restrained;
- technical;
- editorial;
- spatial;
- dark/light theme aware;
- strong typography;
- subtle borders;
- controlled glow;
- layered surfaces;
- generous whitespace;
- crisp media;
- minimal decorative noise.

Avoid:

- excessive glassmorphism;
- giant rounded cards;
- random gradients;
- excessive pills;
- rainbow colors;
- dashboard-like density;
- decorative elements with no semantic purpose;
- heavy shadows everywhere.

Use a restrained radius system.

Preferred:

```text
rounded-sm
rounded-md
```

Avoid making every component a pill.

---

# 4. LABS DESIGN TOKENS

Do not overwrite the portfolio's existing global tokens.

Create Lab-specific semantic tokens that map onto the existing theme system.

Recommended token contract:

```css
--lab-bg
--lab-surface
--lab-surface-elevated
--lab-surface-muted

--lab-text
--lab-text-muted
--lab-text-subtle

--lab-border
--lab-border-strong

--lab-accent
--lab-accent-soft
--lab-accent-contrast

--lab-grid
--lab-glow

--lab-code-bg
--lab-code-text

--lab-radius-sm
--lab-radius-md

--lab-content
--lab-content-wide
--lab-gutter
```

Example semantic values:

### Light

```text
lab-bg              → very light neutral
lab-surface         → white / near-white
lab-surface-elevated→ white
lab-text            → near-black
lab-text-muted      → neutral gray
lab-border          → low-contrast neutral
lab-accent          → existing portfolio accent
lab-code-bg         → dark technical surface
```

### Dark

```text
lab-bg              → deep neutral
lab-surface         → slightly elevated neutral
lab-surface-elevated→ elevated neutral
lab-text            → near-white
lab-text-muted      → muted gray
lab-border          → subtle light border
lab-accent          → existing accent adjusted for contrast
lab-code-bg         → near-black
```

Important:

**Do not invent a second brand identity.**

Labs should feel like an extension of the same personal site while having a distinct experimental atmosphere.

---

# 5. LAYERING SYSTEM

Every Labs page should use a predictable layer stack.

## Layer 0 — Page background

```text
z-0
```

Purpose:

- base theme color;
- no interaction;
- no expensive animation.

---

## Layer 1 — Ambient atmosphere

```text
z-0 / pointer-events-none
```

May contain:

- subtle radial glow;
- very low-opacity gradient;
- experimental accent atmosphere.

Rules:

- opacity must remain low;
- no continuous expensive animation;
- respect `prefers-reduced-motion`.

---

## Layer 2 — Technical grid

```text
z-0 / pointer-events-none
```

Optional grid/noise treatment.

Rules:

- subtle;
- never compete with text;
- should disappear or reduce on mobile if visually noisy.

---

## Layer 3 — Content

```text
relative z-10
```

All readable content belongs here.

---

## Layer 4 — Media

Media should remain inside explicit media containers.

Never allow uncontrolled video/image overflow.

---

## Layer 5 — Interaction controls

```text
relative z-20
```

Examples:

- back;
- source;
- copy;
- fullscreen;
- play;
- filter.

---

## Layer 6 — Temporary overlays

```text
z-30+
```

Examples:

- code viewer;
- fullscreen media;
- modal;
- authentication prompt.

Never create arbitrary z-index values throughout the application.

---

# 6. CONTAINER SYSTEM

Use a consistent Labs container.

Desktop:

```text
max-width: approximately 1280–1440px
```

Large detail media may use a wider container.

Recommended conceptual structure:

```jsx
<div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-10">
```

Use a second content constraint for readable text:

```text
max-w-[720px]
```

And a wide showcase constraint:

```text
max-w-[1400px]
```

Do not make paragraphs span the entire viewport.

---

# 7. SPACING SYSTEM

Use an 8px-oriented spacing rhythm.

Suggested scale:

```text
4px
8px
12px
16px
24px
32px
40px
48px
64px
80px
96px
120px
```

## Labs index

Recommended vertical rhythm:

```text
Navbar
↓
32–48px
↓
Labs intro
↓
48–64px
↓
Filter/category controls
↓
32–48px
↓
Lab grid
↓
80–120px
↓
Footer
```

## Lab detail

Recommended:

```text
Navbar
↓
32–48px
↓
Breadcrumb/back
↓
24–40px
↓
Eyebrow
↓
16–24px
↓
Title
↓
20–32px
↓
Description
↓
32–48px
↓
Meta / actions
↓
48–80px
↓
Primary experiment
↓
64–120px
↓
Supporting sections
```

Do not use huge empty gaps simply to make the page look premium.

Whitespace must establish hierarchy.

---

# 8. TYPOGRAPHY SYSTEM

Do not replace the existing portfolio font system.

Labs should use the same primary font family unless the existing system explicitly provides a display/mono family.

## Labs index

Eyebrow:

```text
11–12px
uppercase
tracking-[0.12em–0.18em]
medium
```

Page title:

Desktop:

```text
48–64px
line-height: 0.95–1.05
letter-spacing: tight
```

Tablet:

```text
40–48px
```

Mobile:

```text
32–40px
```

Description:

Desktop:

```text
18–20px
line-height: 1.5–1.65
```

Mobile:

```text
16–18px
```

---

## Lab detail

Title:

Desktop:

```text
56–80px
line-height: 0.95–1.05
```

Do not exceed the visual scale already established by the portfolio's hero typography without a clear reason.

Tablet:

```text
44–60px
```

Mobile:

```text
34–44px
```

Metadata:

```text
12–14px
```

Body:

```text
16–18px
line-height: 1.6–1.75
```

Code:

```text
12–14px
line-height: 1.5–1.7
```

Code typography must be monospaced.

---

# 9. LAB INDEX PAGE

Route:

```text
/labs
```

## 9.1 Header

Structure:

```text
Labs
Experimental interfaces, interactions, and engineering experiments.
```

Recommended:

```text
Eyebrow
Labs
Short supporting statement
```

Do not add a huge hero illustration.

---

## 9.2 Lab grid

Desktop:

```text
2–3 columns
```

Tablet:

```text
2 columns
```

Mobile:

```text
1 column
```

Grid gap:

```text
20–32px
```

depending on viewport.

---

# 10. LAB CARD

A Lab card should contain only enough information to choose an experiment.

Recommended structure:

```text
Media / visual preview
↓
Category
↓
Lab title
↓
Short description
↓
Technology / interaction metadata
↓
Open Lab
```

Do not render:

- full source;
- full description;
- large video files;
- complete experiment runtime;
- Monaco;
- hidden source code.

---

# 11. LAB CARD MEDIA

A card may have:

```js
media: {
  type: "image",
  src: "...",
  alt: "..."
}
```

or:

```js
media: {
  type: "video",
  src: "...",
  poster: "..."
}
```

or:

```js
media: {
  type: "gif",
  src: "...",
  alt: "..."
}
```

or no media.

Use a graceful fallback when media is missing.

---

# 12. MEDIA PERFORMANCE

## Images

Use:

```jsx
<Image
  src={src}
  alt={alt}
  width={...}
  height={...}
  sizes="..."
/>
```

Use meaningful dimensions.

Do not ship giant source images when a compressed variant is available.

---

## Video

Use:

```html
<video
  muted
  playsInline
  loop
  preload="none"
  poster="..."
>
```

Only autoplay if the visual behavior genuinely requires it.

Do not autoplay multiple large videos on `/labs`.

---

## GIF

GIFs can be expensive.

Preferred order:

```text
MP4/WebM
↓
optimized image
↓
GIF only when necessary
```

If GIF is required, lazy load it and keep the source optimized.

---

# 13. LAB DETAIL PAGE

Route:

```text
/labs/[slug]
```

The detail page is the primary interactive experience.

Structure:

```text
Page background
│
├── Ambient layer
├── Grid layer
│
└── Content
    ├── Back / breadcrumb
    ├── Lab identity
    ├── Actions
    ├── Experiment stage
    ├── Description/context
    ├── Media/showcase
    ├── Technical information
    └── Source access
```

---

# 14. DETAIL HERO

Do not make it identical to Project Hero.

Labs should feel more experimental and compact.

Recommended:

```text
[LAB / EXPERIMENT]

Experiment title

One or two sentence explanation.

[Run / Interact] [View Source] [GitHub]
```

Only show actions that actually exist.

If source is protected:

```text
View Source
```

can trigger authentication instead of exposing the source.

---

# 15. EXPERIMENT STAGE

The most important visual region of the detail page.

Use:

```text
relative
overflow-hidden
border
rounded-sm / rounded-md
```

Suggested desktop minimum visual height:

```text
520–720px
```

depending on the experiment.

Mobile:

```text
360–560px
```

Do not force every Lab into the same height.

The runtime should define its required dimensions.

---

# 16. EXPERIMENT LAYERING

Inside the experiment stage:

```text
Stage
├── stage background
├── decorative atmosphere
├── runtime
├── interaction overlays
└── controls
```

Runtime must always remain above decorative layers.

```text
background     z-0
atmosphere     z-1
runtime        z-10
controls       z-20
overlay        z-30
```

Controls must not interfere with the actual experiment.

---

# 17. DYNAMIC LAB RUNTIME MODEL

The database should not contain arbitrary executable React code.

Use a renderer registry.

Example:

```js
const labRegistry = {
  "slow-counter": SlowCounterLab,
  "magnetic-button": MagneticButtonLab,
  "text-reveal": TextRevealLab,
};
```

Database:

```js
{
  slug: "slow-counter",
  runtime: {
    type: "react",
    component: "slow-counter"
  }
}
```

Frontend maps:

```js
const LabComponent = labRegistry[lab.runtime.component];
```

Then:

```jsx
{LabComponent ? <LabComponent config={lab.config} /> : <LabUnavailable />}
```

This preserves security and keeps executable logic in source control.

---

# 18. LAB CONFIGURATION

Configuration can be stored dynamically.

Example:

```js
config: {
  duration: 1200,
  difficulty: "medium",
  accent: "teal",
  showCounter: true
}
```

The component interprets these values.

Never store:

```js
componentCode: "..."
```

as executable DB configuration.

---

# 19. SUPPORTED CONTENT TYPES

The Lab detail renderer should support:

```text
runtime
image
video
gif
gallery
code
markdown/text
```

Recommended conceptual schema:

```js
content: [
  {
    type: "runtime",
    runtime: "slow-counter"
  },
  {
    type: "video",
    src: "...",
    poster: "..."
  },
  {
    type: "image",
    src: "...",
    alt: "..."
  },
  {
    type: "gif",
    src: "...",
    alt: "..."
  },
  {
    type: "code",
    language: "jsx",
    file: "..."
  }
]
```

Render through a controlled registry:

```text
LabContentRenderer
├── RuntimeBlock
├── ImageBlock
├── VideoBlock
├── GifBlock
├── GalleryBlock
└── CodeBlock
```

---

# 20. CODE VIEWER

Code should not be returned in the public Lab API.

Public:

```text
GET /api/v1/labs/:slug
```

returns metadata/configuration/content references but no protected source.

Protected:

```text
GET /api/v1/labs/:slug/source
```

requires authenticated access.

Only then load the code viewer.

---

# 21. MONACO ISOLATION

Do not import Monaco at application root.

Use dynamic import:

```js
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react"),
  { ssr: false }
);
```

Only load it after the user requests source.

Recommended sequence:

```text
Lab detail
↓
User clicks View Source
↓
Auth check
↓
Fetch source
↓
Dynamic Monaco import
↓
Render editor
```

Do not preload Monaco on `/labs`.

---

# 22. LAB DATA MODEL

Recommended starting model:

```js
{
  id,
  slug,
  title,
  eyebrow,
  description,

  category,
  tags: [],

  status,
  featured,
  order,

  thumbnail,
  media,

  runtime: {
    type: "react",
    component: "slow-counter"
  },

  config: {},

  content: [],

  technologies: [],

  source: {
    enabled: true,
    language: "jsx"
  },

  links: {
    github: null
  },

  seo: {
    title,
    description,
    image
  },

  createdAt,
  updatedAt
}
```

Do not store React component functions in MongoDB.

---

# 23. LAB API CONTRACT

Public list:

```http
GET /api/v1/labs
```

Return lightweight metadata only.

Public detail:

```http
GET /api/v1/labs/:slug
```

Return:

- identity;
- description;
- media;
- runtime identifier;
- safe config;
- content references;
- technologies;
- links;
- SEO.

Never return protected source.

Source:

```http
GET /api/v1/labs/:slug/source
```

Authenticated only.

---

# 24. REACT QUERY

Use TanStack React Query.

Suggested keys:

```js
["labs"]

["lab", slug]

["lab", slug, "source"]
```

Do not fetch all Lab details for the index.

Index:

```text
GET /labs
```

Detail:

```text
GET /labs/:slug
```

Source:

```text
GET /labs/:slug/source
```

---

# 25. DYNAMIC CONTENT FLOW

Correct architecture:

```text
MongoDB
   ↓
Express repository
   ↓
Express service
   ↓
Express controller
   ↓
API response
   ↓
React Query
   ↓
Lab page
   ↓
LabContentRenderer
   ↓
controlled renderer / runtime registry
```

Never:

```text
React component
   ↓
MongoDB
```

Never:

```text
MongoDB
   ↓
eval()
```

Never:

```text
database string
   ↓
dangerously execute arbitrary JavaScript
```

---

# 26. THEMING

Labs must support the existing site's theme system.

Do not create a separate theme provider unless absolutely necessary.

Use semantic Lab tokens.

Dark mode should:

- preserve readable text;
- maintain visible borders;
- keep experiment controls readable;
- prevent background effects from washing out content;
- preserve media contrast.

Light mode should:

- avoid pure-white-on-white surfaces;
- keep borders visible;
- preserve technical atmosphere without excessive gray.

---

# 27. RESPONSIVE DESIGN

## Desktop

Use:

```text
large horizontal composition
large experiment stage
generous side gutters
2–3 card grid
```

## Tablet

Reduce:

```text
heading size
grid columns
stage height
horizontal spacing
```

## Mobile

Prioritize:

```text
content order
readability
touch targets
runtime usability
```

Mobile Lab detail order:

```text
Back
↓
Eyebrow
↓
Title
↓
Description
↓
Actions
↓
Experiment
↓
Supporting content
↓
Source
```

Do not place critical controls outside the viewport.

Minimum touch target:

```text
~44px
```

---

# 28. MOBILE EXPERIMENT RULES

Experiments must be usable on touch devices.

Do not depend only on:

```text
hover
mousemove
pointer position
```

Provide touch-safe behavior.

For cursor-driven experiments:

```text
pointer/touch fallback
```

For hover-only visual states:

```text
tap/focus fallback
```

---

# 29. MOTION SYSTEM

Use the existing Motion / motion/react stack.

Do not add a second animation library just for Labs.

Recommended constants:

```js
EASE
DURATION
DELAY
```

Motion should communicate:

- page entry;
- content hierarchy;
- media reveal;
- interaction feedback;
- state transitions.

Avoid:

- perpetual decorative motion;
- excessive parallax;
- animation on every element;
- motion that delays interaction.

---

# 30. REDUCED MOTION

All non-essential Lab motion must respect:

```text
prefers-reduced-motion
```

When reduced motion is enabled:

```text
remove/reduce parallax
remove continuous ambient animation
reduce entrance transforms
preserve opacity/instant transitions where appropriate
```

The experiment itself may require motion; provide a sensible reduced-motion behavior where possible.

---

# 31. ERROR STATES

Required:

```text
Lab not found
Lab unavailable
Runtime unavailable
Media failed
Source unavailable
Authentication required
API failure
```

Never leave a blank stage.

Example:

```text
Experiment unavailable

This Lab could not be loaded right now.
```

---

# 32. LOADING STATES

Index:

```text
skeleton cards
```

Detail:

```text
identity skeleton
stage skeleton
content skeleton
```

Do not use a global blocking loader for the entire application.

---

# 33. NOT FOUND

For:

```text
/labs/unknown-slug
```

use the existing Next.js not-found mechanism.

Do not render an application error page as a successful response.

---

# 34. ACCESSIBILITY

Required:

- semantic headings;
- visible focus states;
- keyboard-accessible controls;
- descriptive image alt text;
- captions/transcripts where applicable;
- `aria-label` only when visual labels are insufficient;
- no color-only information;
- sufficient contrast;
- keyboard access to source actions.

---

# 35. PERFORMANCE BOUNDARIES

## `/`

Must not load:

```text
Monaco
Lab runtime registry
Lab source
Lab video
Lab experiment bundles
```

unless a shared dependency is genuinely required.

## `/projects/[slug]`

Must not load:

```text
Lab runtime
Monaco
Lab source
```

## `/labs`

Must not load:

```text
Monaco
all runtime implementations
all Lab source
all large media
```

## `/labs/[slug]`

May load:

```text
selected Lab runtime
selected media
```

Monaco only after source request.

---

# 36. BUNDLE ISOLATION

If a Lab runtime is heavy, dynamically import it.

Example:

```js
const SlowCounterLab = dynamic(
  () => import("@/labs/runtimes/SlowCounterLab"),
  { ssr: false }
);
```

Prefer one runtime per Lab when the dependency cost is significant.

Do not create:

```text
labs/all-runtimes.js
```

that imports every experiment into `/labs`.

---

# 37. RECOMMENDED FRONTEND STRUCTURE

Adapt to the existing repository rather than forcing a rewrite.

Possible structure:

```text
src/
├── app/
│   └── labs/
│       ├── page.jsx
│       └── [slug]/
│           └── page.jsx
│
├── components/
│   └── labs/
│       ├── LabsHeader.jsx
│       ├── LabCard.jsx
│       ├── LabGrid.jsx
│       ├── LabDetailHeader.jsx
│       ├── LabStage.jsx
│       ├── LabContentRenderer.jsx
│       ├── LabMedia.jsx
│       ├── LabActions.jsx
│       ├── LabSourceViewer.jsx
│       ├── LabSkeleton.jsx
│       ├── LabError.jsx
│       └── LabNotFound.jsx
│
├── labs/
│   ├── registry/
│   │   └── labRegistry.js
│   └── runtimes/
│       ├── SlowCounterLab.jsx
│       └── ...
│
├── lib/
│   ├── api/
│   │   └── labApi.js
│   └── query/
│       └── queryKeys.js
│
└── hooks/
    └── useLabs.js
```

The actual repository structure has priority.

---

# 38. IMPLEMENTATION PHASES

## PHASE 0 — AUDIT ONLY

Before modifying code, inspect:

- current app structure;
- portfolio layout;
- global theme;
- Tailwind configuration;
- typography;
- spacing;
- Motion utilities;
- Next.js version;
- existing API layer;
- React Query setup;
- media utilities;
- existing project detail architecture;
- existing loading/error/not-found patterns.

### Done

- [ ] Existing portfolio routes identified.
- [ ] Existing theme tokens identified.
- [ ] Existing reusable layout components identified.
- [ ] No portfolio component changed.
- [ ] Implementation plan mapped to existing architecture.

---

# PHASE 1 — LAB ROUTE SHELL

Create:

```text
/labs
/labs/[slug]
```

Only build layout shells.

### `/labs`

Implement:

```text
LabsHeader
LabGrid placeholder
```

### `/labs/[slug]`

Implement:

```text
LabDetailHeader
LabStage placeholder
LabContent placeholder
```

### Done

- [ ] Routes resolve.
- [ ] Existing portfolio works exactly as before.
- [ ] Desktop works.
- [ ] Tablet works.
- [ ] Mobile works.
- [ ] No Lab runtime loaded yet.

---

# PHASE 2 — LAB VISUAL SYSTEM

Implement Lab-only:

- semantic color tokens;
- spacing;
- typography;
- container;
- borders;
- radius;
- layer utilities;
- responsive rules.

### Done

- [ ] Light theme readable.
- [ ] Dark theme readable.
- [ ] No global portfolio token regression.
- [ ] Layer stack is predictable.
- [ ] No excessive glass effects.
- [ ] Typography hierarchy is clear.
- [ ] Mobile spacing is intentional.

---

# PHASE 3 — STATIC LAB CARD DESIGN

Create one mocked Lab object.

Example:

```js
{
  slug: "slow-counter",
  title: "Slow Counter",
  description: "An interaction experiment...",
  category: "Interaction",
  tags: ["Motion", "React"],
  media: {
    type: "image",
    src: "/labs/slow-counter/poster.webp",
    alt: "Slow counter experiment preview"
  }
}
```

Build:

```text
LabCard
LabGrid
```

### Done

- [ ] Card works with media.
- [ ] Card works without media.
- [ ] Long title does not break layout.
- [ ] Long description does not break layout.
- [ ] Mobile card is readable.
- [ ] Hover/focus state works.
- [ ] No large media preloading across all cards.

---

# PHASE 4 — LAB DETAIL MEDIA SYSTEM

Implement:

```text
LabMedia
ImageBlock
VideoBlock
GifBlock
```

Use controlled content rendering.

### Done

- [ ] Image renders correctly.
- [ ] Video renders correctly.
- [ ] GIF renders correctly.
- [ ] Missing media has fallback.
- [ ] Media never overflows.
- [ ] Video uses poster where available.
- [ ] Video does not aggressively preload.
- [ ] Mobile media remains usable.

---

# PHASE 5 — DYNAMIC RUNTIME REGISTRY

Create:

```text
labRegistry
```

Example:

```js
export const labRegistry = {
  "slow-counter": () =>
    import("@/labs/runtimes/SlowCounterLab")
};
```

Only resolve the selected runtime.

### Done

- [ ] Runtime is selected by safe identifier.
- [ ] No `eval`.
- [ ] No arbitrary DB JavaScript execution.
- [ ] Unknown runtime shows fallback.
- [ ] Runtime can receive safe configuration.
- [ ] Heavy runtime can be dynamically imported.

---

# PHASE 6 — DYNAMIC CONTENT RENDERER

Create:

```text
LabContentRenderer
```

Support:

```text
runtime
image
video
gif
gallery
code/reference
```

### Done

- [ ] Renderer is type-driven.
- [ ] Unknown type fails gracefully.
- [ ] Missing required fields fail gracefully.
- [ ] Runtime remains isolated.
- [ ] Media remains lazy/optimized.
- [ ] Page does not depend on one fixed Lab layout.

---

# PHASE 7 — API + REACT QUERY

Connect:

```text
GET /api/v1/labs
GET /api/v1/labs/:slug
```

React Query keys:

```text
["labs"]
["lab", slug]
```

### Done

- [ ] No component directly calls MongoDB.
- [ ] API layer is centralized.
- [ ] Query keys centralized.
- [ ] List payload is lightweight.
- [ ] Detail payload contains only required detail data.
- [ ] Caching/stale time is intentional.
- [ ] Error state works.
- [ ] Loading state works.

---

# PHASE 8 — SOURCE ACCESS

Implement:

```text
GET /api/v1/labs/:slug/source
```

Require authentication.

Flow:

```text
Click View Source
↓
Check auth
↓
Request source
↓
Load Monaco dynamically
↓
Render code
```

### Done

- [ ] Anonymous user cannot retrieve protected source.
- [ ] Public Lab API does not expose source.
- [ ] Monaco absent from `/labs`.
- [ ] Monaco absent from portfolio routes.
- [ ] Monaco loads only when source is requested.
- [ ] Unauthorized state is clear.
- [ ] Code copy action works if enabled.

---

# PHASE 9 — MOTION + MICROINTERACTIONS

Add Motion gradually.

Order:

1. page reveal;
2. card reveal;
3. media reveal;
4. hover/focus;
5. stage interaction;
6. source viewer transition.

### Done

- [ ] Motion does not block interaction.
- [ ] Reduced motion supported.
- [ ] No continuous expensive animation.
- [ ] Animation durations are consistent.
- [ ] Typography remains crisp.
- [ ] No transform-induced blur on important text.

---

# PHASE 10 — RESPONSIVE HARDENING

Test:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px+
```

Verify:

- header;
- typography;
- card grid;
- experiment stage;
- controls;
- media;
- code viewer;
- overflow;
- touch targets.

### Done

- [ ] No horizontal overflow.
- [ ] No clipped critical controls.
- [ ] No unreadable typography.
- [ ] No broken media.
- [ ] No mobile-only dead interaction.
- [ ] Touch targets are usable.

---

# PHASE 11 — PERFORMANCE AUDIT

Measure:

```text
/labs
/labs/[slug]
/
/projects/[slug]
```

Verify bundle boundaries.

### Must be true

```text
Portfolio
  ├── no Monaco
  ├── no Lab runtime
  └── no Lab source

Labs index
  ├── no Monaco
  ├── no all-runtime bundle
  └── no all-source payload

Lab detail
  └── selected runtime only
```

### Done

- [ ] Network panel verified.
- [ ] Bundle analyzer verified where available.
- [ ] Images optimized.
- [ ] Video lazy/preload strategy verified.
- [ ] No N+1 Lab requests.
- [ ] No unnecessary refetch loops.

---

# PHASE 12 — SEO + ACCESSIBILITY

Implement:

- metadata;
- OpenGraph;
- dynamic title;
- description;
- not-found;
- semantic headings;
- keyboard navigation;
- focus states.

### Done

- [ ] `/labs` has metadata.
- [ ] `/labs/[slug]` has dynamic metadata.
- [ ] Invalid slug returns proper not-found.
- [ ] Images have alt.
- [ ] Controls are keyboard accessible.
- [ ] Contrast is acceptable.

---

# PHASE 13 — ANALYTICS FOUNDATION

Optional but architecture-ready.

Track:

```text
VIEW
INTERACTION
CODE_VIEW
CODE_COPY
```

Schema:

```js
{
  labId,
  userId: null,
  eventType,
  sessionId,
  metadata,
  createdAt
}
```

Do not block the Lab experience on analytics.

### Done

- [ ] Analytics failure does not break Lab.
- [ ] Events are lightweight.
- [ ] No sensitive data is recorded.
- [ ] User identity is nullable where appropriate.

---

# PHASE 14 — ADMIN / FUTURE DYNAMIC UPLOAD

Only after public Lab rendering is stable.

Admin can eventually create/update:

```text
title
description
media
runtime identifier
config
content blocks
technologies
status
SEO
```

Do not allow admin UI to execute arbitrary code.

For new runtime code:

```text
Developer creates runtime in repository
↓
Registers runtime
↓
Admin selects runtime identifier
↓
DB stores identifier/config
```

For media:

```text
Admin upload
↓
Media provider/object storage
↓
DB stores metadata/reference
```

Never store large media binaries directly in MongoDB.

---

# 39. MEDIA UPLOAD CONTRACT

Recommended abstraction:

```js
{
  provider: "cloud-storage",
  url: "...",
  publicId: "...",
  type: "image",
  width: 1600,
  height: 900,
  size: 123456,
  alt: "..."
}
```

For video:

```js
{
  provider: "cloud-storage",
  url: "...",
  poster: "...",
  type: "video",
  width: 1920,
  height: 1080
}
```

The actual media provider can remain configurable.

---

# 40. SAFE MIGRATION RULES

Every phase must be independently testable.

Use this sequence:

```text
Add
↓
Verify
↓
Integrate
↓
Measure
↓
Proceed
```

Never:

```text
Rewrite entire app
↓
Hope it works
```

During migration:

- preserve existing routes;
- preserve existing visual behavior;
- preserve existing project data;
- preserve existing Motion behavior;
- preserve existing theme behavior;
- avoid unrelated cleanup;
- avoid mass renaming;
- avoid dependency replacement.

---

# 41. ROLLBACK STRATEGY

Each phase should be revertible.

Recommended Git strategy:

```text
feat/labs-shell
feat/labs-design-system
feat/labs-media
feat/labs-runtime
feat/labs-api
feat/labs-source
feat/labs-motion
feat/labs-performance
```

Prefer small commits.

---

# 42. DEFINITION OF DONE — FINAL

## Architecture

- [ ] Labs is a separate bounded context.
- [ ] Portfolio remains stable.
- [ ] MongoDB is accessed only by backend.
- [ ] React Query talks to API only.
- [ ] Runtime code remains in source control.

## UI

- [ ] Labs has its own layout system.
- [ ] Spacing is consistent.
- [ ] Typography is intentional.
- [ ] Theme tokens are semantic.
- [ ] Layering is predictable.
- [ ] Mobile layout is deliberate.
- [ ] No excessive rounded/pill UI.

## Dynamic content

- [ ] Labs listing is dynamic.
- [ ] Lab detail is dynamic.
- [ ] Image works.
- [ ] Video works.
- [ ] GIF works.
- [ ] Runtime component works.
- [ ] Mixed content works.
- [ ] Missing content fails gracefully.

## Source

- [ ] Source is not public.
- [ ] Authentication protects source.
- [ ] Monaco is dynamically loaded.
- [ ] Monaco is not part of portfolio bundles.

## Performance

- [ ] Lab dependencies are isolated.
- [ ] Portfolio does not load Lab runtime.
- [ ] Lab index does not load all runtimes.
- [ ] Media is optimized.
- [ ] Video is lazy/non-aggressive.
- [ ] No N+1 requests.

## Motion

- [ ] Motion uses existing motion/react stack.
- [ ] Motion is subtle and purposeful.
- [ ] Reduced motion is respected.
- [ ] Important typography remains crisp.

## Safety

- [ ] No eval.
- [ ] No arbitrary executable DB code.
- [ ] Runtime identifiers are allowlisted.
- [ ] API validates input.
- [ ] Source endpoint is authenticated/authorized.
- [ ] Admin upload cannot execute arbitrary code.

---

# 43. IMPLEMENTATION AGENT RULE

When implementing this specification, behave as a senior Next.js + React + Tailwind + Motion engineer.

Before editing:

1. inspect the repository;
2. identify existing patterns;
3. reuse existing primitives;
4. avoid duplicate systems;
5. make the smallest safe change.

For every phase report:

```text
PHASE
Files changed
Why changed
UI changes
Data/API changes
Performance impact
Security impact
Tests performed
Definition of Done
```

If an existing project convention conflicts with this document, preserve the existing working convention unless changing it is necessary for the Lab requirement.

**Primary success condition:**

> Add a dynamic, premium, responsive, media-rich Labs system without breaking the already-complete portfolio or loading Lab complexity into portfolio routes.
