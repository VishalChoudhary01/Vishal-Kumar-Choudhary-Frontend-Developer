# Portfolio Documentation — Source of Truth

**Audited branch:** feat/labs-platform-integration  
**Audit date:** 2026-11-07  
**Current status:** [PROJECT-STATUS.md](./PROJECT-STATUS.md)

This folder is the engineering handover for the complete portfolio platform. Start with the current status and current-state engineering guides. Older design specifications and phased implementation plans are retained where they preserve useful decisions/history; they must not be read as proof that an item is still planned or still pending.

## 1. Read this first

1. [Current Project Status](./PROJECT-STATUS.md) — current code status, future boundary, release checks and document authority.
2. [System Architecture](./architecture/SYSTEM-ARCHITECTURE.md) — current frontend/backend/domain responsibilities and major data flows.
3. [Homepage Engineering](./pages/HOME-PAGE-ENGINEERING.md) — every homepage section, component hierarchy, scroll and Motion reconstruction guide.
4. [Project Detail Engineering](./pages/PROJECT-DETAIL-ENGINEERING.md) — project route, metadata, fixed template, data contract and optional sections.
5. [Scroll and Motion Engineering](./architecture/SCROLL-AND-MOTION-ENGINEERING.md) — Lenis/native scroll policy, page-loader reset, sticky/pinned timelines, reduced-motion and QA.
6. [Theme Toggle Engineering](./architecture/THEME-TOGGLE-ENGINEERING.md) — complete theme state ownership, OLD/NEW snapshot behavior, four transition variants, accessibility, fallbacks and cleanup.
7. [Labs Runtime and Code Execution](./architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md) — source → compiler → sandbox → immutable artifact → isolated public runtime.
8. [Data Model Catalogue](./architecture/DATA-MODEL-CATALOG.md) — actual Mongoose collections, fields, constraints and indexes.
9. [API Endpoint Inventory](./api/ENDPOINT-INVENTORY.md) — all current Route Handler endpoints and methods.

## 2. Current-state page guides

- [Homepage](./pages/HOME-PAGE-ENGINEERING.md) — hero, About, Education, Skills, Experience, Projects and Contact, including animation/scroll reconstruction.
- [Vee Mascot](./pages/PORTFOLIO-MASCOT-ENGINEERING.md) — homepage companion 3D scene, scroll-based position/poses, section reactions and interactive scan system.
- [Project Detail](./pages/PROJECT-DETAIL-ENGINEERING.md) — server/static route behavior, hero, snapshot, context, approach, design, engineering, motion, responsive, showcase, reflection, navigation.
- [Public Labs and Owner Workspace](./pages/LABS-AND-OWNER-WORKSPACE.md) — public listing/detail, likes/source, owner analytics, inventory/editor, experiment metadata and media.
- [Analytics Engineering](./pages/ANALYTICS-ENGINEERING.md) — separate Portfolio Analytics and Labs Engagement Analytics contracts.

## 3. Architecture and engineering references

- [System Architecture](./architecture/SYSTEM-ARCHITECTURE.md) — current rendering/backend/persistence/infrastructure boundaries.
- [Scroll and Motion Engineering](./architecture/SCROLL-AND-MOTION-ENGINEERING.md) — scroll-controller ownership, Motion graph types, breakpoints and test matrix.
- [Theme Toggle Engineering](./architecture/THEME-TOGGLE-ENGINEERING.md) — next-themes ownership, OLD/NEW snapshot rules, rectangle/circle/circle-blur/blinds transitions, fallback and click sound.
- [Sound Engineering](./architecture/SOUND-ENGINEERING.md) — shared Web Audio hook, Vee voice/laser and ThemeToggle click sound, complete asset inventory, autoplay policy and extension guide.
- [Layout Layers and Design Tokens](./design/LAYOUT-LAYERS-AND-TOKENS.md) — actual fonts, light/dark semantic tokens, Tailwind v4 scan setup, root provider nesting and shared layout layers.
- [Data Model Catalogue](./architecture/DATA-MODEL-CATALOG.md) — current collections and schema constraints; live Atlas indexes still require environment verification.
- [Labs Runtime and Code Execution](./architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md) — built-in runtime, Monaco editor, unsaved Run, immutable publishing, artifact security and poster/media lifecycle.
- [API Endpoint Inventory](./api/ENDPOINT-INVENTORY.md) — route/method/auth/access index for all 36 handlers.
- [Environment and Release](./operations/ENVIRONMENT-AND-RELEASE.md) — local setup, actual env variable use, scripts, build gates, release QA and known stale .env.example contact configuration.

