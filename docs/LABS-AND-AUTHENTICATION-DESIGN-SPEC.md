# Labs & Authentication — Product and UX Design Specification

**Document:** `docs/LABS-AND-AUTHENTICATION-DESIGN-SPEC.md`  
**Version:** 2.0
**Status:** Labs public experience and authentication/source-management implementation are on `feat/labs-platform-integration`; Atlas, Vercel environment, end-to-end and browser QA gates remain.
**Updated on:** 2026-11-04  
**Scope:** Labs listing, experiment detail/workspace, protected source access, Labs authentication UX, repository-aligned stack, module boundaries, hooks, components and state ownership  
**Companion repository documents:** `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/API-CONTRACTS.md`, `docs/PROJECT-STRUCTURE.md`, `docs/IMPLEMENTATION-PLAN.md`, and `docs/THREAT-MODEL.md`

---

## 0. How to Read and Apply This Document

This file records the product and UX decisions made for Labs and its authentication experience. It is intended to guide a human developer or AI coding agent without allowing either to invent missing requirements.

### 0.1 Decision status labels

| Status | Meaning | Required handling |
|---|---|---|
| **LOCKED — USER SELECTED** | The user explicitly selected or approved this decision. | Implement as written. Do not reopen or silently alter it. |
| **LOCKED — RECOMMENDATION ADOPTED** | The user later instructed that remaining recommendations should be locked. This decision adopts the recommendation that had already been presented. | Treat as locked unless the user explicitly changes it. |
| **OPEN — DO NOT ASSUME** | The discussion did not provide enough information, and no recommendation was approved or adopted. | Do not choose a value, provider, policy, or implementation by guessing. Ask for a decision when the work reaches this dependency. |
| **DEFERRED** | Intentionally outside the current Labs-first scope. | Do not implement as part of the current work. |
| **REFERENCE / INHERITED CONSTRAINT** | A technical or architectural constraint comes from the existing portfolio architecture specification. | Preserve it unless the user explicitly changes the architecture. |
| **ILLUSTRATIVE ONLY** | Example copy, data, dimensions, or UI shown to explain a direction, not a final content decision. | Do not treat the example as production content or a fixed data value. |

### 0.2 Instructions for AI agents and developers

1. Read this document before designing or implementing Labs or its authentication screens.
2. Read the companion architecture reference before changing repository structure, API boundaries, database models, data flow, or infrastructure.
3. This document remains the product/UX source of truth. The user explicitly authorized implementation on `feat/labs-platform-integration`; feature and bug-fix work must land on that integration branch. Do not merge into `main`, deploy Production, or run destructive data migrations without the corresponding release approval.
4. Do not replace, redesign, migrate, or regress the existing portfolio UI, interactions, animations, responsive behavior, SEO, or project-detail experience.
5. Keep the existing application in JavaScript. Do not introduce TypeScript or substitute the approved stack without explicit approval.
6. Do not invent an authentication provider, social provider, auth library, email service, session lifetime, password policy, authorization tier, route path, API schema, database schema, or Cloudinary upload policy where this document marks the item OPEN.
7. Do not interpret an example or illustrative wireframe as final production copy or content unless it is explicitly marked LOCKED.
8. Do not add Labs experiments to `portfolio.projects`. Labs is a separate domain.
9. Do not expose source code in public page data, listing payloads, server-rendered HTML, public caches, or anonymous API responses. Do not rely on CSS to hide source.
10. Do not require authentication for public Labs browsing or public experiment demos. Authentication and authorization are required only for protected functionality such as source access.
11. Keep the implementation defensive: absent optional media, absent controls, empty categories, missing optional content, or unavailable previews must not break the page.
12. Prefer the existing design tokens, typography, component conventions, Motion conventions, and responsive rules. Do not create a competing visual system for Labs or authentication.
13. If a new requirement conflicts with an existing architecture specification, do not silently resolve the conflict. Identify it, explain the impact, and obtain approval.
14. When a change is approved later, update this document and its decision/change log before implementing the change.

### 0.3 Decision hierarchy and known supersession

- docs/PRD.md owns product goals, functional requirements, user capabilities and acceptance criteria.
- docs/ARCHITECTURE.md owns the approved runtime boundaries, server/client separation, backend approach, security responsibilities and request flows.
- docs/API-CONTRACTS.md owns the HTTP endpoint families, request/response contracts, validation and error conventions.
- docs/PROJECT-STRUCTURE.md is the generic proposed module structure. Sections 22–29 of this document adapt those responsibilities to the actual repository tree inspected on 2026-11-02; they do not authorize a broad restructure.
- This document owns the detailed Labs page composition, interaction treatment, authentication UX and Labs-specific implementation guidance. It does not silently replace PRD capabilities or architecture/security contracts.
- If older examples use the singular /lab route while this document specifies /labs, use /labs as the approved public UX route. Update related API/PRD references before implementation rather than creating both routes.
- The public-demo decision in this document is specific: guests may use experiments explicitly published as public demos. This does not authorize arbitrary stored/admin-authored JavaScript to execute in the main application. Any untrusted or restricted preview still requires the separately reviewed isolation boundary in docs/ARCHITECTURE.md and docs/THREAT-MODEL.md.
- The PRD requirement for email/password and Google sign-in remains in force. Better Auth with its MongoDB adapter is now the selected authentication implementation. Google OAuth credentials remain deployment configuration; the Google action is shown only when configured. GitHub sign-in is not selected.
- The user explicitly changed the work order: **complete Labs design/implementation before beginning CMS work**. Any older roadmap ordering that puts Admin/CMS ahead of Labs must not override this priority.
- An earlier decision proposed navigating directly from account creation to the Email Verification screen. That navigation was **superseded** when the user approved privacy-safe generic registration handling and a dedicated generic registration confirmation. The current Sign-up result is the generic confirmation state, not a visibly different state that reveals whether the email was already registered.
- The user instructed that remaining recommendations should be finalized. Accordingly, the previously recommended treatments listed as **LOCKED — RECOMMENDATION ADOPTED** below are now part of this baseline. Items with no recommendation or insufficient information remain OPEN.

---

## 1. Product Scope and Non-Goals

### 1.1 Purpose of Labs

Labs is a creative frontend experimentation space within the portfolio. It showcases focused experiments in motion, interaction, CSS, interface behavior, and creative coding.

Labs is not:

- A replacement for the professional Projects section.
- A generic dashboard.
- A long-form documentation archive.
- A public source-code repository.
- A requirement to sign in before browsing or using public demos.
- A CMS.

### 1.2 Projects and Labs remain separate domains

**Projects** demonstrate professional work and may contain case studies, contributions, engineering stories, showcases, and reflections.

**Labs** contain experiments, interactive demos, concise metadata, experiment-specific configuration, protected source access, and potentially separate analytics.

Do not put Labs records inside `portfolio.projects`, and do not flatten project case-study content into the Labs model.

### 1.3 Current priority

1. Finalize Labs product and UX design.
2. Implement and validate the Labs experience on the approved integration branch.
3. Complete the Labs authentication screens and required authentication behavior as part of the Labs scope.
4. Only after Labs is complete, begin CMS/Admin design and implementation.

**CMS/Admin is DEFERRED until Labs is complete.** Do not broaden the current scope into a CMS build.

### 1.4 Preserve the current portfolio

Changes for Labs must remain isolated and must not unnecessarily affect:

- The homepage and existing portfolio sections.
- Existing project listing and project-detail pages.
- Existing data structures and project stories.
- Existing visual design, typography, color tokens, responsive behavior, Motion, or Lenis behavior.
- Existing SEO metadata and route performance.

Do not perform a wholesale rewrite or migrate all portfolio content as a side effect of Labs work.

---

## 2. Technical and Architectural Guardrails

These are inherited from the companion architecture reference unless stated otherwise.

### 2.1 Existing and approved stack

The repository's committed package manifest and the architecture documents establish this baseline:

- Next.js App Router and React 19, using JavaScript/JSX. TypeScript is not approved.
- Tailwind CSS v4 for styling, reusing current design tokens and utility conventions.
- Motion from motion/react for interactions and animation. Reuse existing motion helpers and reduced-motion behavior.
- Lenis is already part of the application. Do not create a second smooth-scroll system or change global scroll behavior for Labs.
- next-themes is the existing theme provider. Labs and authentication must reuse the current light/dark theme system.
- MongoDB with Mongoose for application persistence. Database access remains server-only.
- Better Auth with `@better-auth/mongo-adapter` is the selected Labs authentication implementation. It uses the native MongoDB driver against the same configured Atlas database; the Better Auth adapter and Mongoose repository connection remain server-only.
- Cloudinary for media storage/delivery. The API secret remains server-only.
- Vercel for the existing Next.js application deployment.
- TanStack Query is approved for client-side server-state cases that benefit from query caching, mutation lifecycle, invalidation or polling. It is not installed as a direct dependency in the inspected package.json and must not be assumed to exist. Server Components remain the default for safe initial public page data.
- The existing design system and UI packages are reused. Do not add a competing component library.

The inspected package.json declares these relevant versions/ranges on this branch: Next.js ^16.4.3, React/React DOM 19.2.8, Tailwind CSS ^4, Motion ^13.2.0, Lenis ^1.3.26, next-themes ^0.4.6, Mongoose ^9.11.4, Cloudinary ^2.11.0, lucide-react ^1.41.0, react-icons ^5.7.0, clsx ^2.1.1, tailwind-merge ^3.6.0, and Three.js ^0.187.0. Treat package.json/package-lock.json as the exact dependency authority; this prose is a snapshot and must be rechecked before implementation.

Additional dependency constraints:

- Three.js is available but must be imported only by an experiment that actually needs 3D; it must not enter the Labs listing or homepage critical path.
- Nodemailer exists for the current contact route. Do not assume it is the approved transactional email service for authentication or Labs account mail.
- Monaco is not installed in the inspected package manifest. The source-viewer/editor package and version remain an explicit dependency decision; any editor must be dynamically imported only after server-side authorization.
- React Hook Form and @tanstack/react-query are not direct dependencies in the inspected package manifest. Do not write code assuming either is installed.
- The inspected package manifest does not declare @reduxjs/toolkit, even though current files under src/app/store import it. See the state-ownership notes in Section 27 before reusing that store.
- No new library may be added simply because it is common in AI-generated examples. First state the requirement, compare the existing stack and request approval when a new dependency is needed.

Styling rule: use Tailwind CSS v4 utilities and the existing theme tokens. Do not add a new custom CSS system or global selector layer for Labs. Any exception must be narrowly justified by a browser capability that cannot be expressed with the current utility/token system and must not change existing pages.

### 2.2 Architectural separation

The approved default is a **Next.js-native backend**, not a separate Express application.

Public page flow:

Server Component / App Router page → server-only Labs query or use case → repository/data-access module → MongoDB → explicitly shaped public DTO → rendered page.

Protected or mutation flow:

Client interaction or form → Server Action or Route Handler (only where an HTTP API is needed) → resolve server actor/session → validate input → authorize the actor and resource → domain service/use case → repository → MongoDB → safe result.

Rules:

- React components never connect directly to MongoDB or call Cloudinary Admin APIs.
- Server-only services/repositories must not be imported by Client Components.
- Keep transport parsing/status mapping in Route Handlers or Server Actions; keep business invariants in service/use-case modules.
- Repositories own database queries. Hooks do not contain MongoDB queries.
- Prefer Server Components for SEO-oriented public Labs listing/detail data.
- Use Client Components only where interaction, form state, demo controls, browser APIs, fullscreen or motion requires them.
- TanStack Query hooks, if later required and installed, call approved API functions; they do not replace server authorization or database layers.
- Do not create Express controllers, Express middleware or a second server by default. Express is conditional and requires a written architecture decision plus explicit approval.
- Never put the whole route tree behind a Client Component just to simplify data fetching.

### 2.3 Labs data and public/private boundaries

The companion architecture proposes a separate Labs domain and an illustrative Lab model containing concepts such as:

- `slug`, `title`, `description`, `category`
- `tags`, `technologies`
- publication/status and ordering metadata
- featured metadata
- thumbnail and preview references
- demo configuration
- source-access policy
- source-code data
- media references
- SEO metadata
- timestamps

This is a **conceptual model reference**, not a final schema. Do not finalize field names, field types, indexes, validators, API response shapes, or database relationships solely from the illustrative example.

Public Labs responses may contain only the metadata required for public listing/detail rendering and the public demo. They must not contain source code or private source metadata.

### 2.4 Source-code protection

The required security boundary is:

1. Public request returns public experiment metadata only.
2. A source request is made only when the user opens the protected source experience.
3. The server authenticates the request.
4. The server separately authorizes the account for that source.
5. Only after both checks pass may source content be returned.

Never:

- Include source code in the public `/labs` listing payload.
- Include source code in an anonymous Lab detail payload.
- Render source into HTML and hide it with CSS.
- Put source code in public caches or static output.
- Treat successful sign-in as proof of source authorization.

The architecture reference identifies an endpoint concept such as `GET /api/v1/labs/:slug/source`. Treat the exact route and API contract as an architecture reference until the API design is explicitly finalized.

### 2.5 Performance isolation

- `/` must not load Monaco, Lab source, Lab runtime, Lab video, or unrelated Lab-heavy dependencies.
- Existing project pages must not load Monaco or Lab-only dependencies.
- `/labs` must not load Monaco, all source files, all experiment runtimes, all videos, or all GIFs.
- `/labs` loads lightweight experiment metadata and optimized thumbnails/posters only.
- `/labs/[slug]` loads only the selected experiment runtime.
- Heavy dependencies are dynamically imported at the feature boundary.
- The protected source viewer uses the lightweight text viewer/editor implementation. No Monaco/CodeMirror dependency is installed; do not add one without an approved dependency decision.
- Media is lazy-loaded where appropriate. Videos should use a poster first, avoid unnecessary preload, and not autoplay unless the individual experiment explicitly requires it.
- Avoid layout shift by reserving media/canvas dimensions and providing stable loading placeholders.
- Public metadata may be cached appropriately; protected source must never be publicly cached.

### 2.6 Media storage

- Do not store raw image/video binaries or large base64 payloads in MongoDB.
- Store media references/metadata in MongoDB; store actual media with the configured media provider.
- Images/video/posters are optional. Missing media must not create broken-image icons or break a page.
- Use responsive optimized media and dimensions/aspect ratios to prevent layout shift.
- Exact Cloudinary transformations, signed-upload workflow, folder naming, and asset schema are OPEN unless already specified elsewhere in the companion architecture.

