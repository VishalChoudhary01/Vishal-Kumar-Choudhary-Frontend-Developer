# SEO and AEO Engineering — Current Implementation and Labs Extension

**Audited branch:** `feat/labs-platform-integration`  
**Implementation snapshot:** 2026-11-07  
**Status:** Homepage and project-detail SEO are implemented; public Labs metadata, structured data, semantic answer content and sitemap coverage have now been added in this branch. Deployment indexing and browser validation remain pending.

## 1. Scope and source standard

The portfolio SEO/AEO specification supplied for this task establishes the production standard:
- canonical portfolio identity: **Vishal Kumar Choudhary — Frontend Developer**;
- canonical data remains the source of factual content;
- semantic, server-rendered content comes before metadata and structured data;
- real crawlable internal links;
- accurate alt text and reduced-motion/accessibility behavior;
- no artificial AEO meta tag, hidden keyword blocks, fabricated claims, fake FAQs or fake schema.

The uploaded baseline named only `/` and `/projects/[slug]` as indexable routes. The current implementation extends that same standard to the public Labs collection and eligible public experiment details:
- `/`
- `/projects/[slug]`
- `/labs`
- `/labs/[slug]`, only while the experiment meets the public source/artifact eligibility contract.

This document records what the repository actually implements. It is not a promise of search ranking, AI citations, rich-result eligibility, indexing, or search-engine acceptance.

## 2. Shared SEO architecture

| Concern | Current implementation |
|---|---|
| Absolute site origin | `src/app/lib/seo/urls.js` |
| Homepage title/description/metadata | `src/app/lib/seo/metadata.js` |
| Person, WebSite, ProfilePage, CreativeWork schema | `src/app/lib/seo/jsonld.js` |
| Labs CollectionPage/ItemList/CreativeWork/BreadcrumbList and metadata | `src/app/lib/seo/labs.mjs` |
| Safe JSON-LD script renderer | `src/app/components/seo/JsonLd.jsx` |
| Sitemap | `src/app/sitemap.js` |
| Robots | `src/app/robots.js` |
| Static project SEO validator | `scripts/validate-seo.cjs` → `src/app/lib/seo/validators.js` |
| Labs SEO regression coverage | `tests/labs-seo.test.mjs` |

`buildSiteUrl()` uses `NEXT_PUBLIC_SITE_URL` when supplied, the configured Vercel production host as a production fallback, and localhost only in development. Keep one URL utility layer; do not construct a second hostname source in a page.

The JSON-LD component serializes server-provided data and escapes `<`, `>` and `&` before inserting the JSON string into the script node. Do not use a raw user-supplied script, arbitrary HTML field or client-side SEO injection.

## 3. Homepage — current SEO/AEO

**Route:** `src/app/page.js`

Implemented:
- Title: `Vishal Kumar Choudhary — Frontend Developer`.
- Factual description sourced from the canonical identity and frontend stack.
- Root canonical URL.
- Open Graph `website` metadata, site name, social image and alt description.
- Twitter/X `summary_large_image` metadata when the social image is available.
- Server-rendered JSON-LD graph: `WebSite`, `ProfilePage`, `Person`.
- Person schema uses real public social profile URLs only; email compose links are intentionally excluded from `sameAs`.
- JSON-LD is emitted from the server route independently of the client homepage shell/intro loader.

The homepage visible copy, section order and SEO identity are separate concerns. Preserve the actual H1/section content in the homepage engineering guide; do not add a hidden SEO H1 or alter visual copy solely to insert keyword strings.

**Current limitation:** `scripts/validate-seo.cjs` validates project data/social URLs, not rendered homepage HTML, heading count, image alt coverage, or live production metadata. Those still require browser/crawler validation.

## 4. Project detail pages — current SEO/AEO

**Route:** `src/app/projects/[slug]/page.js`

Implemented:
- `generateStaticParams()` is derived from canonical `portfolio.projects`.
- `dynamicParams = false`; invalid project slugs reach the proper not-found path.
- Per-project `generateMetadata()`: title, description, canonical, Open Graph `article`, project media image/alt when available, and Twitter/X `summary_large_image`.
- Server-rendered JSON-LD `CreativeWork` with creator `Person`.
- `dateCreated` is emitted only when a supported project year exists; technology keywords and image are conditional on actual fields.
- Project content/data remains a single canonical source; there is no second SEO project database.
- Project detail rendering uses the fixed template and structured story data; it does not require hover, Redux or Lenis to create its metadata.

The homepage/project implementation remains the baseline described by the supplied specification and [Project Detail Engineering](./pages/PROJECT-DETAIL-ENGINEERING.md). This Labs update does not replace or duplicate those builders.

## 5. Public Labs collection — current SEO/AEO