## 4. Future implementation — explicitly not part of current implementation

- [Portfolio CMS and Project Detail CMS](./future/PORTFOLIO-CMS-AND-PROJECT-DETAIL-CMS.md) — approved content boundary, current source-field mapping and future data/version/cache gates. It is not implemented.
- [Google and GitHub OAuth](./future/GOOGLE-GITHUB-OAUTH.md) — provider code exists behind credential checks; Preview/Production configuration and complete E2E acceptance remain pending.

## 5. Existing product, design and security authorities

These original flat documents remain important for decisions and detailed requirements. Read them together with the current-state guide above.

- [Product Requirements](./PRD.md)
- [Decisions](./DECISIONS.md)
- [Admin/CMS Design](./DESIGN-ADMIN.md) — future general Portfolio CMS/admin design requirements, not proof that these proposed routes currently exist.
- [Analytics Design](./DESIGN-ANALYTICS.md) — Labs analytics semantics and dashboard requirements; current implementation state is in pages/ANALYTICS-ENGINEERING.md.
- [Labs Design](./DESIGN-LAB.md)
- [Labs and Authentication Design Spec](./LABS-AND-AUTHENTICATION-DESIGN-SPEC.md)
- [Labs Authentication and Source Access Runbook](./LABS-AUTHENTICATION-AND-SOURCE-ACCESS.md)
- [Labs Source Management Specification](./LABS-SOURCE-MANAGEMENT-SPEC.md)
- [Labs Owner Console Coordination Plan](./LABS-OWNER-CONSOLE-ANALYTICS-AND-SOURCE-MANAGEMENT-PLAN.md)
- [Labs Experiment Studio Runtime and Media Plan](./LABS-EXPERIMENT-STUDIO-RUNTIME-AND-MEDIA-PLAN.md)
- [Labs Gallery, Engagement and Live UI Implementation](./LABS-GALLERY-ENGAGEMENT-AND-LIVE-UI-IMPLEMENTATION.md)
- [Threat Model](./THREAT-MODEL.md)
- [Database and Media Setup Plan](./DATABASE-AND-MEDIA-SETUP-PLAN.md)
- [Foundation Audit](./FOUNDATION-AUDIT.md)
- [Motion Lab Component Specification System](./MOTION-LAB/README.md)

## 6. Legacy planning/contract documents

- [Implementation Plan](./IMPLEMENTATION-PLAN.md) — original phase plan; use PROJECT-STATUS.md for present implementation state.
- [Portfolio Analytics Implementation Plan](./PORTFOLIO-ANALYTICS-IMPLEMENTATION-PLAN.md) — original first-party analytics design/rollout plan; actual code and current behavior are documented in pages/ANALYTICS-ENGINEERING.md.
- [Architecture Responsibility Contract](./ARCHITECTURE.md) — original target responsibility rules; current implemented topology is in architecture/SYSTEM-ARCHITECTURE.md.
- [Project Structure Proposal](./PROJECT-STRUCTURE.md) — conceptual target structure; current repository tree is listed in architecture/SYSTEM-ARCHITECTURE.md.
- [API Contracts](./API-CONTRACTS.md) — detailed domain contract notes; current route/method index is api/ENDPOINT-INVENTORY.md.

## 7. Source-of-truth rules

1. Current source code is the authority for what exists and how it behaves.
2. PROJECT-STATUS.md is the navigation/status authority; page/architecture engineering guides are the current implementation explanation.
3. PRD and approved decisions define what should exist, not proof that it has been implemented.
4. Domain docs own detailed invariants. API inventory owns the route index; it should not duplicate every internal schema field.
5. Mark implementation and verification separately. Code present does not mean Preview/Production/browser/Atlas integration has passed.
6. Record unresolved discrepancies as explicit audit items. Do not silently reconcile by guessing.
7. Portfolio CMS and Project Detail CMS remain future work. Education remains code-owned/static.
8. Do not change public composition, animation, responsive design, project slug behavior or runtime security while implementing docs.

## 8. Documentation change control

When a feature changes:
1. update the owning current-state engineering document;
2. update PROJECT-STATUS.md when status or verification changes;
3. update API inventory for route/method changes;
4. update DATA-MODEL-CATALOG.md for schema/collection/index changes;
5. update scroll/motion docs for changes to interaction/scroll ownership;
6. update PRD/DECISIONS only when an approved product decision changes;
7. link superseded plans rather than silently deleting historical context.

Do not implement CMS, OAuth provider setup, new APIs, new models or UI changes as part of a documentation update.