### 2.7 Do not store presentation or executable logic in the database

MongoDB may describe structured content or a validated demo configuration, but frontend rendering and component implementation remain in application code.

Do not store executable arbitrary JavaScript or React component implementations in Labs content records as a substitute for a reviewed runtime architecture. Keep the experiment runtime loading mechanism explicit and code-owned.

---

## 3. Labs Landing Page — `/labs`

### 3.1 Page purpose and overall composition

The Labs landing page should communicate an editorial creative-experimentation identity and make it easy to discover experiments.

The selected direction is a **hybrid showcase**: a short editorial introduction, one featured experiment, and a structured experiment gallery.

The intended section sequence is:

1. Labs introduction / hero.
2. Featured experiment.
3. Category navigation and experiment gallery.
4. Short closing line or transition into the existing footer.

The exact hero heading, hero paragraph, gallery heading, closing copy, and final experiment content are not locked. Copy samples used during design (for example, “Experiments beyond the ordinary.” or “Experiments worth exploring.”) are **ILLUSTRATIVE ONLY**.

### 3.2 Category system

The following four primary categories are **LOCKED — USER SELECTED**:

| Canonical category | Short navigation label | Typical experiment focus |
|---|---|---|
| **Motion & Animation** | Motion | Parallax, text reveals, horizontal scroll, SVG animation, transitions, scroll-driven motion. |
| **CSS Experiments** | CSS | Masks, gradients, clipping, creative layouts, hover effects, and visual styling. |
| **Interface Interactions** | Interactions | Magnetic buttons, cursor interactions, draggable elements, tabs, and interactive components. |
| **Creative Coding** | Creative Coding | Particle systems, Canvas experiments, generative artwork, and visual simulations. |

Category rules:

- Every experiment has one primary category.
- Additional descriptive tags may be assigned independently.
- Technologies are separate metadata, not categories.
- Technology labels may include React, Next.js, JavaScript, Tailwind CSS, Motion, GSAP, Lenis, and others actually used by the experiment.
- Tags may include SVG, Parallax, Typography, Canvas, and similar descriptive labels.
- The default filter is **All**.
- Do not show a category with no published experiments.
- Category matching is based on the experiment's core purpose, not every technology used.

### 3.3 Category navigation appearance and behavior

- Editorial text navigation; do not render category pills, filled backgrounds, boxed tabs, or bordered button cards.
- Active category uses primary foreground and a persistent underline.
- Underline uses the existing accent token and a 2px thickness.
- Inactive categories use secondary foreground.
- Hover may subtly emphasize foreground; active underline remains visible.
- Use semantic, keyboard-operable controls and visible focus styles.
- Reduced-motion preferences must be respected.
- Desktop: keep categories in one row when they fit.
- Mobile: allow horizontal scrolling within the category navigation only; do not create page-level horizontal overflow.
- Selecting a category resets the visible count to the first six matching experiments.
- Selecting All resets the list to the first six experiments across all published categories.

### 3.4 Featured experiment layout

The featured experiment uses a **40:60 desktop split**:

- Left: editorial text/content, approximately 40%.
- Right: visual preview, approximately 60%.
- Text is left-aligned and vertically centered against the preview.
- Use the existing page container and spacing system.
- A 48px column gap and 64–80px section spacing were proposed as starting values; treat these as layout guidance, not hard-coded values if the existing container/system calls for a responsive adjustment.
- On mobile, content comes first and the visual follows.
- At tablet widths, stack when the split no longer has enough room.

Featured content hierarchy is **LOCKED**:

1. Eyebrow: `FEATURED EXPERIMENT`.
2. Category label.
3. Experiment title.
4. Short description (maximum two sentences).
5. `BUILT WITH` label.
6. Inline technology names separated by middle dots; do not use technology chips/pills.
7. One CTA: `Explore experiment ↗`.

The sample experiment name `Scroll-driven Text Reveal`, sample category `MOTION & INTERACTION`, and sample technology list used in the design conversation are **ILLUSTRATIVE ONLY**. They are not locked production content.

### 3.5 Featured preview frame

- Contained visual frame.
- 4:3 aspect ratio.
- No browser chrome, toolbar, fake browser header, or decorative controls.
- Artwork/media is edge-to-edge inside the frame.
- Caption, if needed, sits outside the frame.
- Use one subtle border and the portfolio's restrained radius.
- No default shadow.
- No inner padding around artwork.
- Preview is a static optimized image/poster on the listing page; do not initialize the actual experiment runtime there.
- Hover may scale media from `1` to `1.01` and subtly emphasize the frame border; frame dimensions must not change.
- Clip overflow to the frame; no layout shift.
- Do not independently animate the artwork on hover.
- Reduced motion disables the scale effect.
- Keyboard focus indication must not depend on hover.
- Touch must not depend on hover to reveal content.

### 3.6 Experiment gallery layout

- Use a uniform editorial grid; do not use masonry or mixed-size cards.
- Desktop: three columns.
- Tablet: two columns.
- Mobile: one column.
- Initial visible count: six experiments at all viewport widths.
- `Load more` appends the next six matching experiments without removing/reordering the existing visible cards.
- Display a count such as `Showing 6 of 18 experiments`.
- After loading more, update the count (for example, `Showing 12 of 18 experiments`).
- Hide Load More when all matching experiments are visible.
- Do not jump the page to the top after appending.
- When a category changes, reset to the first six matching items.
- The count must refer to the active filter's total, not the all-category total.
- Whether the first six / next six are obtained by client-side slicing or API pagination is an implementation/API decision, not locked here.

### 3.7 Gallery card structure and visual treatment

Each card is an open editorial card, not a permanent outer card panel.

Structure:

1. Dominant thumbnail (4:3).
2. Category label.
3. Experiment title.
4. Short description, capped at approximately two or three lines.
5. Inline technologies, with a maximum of three technology labels shown on the listing card. Additional technologies belong on the experiment detail page.

Visual rules:

- No permanent outer card border/background panel.
- Thumbnail may use a subtle boundary only where useful.
- Thumbnail fit depends on artwork: `cover` when crop is intended; `contain` when the full artwork must remain visible.
- Provide a designed fallback if a thumbnail is missing or fails.
- Do not autoplay video, GIFs, or experiment runtimes in the gallery.
- No image overlay controls, nested cards, decorative controls, or nested interactive controls.
- The entire card is one semantic link to `/labs/[slug]`.
- Do not nest other buttons or links inside the card link.
- Accessible name should be based on the experiment title and useful context.

Hover and focus:

- Card translates upward by approximately `-4px`.
- Thumbnail scales to approximately `1.02` within its clipped frame.
- Use subtle hover elevation/shadow only as appropriate to existing portfolio conventions.
- An arrow may translate approximately `3px`.
- Do not scale the whole card.
- Do not cause layout movement or reflow.
- Use existing Motion conventions; do not introduce another animation system.
- Reduced motion removes movement effects.
- Keyboard focus is clearly visible.
- Touch users can access all information without hover.

### 3.8 Landing page items not locked

- Exact hero headline and supporting paragraph.
- Exact gallery heading and description.
- Exact closing sentence.
- Identity and content of the featured experiment.
- Exact experiment list, thumbnail artwork, copy, and order.
- Exact card dimensions/gaps beyond the responsive grid and 4:3 media ratio.
- Final client-side vs API pagination strategy.

Do not invent production copy or experiment metadata to fill these gaps.

---

## 4. Experiment Detail Page — `/labs/[slug]`

### 4.1 Page purpose and content order

The experiment detail page is **interactive-first, not documentation-first**. Visitors should encounter the experiment, not a long technical article.

Intended order:

1. Introduction: category, experiment title, short description, and inline technologies.
2. Interactive demo/workspace.
3. Contextual controls/configuration, only when the experiment has useful controls.
4. Minimal explanation (for example, “How it works” or “About this experiment”).
5. Protected source access section.
6. Related experiments.

The exact title/description, content for a real experiment, and final section copy are authored per experiment; sample Magnetic Interaction/Pointer Calculation wording from the design conversation is illustrative only.

### 4.2 Introduction

- Show category, concise title, a one- or two-sentence description, and inline technology names.
- Avoid excessive metadata.
- Do not repeat the same description elsewhere on the page.
- Keep the visual hierarchy consistent with existing portfolio typography.

### 4.3 Workspace split

The selected desktop workspace arrangement is **70:30**:

- Experiment demo/canvas: approximately 70% of the workspace.
- Controls panel: approximately 30%, with a maximum width around 320px and a minimum target around 260px where space permits.
- The demo receives remaining available width.
- If the experiment has no useful controls, hide the controls panel entirely and let the demo use the available width.
- Mobile: demo appears first; controls follow beneath it.
- Do not force a controls sidebar for experiments with no controls.

### 4.4 Controls panel appearance

- Contained settings panel.
- Theme-aware secondary surface, softly contrasted from the page.
- Subtle thin border.
- Existing restrained radius.
- No default shadow.
- Inner padding approximately 16–20px.
- Compact heading and optional short description.
- Group controls through spacing and/or subtle dividers.
- Do not put each control into a nested card.
- Show only controls that materially affect the experiment.
- Possible control types include sliders, toggles, selects, color inputs, and numeric inputs, but only where the experiment needs them.
- Changes update the demo live.
- If the experiment is configurable, provide a Reset action at the bottom of the settings panel.
- Reset restores that experiment's defined defaults and updates the demo.
- Do not ask for confirmation for an ordinary settings reset.
- Do not show a reset control when the experiment has no configurable settings.
- Reset affects only the relevant experiment settings; it must not reset unrelated application state.

### 4.5 Experiment canvas

- Use a contained experiment canvas.
- Outer container has a subtle border, secondary neutral surface where appropriate, and restrained radius.
- No default shadow.
- No browser chrome, toolbar, or decorative header.
- The inner canvas background is experiment-specific; do not force one common background on every experiment.
- Experiment controls that belong inside the actual creative interaction may remain inside the experiment's own canvas area.
- Show a stable loading/placeholder state while the runtime initializes to prevent layout shift.

Supported aspect-ratio presets:

- `16:9`
- `4:3`
- `1:1`
- `3:4`

Responsive defaults:

- Desktop default: `16:9`.
- Mobile default: `4:3`.
- An experiment may override its ratio, including separate desktop and mobile ratios.
- Canvas width fills its demo column; height is derived from the selected ratio.
- Do not distort the experiment to fill an arbitrary fixed pixel height.

### 4.6 Canvas actions

Canvas actions are conditional and capability-based. Show only actions that are useful and supported by that experiment.

- **Restart:** restarts the experiment runtime/animation while preserving current settings.
- **Fullscreen:** show only when helpful and supported. Preserve composition/aspect behavior, allow Escape to exit, and restore the normal page layout on exit. Never enter fullscreen automatically.
- **Reset settings:** separate from Restart; only exists for configurable experiments and belongs in the settings panel, not duplicated in the canvas action row.
- Put canvas actions in a compact row below the canvas, not in a toolbar inside the canvas.
- Hide the action row when there are no supported actions.
- Actions must be keyboard-operable, visibly focused, and usable on touch.
- Reduced-motion preferences must be respected.

### 4.7 Minimal explanation

- One concise paragraph, ideally one or two sentences.
- Explain only what helps the visitor understand the experiment.
- No expandable technical documentation.
- No diagrams required by default.
- No code walkthrough.
- No long documentation sections.
- Do not repeat the intro description.

### 4.8 Related experiments

A Related Experiments section belongs after source access in the proposed page order.

**OPEN:** The detailed layout, number of items, ordering logic, matching rules, and whether the section can be omitted when there are no related experiments were not designed in this discussion. Do not invent these rules during implementation; use a defensive empty-state/omit decision only after confirming expected behavior.

---

## 5. Protected Source Access Experience

### 5.1 Public vs protected behavior

Anonymous visitors may:

- Browse /labs.
- View published public experiment metadata and public static media.
- Open a published experiment detail page.
- View and interact with a demo that the publisher has explicitly designated as public.

Important runtime distinction:

- A public demo must be a reviewed, code-owned experiment runtime or another explicitly approved safe public preview.
- Do not evaluate arbitrary source text retrieved from MongoDB inside the main portfolio React tree, Next.js server, or privileged application origin.
- If an experiment requires user-authored/admin-managed source execution, a restricted preview, or capabilities beyond a code-owned public demo, it must use the separately approved isolated preview boundary. The hosting/provider, origin, CSP, dependency allowlist, network policy and resource limits remain OPEN until the threat-model gate is passed.
- A restricted interactive preview may have its own authentication/authorization requirement. That is distinct from the public demo permission.
- Full source remains protected and is never returned to guests.
- No source bytes (full or partial) are returned to guests or signed-in unverified accounts. Anonymous visitors may like/unlike the experiment without viewing source; verified accounts may view/copy source and like/unlike.

Authentication and authorization apply to protected source and any separately restricted preview functionality, not to ordinary public browsing or demos explicitly published as public.

### 5.2 Source access section appearance

- Compact bordered section.
- Theme-aware surface and subtle border.
- Existing restrained radius.
- Short heading and concise explanatory text.
- Primary action: `Sign in to view source`.
- Secondary action: `Create an account`.
- Preserve the current experiment/source destination through the authentication journey.
- No large promotional panel or oversized illustration.

### 5.3 Source authorization flow

1. User selects `Sign in to view source` or `Create an account`.
2. Preserve a validated internal return destination identifying the current experiment/source target.
3. If anonymous, complete the chosen authentication flow. If signed in but unverified, direct the user to the email-verification/resend flow.
4. Email verification is required after registration before protected source can be requested.
5. After verification, user manually signs in.
6. After successful sign-in, return to the preserved destination.
7. Server authenticates and separately authorizes the source request.
8. If authorized, load the protected source viewer.
9. If authenticated but unauthorized, show the Access Denied state below.

**Target policy (locked 2026-11-04):** a valid signed-in session with `emailVerified === true` automatically grants read access to every published experiment source. Email verification is the source-access gate; there is no owner-issued per-user grant. Anonymous visitors can like/unlike without source access; signed-in unverified users cannot like. This does not grant access to drafts or owner-management operations.

### 5.4 Protected source viewer and Monaco

- Source code is not loaded until the server confirms authentication and authorization.
- The protected source viewer uses the lightweight text viewer/editor implementation. No Monaco/CodeMirror dependency is installed; do not add one without an approved dependency decision.
- Do not load Monaco on the homepage, project pages, Labs listing, or ordinary experiment demo page.
- Do not send source in unauthenticated HTML, route data, public APIs, or metadata.
- Do not publicly cache source responses.
- The implemented viewer supports source-file navigation and file copy; source download and syntax-highlighting editor dependencies remain out of scope.