**Route:** `src/app/labs/page.js`  
**Data source:** `getPublishedCustomLabExperimentPage()`

### 5.1 Indexability and metadata

The route is dynamic because the eligible catalogue comes from MongoDB. It now uses a shared cached initial-page loader for both metadata generation and page rendering.

Metadata:
- unique collection title: `Frontend Experiments — Portfolio Labs | Vishal Kumar Choudhary`;
- direct, factual collection description naming the operator, role and actual categories;
- canonical `/labs`;
- explicit `index, follow`;
- Open Graph `website`;
- Twitter/X `summary_large_image` when the current featured experiment has a valid image, otherwise `summary`;
- no fabricated image when no public preview image exists.

The page description in `LabsIntroduction` now states that these are published frontend experiments by Vishal Kumar Choudhary, a Frontend Developer, across motion/animation, CSS, interface interactions and creative coding. This text is visible page copy, not hidden AI-only text.

### 5.2 Collection structured data

The route emits server-side `CollectionPage` JSON-LD with:
- canonical page URL and stable `@id`;
- name and description matching the public collection metadata;
- `isPartOf` pointing to the portfolio WebSite entity;
- a main `ItemList` of eligible published experiments from the initial server page;
- each `ListItem` has a position and a `CreativeWork` name, description and canonical detail URL;
- `numberOfItems` uses the server's actual eligible published total.

The initial collection page displays up to 18 records. The structured list entries describe that initial server page; the total count describes the complete eligible set. Cursor pagination and category selection remain normal collection UI, not separately indexable filter URLs.

### 5.3 Public catalogue eligibility

Only a custom experiment that:
1. has published status;
2. has a published source pointer; and
3. has an exact matching ready artifact/source version

is part of the public catalogue. Built-in runtime registry entries, drafts, unpublished source, private source bytes and preview/internal routes must not enter the CollectionPage ItemList or sitemap.

## 6. Public Labs experiment detail — current SEO/AEO

**Route:** `src/app/labs/[slug]/page.js`

### 6.1 Metadata and missing-record behavior

The route uses one shared cached published-experiment lookup for metadata and page rendering.

For an eligible published experiment:
- title is derived from the experiment's public SEO title (currently generated from its real title) with a descriptive fallback including “Frontend Experiment” and the portfolio identity;
- meta description is the actual experiment description;
- canonical is `/labs/[slug]` with the slug encoded;
- explicit `index, follow`;
- Open Graph `article`, canonical URL, site name, author identity and an image only when a valid image preview is available;
- Twitter/X uses `summary_large_image` when a valid image is available and otherwise `summary`.

For an invalid, unpublished or no-longer-eligible record, metadata returns a noindex fallback and the page calls Next.js `notFound()`. No successful indexable placeholder is generated for missing experiments.

### 6.2 Detail structured data

The server route emits a JSON-LD graph:
- `WebPage`, linked to the main portfolio `WebSite`;
- `CreativeWork` as the page's main entity;
- `BreadcrumbList`: Home → Labs → current experiment.

The CreativeWork includes only facts present in the public record:
- title/name;
- description;
- canonical URL;
- creator Person linked to the portfolio `/#person` entity;
- category as genre;
- category and technology labels as keywords;
- image only if a valid public image asset exists;
- `datePublished` and `dateModified` only when valid source record timestamps exist.

It does **not** invent ratings, reviews, user counts, price, rankings, clients, awards, performance metrics, runtime capabilities or product outcomes. It does not emit FAQ schema or SearchAction.

### 6.3 Visible answer-ready content

The detail page now keeps these factual answers visible in the semantic page:
- H1: experiment title;
- category label, when present;
- actual experiment description;
- visible creator byline: “A frontend experiment by Vishal Kumar Choudhary.”;
- technology list, when present;
- static preview in a `figure` with a descriptive caption, only when a preview exists;
- explanation section with the H2 “How it works”, when an explanation exists;
- protected source section, whose source bytes remain available only to verified accounts.

The detail composition is a semantic `article` labelled by its H1. The preview section has a heading and uses figure/figcaption. The explanation remains ordinary page text. Source bytes are intentionally excluded from public JSON-LD and guest HTML.

**Important runtime boundary:** public detail is static/non-executable. SEO/AEO must describe the visible experiment metadata and static preview, not imply that the route runs an interactive artifact or exposes source code to anonymous visitors. Owner Run/build/publish and artifact delivery remain separate infrastructure.

### 6.4 Preview image selection and alt text

The public DTO resolves the current release-bound gallery preview, generated poster or thumbnail. Missing alt text on the selected public image is replaced with a factual experiment-specific preview description. The SEO image helper only serializes HTTPS or app-root-relative image paths and skips video media as an image.

