# Future Scope — Portfolio CMS and Project Detail CMS

**Status:** PLANNED — APPROVED PRODUCT DIRECTION; NOT IMPLEMENTED.  
**Current renderer:** Code-owned Next.js App Router pages and structured project records.  
**Purpose:** Preserve the current portfolio presentation while moving explicitly approved content fields into a controlled content-management workflow.

This document records the future content boundary and implementation constraints. It is not permission to start CMS implementation during documentation work. The actual PRD/design decisions remain the authority where more detailed field decisions exist.

## 1. Principle: data becomes dynamic; presentation stays code-owned

The CMS will supply approved content and publication state. The application remains responsible for:
- page layout and component composition;
- typography and design tokens;
- responsive behavior;
- animation definitions and Motion triggers;
- scroll choreography;
- interaction behavior and accessibility;
- SEO rendering rules and structured data;
- section ordering and template availability.

The CMS must not become:
- an arbitrary page builder;
- a free-form JSX/HTML/CSS/JavaScript editor;
- a theme/layout editor;
- a store for executable animation definitions;
- a mechanism that can reorder sections without an approved code change.

Education section content remains static/code-owned unless a later explicit product decision changes it.

## 2. Approved dynamic content areas

| Content area | Existing source | Future content ownership | Renderer boundary |
|---|---|---|---|
| Hero/introduction | Current hero constants/data | Heading, supporting copy, approved CTA labels/targets and selected media/profile references | Keep CinematicHero/ReducedMotionHero and animation config in code |
| About | src/app/data/aboutData.js | Heading, paragraphs and three capability groups/entries | Keep AboutContent/AboutReduced, word reveal and layout in code |
| Skills | src/app/data/skillsData.js or portfolio data composition | Skill categories, ordering, titles/context, primary skills, supporting skills and approved icon keys | Keep SkillCategory, visibility state and RISE timing in code |
| Experience | portfolio.experience in src/app/data/portfolio.js | Employer/company, role, dates, logo/media refs, overview, build items, optional impact and metadata | Keep selector, tabs, keyboard support, watermark and transitions in code |
| Project listing | Current projects array | Project metadata, categories, title, summary, technologies, featured/order/status, cover, links and SEO fields | Keep ProjectsSection, category filters, cards and presentation presets in code |
| Project detail content | projectsData.js / projectsSeo.js → portfolio.projects | Structured content for existing detail sections and media gallery metadata | Keep one code-owned ProjectDetail template and section implementations |
| Project media/gallery | Public assets and current project records | Asset references, ordering, captions, alt text, media type and safe fit metadata | Keep ProjectShowcase/ProjectMedia/Lightbox behavior in code |

## 3. Current project data contract — migration input

Canonical project detail route resolves portfolio.projects by slug. Current record is enriched in projectsSeo.js from projectsData.js. Relevant existing groups:

- Identity: id, number, name, slug.
- Listing: category, categoryLabel, description, role, year, technologies, contribution, features.
- Primary media: media.type, media.src, media.alt.
- External actions: links such as live and GitHub.
- Discovery presentation: presentation mode/variant/emphasis/density; motion entrance/media/hover/scroll presets; status/order/featured.
- Section switches: content.context, approach, design, engineering, motion, responsive, showcase, reflection.
- Structured detail narrative: story.context, approach, design, engineering, motion, responsive, showcase, reflection.
- SEO: seo.title, description, keywords.
- Existing code-maintained updatedAt.

Do not replace all these fields with arbitrary untyped content blocks. During CMS architecture, map each field to an approved schema and inspect every existing project record for optional/legacy variants.

## 4. Project detail fixed template

Current template order (see pages/PROJECT-DETAIL-ENGINEERING.md):

1. Hero.
2. Snapshot/stack.
3. Context.
4. Approach.
5. Design.
6. Engineering.
7. Motion.
8. Responsive.
9. Showcase.
10. Reflection.
11. Previous/next navigation.

Each optional section uses a fixed boolean content flag and its corresponding story data. A section should be hidden if its flag is false or required content is empty. The CMS should not be allowed to supply a React component name or arbitrary section tree.