### 5.5 Access Denied state

**LOCKED — USER SELECTED**

Copy:

- Heading: `Access not available`
- Description: `This experiment's source code has not been published yet.`
- Supporting status text may say: `Published source will be available automatically to every verified Labs account.`
- Action: `Back to experiment`

Visual treatment:

- Dedicated state in the source-access area.
- Small shield-alert icon.
- Theme-aware secondary surface.
- One subtle border and existing restrained radius.
- No heavy error panel, default shadow, or large illustration.

Behavior:

- Replace the protected source viewer; never render source behind the denied state.
- Keep the user signed in.
- Do not show Login or Sign-up actions.
- Public experiment page and demo remain accessible.
- No automatic logout or redirect.
- Back to experiment navigates to the public experiment detail page.
- Do not add `Request access` until a real access-request workflow exists.

**LOCKED — TARGET SOURCE-ACCESS POLICY (USER APPROVED 2026-11-04):** any signed-in registered account with `emailVerified === true` can access all published experiment source automatically. Guests and signed-in unverified accounts cannot view/copy source. Anonymous visitors and verified accounts can like/unlike once per browser identity/account per experiment; signed-in unverified accounts cannot like. There is no per-user source grant, expiry or revoke workflow. The singleton Owner uses a separate server-only owner authorization path for drafts, source editing, versions and publication. The integration branch implementation is in `feat/labs-platform-integration`; release remains gated by owner/SMTP environment setup, Atlas migration and end-to-end QA. Detailed lifecycle/API/analytics requirements are in `LABS-SOURCE-MANAGEMENT-SPEC.md` and `LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md`.

---

## 6. Shared Labs Authentication Layout

### 6.1 Overall layout

**LOCKED — USER SELECTED:** Centered Focused Form layout with a contained form panel.

Use the same overall layout for:

- Login.
- Sign up.
- Forgot Password.
- Reset Password.
- Email Verification.
- Relevant confirmation, processing, and error states.

Do not use a split-screen editorial layout for authentication.

### 6.2 Shared page frame

The adopted shared layout is:

- Labs wordmark at the top-left.
- Theme control at the top-right.
- Centered authentication panel in the available page area.
- Footer/context label at the lower-left (for example, `LABS AUTHENTICATION`).
- `Back to Labs` link at the lower-right.

The exact icon/wordmark artwork and final footer microcopy should reuse the existing portfolio identity and theme controls; do not invent a new logo or theme system.

### 6.3 Centering and responsive behavior

- Full-viewport minimum height.
- Center the panel horizontally.
- Center vertically when available space allows.
- Panel height is natural; do not force a fixed height.
- If content exceeds the available viewport, allow natural page scrolling. Never clip or compress fields/content to preserve vertical centering.
- Desktop horizontal page inset: approximately 24px.
- Mobile horizontal page inset: approximately 16px.
- Mobile panel uses the available content width and appropriate inner padding.
- Respect mobile keyboard/short viewport behavior; form content must remain reachable.

### 6.4 Contained panel treatment

**LOCKED — USER SELECTED**

- Maximum width: **420px**.
- Theme-aware secondary surface.
- One subtle border.
- Existing restrained radius.
- No default shadow.
- Desktop inner padding: **24px**.
- Mobile inner padding: **16–20px**.
- No nested panels or decorative card layers.
- Existing portfolio font families, typography scale, color tokens, and light/dark theme rules.
- Use existing spacing and control conventions wherever possible.

### 6.5 Shared panel content rules

- Heading and description are centered.
- Form labels and input content are left-aligned.
- No extra eyebrow, promotional copy, or decorative illustration unless a specific screen calls for it.
- Keep the content focused and compact.
- A screen's state changes its content, not the overall page layout.

---

## 7. Shared Authentication Form Components and States

### 7.1 Input appearance

**LOCKED — USER SELECTED:** Clean Outlined Fields.

| Property | Specification |
|---|---|
| Width | Full available form width |
| Minimum height | 44px |
| Background | Theme-aware transparent/page-level surface |
| Border | 1px subtle neutral border |
| Radius | Existing restrained control radius |
| Horizontal padding | Approximately 12px |
| Label | Always visible above the field |
| Label-to-input gap | Approximately 6px |
| Text | Existing body typography |
| Placeholder | Secondary text color; never a substitute for the label |
| Shadow | None |

Do not mix outlined, filled, and underline field variants across authentication screens.

### 7.2 Input interaction states

Every relevant field must support:

- Default: subtle neutral border.
- Hover: slight border emphasis without changing dimensions.
- Focus: existing accent border.
- Keyboard focus-visible: a clear accessible focus indicator; do not rely on color alone.
- Invalid: semantic error border and inline error message.
- Disabled: visibly muted and non-interactive.
- Filled: normal foreground text without unnecessary additional decoration.

The intended custom focus treatment must preserve keyboard visibility and must not simply remove the focus outline with no accessible replacement.

### 7.3 Password visibility

**LOCKED — USER SELECTED**

- Show/hide control appears inside the password input.
- Clicking the eye reveals the password; clicking again masks it.
- Preserve the value, cursor position, and field focus.
- Use an accessible label that changes between `Show password` and `Hide password`.
- Toggling visibility must not change or submit the password value.
- Each password field has an independent toggle. In Reset Password, toggling one field must not affect the other.
- The toggle is keyboard-operable and touch-accessible.
- During submission, the toggle is disabled along with the other form controls.

### 7.4 Validation presentation

**LOCKED — USER SELECTED:** Inline field-level messages below the corresponding field.

- Place a concise message immediately below the field, approximately 4–6px spacing.
- Use the existing semantic error token and readable small text.
- Error border is semantic error color.
- A small alert icon may be used where useful; do not add decorative error backgrounds.
- Do not use a form-wide summary for ordinary field validation.
- Associate the message with the input using `aria-describedby` or an equivalent accessible relationship.
- Mark invalid fields semantically (for example `aria-invalid`).
- When several fields are invalid on submit, focus the first invalid field.
- Error content must remain readable in light and dark themes.

### 7.5 Validation timing

**LOCKED — USER SELECTED**

- Validate a field on blur.
- Validate all required fields on submission.
- Do not show premature errors before a field has been interacted with or the form has been submitted.
- Once an error exists, revalidate as the user corrects the value and clear it when valid.
- A field's error clears only when its validation succeeds.

### 7.6 Authentication-level error alert

**LOCKED — USER SELECTED:** Alert appears below the screen heading/description and above the first form field.

- Full form width.
- Subtle theme-aware error surface.
- Thin semantic error border.
- Existing restrained radius.
- Small error icon.
- Short title where useful and one concise explanatory message.
- No shadow.
- Use an appropriate accessible live-region/alert role when the message appears.
- Do not expose server internals, credentials, tokens, or account existence.

Persistence:

- Remain visible until the next submission or until the underlying issue is resolved.
- No automatic timeout.
- No default dismiss button.
- A new submission replaces the previous message.
- Remove it when the issue is successfully resolved.

### 7.7 Secondary links

**LOCKED — USER SELECTED:** Simple text links, not filled or outlined buttons.

- No button background, border, or pill styling.
- Use existing text/accent conventions.
- Accent emphasis on hover/focus and clear keyboard focus indicator.
- Underline may appear on hover; do not make the link look like a primary action.
- Use comfortable touch targets.
- `Back to Labs` is a separate navigation item in the shared page frame.

### 7.8 Primary authentication buttons

**LOCKED — USER SELECTED:** Filled accent button using the existing portfolio primary accent token. Do not invent an authentication-only accent color.

| Property | Specification |
|---|---|
| Width | Full available panel width |
| Height | 46px |
| Background | Existing primary accent token |
| Foreground | Theme-appropriate accessible contrast |
| Typography | Existing button typography, semibold |
| Radius | Existing restrained button radius |
| Shadow | None by default |
| Content | Centered label and optional spinner |

States:

- Default: filled primary accent.
- Hover: subtle accent emphasis; no size change.
- Pressed: slightly stronger accent treatment; no scale effect.
- Focus-visible: clear accessible focus ring.
- Disabled: visibly muted but readable.
- Loading: small spinner beside an action-specific label; button disabled.
- Preserve button dimensions across states to prevent layout shift.
- Respect reduced-motion settings.

### 7.9 Loading/submission behavior

**LOCKED — USER SELECTED**

- Keep the form visible while a request is processing.
- Show a small spinner and action-specific text (for example, `Signing in…`, `Creating account…`, `Sending reset link…`).
- Disable the primary button to prevent duplicate submissions.
- Temporarily disable all interactive fields and controls in the form: text inputs, password visibility controls, checkboxes, selects, and other form controls.
- Preserve all entered values while pending.
- When a request fails, restore controls and show the appropriate error.
- When successful, transition to the specified confirmation or destination.
- Do not replace the form with a full-page loading screen, modal overlay, or skeleton for ordinary submissions.
- Navigation outside the form is not automatically disabled by this rule.

### 7.10 Confirmation states

**LOCKED — USER SELECTED:** Use a dedicated confirmation state inside the same contained form panel for successful actions where the user needs feedback or a next step.

- Replace the completed form content, not the entire shared authentication layout.
- Use a subtle, simple success/email icon.
- Center heading and description.
- Keep copy short and action-oriented.
- Use the filled accent button when a primary next action exists.
- Use simple text links for secondary navigation.
- No oversized illustration, heavy celebration, or unnecessary animation.
- No automatic redirect unless explicitly specified for that flow. The flows in this document state when continuation is manual.

---

## 8. Login Screen

### 8.1 Heading and description

**LOCKED — USER SELECTED**

- Heading: `Welcome back`
- Description: `Sign in to access your Labs account.`

Existing portfolio heading/body typography, centered; approximately 8px spacing between heading and description. No eyebrow or decorative illustration.

### 8.2 Fields and order

- Email address.
- Password (with the shared show/hide control).
- `Forgot password?` link directly below the password input, right-aligned.
- Primary button: `Sign in`.
- Secondary line: `Don't have an account? Create an account`.

There is **no Remember me checkbox**. Session persistence is managed by the authentication system; absence of the checkbox does not mean permanent or short-lived sessions.

### 8.3 Forgot Password link placement

**LOCKED — USER SELECTED**

- Directly below the password field.
- Right-aligned.
- Remains right-aligned on mobile.
- Must not overlap a field-level validation message.

### 8.4 Login button and states

- Button label: `Sign in`.
- Loading label: `Signing in…`.
- Use shared filled button, loading, disabled, validation, and error rules.
- Generic credential failure example: title `Unable to sign in`; message `Check your email and password, then try again.`
- Do not reveal whether an email address is registered.

### 8.5 Sign-up link

Use simple text-link styling: `Don't have an account? Create an account`.

### 8.6 Google sign-in and provider UI

**PRODUCT REQUIREMENT — REQUIRED:** docs/PRD.md and docs/README.md require both email/password and Google sign-in.

- The Labs Login experience must support email/password and Google sign-in.
- The actual authentication provider/service/library, Google OAuth app configuration, callback implementation, account-linking behavior and session implementation remain OPEN.
- The visual placement, divider copy, button label, icon treatment and ordering of the Google sign-in action are OPEN. Do not invent a final treatment.
- Do not silently replace Google with GitHub. GitHub sign-in is not required or selected in the current product baseline.
- Provider authentication must be verified on the server. A client callback or visible signed-in state is not proof of a valid session.
- The approved Login field/error/loading behavior continues to apply to email/password. Google-provider-specific pending, cancellation, callback failure and account-linking states must be designed when the provider is selected.

---

## 9. Sign-up Screen

### 9.1 Heading and description

**LOCKED — USER SELECTED**

- Heading: `Create your account`
- Description: `Start using your Labs account.`

Use the shared centered heading/description typography and spacing.

### 9.2 Fields and order

**LOCKED — USER SELECTED**

1. Email address.
2. Password with show/hide control.
3. Short password helper text below the password field.
4. Required Terms of Service and Privacy Policy consent checkbox.
5. Primary button: `Create account`.
6. Secondary line: `Already have an account? Sign in`.

Do not add a full name, username, confirm-password field, Remember me checkbox, or additional profile fields unless separately approved.

### 9.3 Password helper text

**LOCKED — USER SELECTED:** Use concise helper text below the Password field; do not show a password strength meter.

- Example shown during design: `Use at least 8 characters.`
- Placement: immediately below the password input.
- Typography: small existing body text, secondary text token, no background.
- If a validation error exists, the error message takes priority over helper text; show the helper again after the error resolves.

**OPEN:** The actual password security policy (minimum length, maximum length, allowed characters, compromised-password checks, and any other rules) is not finalized. The example `8 characters` must not be treated as the final security policy unless the backend/security design confirms it. Helper text must match actual server-side enforcement.

### 9.4 Required legal consent

**LOCKED — USER SELECTED**

Label:

`I agree to the Terms of Service and Privacy Policy.`

- Checkbox is required and unchecked by default.
- Place below password helper/validation text and above Create account.
- Terms and Privacy Policy are separate links.
- Each link opens in a new browser tab.
- Use `noopener` and `noreferrer` (or equivalent safe link behavior).
- Opening either legal page must not toggle the checkbox.
- Preserve the original Sign-up tab and its input/checkbox state.
- Use the existing restrained checkbox style and accessible focus behavior.
- If unchecked on submit, block registration and show this inline message immediately below the checkbox: `Please accept the Terms of Service and Privacy Policy to continue.`
- Clear the consent error after the user checks the checkbox.
- Record the accepted Terms version, Privacy Policy version, and acceptance timestamp as part of the account-creation/audit design.

**OPEN:** Actual legal document content, URLs, versioning procedure, and legal review are not supplied by this design discussion. Do not create fake legal documents or invented links.

### 9.5 Sign-up primary action

- Label: `Create account`.
- Loading label: `Creating account…`.
- Use shared primary button and submission-disabled behavior.

### 9.6 Privacy-safe registration result

**LOCKED — USER SELECTED**

The public registration response must not disclose whether an email is already registered.

The Sign-up form is replaced by a dedicated confirmation state inside the same contained panel.

- Heading: `Check your email`
- Description: `If an account can be created with this address, you'll receive an email with the next steps.`
- Use a subtle email/check icon.
- Center heading and description.
- Do not show an inline duplicate-email error.
- Do not display `This email already exists` or reveal verification status.
- Do not automatically sign in.
- Do not automatically redirect.

