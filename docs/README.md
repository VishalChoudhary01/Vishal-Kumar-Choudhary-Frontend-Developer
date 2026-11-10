# Portfolio Documentation

**Audited branch:** `feat/labs-platform-integration`  
**Documentation baseline:** 7 November 2026

This folder contains the maintained product, implementation, architecture, security and operations documentation for the portfolio. It is intentionally organized around one current-state guide per domain. Superseded plans, duplicate audits and phase-by-phase implementation logs have been removed; useful current decisions and unresolved gaps are recorded in the canonical documents below.

## Start here

1. [Project status](./PROJECT-STATUS.md) — implemented capabilities, accepted decisions, known gaps and release verification.
2. [Product requirements](./PRD.md) — product scope and acceptance requirements; a requirement is not proof of implementation.
3. [Architecture decisions](./DECISIONS.md) — approved and superseding decisions.
4. [System architecture](./architecture/SYSTEM-ARCHITECTURE.md) — current application boundaries and request/data flows.
5. [API endpoint inventory](./api/ENDPOINT-INVENTORY.md) — current route handlers, methods and access requirements.
6. [Data model catalogue](./architecture/DATA-MODEL-CATALOG.md) — current Mongoose collections, fields, indexes and relationships.
7. [SEO and AEO](./SEO-AND-AEO-IMPLEMENTATION.md) — current homepage, project and public Labs metadata, structured data, sitemap and semantic-content rules.

## Current implementation guides

### Public portfolio
- [Homepage](./pages/HOME-PAGE-ENGINEERING.md)
- [Navbar and footer](./pages/NAVBAR-AND-FOOTER-ENGINEERING.md)
- [Project detail pages](./pages/PROJECT-DETAIL-ENGINEERING.md)
- [Vee mascot](./pages/PORTFOLIO-MASCOT-ENGINEERING.md)
- [Contact form and email](./pages/CONTACT-FORM-AND-EMAIL-ENGINEERING.md)
- [Error and not-found handling](./pages/ERROR-AND-NOT-FOUND-ENGINEERING.md)

### Labs and analytics
- [Public Labs and owner workspace](./pages/LABS-AND-OWNER-WORKSPACE.md)
- [Labs runtime and code execution](./architecture/LABS-RUNTIME-AND-CODE-EXECUTION.md)
- [Analytics engineering](./pages/ANALYTICS-ENGINEERING.md)
- [Authentication and account engineering](./pages/AUTHENTICATION-AND-ACCOUNT-ENGINEERING.md)

### Shared engineering
- [Scroll and Motion](./architecture/SCROLL-AND-MOTION-ENGINEERING.md)
- [Theme toggle](./architecture/THEME-TOGGLE-ENGINEERING.md)
- [Sound](./architecture/SOUND-ENGINEERING.md)
- [Privacy and data lifecycle](./architecture/PRIVACY-AND-DATA-LIFECYCLE.md)
- [Layout layers and design tokens](./design/LAYOUT-LAYERS-AND-TOKENS.md)
- [Threat model](./THREAT-MODEL.md)
- [Environment and release](./operations/ENVIRONMENT-AND-RELEASE.md)
- [Labs Run recovery](./operations/LABS-PREVIEW-RECOVERY.md)

## Product and design references

- [Analytics product design](./DESIGN-ANALYTICS.md) — metric definitions, dashboard intent and privacy requirements. Current behavior is documented in the Analytics Engineering guide.
- [Admin/CMS design](./DESIGN-ADMIN.md) — future general portfolio CMS/admin experience; it is a design reference, not an implemented route.
- [Labs product design](./DESIGN-LAB.md) — visual/interaction requirements. Current behavior and accepted superseding rules are documented in the Labs engineering guide and ADR-018.
- [Motion Lab component specifications](./MOTION-LAB/README.md) — design system, engineering standards, agent protocol and individual component specifications.

## Explicit future scope

Only the following detailed future implementation plans are retained:
- [Portfolio CMS and Project Detail CMS](./future/PORTFOLIO-CMS-AND-PROJECT-DETAIL-CMS.md) — approved future content-management boundary; not implemented.
- [Google and GitHub OAuth configuration](./future/GOOGLE-GITHUB-OAUTH.md) — provider configuration and end-to-end verification; code is present behind credential gates, but deployment verification remains pending.

## Source-of-truth and maintenance rules

1. Source code is authoritative for what exists and how it behaves.
2. `PROJECT-STATUS.md` is the current status and verification authority.
3. Page and architecture engineering guides own detailed current implementation behavior.
4. `PRD.md` and the design documents define product requirements, not implementation evidence.
5. `DECISIONS.md` records accepted decisions. ADR-018 supersedes older conflicting Labs statements, including the former interactive public-detail requirement.
6. `ENDPOINT-INVENTORY.md` owns the route/method index; `DATA-MODEL-CATALOG.md` owns the current schema catalogue. Avoid copying full endpoint or schema definitions into overview documents.
7. Keep implementation status separate from test, browser, provider, database and deployment verification. Never mark external verification complete based on code presence alone.
8. When a feature changes, update its owning guide and update `PROJECT-STATUS.md` only when capability status, a known gap or verification state changes.
9. Update PRD/design documents only when an approved product requirement changes. Update ADRs only when a decision changes.
10. Preserve the public homepage, project-detail composition, SEO, accessibility, responsive behavior and Motion/scroll contracts during Labs or admin work.

Portfolio CMS/Project Detail CMS and Google/GitHub OAuth remain future/configuration work as stated above. This documentation cleanup does not authorize feature implementation or deployment.