When no valid image exists, omit Open Graph/Twitter/JSON-LD image properties. Do not fabricate screenshots or use video URLs as image URLs.

## 7. Sitemap and robots

### Sitemap — `src/app/sitemap.js`

The generated sitemap includes:
- homepage at the canonical trailing-slash URL;
- Labs collection;
- privacy page;
- project detail routes from canonical project data;
- every currently eligible published Labs detail route, using cursor pagination until all eligible records have been enumerated.

Labs detail `lastModified` uses a valid MongoDB `updatedAt` timestamp, falling back to `publishedAt`; if neither is valid, the property is omitted. The public experiment DTO now carries those actual timestamps. Private drafts, source files, auth flows, owner pages and runtime preview routes are not listed.

### Robots — `src/app/robots.js`

All routes are allowed by default except the private `/admin` area. Do not disallow all of `/api/`: public static poster images are currently served through a public Labs API route and must remain fetchable when referenced by public page metadata. Robots directives are discovery guidance, not the authorization boundary.

Labs auth pages already use `noindex, nofollow` metadata. They are not included in the sitemap.

## 8. AEO rules applied

- Write direct factual descriptions; keep experiment facts attributable to the actual experiment record.
- Make who/what/category/technologies/how information visible without hover or a fake question/answer section.
- Use internal canonical links to each real eligible experiment.
- Keep Motion, hover and preview playback as enhancement; core text remains normal HTML. Labs hero and featured text, plus collection-card content, begin at opacity 1 so a Motion entrance never hides answer-critical copy in the initial HTML. Their entrance only adds a small upward positional movement. Published experiment counts also begin with the actual value before the count-up animation.
- Do not add a meta name “aeo”, hidden prompt/keyword blocks, fake FAQ entries, fake SearchAction, reviews, aggregate ratings or unsupported claims.
- Treat source-access authorization accurately. Public page metadata does not imply public source-code access.
- Keep Portfolio visits and Labs engagement analytics out of CreativeWork markup. Analytics counts are not evidence of reviews/ratings or product popularity.

## 9. Remaining SEO/AEO gaps and boundaries

| Item | Current status |
|---|---|
| Homepage metadata/JSON-LD | Implemented in code; rendered production output not live-validated in this pass |
| Project metadata/JSON-LD | Implemented in code; existing project validator remains data-level only |
| Labs collection metadata/JSON-LD | Implemented; current page's first server page is represented in ItemList |
| Labs detail metadata/JSON-LD | Implemented; schema derives from actual published experiment DTO |
| Labs sitemap coverage | Implemented using cursor pagination and eligible published records |
| Robots policy | Implemented for `/admin`; public poster API paths remain crawlable |
| Labs duplicate SEO-title/description detection | Not implemented as a database-wide publication validator; slug is unique but titles/descriptions are not schema-unique |
| HTML/H1/alt audit across all database records | Not run against a live rendered database in this documentation/code pass |
| Rich Results / schema validator | Not run |
| Search Console/Bing Webmaster submission and URL inspection | Not configured or verified here |
| Actual search indexing, ranking or AI citation | Cannot be inferred from metadata/schema code |
| AEO/FAQ schema | Intentionally not implemented; no unsupported FAQ content is fabricated |

## 10. Tests and verification

New focused suite:
- `tests/labs-seo.test.mjs`;
- npm script `npm run test:labs-seo`;
- included in the `npm run build` pre-build regression chain.

It covers:
- collection/detail metadata output;
- canonical and index/noindex behavior;
- preview image URL safety and video exclusion;
- CollectionPage/ItemList and CreativeWork/BreadcrumbList relationships;
- creator/category/technology attribution;
- valid versus invalid publication/modified timestamps;
- absence of ratings, reviews and invented engagement data;
- route-level helper/JSON-LD integration;
- visible AEO copy, semantic detail structure, sitemap enumeration and robots poster-path policy.

**Execution status:** The suite and production build were not run in this environment because the branch could not be cloned from GitHub (network DNS unavailable); the latest GitHub commit returned no CI status checks. Do not describe the implementation as build-verified or production-index-verified until the tests, build and deployed crawler checks pass.

## 11. Change rules

1. Use the canonical database experiment record and eligibility helper; never create a parallel SEO database.
2. Keep public catalogue/detail schema in sync with visible fields and the published eligibility check.
3. Do not serialize protected source text or private media in metadata/JSON-LD.
4. Never use the owner-supplied description to claim unsupported runtime features.
5. Only add date properties from actual persisted timestamps.
6. Never publish private drafts or API/private owner routes in sitemap.
7. Do not block the public API image route in robots while the poster image remains served there.
8. When public metadata fields/roles change, update the helper, tests, Labs docs and sitemap eligibility together.