**LOCKED — RECOMMENDATION ADOPTED:** Show a simple secondary text link `Back to sign in` beneath the generic confirmation. Do not add a second filled button unless a later approved flow requires it.

Security requirements:

- New and already-registered email submissions must produce the same user-visible response.
- Do not reveal account existence through response details, error wording, or distinguishable timing.
- Do not create duplicate accounts.
- Apply server-side rate limiting.
- The server may perform different private operations where necessary, but client-visible behavior must remain generic.

**IMPORTANT SUPERSESSION:** An earlier proposal to navigate every successful new registration directly to the Email Verification screen is superseded. The currently approved public UX is the generic registration confirmation state. Email verification remains a required account flow, but the exact delivery/verification email orchestration must preserve the generic response and is an implementation/security detail to finalize.

---

## 10. Forgot Password Screen

### 10.1 Heading and description

**LOCKED — USER SELECTED**

- Heading: `Reset your password`
- Description: `Enter your email address and we'll send you a link to reset your password.`

### 10.2 Form structure

- One field: Email address.
- Shared outlined input.
- Validate email on blur and submit.
- Primary button: `Send reset link`.
- Loading label: `Sending reset link…`.
- Disable email input and submit button during request.
- Secondary link `Back to sign in`, centered immediately below the primary button.

### 10.3 Privacy-safe reset result

**LOCKED — RECOMMENDATION ADOPTED**

After submission, replace the form with a dedicated generic confirmation state, regardless of whether an account exists for the submitted email.

- Heading: `Check your email`
- Description: `If an account exists for this email address, you'll receive instructions to reset your password.`
- Use a subtle email confirmation icon.
- Same contained panel, centered text.
- Secondary link: `Back to sign in`.
- No inline duplicate/unknown-account error.
- No automatic redirect.
- Never disclose account existence or verification status.
- Apply server-side rate limiting and avoid distinguishable response timing.

The server sends a reset message only where appropriate; the visible response remains generic.

---

## 11. Reset Password Screen

### 11.1 Heading and description

**LOCKED — USER SELECTED**

- Heading: `Create a new password`
- Description: `Choose a new password for your Labs account.`

The screen is available only through a valid password-reset flow.

### 11.2 Fields and order

**LOCKED — USER SELECTED**

1. `New Password` with visibility toggle.
2. Helper text below New Password only.
3. `Confirm New Password` with its own independent visibility toggle.
4. Primary button: `Update password`.

**LOCKED — RECOMMENDATION ADOPTED:** The primary button label is `Update password`.

The helper example from design was `Use at least 8 characters.` but the actual password requirements remain subject to the OPEN security policy. Confirmation field does not repeat the helper text.

### 11.3 Validation

- Both fields are required.
- New Password must follow the final server-side password policy.
- Confirm New Password must match New Password.
- Match validation follows the shared blur/submit timing rules.
- Mismatch message: `Passwords do not match.`
- Block submission while the values do not match.
- Clear the mismatch error when the values match.
- Each field's visibility toggle operates independently.

### 11.4 Invalid, expired, or already-used reset token

**LOCKED — USER SELECTED**

Replace the reset form with a dedicated error state in the same panel.

- Heading: `This link is no longer valid`
- Description: `This password-reset link may have expired or already been used. Request a new link to continue.`
- Primary action: `Request a new link` → Forgot Password flow.
- Secondary action: `Back to sign in`.
- No password form while token is unusable.
- Do not expose token details.
- No automatic redirect or repeated automatic retry.

### 11.5 Successful password reset

**LOCKED — USER SELECTED**

Dedicated confirmation state:

- Heading: `Password updated`
- Description: `Your password has been successfully updated. You can now sign in with your new password.`
- Primary button: `Continue to sign in`.
- Manual continuation; no automatic redirect or countdown.
- Do not automatically sign the user in.
- Clicking the button navigates to Login; the user signs in using the new password.

### 11.6 Session revocation after password reset

**LOCKED — USER SELECTED**

After a successful reset, revoke **all existing sessions** for that account across all devices and browsers.

- Invalidate server-side sessions/refresh credentials associated with the account.
- Old session credentials must be rejected by the server.
- Clear current-browser authentication cookies/state where applicable.
- Other open tabs/devices must lose protected access.
- Do not keep other sessions active.
- Do not automatically sign the current user in after reset.
- Treat the reset token as single-use.
- Clear sensitive authenticated client caches and ensure protected source cannot be reused from stale cache/history.

The reset confirmation screen remains visible after revocation.

---

## 12. Email Verification

### 12.1 Verification screen heading and description

**LOCKED — USER SELECTED**

- Heading: `Verify your email`
- Description: `Check your inbox and follow the verification link to activate your Labs account.`

### 12.2 Email address display

**LOCKED — RECOMMENDATION ADOPTED**

Show the destination email in a masked form when displaying it is useful for confirming where the message was sent.

- Do not display the complete email address unnecessarily.
- Example only: `vi••••@gmail.com`.
- The masking algorithm and behavior for short/unusual addresses are OPEN; implement a privacy-conscious masking helper rather than copying the sample literally.
- Do not let a masked address become an account-existence disclosure in generic registration/reset responses.

### 12.3 Resend verification email

**LOCKED — USER SELECTED:** 30-second cooldown.

Behavior:

- After a verification email is successfully sent, start a 30-second cooldown.
- While active, disable resend and show a countdown (for example, `Resend available in 00:30`).
- Update the countdown once per second.
- When it reaches zero, enable a text-link action such as `Resend verification email`.
- Do not automatically resend when the countdown ends.
- Clicking resend shows inline loading and prevents repeated submissions.
- On successful resend, restart the 30-second cooldown.
- On failure, show the shared authentication-level error alert.
- Server-side rate limiting is authoritative; a client countdown is only UX feedback.
- Repeated requests across tabs/devices must not bypass the server rate limit.
- Cooldown begins only after the corresponding email send succeeds.
- Resending preserves the verification context.

### 12.4 Verification token processing

**LOCKED — USER SELECTED:** Dedicated centered processing state in the same panel.

- Spinner centered above the heading.
- Heading: `Verifying your email`
- Description: `Please wait while we verify your email address.`
- No extra controls or progress bar.
- Keep visible until the server confirms success or failure.
- Do not expose token values/details.
- Do not allow duplicate verification submissions.
- Respect reduced-motion preferences.

### 12.5 Failed email verification

**LOCKED — USER SELECTED:** Dedicated error state replaces processing content.

- Heading: `This link is no longer valid`
- Description: `This verification link may have expired or already been used. Request a new verification email to continue.`
- Primary action: `Resend verification email`.
- Secondary action: `Back to sign in`.
- Resend uses the 30-second cooldown and server-side rate limiting.
- On resend success, restart the 30-second cooldown and provide clear success feedback without leaving the verification context. The exact success message and its placement are OPEN.
- On resend failure, show the shared authentication-level error alert.
- Do not expose token values or internal verification details.

Special case:

If the link was already used because the email had previously been successfully verified, show the verified success state instead of showing the invalid-link error.

### 12.6 Successful email verification

**LOCKED — USER SELECTED**

Dedicated success state:

- Heading: `Email verified`
- Description: `Your email address has been successfully verified. You can now sign in to your Labs account.`
- Primary action: `Continue to sign in`.
- Manual continuation; no automatic redirect or countdown.
- No automatic sign-in/session creation from verification alone.
- Clicking the button opens Login.
- If verification began from a protected-source journey, preserve the validated internal return destination through the subsequent Login flow.
- Otherwise, successful Login without a return destination goes to `/labs`.

### 12.7 Verification/account state distinctions

- Email verification is separate from authentication.
- A verified account is not automatically signed in.
- A verification link that is already consumed but whose email is verified should resolve to the verified state.
- An invalid/expired link that has not resulted in successful verification resolves to the dedicated invalid-link state.
- Exact email provider, token format, token lifetime, token storage, delivery retries, and verification endpoint contract are OPEN technical decisions.

---

## 13. Authentication Navigation and Session Behavior

### 13.1 Successful Login

**LOCKED — USER SELECTED**

- Redirect immediately after server-confirmed authentication/session creation.
- Do not show an intermediate `Signed in successfully` screen.
- If the user arrived from a protected experiment source, return to that validated internal destination.
- Otherwise, go to `/labs`.
- Re-check source authorization after return navigation.
- Only use validated internal return destinations. Reject external URLs and unsafe redirects.

### 13.2 Already-authenticated visitor opens Login or Sign-up

**LOCKED — USER SELECTED**

- If the user opens the Login route: redirect to the validated internal return destination or `/labs`.
- If the user opens the Sign-up route: same behavior.
- The literal route paths for Login and Sign-up are not finalized; `/login` and `/signup` are conceptual examples only.
- Do not flash/render a redundant authentication form before redirecting.
- Treat invalid/expired sessions as unauthenticated and show the requested form.
- Do not create redirect loops; reject Login/Sign-up routes as return destinations.

### 13.3 Logout

**LOCKED — USER SELECTED**

- Logout is immediate; no confirmation dialog.
- Invalidate the active server session.
- Clear authentication cookie/client authenticated state where applicable.
- Clear authenticated client caches.
- Redirect to `/labs` after successful server invalidation.
- Do not display a logout success page.
- If server invalidation fails, do not falsely report successful logout; show an appropriate error and handle remaining session state safely.
- Protected source must no longer be accessible after logout, including via stale browser history/cache.

### 13.4 Sign-out control and account menu

**LOCKED — USER SELECTED:** Sign out lives inside a compact account dropdown in the Labs header.

- Trigger: compact account icon button.
- Position: beside the theme control.
- Menu opens from and aligns to the right-side trigger.
- Theme-aware background, one subtle border, restrained radius, subtle elevation only where useful.
- Menu width target: approximately 220–240px.
- Full keyboard/touch accessibility.
- Outside click closes the menu.
- Escape closes and restores focus to the trigger.
- Menu closes when logout begins.

**LOCKED — RECOMMENDATION ADOPTED:** Keep the menu minimal. Its contents are:

1. Signed-in account email (not a fake hard-coded sample).
2. Divider.
3. `Sign out` with an icon.

Do not add My Labs, Account Settings, profile editing, or other menu destinations until a real feature is approved. The menu may show the email because the Sign-up form does not collect a name.

### 13.5 Session expiration

**LOCKED — USER SELECTED**

When session expiry blocks a protected action:

- Redirect to Login.
- Show an authentication-level alert with:
  - Title: `Session expired`
  - Message: `Your session has expired. Please sign in again to continue.`
- Preserve a validated internal return destination.
- After sign-in, return to that destination and re-check authorization.
- Clear stale authenticated state and caches.
- Do not automatically sign in again.

Public Labs browsing and public demos do not require authentication and must not be interrupted or redirected merely because an old session expired. Redirect only when protected access is attempted or an active protected view must be re-authenticated.

### 13.6 Cross-tab session synchronization

**LOCKED — RECOMMENDATION ADOPTED**

Synchronize authentication/session changes across open Labs tabs.

- When a user signs out in one tab, other tabs must clear authenticated UI state and prevent further protected actions.
- When a password reset revokes all sessions, every other tab/device must lose protected access.
- When a session expires or is invalidated, other tabs must recognize this before subsequent protected actions and clear stale auth state.
- Other tabs must not retain an authorized source viewer using stale client state.
- Public Labs pages and public demos remain usable; do not force a public page to redirect to Login simply because a session changed.
- When a tab is on a protected source view and the session becomes invalid, it must stop showing/using protected content and follow the session-expiry Login flow while preserving a validated return destination.
- Server session state remains authoritative; cross-tab messages are a notification/synchronization aid, not proof of authentication.

**OPEN:** Exact cross-tab transport (for example, BroadcastChannel, storage events, or another mechanism), polling/revalidation interval, and race-condition handling are implementation decisions. Do not choose one without examining the existing code and architecture.

### 13.7 Remember-me and session persistence

- No Remember me checkbox is shown on Login.
- Session persistence is automatic and owned by the authentication system.
- Do not infer that the session is permanent or short-lived.

**OPEN:** Session lifetime, idle timeout, absolute timeout, refresh strategy, cookie flags/domain/path, revocation storage, concurrent session policy, and reauthentication requirements have not been finalized. The companion architecture recommends secure HTTP-only cookies where appropriate; that is a preferred security direction, not a complete session design.

---

## 14. Authentication Flow Summaries

These flows summarize the approved UX. They do not define endpoint contracts, token formats, or a specific authentication library.

### 14.1 Registration

```text
Sign-up form
  → validate email/password/required consent
  → submit
  → server handles account creation and privacy-safe duplicate handling
  → show the same generic Check your email confirmation
  → user follows the appropriate email instructions
  → email verification processing
  → Email verified confirmation
  → user manually opens Login
  → sign in
  → validated return destination or /labs
```

The UI must not reveal whether a submitted email already exists. Exact server-side handling and email orchestration must preserve this generic behavior.

### 14.2 Login

```text
Login form
  → validate
  → submit (disable all form controls while pending)
  → server authenticates and creates/establishes session
  → on failure: stay on Login and show authentication alert
  → on success: immediately redirect to validated return destination or /labs
```

### 14.3 Forgot Password and Reset Password

```text
Forgot Password form
  → submit email
  → show same generic Check your email confirmation
  → user opens valid reset link
  → validate token
      ├─ invalid/expired/used: dedicated invalid-link state
      └─ valid: Reset Password form
             → validate New Password + Confirm New Password
             → update password
             → revoke all existing sessions
             → Password updated confirmation
             → manual Continue to sign in
             → Login
```

### 14.4 Protected source access

```text
Public experiment detail
  → Sign in to view source / Create an account
  → preserve validated internal experiment/source return destination
  → authenticate (and verify email if required)
  → after verification, user manually signs in
  → return to experiment/source target
  → server authenticates and separately authorizes
      ├─ allowed: return source; dynamically load source viewer/Monaco
      └─ denied: dedicated Access not available state; keep public demo usable
```

### 14.5 Session expiry/logout/password reset

```text
Logout or session revocation/expiry
  → server session becomes invalid
  → notify/synchronize other tabs
  → clear stale authenticated state/caches
  → block protected-source access
  → if user is on/attempts protected access: Login + session-expired message
  → after sign-in: validated return destination
  → public Labs browsing remains available without authentication
```

---

## 15. Accessibility, Responsive Design, and Motion Requirements

These requirements apply across Labs and authentication.

### 15.1 Accessibility