Approved dynamic section content examples:
- Context: statement, paragraphs/body and contribution.
- Approach: ordered list of structured steps.
- Design: statement and ordered explanatory paragraphs.
- Engineering: ordered decisions/implementation entries.
- Motion: statement and typed motion explanation entries.
- Responsive: ordered breakpoint/behavior entries.
- Showcase: ordered media references, alt text and captions.
- Reflection: statement, what worked and improvement ideas.

The exact per-field limits, required rules and rich-text allowance must be defined during the CMS schema-design phase. Do not assume arbitrary HTML is approved. Prefer structured text and safe links/media references.

## 5. Media model boundaries

CMS media selection should reference reusable managed assets rather than require duplicate uploads each time.

A future media record will need an explicit, approved asset identity and metadata contract (source/provider, asset ID, canonical delivery reference, media kind/type, dimensions/size, alt text, caption, owner/created metadata and safe deletion/usage rules). The exact data model is OPEN until media usage/reference requirements are audited.

Project gallery ordering must be deterministic and persisted as data. Preserve:
- image/video type;
- alt text;
- caption;
- explicit ordering;
- object-fit/focal treatment only where currently approved;
- references to the original asset;
- preview/live asset distinction.

Do not reuse the Labs runtime media model blindly. Portfolio project media and Labs upload/runtime media have different authorization, publication and execution requirements.

## 6. Publication/version behavior to design

The target portfolio content system should support:
- draft editing;
- saved draft without changing live published content;
- exact-version preview;
- explicit publish/unpublish;
- immutable published snapshot/version history;
- restore by creating a new version;
- cache revalidation after successful publication only;
- slug uniqueness and safe canonical routing;
- reference-aware media deletion.

A scheduled publisher is not approved as an assumed implementation detail until its infrastructure, idempotency and deployment constraints are approved. Any content schedule must bind to an exact immutable version.

## 7. Proposed CMS data domains (not implemented schema)

Potential domains to evaluate:
- PortfolioContentDocument (singleton or typed section documents).
- PortfolioProject (project summary and structured detail story).
- PortfolioExperienceEntry.
- PortfolioMediaAsset/MediaReference.
- PortfolioContentVersion.
- Publication pointer/audit records.

These are conceptual entities, not collection names or approved schemas. Before choosing collections, inspect the existing application conventions, current Mongoose setup, schema/index migration patterns and asset systems. Document and approve the final schema before implementation.

## 8. Public rendering and cache boundary

The current public homepage and project routes are rendered from code data. A future CMS must:
1. fetch only published content in public route/server data loaders;
2. never serialize draft fields into public RSC/HTML payloads;
3. preserve the current server-side metadata and JSON-LD generation;
4. preserve generateStaticParams/current stable slug behavior or explicitly revise static/dynamic route strategy with an impact plan;
5. revalidate the correct page/path/tag only after a confirmed publish transition;
6. ensure preview routes are private, noindex and version-bound;
7. leave the site usable if CMS configuration is missing/unavailable where the existing static fallback policy requires it.

## 9. UI/admin scope (future)

Portfolio CMS will require its own admin entry and purpose-built editors for hero/about/skills/experience/projects. The existing Labs owner console is not a general Portfolio CMS. Portfolio Analytics is not a CMS. Do not add portfolio content actions to Labs Source Library.

Editor fields should have labels, help text, safe limits, field validation, unsaved-change protection, preview and explicit Save Draft/Publish actions. The live public page should keep using the existing React components.

## 10. Implementation gates

Before coding:
- approve exact dynamic fields and their current source-to-CMS mapping;
- audit every project record/story variant;
- define structured schemas and validation limits;
- design version/publish/restore lifecycle;
- decide media asset ownership/reference/deletion behavior;
- decide data loading/caching/revalidation;
- define preview authorization and noindex behavior;
- test migration/backfill with exported current static data;
- document rollback to code-owned static fallback;
- obtain explicit implementation authorization.

Do not begin Portfolio CMS while this documentation and remaining current-system verification are incomplete.