- Use semantic links for navigation and buttons for actions.
- Entire gallery card must be one link; no nested interactive elements.
- All forms have visible labels.
- Link/checkbox/button/control interactions must work by keyboard and touch.
- Show visible focus indicators that are not dependent on hover or color alone.
- Associate validation errors with their fields.
- Announce authentication alerts and confirmation/status changes appropriately to assistive technology.
- Maintain usable contrast in light and dark themes.
- Do not use placeholder text as the only field label.
- Do not rely on hover to reveal essential content.
- Fullscreen has an explicit accessible exit path and Escape support.

### 15.2 Responsive behavior

- Preserve existing portfolio breakpoints/container conventions where possible.
- Avoid page-level horizontal overflow.
- The Labs category navigation may scroll horizontally within its own region on mobile.
- Featured experiment stacks on narrow screens with copy before visual.
- Gallery: 3 desktop / 2 tablet / 1 mobile columns.
- Experiment detail: demo before controls on mobile.
- Authentication panel remains within mobile side insets and can scroll when content or keyboard requires it.
- Do not clip long form content to maintain vertical centering.

### 15.3 Motion and reduced motion

- Reuse the existing Motion conventions.
- Do not introduce an independent animation library/system.
- Keep hover/entrance effects restrained and avoid layout shift.
- Honor `prefers-reduced-motion` for hover scale/translation, state transitions, and loading animation where possible.
- No interaction may depend on motion to communicate a state.
- Preserve the existing Lenis setup; do not apply a new scroll behavior globally as part of Labs without approval.

---

## 16. Explicitly OPEN Decisions — Do Not Assume

The following items were not finalized by the discussion. They require an explicit decision or a separate architecture/security design before implementation reaches them.

### 16.1 Authentication product and provider decisions

1. **Resolved:** Better Auth with `@better-auth/mongo-adapter` is selected for email/password and Google sign-in. Google OAuth client credentials and production callback configuration remain deployment requirements. Google account linking uses Better Auth's verified same-email linking behavior; no force-trusted provider override is configured. Implicit Google sign-up remains disabled so Google cannot bypass the consent-aware registration route.
2. Email delivery provider/service, sending domain, templates, retry and bounce handling.
3. Verification token format, token lifetime, single-use storage, resend/replay semantics and verification endpoint design.
4. Password-reset token format, lifetime, single-use storage and endpoint contract.
5. **Resolved in the implementation:** `/labs/login`, `/labs/signup`, `/labs/forgot-password`, `/labs/reset-password`, and `/labs/verify-email`.
6. What happens when an unverified account attempts to log in (copy, resend path and whether access is blocked until verified).
7. Account deletion, email change, password change outside reset, and recovery/support flows.
8. Session lifetime, idle/absolute timeout, refresh strategy, cookie settings and concurrent session policy.
9. Exact cross-tab transport and revalidation strategy.
10. Exact masking algorithm for displayed email addresses.
11. The current implementation enforces 8–128 characters, matching the visible helper text and Better Auth policy. Any breached-password screening or policy change remains open.
12. Exact rate limits/cooldowns for sign-up, Login, reset requests, verification resends and failed attempts beyond the approved 30-second client resend cooldown.
13. Google sign-in button placement and interaction states.
14. Whether any additional provider beyond Google is desired in the future; GitHub is not currently selected.

### 16.2 Authorization decisions

1. **Legacy implementation:** the current code denies by default and requires an active per-user/per-experiment record in `lab_source_grants`. This is transitional and must be removed. **Target policy:** a valid Better Auth session with `emailVerified === true` plus a published source version is sufficient; no grant record is queried or required.
2. Whether source authorization is global, per experiment, role-based, allowlist-based, or entitlement-based.
3. Whether account age, verification status, admin role, or another condition changes source permission.
4. Whether a user can request access in the future (no Request access action is included now).
5. Exact unauthorized API response/status handling and security logging policy.

Do not assume that authentication means authorization.

### 16.3 Labs content and visual decisions

1. Exact landing hero heading, paragraph, gallery heading, closing line, and final copy.
2. Actual featured experiment selection and its production metadata/thumbnail.
3. Experiment list, order, publish status, and category assignments.
4. Related Experiments section layout, quantity, matching/order logic, and empty behavior.
5. Per-experiment demo behavior, control configuration, canvas background, ratio override, supported actions, and runtime strategy.
6. Final source viewer layout, editor controls, copy/download features, and code-file navigation.
7. Exact final aspect dimensions, spacing, and typography values where only guidance is recorded.
8. Whether load-more uses client-side slicing or server/API pagination.
9. Whether any individual experiment needs video, GIF, or autoplay (listing autoplay is not allowed; detail behavior must be decided per experiment).

### 16.4 Backend/data/operations decisions

1. Final Labs MongoDB schema and indexes.
2. Final endpoint list, request/response contracts, validation rules, error codes, pagination model, and API versioning.
3. Authentication/user schema beyond the conceptual architecture model.
4. Better Auth stores sessions and verification state in MongoDB and revokes sessions following password reset. Session lifetime/concurrency policy remains open and currently relies on Better Auth defaults.
5. Cloudinary folder conventions, transformations, responsive media strategy, signed upload flow, and ownership metadata.
6. Lab source storage/versioning strategy (inline source snapshots vs repository integration, and any version model).
7. Analytics event scope, consent/privacy policy, retention, and aggregation.
8. Cache policy for Labs metadata, experiment detail data, demos, and source.
9. Deployment/environment configuration and secret rotation status.
10. Actual implementation milestones, release order, and measurable performance budgets.

### 16.5 Legal and consent decisions

1. Actual Terms of Service and Privacy Policy content and URLs.
2. Document versioning and publishing/review workflow.
3. Applicable legal/compliance requirements and consent retention duration.

Do not invent legal terms or URLs.

---

## 17. Deferred Work and Explicit Non-Goals

- **CMS/Admin:** DEFERRED until Labs is complete. Do not build CMS screens, content editors, admin dashboard, or bulk-management flows as part of the current Labs design scope.
- **Portfolio migration:** Do not migrate all existing static portfolio data as a side effect of Labs work.
- **Project redesign:** Do not redesign existing portfolio or project-detail pages.
- **Full Lab version history:** Architecture reference suggests keeping the service layer future-ready, but do not implement full versioning until required.
- **Advanced account profile/settings:** Not in the account menu or current authentication UX.
- **Favorites/saved experiments:** Not selected for the current scope.
- **Request-access workflow:** Not selected; no button until a real workflow is designed.
- **Long-form experiment documentation:** Explicitly not the desired detail-page direction.

---

## 18. Quality and Acceptance Checklist

Use this checklist before considering Labs design/implementation complete. A checked design rule does not prove implementation passed; implementation evidence is still required.

### 18.1 Portfolio preservation

- [ ] Existing homepage UI, content, SEO, responsive behavior, Motion, and Lenis remain intact.
- [ ] Existing project listing/detail pages remain intact.
- [ ] No Labs runtime, Monaco, source, or Lab media appears in homepage initial loads.
- [ ] No unnecessary portfolio bundle growth from Labs dependencies.

### 18.2 Labs listing

- [ ] Four approved categories and short labels are used consistently.
- [ ] All is the default filter.
- [ ] Empty categories are not displayed.
- [ ] Each experiment has exactly one primary category.
- [ ] Featured section uses 40:60 desktop layout and stacks appropriately.
- [ ] Featured preview is a static 4:3 optimized visual, not a live runtime.
- [ ] Gallery uses 3/2/1 responsive columns.
- [ ] First six items shown initially.
- [ ] Load More appends six and updates count correctly.
- [ ] Category change resets to first six matches.
- [ ] Cards are one semantic link with no nested controls.
- [ ] No gallery autoplay, live runtime, Monaco, or source payload.
- [ ] Missing thumbnail fallback works.

### 18.3 Experiment detail

- [ ] Only selected experiment runtime loads.
- [ ] Intro remains concise.
- [ ] Workspace uses 70:30 desktop layout where controls exist.
- [ ] No-control experiment hides the settings panel.
- [ ] Mobile puts demo before controls.
- [ ] Canvas uses an approved aspect preset and does not distort.
- [ ] Loading placeholder prevents layout shift.
- [ ] Restart preserves settings.
- [ ] Fullscreen appears only when supported and exits with Escape.
- [ ] Reset is separate from Restart and only shown for configurable experiments.
- [ ] Explanation is one concise paragraph, not long documentation.
- [ ] Related experiments follow the separately approved design when finalized.

### 18.4 Source protection

- [ ] Anonymous users can browse and interact with public demos.
- [ ] Anonymous payloads/HTML do not contain source.
- [ ] Public caches do not contain source.
- [ ] Authentication is checked server-side.
- [ ] Authorization is checked separately server-side.
- [ ] Unauthorized users see Access not available and no source data.
- [ ] Authorized source request is the first point where source is returned.
- [ ] Monaco is dynamically imported only for an authorized source viewer.
- [ ] Source access works correctly after the return-to-source authentication flow.

### 18.5 Authentication UX

- [ ] All authentication pages reuse the centered contained panel.
- [ ] Inputs use outlined treatment and visible labels.
- [ ] Password visibility controls preserve value/focus and are independently operable.
- [ ] Validation appears on blur/submit and is associated with the field.
- [ ] Authentication-level alert appears above the fields and persists as specified.
- [ ] Primary buttons use the existing accent token and shared loading state.
- [ ] All form controls disable during submission and restore on failure.
- [ ] Sign-up requires the legal checkbox.
- [ ] Legal links open safely in new tabs without toggling the checkbox.
- [ ] Registration and reset requests do not reveal email-account existence.
- [ ] Reset token invalid/expired/used state is separate from the form.
- [ ] Password reset revokes all sessions.
- [ ] Email verification uses centered processing, dedicated success/error states, manual continuation, and 30-second resend cooldown.
- [ ] Verification does not automatically sign the user in.
- [ ] Login success redirects immediately to a validated return destination or `/labs`.
- [ ] Already-authenticated users are redirected away from Login/Sign-up.
- [ ] Logout is immediate, invalidates session, clears authenticated state, and redirects to `/labs`.
- [ ] Session expiry redirects only when protected access is required; public Labs remains usable.
- [ ] Cross-tab session changes are synchronized without relying on client messages as authentication proof.

### 18.6 Security and privacy

- [ ] No password, token, source code, or private user data is logged.
- [ ] Passwords are securely hashed server-side; never stored in plaintext.
- [ ] Sensitive authentication data is not stored in localStorage where avoidable; companion architecture prefers secure HTTP-only cookies.
- [ ] Return destinations are validated internal URLs.
- [ ] Source is never publicly cached.
- [ ] Duplicate registration and password-reset responses do not expose account existence.
- [ ] Server-side rate limits are authoritative.
- [ ] Authorization policy is explicitly implemented and tested rather than assumed.
- [ ] Consent version and timestamp can be audited.

---

## 19. Implementation Order After Explicit Authorization

This is a recommended implementation order, not authorization to start coding:

1. Audit the actual repository and confirm the current route/component/data structure against the companion architecture.
2. Complete any remaining Labs UX decisions marked OPEN that block implementation (especially related experiments, auth providers, authorization policy, password policy, session architecture, route names, and email delivery).
3. Finalize the Labs data contract and public/private API contracts without flattening existing portfolio content.
4. Implement the Labs landing page using lightweight public metadata and static media previews.
5. Implement the experiment detail shell and one selected runtime boundary.
6. Implement the demo canvas, contextual controls, responsive ratios, and supported canvas actions.
7. Implement protected source request flow, server authorization, and lazy source viewer/Monaco.
8. Implement the approved authentication screens and flows using the selected authentication architecture/provider once decided.
9. Implement session revocation, cross-tab synchronization, safe return destinations, rate limiting, privacy-safe responses, and authorization checks.
10. Test public/private data boundaries, access denial, responsive behavior, reduced motion, keyboard accessibility, performance isolation, and portfolio non-regression.
11. Complete Labs and validate it before beginning CMS/Admin work.

Do not skip repository inspection. Do not assume the current filesystem matches a proposed architecture diagram. Do not begin the next phase until the preceding phase is understood and its acceptance criteria are checked.

---

## 20. Decision Log and Change History

### 2026-11-02 — Consolidated baseline

This document consolidates the Labs landing page, experiment detail page, protected source access, authentication visual system, Login, Sign-up, Forgot Password, Reset Password, Email Verification, session behavior, and privacy/security UX discussed with the user.

The user explicitly instructed that remaining recommendations should be locked. The following recommendations were therefore adopted into this baseline:

- Show a masked email address in the verification context when useful.
- Use a dedicated privacy-safe Forgot Password confirmation.
- Use `Update password` as the Reset Password primary action.
- Add `Back to sign in` beneath the generic Sign-up confirmation.
- Keep the account dropdown minimal: signed-in email and Sign out only.
- Synchronize session changes across open Labs tabs, with server state authoritative and public demos unaffected.

Items for which no recommendation had been approved or no sufficient information was available remain OPEN and are listed in Section 16.

### 2026-11-03 — Initial published experiment set

The first three code-owned public experiments are now implemented on the feature branch:

| Experiment | Slug | Primary category | Runtime approach | Public controls |
|---|---|---|---|---|
| Magnetic Interaction | `magnetic-interaction` | Interface Interactions | React + Motion spring values + Pointer Events | Magnetic strength, field radius, show field |
| Scroll-driven Text Reveal | `scroll-driven-text-reveal` | Motion & Animation | React + Motion `useScroll` / `useTransform` | Reveal span, show scroll progress |
| Gradient Bloom | `gradient-bloom` | CSS Experiments | CSS radial/conic gradients, `color-mix()`, CSS custom properties | Bloom color, intensity, spread |
| Generative Particle Field | `generative-particle-field` | Creative Coding | Native Canvas 2D API | Particle count, movement speed, connection distance, network color |

All three runtimes are code-owned and lazy-loaded through the literal runtime registry. Their public metadata remains separate from `portfolio.projects`. The Labs listing renders static code-authored artwork rather than importing live experiment runtimes. The experiments do not use database-authored executable source.

This entry records the current implementation content, not a new global design-system decision. The fourth Creative Coding category remains without a published experiment.


### 2026-11-03 — Fourth published experiment

Added **Generative Particle Field** (`generative-particle-field`) in the approved **Creative Coding** category.

- Runtime: native Canvas 2D with a code-owned lazy registry entry.
- Controls: particle count (28–120), movement speed (0–2), connection distance (50–180px), and network color.
- Performance safeguards: 30fps target, device-pixel ratio capped at 1.5, ResizeObserver cleanup, and no React state updates per animation frame.
- Accessibility: reduced-motion mode renders a static particle network and the canvas has an accessible description.
- Listing: a separate static SVG/CSS-style artwork preview is used; the Canvas runtime is not imported by the listing page.
- No new dependency was added. Three.js is not used by this experiment.

### Change management

For every future approved change:

1. Update the relevant specification section.
2. Update decision status if the decision changes.
3. Record what changed, why, and the approval date here.
4. Search for dependent sections and update all affected copy, flows, tables, and checklists.
5. Check for contradictions before implementation.

Never leave an approval only in chat while the source-of-truth file remains outdated.

---

## 21. Design-baseline instruction

Treat this document as the detailed Labs and Labs-authentication UX baseline. Implement exactly what is LOCKED, preserve inherited architecture constraints, and do not guess any OPEN decision. CMS remains deferred until Labs is complete. Existing portfolio functionality and visual design must remain unaffected. The repository-aligned implementation guidance and the inspected current tree are documented in Sections 22–30.


---

## 22. Repository Baseline — Actual vs Planned

**Inspection snapshot:** 2026-11-02  \n**Repository:** VishalChoudhary01/Vishal-Kumar-Choudhary-Frontend-Developer  \n**Branch:** docs/portfolio-platform-spec  \n**Inspected head before this documentation update:** 02b54f4066ebbc99ca27b0234b2025183fb11045  \n**Purpose:** Distinguish existing files from proposed Labs files. This section is a remote GitHub repository inspection; it is not a claim that a local build, test suite or complete runtime audit was run.

### 22.1 Existing repository conventions verified

- App Router root: src/app/.
- Existing home page: src/app/page.js (Server Component).
- Existing project detail route: src/app/projects/[slug]/page.js (Server Component with server-side metadata and JSON-LD).
- Existing project detail client composition: src/app/projects/[slug]/ProjectPageView.js.
- Existing reusable UI: src/app/components/.
- Existing shared hooks: src/app/hooks/.
- Existing providers: src/app/providers/.
- Existing application state files: src/app/store/.
- Existing server utility area: src/app/lib/.
- Existing API Route Handlers: src/app/api/.
- Existing static portfolio data: src/app/data/.
- Existing global layout: src/app/layout.js.
- Existing import alias: @/* maps to ./src/* in jsconfig.json.
- Existing build command: npm run build executes scripts/validate-seo.cjs before next build.
- Existing package manager/lockfile: npm with package-lock.json.
- No src/app/labs route, Labs-specific component folder, Labs-specific hooks, Labs API route, Labs model or Labs experiment registry was present in the inspected tree. Those paths below are proposals, not existing implementation.

### 22.2 Current global layout and provider implications

The current src/app/layout.js:

- Loads the existing font families and global design system.
- Mounts AppProviders and UIThemeProvider.
- Renders the main page content and the existing Footer.

AppProviders currently mounts MobileMenuProvider, MotionProvider, SmoothScroll/Lenis and PageLoaderProvider. The theme provider uses next-themes.

Consequences for Labs/authentication implementation:

- Reuse the existing theme, typography, design tokens and reduced-motion behavior; do not introduce a second theme provider.
- Do not add another Lenis instance or another global animation/provider layer.
- The current root layout renders the portfolio Footer for every route. A centered authentication experience has its own compact footer/context row. A nested route-group layout does not automatically remove a Footer rendered by the root layout. Before implementing auth routes, explicitly choose and test a narrow layout-boundary approach that preserves existing portfolio pages. Do not move all existing routes into new route groups as a convenience refactor.
- The existing global PageLoader and Lenis behavior must be checked on Labs/auth routes. Avoid adding a second loader or changing public-route behavior. Route-specific provider scope is an implementation decision after this audit.

### 22.3 Existing utilities and state files

Existing shared hooks include:

- src/app/hooks/useBreakpoint.js
- src/app/hooks/useDownload.js
- src/app/hooks/useReducedMotion.js
- src/app/hooks/useThemeToggle.js
- src/app/hooks/useUiSound.js

Existing state files include:

- src/app/store/index.js
- src/app/store/slices/uiSlice.js

The current slice contains mobile-menu UI state. However, the inspected package manifest and lockfile do not declare @reduxjs/toolkit, and AppProviders.js does not mount a Redux Provider. The store files therefore must be treated as **unverified/unintegrated existing code**, not as proof of a working global Redux store for Labs. Do not extend this store, install a missing package, or migrate Lab state into Redux without a separate repository/dependency decision.

### 22.4 Existing backend utilities

The inspected branch contains:

- src/app/lib/db/mongoose.js — server-only Mongoose connection helper with cached connection/promise behavior.
- src/app/lib/cloudinary/index.js — server-only Cloudinary SDK configuration.
- src/app/api/health/database/route.js — development-only database diagnostic route; it returns 404 in production.
- src/app/api/source-snapshot/route.js — development-only source-context helper; it returns 404 in production and restricts reads to the src/ tree.
- src/app/api/contact/route.js — existing contact transport route.

These are existing foundations, not a completed Labs data layer. Do not repurpose the source-snapshot diagnostic route as a Lab source endpoint. Do not create a public database-health endpoint. Do not expose Mongoose/Cloudinary helpers to Client Components.

---

## 23. Labs Technology Stack and Dependency Policy

### 23.1 Required runtime stack

| Concern | Selected baseline | Labs implementation rule |
|---|---|---|
| Routing/rendering | Next.js App Router | Use Server Components for public listing/detail composition where practical. |
| UI | React 19, JavaScript | Use JSX/ES modules; no TypeScript substitution. |
| Styling | Tailwind CSS v4 | Reuse existing tokens/utilities; no new CSS framework or custom CSS system. |
| Motion | motion/react | Reuse existing Motion conventions; respect reduced motion. |
| Smooth scroll | Existing Lenis integration | Do not add another smooth-scroll library or initialize a second instance. |
| Theme | next-themes and existing UIThemeProvider | Reuse the current theme system and existing theme-aware tokens. |
| Database | MongoDB through Mongoose | Server-only access through the existing connection helper and a Labs repository/service boundary. |
| Media | Cloudinary Node SDK | Server-side operations only; no Cloudinary API secret in the browser. |
| Hosting | Existing Vercel Next.js project | Validate Node.js runtime compatibility for database-dependent Route Handlers. |
| Icons | Existing lucide-react and react-icons | Reuse existing icon packages; avoid a second icon dependency. |
| Server state | Server Components first; TanStack Query only when needed | TanStack Query is approved conditionally but is not a direct dependency in the inspected package manifest. |
| Source viewer | Not selected | Monaco/editor package is not installed; select and dynamically import only after source authorization. |
| Interactive preview | Not selected for untrusted source | Public code-owned demos may load on demand; untrusted source needs an isolated runtime approved by the threat model. |

### 23.2 Existing dependencies are not automatically all Labs dependencies

- The package manifest contains Three.js. Load it only for an experiment that needs 3D and only in that experiment's runtime chunk.
- The package manifest contains Nodemailer for the existing contact route. This does not select Nodemailer as the authentication/verification/reset email provider.
- The package manifest does not list TanStack Query, React Hook Form, @reduxjs/toolkit or a Monaco editor as direct dependencies.
- Do not add a dependency to support an illustrative folder or hook name. First establish an actual behavior that requires it, compare the existing stack, update package.json and package-lock.json together, and record the approval.
- If TanStack Query is later adopted, use it only for client-side server-state interactions that benefit from cache/mutation semantics. Do not mirror every Server Component read into a client query cache.
- Authentication provider, validation library, email provider and code-editor library remain open where not explicitly selected by the product/architecture documents.

### 23.3 Environment variables and server-only configuration

The existing code uses these server-side environment variable names:

- MongoDB: MONGODB_URI, MONGODB_DB_NAME.
- Cloudinary: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.

Only names may appear in documentation. Never include real secret values, a full MongoDB URI, Cloudinary secret, OAuth secret or session secret. Never add NEXT_PUBLIC_ prefixes to credentials.

Authentication/email/session variable names are not finalized. Do not invent names such as AUTH_SECRET, GOOGLE_CLIENT_SECRET or SMTP credentials until the selected provider and integration require them.

---

## 24. Proposed Labs Folder Structure — Adapted to This Repository

**Status:** Labs public experience and authentication/source-management implementation are on `feat/labs-platform-integration`; Atlas, Vercel environment, end-to-end and browser QA gates remain.

The following proposal uses the current src/app convention and keeps public routes, feature UI, client hooks, server-only data access and experiment runtimes separated.

    src/
      app/
        labs/
          page.js                         # Public Labs listing Server Component
          [slug]/
            page.js                       # One published experiment detail Server Component
            loading.js                    # Optional route loading UI if required
            error.js                      # Optional route error boundary if required
        api/
          labs/
            route.js                      # Only if a stable HTTP collection API is required
            [slug]/
              route.js                    # Only if a stable HTTP detail API is required
              source/
                route.js                  # Protected source endpoint; exact contract OPEN
              events/
                route.js                  # Only after event contract/abuse policy is approved
        components/
          labs/
            landing/
              LabsLandingContent.js
              LabsIntroduction.js
              FeaturedExperiment.js
              LabCategoryNavigation.js
              LabGallery.js
              LabCard.js
              LabGalleryStatus.js
            detail/
              LabDetailHeader.js
              LabWorkspace.js
              LabCanvas.js
              LabControlsPanel.js
              LabCanvasActions.js
              LabExplanation.js
              LabSourceAccess.js
              LabAccessDenied.js
              LabRelatedExperiments.js
            source/
              ProtectedSourceViewer.js
              SourceViewerLoading.js
            runtime/
              LabRuntimeBoundary.js
              registry.js
              experiments/
                <experiment-slug>/
                  index.js
                  settings.js
          auth/
            AuthPageShell.js
            AuthPanel.js
            AuthHeading.js
            AuthField.js
            PasswordField.js
            AuthPrimaryButton.js
            AuthInlineError.js
            AuthAlert.js
            AuthConfirmation.js
            AccountMenu.js
        hooks/
          labs/
            useLabCategoryFilter.js
            useLabLoadMore.js
            useLabDemoSettings.js
            useLabFullscreen.js
            useLabSessionSync.js
        lib/
          labs/
            shared/
              categories.js
              constants.js
              formatters.js
            server/
              models/
              repositories/
              services/
              policies/
              schemas/
              dto/
            runtime/
              registry.js
        providers/
          # No new global provider by default.
          # Add a route/feature-scoped provider only for an approved need.

Authentication route paths are still OPEN. When they are finalized, use an App Router route group if it helps share the authentication layout, but remember that the current root layout renders the public Footer globally. Do not assume a nested layout removes it. Any proposed auth route tree is illustrative until route names and the layout boundary are approved.

Folder rules:

1. Keep app route files small. They resolve route params, load safe server data, generate metadata and compose page components.
2. Keep Labs presentation in components/labs; do not place Lab UI inside portfolio project-detail components.
3. Keep Labs-only hooks in hooks/labs. Reuse existing shared hooks only where their behavior is appropriate.
4. Keep all MongoDB models/repositories/services/policies and Cloudinary administrative operations server-only.
5. Put only browser-safe formatting/constants in labs/shared. Never import server-only modules through a shared barrel file.
6. Keep experiment runtimes code-owned and selected through an explicit registry. The database may store validated configuration and media references, not arbitrary executable React/JavaScript source to evaluate in the main app.
7. Load only the selected experiment's runtime. The listing must not import every runtime.
8. The source viewer/editor is a separate lazy boundary and is loaded only after server-side authorization succeeds.
9. Add Route Handlers only where an HTTP API is needed. Same-app mutations may use Server Actions if appropriate and documented; do not create duplicate endpoints.
10. Do not create admin/CMS folders as part of Labs implementation. CMS remains deferred until Labs is complete.

---

## 25. Labs Component Architecture and Responsibilities

Component names below are proposed names to clarify responsibilities. They are not a mandate to create one file for every bullet. Group or split components based on actual complexity while preserving the ownership boundaries.

### 25.1 Listing route

Server route composition:
- Load published public Lab metadata only.
- Select the featured experiment from approved public metadata.
- Generate page metadata/canonical metadata from published records.
- Pass only safe display DTOs to Client Components.
- Do not query or serialize source code, private demo configuration, unpublished drafts or private access policy internals.

Presentation components:
- LabsLandingContent: page-level section composition.
- LabsIntroduction: editorial intro; final heading/body copy remain open.
- FeaturedExperiment: 40:60 desktop layout, approved content hierarchy and static preview.
- LabCategoryNavigation: All plus the four approved categories; text tabs with persistent active underline.
- LabGallery: uniform responsive grid and active-filter results.
- LabCard: one semantic link per experiment, no nested interactive controls.
- LabGalleryStatus: count, loading, empty, no-results, error and Load More feedback.

The listing renders static optimized image/poster previews. It does not initialize live demo runtimes, Monaco or source code.

### 25.2 Experiment detail route

Server route composition:
- Resolve the slug and published experiment record.
- Return notFound for missing/unpublished public records according to the final publishing contract.
- Generate metadata from public fields only.
- Compose a client workspace boundary only where the selected experiment requires interaction.
- Do not load source data into the initial public page payload.

Presentation components:
- LabDetailHeader: category, title, short description and inline technologies.
- LabWorkspace: 70:30 demo/control arrangement where controls exist.
- LabCanvas: contained experiment-specific canvas with the approved responsive ratio.
- LabControlsPanel: settings controls only when the experiment has meaningful settings.
- LabCanvasActions: Restart/Fullscreen only when supported; no duplicated Reset action.
- LabExplanation: one short paragraph, not a long technical article.
- LabSourceAccess: compact bordered sign-in/create-account prompt.
- LabAccessDenied: dedicated permission-denied state without source data.
- LabRelatedExperiments: only after related-experiment matching/layout is finalized.

### 25.3 Runtime boundary

- A code-owned experiment registry maps an approved slug to a lazy loader.
- The registry must not eagerly import all experiments into the listing.
- Only the selected experiment runtime is imported on its detail page.
- The experiment receives only its validated public configuration and the controls defined for that experiment.
- Settings state belongs to the selected experiment workspace, not a global Labs store.
- Restart restarts the runtime/animation while preserving settings.
- Reset restores the experiment's approved default settings; it is not the same as Restart.
- A public code-owned demo can be available to guests.
- Never eval database source or render untrusted source as a React component in the main portfolio runtime.
- If an untrusted/admin-managed interactive preview is required, stop at the runtime boundary until the isolated execution provider, origin, CSP, network policy, dependency allowlist and resource limits are approved and tested.

### 25.4 Protected source viewer

- LabSourceAccess is a navigation prompt, not the security boundary.
- A server Route Handler/Server Action/use case authenticates and separately authorizes the source request.
- Only after authorization may the server return the source DTO.
- ProtectedSourceViewer receives source only after authorization succeeds.
- Dynamically import the selected editor package only when the authorized source viewer is opened.
- Do not preload the editor, source or editor language bundles on the listing, homepage or public demo.
- No unauthorized response may include source, code metadata that reconstructs it, or a reusable public asset URL.
- Exact source-file navigation, copy/download controls and editor UI remain OPEN until designed.

---

## 26. Labs Hooks — Responsibilities and Limits

Hooks are client-only orchestration helpers. They do not become the location for database access, authorization, API contracts or domain business rules.

### 26.1 Existing hooks to reuse

- useReducedMotion: reuse the existing MotionContext-backed reduced-motion preference.
- useBreakpoint: reuse only where JavaScript behavior truly needs a breakpoint. Prefer Tailwind responsive utilities for visual layout and aspect-ratio changes.
- useThemeToggle / existing theme utilities: reuse the current next-themes system. Do not create a separate Labs theme toggle implementation.
- useDownload: do not use for source download unless a secure, authorized download flow is explicitly approved.
- useUiSound: optional existing global utility; do not add sound effects to Labs without a product decision.

### 26.2 Proposed Labs-specific hooks

| Hook | Responsibility | State scope |
|---|---|---|
| useLabCategoryFilter | Track active category and reset the visible count when category changes. | Labs listing page only |
| useLabLoadMore | Append the next six matching records and expose visible/total counts. | Labs listing page only |
| useLabDemoSettings | Own one experiment's current settings and restore its explicit defaults. | One experiment runtime only |
| useLabFullscreen | Manage supported Fullscreen API entry/exit and cleanup. | One experiment workspace only |
| useLabSessionSync | Listen for cross-tab session-change notifications and revalidate with the server. | Authenticated shell only, after session architecture is selected |

Do not create every proposed hook pre-emptively. A hook is warranted when it encapsulates reused or non-trivial client behavior; simple one-component state should remain close to that component.

### 26.3 Query hooks, if TanStack Query is adopted later

Potential query/mutation hooks include:
- useLabsListQuery for client-interactive search/filter/pagination where server-rendered data alone is insufficient.
- useLabDetailQuery only if the detail interaction requires client refetching.
- useLabLikeMutation only after like behavior and API contracts are approved.
- useLabSourceQuery only after auth/authorization, no-store behavior and cache isolation are designed. Source must never enter a public/shared cache.

These are examples, not approved hook names or an instruction to install TanStack Query. Server Components remain the default for initial listing/detail reads.

---

## 27. State Ownership and Management Strategy

Do not put all Labs state into one global store. State must be kept at the narrowest owner that can correctly control it.

### 27.1 Server-authoritative state

Owned by server services/repositories and MongoDB when the relevant schema/use case is approved:
- Published Lab metadata and publication state.
- Featured/category/tag/technology metadata.
- Validated experiment configuration and media references.
- User account and email-verification status.
- Authentication session and server-derived actor.
- Source-access authorization decisions.
- Full source records or repository-backed source references.
- Likes, analytics events and user activity only after their PRD schemas/policies are finalized.

The browser cannot authoritatively change role, publication state, user identity, source permission or server counts.

### 27.2 Server-rendered page data

- Listing and detail pages should load safe public data on the server where practical.
- Pass only public, render-required DTOs to client components.
- Keep full source, draft records, private settings and access-control internals out of serialized props and RSC payloads.
- Use explicit cache policies: public published metadata may be revalidated; user-specific/source responses must be private/no-store as required.
- Cache invalidation and TanStack Query invalidation are separate responsibilities.

### 27.3 Local client UI state

Keep these states local to the page/component that owns them:

- Active category.
- Number of visible listing items.
- Open/closed account dropdown.
- Password visibility.
- Form values, touched fields, validation errors and submission status.
- One experiment's current settings.
- Restart/playing/paused/interaction state for one experiment.
- Fullscreen UI state.
- Local copy-feedback and transient status messages.

Do not persist transient state in MongoDB or a global store unless a later product requirement explicitly makes it durable.

### 27.4 Authentication/session state

- The server session/provider is authoritative.
- Client components may receive a sanitized account/session view needed to render the account menu or protected UI.
- Never store passwords, verification tokens, reset tokens, OAuth tokens or privileged session credentials in Redux, React Context, localStorage or sessionStorage.
- Hiding a source button or source viewer on the client is not authorization.
- Every protected request must re-check server session and resource authorization.
- Cross-tab messages are notifications only. Other tabs must revalidate against the server before allowing protected actions.
- Clear stale account-specific caches and protected content on logout, session expiry or password-reset revocation.

### 27.5 Global application state

The current branch's store files are not proven to be an active global state system: the package manifest/lockfile do not declare @reduxjs/toolkit, and AppProviders does not mount a Redux Provider. Do not treat Redux Toolkit as an approved Labs dependency or add a Labs slice without first resolving that repository inconsistency.

Current Labs decisions do not require a new global store. Prefer local React state for the listing and experiment workspace. Revisit global state only when a verified cross-route requirement cannot be handled by server state, route state or local component state.

### 27.6 URL state

- The All/category filter and initial six-item view are locked.
- Whether active category/search/sort/filter state must be represented in search parameters and restored by browser back/forward is OPEN.
- Do not invent query parameter names or silently make filters shareable/bookmarkable.
- If URL state is later approved, define normalization, defaults and cache keys together.

---

## 28. Route, Data and Implementation Flow

### 28.1 Public listing

1. Visitor requests /labs.
2. Server page loads published public Lab metadata.
3. Server selects only fields needed for the featured section, category navigation and first gallery page.
4. The response excludes source, draft/private fields and privileged runtime details.
5. Client listing controls manage category selection and visible-count progression.
6. Static media loads responsively; no runtime/editor is initialized.

### 28.2 Public experiment detail

1. Visitor requests /labs/[slug].
2. Server resolves the slug against published public content.
3. Server renders public metadata and SEO.
4. Only the selected code-owned public demo runtime is dynamically loaded when the workspace needs it.
5. Per-experiment settings remain local to the workspace.
6. Public demo functionality does not require a user account unless the specific preview is explicitly classified as restricted and its security/auth policy is approved.

### 28.3 Protected source request

1. Visitor selects Sign in to view source or Create an account.
2. Preserve a validated local return path to the current experiment/source destination.
3. Complete email/password or Google sign-in; registration follows the generic confirmation and verification UX already locked in this document.
4. On successful Login, return to the preserved local destination.
5. Server verifies the session.
6. Server separately checks the experiment's source authorization policy.
7. Only an authorized response returns full source with private/no-store semantics.
8. Only then load the source viewer/editor package.
9. Unauthorized users see Access not available and receive no source payload.

### 28.4 Backend operation

Use the Next.js-native request flow defined in docs/ARCHITECTURE.md:
- Route Handler or Server Action as the transport boundary.
- Server-derived actor/session.
- Validation at the boundary.
- Domain service/use case for behavior and authorization invariants.
- Repository for Mongoose/MongoDB.
- Safe DTO/result returned to the UI.

Do not create Express controllers or a separate Express deployment unless an approved architecture decision changes the current default.

### 28.5 Implementation sequence

Recommended vertical slices after explicit implementation authorization:

1. Repository/baseline recheck: branch head, package files, route tree, layout/footer, providers, tests and current deploy status.
2. Resolve remaining blockers: final Better Auth session policy, route naming/API details, singleton owner identity bootstrap, editor choice, exact source file limits, exact password policy if changed, email operations, public-vs-restricted preview classification, and cache contracts.
3. Implement public Labs listing with safe published metadata and static thumbnails; verify the current portfolio does not load Labs-only code.
4. Implement one experiment detail route and one code-owned demo runtime; verify mobile/desktop canvas, controls, restart/fullscreen/reset and reduced motion.
5. Implement the validated Lab repository/service/DTO layer and any needed Next.js Route Handlers/Server Actions. Do not finalize schema fields from illustrative examples.
6. Implement the authentication screens with the selected provider, including email/password and Google, using the approved layout and states.
7. Implement protected source flow and authorization; add an editor only after a package is selected and the server boundary is verified.
8. Add likes, analytics, user dashboard or other PRD capabilities only with their approved schemas, UI decisions, privacy policy and contracts.
9. Run focused, security, responsive, accessibility, performance and portfolio-regression checks. Record evidence; do not claim unrun tests.
10. Complete Labs before opening CMS/Admin implementation.

---

## 29. Cross-Document Alignment and Conflict Register

The repository contains older broader platform requirements that remain relevant but are not all covered by this page-level UX design.

1. **Public route naming:** PRD/DESIGN-LAB examples include singular /lab. This document locks /labs for the Labs listing and /labs/[slug] for detail. Update route references in dependent docs before implementation; do not ship duplicate route aliases by assumption.
2. **Backend:** any older Express-oriented architecture wording is superseded by docs/ARCHITECTURE.md and docs/README.md. Next.js-native server modules, Route Handlers and Server Actions are the default. Express remains conditional and requires explicit approval.
3. **Authentication:** Email/password and Google sign-in are required by PRD. This document defines the email/password UX in detail; Google button presentation and provider integration still need a decision. GitHub is not selected.
4. **Guest demos vs restricted previews:** this document allows guests to use explicitly public demos. It does not authorize untrusted code execution in the main application. The threat model and isolation architecture still gate admin-authored/untrusted interactive previews.
5. **Guest source exposure:** no source bytes (full or partial) are returned to guests or signed-in unverified accounts. Only signed-in verified accounts can load/copy published source.
6. **Search/sort/likes/analytics/dashboard:** PRD/DESIGN-LAB describe broader search fields, filtering/sort options, likes, user activity and analytics. The current landing-page UX locks the category navigation and six-item Load More interaction, but does not define every broader filter/sort control or engagement widget. These product requirements are not silently cancelled; their detailed UI, URL state, API and privacy contracts remain OPEN.
7. **Related experiments:** the section is in the detail-page order, but exact matching, number, layout and empty-state behavior remain OPEN.
8. **Authentication route layout:** current root layout renders the portfolio Footer globally. A separate auth footer/layout requires a deliberate route/layout boundary. Do not assume route groups alone remove the root Footer.
9. **State tooling:** TanStack Query is conditionally approved but not a direct dependency in the inspected package manifest. The current Redux store files import a package absent from the manifest and are not mounted by AppProviders. Neither is an established Labs state layer today.
10. **Source editor:** Monaco is not installed, and editor UI/package choices remain OPEN. Its loading boundary must remain inside the owner workspace after server-side owner authorization. Source lifecycle and immutable-version data rules are defined in Section 37.
11. **Documentation precedence:** PRD owns product capabilities; ARCHITECTURE owns server boundaries; API-CONTRACTS owns API contracts; PROJECT-STRUCTURE owns generic module conventions; this document owns detailed Labs/auth UX. Where page appearance or interaction details conflict with older DESIGN-LAB examples, this newer approved UX baseline controls. Where a feature requirement is not addressed here, PRD/DESIGN-LAB continue to apply.

Before feature coding, update any dependent PRD/API/README wording that still uses obsolete route or preview assumptions. Do not silently leave conflicting paths in examples.

---

## 30. Final Agent Instructions

- Treat Sections 0–21 as the approved Labs/authentication UX baseline, Sections 22–29 as repository-aligned technical guidance and explicit conflict resolution.
- Treat every proposed file/folder/component/hook name in Sections 24–26 as a module-boundary proposal, not an existing file or an instruction to create empty scaffolding.
- Inspect the current branch head before implementation. The repository tree may change after this snapshot.
- Follow docs/ARCHITECTURE.md and docs/API-CONTRACTS.md for technical/security/API decisions.
- Use Next.js App Router, JavaScript, Tailwind CSS v4, Motion, current theme/provider conventions, MongoDB/Mongoose and Cloudinary as already established.
- Do not create a separate Express server by default.
- Do not assume TanStack Query, Redux Toolkit, React Hook Form, Monaco or another package is installed because it is mentioned in a proposal.
- Keep server state, local UI state, experiment runtime state and authentication state separate.
- Do not execute untrusted source in the main application runtime.
- Do not place secrets or source code in public bundles, local storage, global state or public caches.
- Do not modify unrelated portfolio routes/components or move the current application tree just to match a proposed diagram.
- CMS/Admin remains deferred until Labs is complete.
- Do not begin implementation unless the user explicitly authorizes it.


## 32. Runtime Action Parity — 2026-11-03

The shared experiment workspace must display the approved compact action row beneath every runtime that declares both capabilities:

- **Restart** reinitializes the current experiment runtime while preserving the current control settings.
- **Fullscreen** expands the experiment canvas and retains the explicit **Exit fullscreen** control in the fullscreen layout.
- The browser Fullscreen API must be feature-detected. The Fullscreen action is rendered only when the browser supports it.
- Restart behavior is runtime-specific:
  - Magnetic Interaction: reset pointer displacement and interaction state.
  - Scroll-driven Text Reveal: return page scroll progress to the beginning; in fullscreen, reset the internal scroll container to the beginning.
  - Gradient Bloom: replay the subtle gradient entrance transition.
  - Generative Particle Field: recreate the particle positions and restart the animation loop.
- Restart must not reset the settings panel. **Reset settings** remains a separate action and restores the approved default values.
- Reduced-motion preferences disable smooth restart movement and non-essential entrance animation.

The current four published experiment records declare both `restart` and `fullscreen` capability. Do not turn these actions off for the three newer experiments unless a later approved runtime decision establishes a concrete incompatibility.


## 33. Labs Scroll Ownership — 2026-11-03

- The public Labs listing (`/labs`) and every Labs detail route (`/labs/[slug]`) use native browser scrolling.
- The global Lenis provider must not intercept or interpolate wheel, trackpad or touch scrolling while the active pathname is `/labs` or starts with `/labs/`.
- On entry into Labs, destroy any active Lenis instance and clear the shared `window.lenis` reference. On leaving Labs for an existing portfolio route, initialize Lenis again using the existing global settings.
- Existing portfolio routes retain the existing Lenis configuration and behavior. Do not remove Lenis globally or add a second scroll library.
- Motion `useScroll` inside an experiment may observe native document or explicitly owned fullscreen-container scrolling. It must not call `preventDefault` on wheel/touch events or capture page scroll input.
- A fullscreen experiment may use its own scroll container only when the experiment requires one. Its scroll area must be bounded to the fullscreen canvas, must retain an explicit exit-fullscreen action, and must not leave document scrolling locked after exit.
- PageLoader route-change cleanup remains responsible for releasing overlay scroll locks. It must not re-enable Lenis on a Labs route.
- Verify wheel, trackpad, touch, keyboard Page Down/Space, scrollbar dragging, back/forward navigation, fullscreen entry/exit, and reduced-motion behavior on Labs and existing portfolio routes.



## 34. Labs Landing Page Visual Refinement — 2026-11-03

The existing hybrid showcase, 40:60 featured layout, category treatment, 4:3 media, and uniform 3/2/1 responsive gallery remain unchanged. The current implementation refines hierarchy without changing the approved interaction model:

- The hero retains its existing headline and descriptive copy. A responsive collection-overview rail presents live counts for published experiments and categories represented by those experiments. The rail stacks alongside the hero on wider layouts and becomes a compact two-column metric row on narrow layouts.
- The featured experiment remains Magnetic Interaction. Its content hierarchy and sole visible CTA are preserved; its visual preview remains static and 4:3. No experiment runtime is initialized on the listing page.
- Gallery cards keep one semantic link, open editorial treatment, category/title/description/inline technologies and the existing 4:3 static artwork. Content uses a flex-column layout so varying title/description lengths do not misalign the technology row and arrow.
- Cards include a quiet ordinal marker. This is presentation metadata only and does not introduce nested controls.
- Category navigation remains horizontally scrollable only within its own region on mobile.
- Existing copy is retained where not explicitly approved for change. No authentication, source access, CMS, new dependency or runtime behavior is included in this visual-refinement slice.



## 35. Category Navigation Scrollbar — 2026-11-03

- The Labs category navigation is horizontally scrollable within its own region on narrow viewports.
- Native scrollbar chrome must be visually hidden, including browser-specific scrollbar arrow buttons. The horizontal scroll behavior itself must remain available through touch, trackpad, mouse/shift-wheel and keyboard where supported.
- Do not add custom arrow buttons or visual scroll indicators to the category navigation.
- The hidden-scrollbar treatment must not create page-level horizontal overflow, clip focus rings, or change the active underline.
- Keep this rule scoped to the category-navigation element. Do not hide or restyle the global portfolio scrollbar.



## 36. Labs Authentication and Protected-Source Implementation — 2026-11-03

This section records the implementation baseline on `feat/labs-public-page`. It does not claim that live credentials have been configured or that the security acceptance tests have passed.

### 36.1 Authentication provider and persistence

- **Selected:** Better Auth with `@better-auth/mongo-adapter`, using the native MongoDB driver and the configured `MONGODB_URI` / `MONGODB_DB_NAME`.
- Mongoose remains the application data-model/repository connection. Both clients target the same configured database, remain server-only and use bounded pools.
- Authentication APIs are mounted at `/api/auth/[...all]`. The raw Better Auth email sign-up endpoint is blocked; public registration must use the consent-aware `POST /api/labs/register` route.
- Email/password is enabled. Sign-up does not automatically establish a session; email verification is required before sign-in.
- Passwords currently enforce 8–128 characters. Password reset revokes existing sessions.
- Google sign-in is conditionally enabled when both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` exist. The action is hidden if those credentials are absent. Implicit Google account creation is disabled; trusted Google account linking is enabled for existing accounts. Configure the provider callback URL as `/api/auth/callback/google` on the registered production origin.
- No GitHub provider is enabled.

### 36.2 Registration, email verification and privacy

- Registration writes a server-managed receipt in the private `labs_registration_consents` collection. It stores the server-selected Terms/Privacy versions, server timestamp, a keyed email digest, linked Better Auth user ID and verified timestamp. Consent values are not editable from client profile input.
- The Terms of Service and Privacy Policy are first-party pages at `/terms` and `/privacy`. Their canonical URLs derive from `NEXT_PUBLIC_SITE_URL`; server-side policy versions are maintained in `src/app/lib/legal/policies.js`.
- Registration stays disabled unless MongoDB/auth secrets and SMTP delivery are configured. First-party Terms and Privacy pages are wired into the sign-up flow; current versions are selected by the server.
- Consent receipts live in `labs_registration_consents`; verification-flow identifiers and status live separately in `labs_verification_flows`. Email values are stored only as keyed HMAC digests in these records, not in plaintext.
- Public legal routes `/terms` and `/privacy` are included in the sitemap and linked from the footer, contact form and Labs sign-up page. Policy versions are server-owned (`2026-11-04` initially) and must be incremented alongside material text changes.
- Duplicate and new-account submissions receive the same generic public response. Account-specific results are not returned to the browser.
- A server-side HMAC rate limit allows at most five registration attempts per trusted proxy IP per minute. Configure `AUTH_TRUSTED_IP_HEADER` to the deployment's trusted proxy header; do not trust a browser-controlled forwarding header.
- Better Auth rate limits additionally apply to sign-in, social sign-in, password-reset request/completion and verification resend routes. Registration HMAC IP-bucket records expire automatically after 24 hours.
- Email delivery uses the existing Nodemailer dependency through a configurable authenticated SMTP transport. No specific SMTP vendor is selected or assumed.
- Verification-link lifetime uses the Better Auth default (one hour in the selected version); no product-specific expiry override is configured. The resend UI uses the locked 30-second cooldown and remains subordinate to server-side rate limiting.
- Sign-up and resend callbacks carry a random, short-lived verification-flow ID. Better Auth's `afterEmailVerification` hook marks the server-side flow verified; the UI never trusts a query-string flag alone.
- Password-reset requests use Better Auth's privacy-safe response and configured SMTP sender. Reset completion requires a valid token and returns the user to Login; it does not automatically sign the user in.

### 36.3 Routes and session behavior

- Authentication pages are implemented as a separate route-group layout at:
  - `/labs/login`
  - `/labs/signup`
  - `/labs/forgot-password`
  - `/labs/reset-password`
  - `/labs/verify-email`
- The public Labs listing and experiment pages remain available without authentication.
- Return destinations are limited to safe, same-origin relative paths under `/labs`. External, protocol-relative, malformed and authentication-route destinations are rejected.
- The Labs header shows a compact account menu only for an active server-backed Better Auth session.
- Cross-tab sign-in/sign-out/reset events use BroadcastChannel with a localStorage fallback. An open protected-source view also revalidates its session every 60 seconds and when the tab becomes visible.
- Session lifetime and concurrency policy remain open. The implementation currently uses Better Auth defaults rather than asserting a separately approved lifetime.
- The global portfolio footer is suppressed only on the Labs authentication routes. Existing public portfolio routes retain their existing layout.

### 36.4 Protected source endpoint and authorization

- Full source is served only by `GET /api/v1/labs/:slug/source`.
- **Current legacy behavior:** every request verifies the server-side Better Auth session, requires a verified email, checks an active grant for the current user and experiment, then loads a published source snapshot from the private `lab_sources` collection. Remove the grant lookup as part of the approved migration; target requests require only verified session + published source.
- **Legacy only:** grants are currently stored in `lab_source_grants`. The target policy retires this collection from authorization. No per-user grant is created, queried or required.
- Responses use `private, no-store` / `no-cache` headers and are not included in public page data, metadata or static generation.
- Source file paths are validated; snapshots are bounded to 40 files, 500 KB per file and 1 MB total response content.
- No source snapshot is seeded by the current implementation. A verified account can read source automatically only after the source snapshot is provisioned and published; no source grant is needed.
- No per-user grant-management screen is introduced or planned. Owner source management and aggregate source-engagement analytics are separate capabilities.

### 36.5 Important source-confidentiality boundary

The repository is currently public, and the four interactive Labs demos are code-owned client runtimes. Code shipped to a visitor's browser is not confidential merely because the source-viewer UI is protected. The new Atlas-backed source store protects separate source snapshots returned by the protected endpoint; it does not retroactively make the public repository, client bundles or already published runtime code private.

Do not copy code that must remain confidential into the public repository or expose private snapshots through the public runtime. A real confidential-source release requires the relevant source snapshot to exist only in private storage/repository and a reviewed build/runtime boundary. The current source viewer displays stored source as text; it does not evaluate database-supplied JavaScript. The public code-owned demos continue to run unchanged.

### 36.6 Deployment and release gates

- Configure the environment variables documented in `.env.example`.
- Configure SMTP and send/receive a real verification and password-reset email before enabling registration.
- Publish the actual Terms of Service and Privacy Policy, then set their HTTPS URLs and version identifiers. Until then, sign-up remains disabled by design.
- Configure Google OAuth credentials and an approved callback origin to enable Google sign-in.
- Provision and publish a private source snapshot. Verify guests/unverified accounts are denied and any verified test account can read it without a grant.
- Run the full responsive/light-dark/authentication/accessibility regression suite and production build. This branch has not been locally built or browser-tested in the connected GitHub-only environment.
- Do not begin CMS work as part of this implementation slice.
## 37. Owner-managed Labs source lifecycle — 2026-11-04

This section resolves the gap between the public source-access panel and the owner capabilities needed to create and maintain actual source snapshots. The detailed source-management specification is `docs/LABS-SOURCE-MANAGEMENT-SPEC.md`; it is the implementation planning authority for owner source management.

### 37.1 Current baseline and missing capability

- Better Auth + MongoDB adapter authentication is implemented on the Labs branch.
- Current `LabSource` stores one mutable record per slug with embedded files, version string and published flag.
- Current `LabSourceGrant` stores one grant per user/experiment and has a unique index.
- Current `GET /api/v1/labs/:slug/source` requires a verified session, matching active grant and published source record.
- Owner source create/edit/save/publish/unpublish/version/restore and audit UI/APIs are not implemented; source-engagement analytics is also not implemented.
- Existing Atlas database setup did not yet show source collections or actual source snapshots. Empty collection creation is not equivalent to provisioning the source.

### 37.2 Owner policy

- First release is a singleton portfolio owner, not a general multi-admin system.
- **LOCKED — USER APPROVED (2026-11-04):** owner identity is a server-only `LABS_OWNER_USER_ID` matching the stable Better Auth ID of the verified owner account. The owner is the sole privileged administrator for the first source-management release and manages all source lifecycle plus source-engagement analytics. Missing configuration denies owner access.
- Missing owner configuration denies owner operations. Never infer owner from first registration, email domain, browser state or request payload.
- Owner authorization is checked server-side at every protected route/action and domain boundary.
- Owner source-management capability is separate from regular source reads. Owner can create/manage drafts and versions; every other verified user reads published source automatically.
- Public registration never creates or elevates an owner/admin role.

### 37.3 Source lifecycle

- Owner source editing is text-only; no code execution, terminal, package install or server execution.
- The target storage model separates a source aggregate (experiment slug + draft/published pointers) from immutable version snapshots (file tree, server-computed content hash, version, parent version, actor and timestamp).
- Save draft creates an immutable version and updates only the draft pointer.
- Publish selects an exact saved version and advances the published pointer after explicit confirmation.
- Unpublish prevents new source reads for all regular users but preserves historical versions and engagement analytics.
- Restore creates a new draft snapshot from an older immutable version.
- No per-user source-grant row is retained in the target model. A unique current like row is maintained per verified user + experiment; append-only analytics events record source opens, copies and like/unlike transitions; audit events record owner source mutations.
- The schema migration must preserve the current embedded-file model and any existing records until reconciliation succeeds; do not drop source data before a tested migration/rollback.

### 37.4 Owner UI scope

- Protected inventory of experiment source records and draft/published state.
- File tree with add/edit/rename/delete text-file operations, safe path and size validation, and unsaved-state protection.
- Save draft, validation result, version history, compare/restore, explicit publish/unpublish.
- Source-engagement analytics: per-experiment source opens, unique verified accounts, code-copy actions, current active likes, like/unlike transitions, trends and rankings. The dashboard shows aggregates only, not a list of individual users.
- Owner-only audit history.
- Lazy-load the chosen editor only within the protected owner workspace. Monaco is not installed in the inspected package manifest; editor choice and exact layout remain OPEN until reviewed.
- Owner-only routes/APIs are private/no-store and must not load editor dependencies on the homepage, Labs listing or normal experiment pages.
- A discoverable owner-only entry point may appear in the account menu and/or the experiment source section, but owner capability must be server-derived; a client flag is not authorization.
- Editing/publishing the protected Atlas snapshot does not modify the code-owned public demo. Live demo changes remain in the canonical source repository and normal deployment workflow; running stored source requires the separately approved isolated-preview boundary.

### 37.5 Security and execution boundary

- Server derives actor ID from Better Auth; never accept a client user ID, owner role, grantor, active flag, published pointer or content hash as authoritative.
- Validate file paths, file count, UTF-8 byte limits, languages, duplicate names and suspicious secret-bearing content on the server. Do not log source text or matched secret values.
- Save, publish, unpublish and restore mutations require concurrency protection, idempotency and owner audit events. Verified-user source-open/copy/like events use a separate idempotent analytics event stream.
- The existing public demos remain code-owned. Stored source is text only; do not evaluate it in the main app or server.
- Any later live execution of owner-authored code requires a separate isolated-preview runtime choice and threat-model review.

### 37.6 Implementation authorization

The existence of this specification does not authorize code changes. Owner identity is approved. Implementation must follow the phases and gates in `LABS-SOURCE-MANAGEMENT-SPEC.md`; the editor dependency and source-import strategy remain open and must be resolved before their dependent implementation work. CMS, general portfolio content management and multi-admin functionality remain deferred.

### 37.7 Verified-user source engagement and admin analytics

- Every signed-in account with `emailVerified === true` can open and copy any published experiment source without owner permission or an individual grant.
- Guests and signed-in unverified accounts cannot access source bytes or source-copy controls. The existing best-effort public experiment-like behavior remains available where supported; verified accounts receive persistent likes.
- `source_open` counts a successful source-viewer open after the protected source response succeeds; public detail-page views are counted separately.
- `code_copy` counts a successful Clipboard API write acknowledged by the client and accepted by the server; no clipboard content is sent to analytics.
- Verified `like` and `unlike` events are counted only when a unique per-user/experiment like-state record changes on the server. Best-effort guest-like actions may be counted separately where measurable, without a unique-person claim.
- The Owner/Admin dashboard presents aggregate rows by experiment: detail views, source opens, unique verified accounts, copies, current active verified likes, verified like/unlike counts, and guest-like action counts separately where measurable, with date-range trends/rankings.
- The first release does not show individual account names/emails or user-level source-view/copy/like history. Analytics retention, deduplication and account-deletion handling must be approved and included in the Privacy Policy before production event writes.
