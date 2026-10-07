# PORTFOLIO SEO + AEO IMPLEMENTATION SPECIFICATION

## Production standard for the homepage and dynamic project detail pages

**Owner:** Vishal Kumar Choudhary\
**Primary role:** Frontend Developer\
**Framework:** Next.js App Router\
**Indexable routes:** `/` and `/projects/[slug]`

This document is the implementation source of truth for SEO, AEO,
semantic HTML, crawlability, metadata, structured data, internal
linking, accessibility, performance, and indexability.

The existing portfolio data and project case-study content remain the
canonical source. The implementation must not invent claims, metrics,
clients, awards, technologies, project dates, or product capabilities.

------------------------------------------------------------------------

# 1. Core strategy

Build the portfolio in this order:

``` text
Canonical portfolio/project data
        ↓
Semantic HTML
        ↓
Server-rendered content
        ↓
Metadata + canonical URLs
        ↓
Structured data
        ↓
Crawlable internal links
        ↓
Accessibility + performance
        ↓
Motion / Lenis / visual enhancement
```

Motion, Lenis, hover, parallax, scroll choreography, and theme effects
are progressive enhancement. Meaning must remain available without them.

Do not create an artificial `aeo` meta tag, hidden keyword blocks, fake
FAQs, or AI-only copy.

AEO is achieved by making important information clear, factual,
extractable, attributable, and internally consistent.

------------------------------------------------------------------------

# 2. Current portfolio identity

Use the current portfolio object as the source of truth:

``` js
{
    name: "Vishal Kumar Choudhary",
    role: "Frontend Developer",
    about,
    navigation,
    socialLinks,
    resumeUrl,
    experience,
    education,
    skills,
    projects
}
```

Keep the professional identity consistent.

Preferred canonical identity:

``` text
Vishal Kumar Choudhary
Frontend Developer
```

Do not randomly alternate between Frontend Developer, UI Designer, Full
Stack Developer, Product Manager, Creative Developer, or Design Engineer
unless the visible portfolio genuinely supports those identities.

------------------------------------------------------------------------

# 3. Homepage SEO

## Purpose

The homepage must clearly answer:

-   Who is Vishal Kumar Choudhary?
-   What does he do?
-   What frontend technologies does he use?
-   What type of interfaces does he build?
-   What projects has he built?
-   How can someone contact him?

## Title

Preferred:

``` text
Vishal Kumar Choudhary — Frontend Developer
```

Do not use:

``` text
My Portfolio
Welcome to My Portfolio
Creative Portfolio
React Next.js JavaScript Tailwind CSS Developer Portfolio
```

## Meta description

Recommended:

``` text
Portfolio of Vishal Kumar Choudhary, a frontend developer building polished, responsive web experiences with React, Next.js, JavaScript, Tailwind CSS, and Motion.
```

Do not claim unverified years of experience, client results, awards,
rankings, performance numbers, or user counts.

## H1

The homepage must contain exactly one H1. The H1 must correspond to the
visible hero message.

Valid patterns include:

``` html
<h1>Frontend Developer</h1>
```

or a meaningful visible headline such as:

``` html
<h1>Building digital experiences that matter.</h1>
```

Do not add a hidden SEO H1.

------------------------------------------------------------------------

# 4. Homepage semantic structure

Use real semantic sections:

``` text
<header>
  navigation
</header>

<main>
  hero / H1
  about / H2
  experience / H2
  projects / H2
  skills / H2
  contact / H2
</main>

<footer>
</footer>
```

The exact existing visual order can remain unchanged.

The existing `aboutData` is useful AEO content because it directly
describes the user's frontend focus, responsive work, interaction
design, motion, visual detail, and maintainable implementation. Keep
this information visible in normal HTML rather than making it dependent
on an animation lifecycle.

------------------------------------------------------------------------

# 5. Homepage project links

Every project card must contain a real crawlable link to:

``` text
/projects/[slug]
```

Prefer Next.js `<Link>` or the existing `ProjectResumeButton` when it
renders a real link.

Do not replace normal navigation with:

``` jsx
<div onClick={() => router.push(...)} />
```

The project name and short description should be understandable without
hover.

------------------------------------------------------------------------

# 6. Project detail page requirements

Every `/projects/[slug]` page is an independent case-study page.

Current public project slugs:

``` text
/projects/class-fuse
/projects/spendwise
/projects/system-canvas
/projects/nextjs-master
```

Each project page must contain enough normal HTML content to understand:

-   what the project is
-   why it exists
-   Vishal's role
-   year
-   category
-   technologies
-   approach
-   design
-   engineering
-   motion where relevant
-   responsive implementation
-   showcase context
-   reflection

None of this may depend on hover, Motion completion, Lenis, or a
client-side state initialization.

------------------------------------------------------------------------

# 7. Project H1 and hierarchy

Every project detail page must have exactly one H1:

``` text
ClassFuse
Spendwise
System Canvas
Next.js Master
```

Recommended hierarchy:

``` text
H1 Project Name

H2 Snapshot / Overview
H2 Context
H2 Approach
  H3 approach item
H2 Design
H2 Engineering
  H3 engineering item
H2 Motion
H2 Responsive
  H3 Desktop / Tablet / Mobile where appropriate
H2 Showcase
H2 Reflection
```

Do not select H1/H2/H3 based only on font size.

The existing `SectionHeading` component can remain responsible for
presentation, but it must output semantic headings.

------------------------------------------------------------------------

# 8. Canonical project data

Do not create a second SEO-specific project database.

Current project records already provide:

``` text
id
number
name
slug
category
categoryLabel
description
role
year
technologies
contribution
features
media
links
presentation
motion
status
order
featured
content
story
```

SEO should derive from these records.

Add only the minimum missing SEO fields:

``` js
seo: {
    title: "...",
    description: "...",
    keywords: ["..."]
},

updatedAt: "YYYY-MM-DD"
```

`updatedAt` must be a real verified content-update date. Never fabricate
it.

------------------------------------------------------------------------

# 9. Recommended project SEO titles

Use:

``` text
[Project Name] — Frontend Development Case Study | Vishal Kumar Choudhary
```

Examples:

``` text
ClassFuse — Frontend Development Case Study | Vishal Kumar Choudhary
Spendwise — Frontend Development Case Study | Vishal Kumar Choudhary
System Canvas — Frontend Development Case Study | Vishal Kumar Choudhary
Next.js Master — Frontend Development Case Study | Vishal Kumar Choudhary
```

Descriptions must be unique and factual.

Recommended source-derived descriptions:

### ClassFuse

``` text
A frontend case study of ClassFuse, a Tailwind CSS utility for cleaning, organizing, and formatting utility class strings with Next.js, React, and Tailwind CSS.
```

### Spendwise

``` text
A frontend case study of Spendwise, a shopping planning and price comparison web app built with Next.js, React, Redux Toolkit, Tailwind CSS, and Motion.
```

### System Canvas

``` text
A frontend case study of System Canvas, an interactive React workspace for exploring structured color and theme systems with Vite, Tailwind CSS, Redux Toolkit, and Motion.
```

### Next.js Master

``` text
A frontend case study of Next.js Master, a reusable React and Next.js interface project using Tailwind CSS, Redux Toolkit, Motion, and Lenis.
```

------------------------------------------------------------------------

# 10. Dynamic metadata

Implement `generateMetadata()` in the dynamic project route.

Conceptually:

``` js
export async function generateMetadata({ params }) {
    const { slug } = await params;
    const project = getProjectBySlug(slug);

    if (!project) {
        return {};
    }

    const url = buildProjectUrl(project.slug);
    const image = buildAbsoluteAssetUrl(project.media.src);

    return {
        title: project.seo.title,
        description: project.seo.description,

        alternates: {
            canonical: url,
        },

        openGraph: {
            type: "article",
            title: project.seo.title,
            description: project.seo.description,
            url,
            images: [
                {
                    url: image,
                    alt: project.media.alt,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title: project.seo.title,
            description: project.seo.description,
            images: [image],
        },
    };
}
```

Adapt syntax to the repository's JavaScript/TypeScript conventions and
existing Next.js version.

Never hardcode the same metadata for every project.

------------------------------------------------------------------------

# 11. Canonical URLs

Create one URL utility layer:

``` text
lib/seo/urls.js
```

Recommended helpers:

``` js
buildSiteUrl()
buildProjectUrl(slug)
buildAbsoluteAssetUrl(path)
```

Use:

``` env
NEXT_PUBLIC_SITE_URL=https://YOUR-PRODUCTION-DOMAIN
```

The actual production domain must be supplied by the project owner.

Never emit:

``` text
http://localhost:3000
```

in production canonical, OG, JSON-LD, sitemap, or social metadata.

Canonical project URL:

``` text
SITE_URL/projects/class-fuse
```

and equivalent for the other projects.

------------------------------------------------------------------------

# 12. Open Graph and social metadata

Homepage should expose:

``` text
og:type = website
og:title
og:description
og:url
og:image
```

Project pages should expose:

``` text
og:type = article
og:title
og:description
og:url
og:image
```

Use each project's own `media.src` and `media.alt` where appropriate.

Also expose:

``` text
twitter:card = summary_large_image
twitter:title
twitter:description
twitter:image
```

Do not maintain a separate social-content database.

------------------------------------------------------------------------

# 13. JSON-LD

Create one structured-data utility:

``` text
lib/seo/jsonld.js
```

and, if useful:

``` text
components/seo/JsonLd.jsx
```

## Homepage

Appropriate schema types may include:

``` text
Person
WebSite
ProfilePage
```

Use the canonical portfolio identity:

``` json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "SITE_URL/#person",
  "name": "Vishal Kumar Choudhary",
  "jobTitle": "Frontend Developer",
  "url": "SITE_URL/"
}
```

Connect only real public social profiles from `socialLinks`.

Do not invent profiles.

## Project page

Use a truthful work representation such as:

``` json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "@id": "PROJECT_URL/#work",
  "name": "PROJECT_NAME",
  "description": "PROJECT_DESCRIPTION",
  "url": "PROJECT_URL",
  "image": "ABSOLUTE_PROJECT_IMAGE",
  "creator": {
    "@type": "Person",
    "name": "Vishal Kumar Choudhary",
    "url": "SITE_URL/"
  }
}
```

Only add `dateCreated`, `dateModified`, `keywords`, or other properties
when the actual data supports them.

Never fabricate ratings, reviews, clients, awards, metrics, prices,
business outcomes, or user counts.

------------------------------------------------------------------------

# 14. AEO principles

AEO is not a metadata trick.

Do not create:

``` html
<meta name="aeo">
```

Do not create hidden AI keyword blocks.

Write direct factual statements.

Prefer:

``` text
Spendwise is a shopping planning and price comparison web app.
```

over vague copy such as:

``` text
An intelligent digital experience for modern commerce.
```

Important facts should be explicit:

``` text
role
technology
year
project purpose
features
architecture
technical decisions
responsive behavior
motion
limitations
```

------------------------------------------------------------------------

# 15. Project-specific AEO truth rules

## ClassFuse

Canonical description:

``` text
A Tailwind CSS utility for cleaning and organizing class lists by removing duplicate and conflicting utilities and producing cleaner, more readable class strings.
```

Supported technologies include:

``` text
Next.js
React
JavaScript
Tailwind CSS
Redux Toolkit
Motion
Lenis
next-themes
React Icons
```

Supported features include:

``` text
multiline Tailwind class formatting
duplicate removal
conflicting utility handling
cleaner Tailwind ordering
developer-focused output
light/dark themes
```

Do not claim user counts, adoption, performance percentages, or business
outcomes without evidence.

## Spendwise

Canonical description:

``` text
A shopping planning and price comparison web app that helps users organize what they need, compare supported product prices, calculate list totals, and keep track of their spending.
```

Supported technologies include:

``` text
Next.js
React
JavaScript
Tailwind CSS
Redux Toolkit
Motion
Lenis
Cheerio
ApexCharts
Lucide React
React Icons
```

Supported capabilities include:

``` text
shopping lists
product information extraction
product URLs
current price comparison across supported sources
list totals
spending overview
purchase/spending tracking
responsive dashboard
interactive charts
light/dark theme
```

### Critical restriction

Never describe Spendwise as having:

``` text
historical price tracking
lowest-ever price
historical price charts
target-price alerts
historical trends
automatic live price monitoring
```

The source content describes currently available prices from supported
sources.

## System Canvas

Canonical description:

``` text
A frontend workspace for exploring and working with a structured color and theme system through an interactive React interface.
```

Supported technologies:

``` text
React
Vite
JavaScript
Tailwind CSS
Redux Toolkit
React Router
Motion
Lenis
React Icons
```

Do not invent:

``` text
Figma integration
real-time collaboration
team collaboration
token synchronization
production design-system publishing
```

## Next.js Master

Canonical description:

``` text
A Next.js frontend project built around reusable UI patterns, responsive layouts, centralized state, and polished interface interactions.
```

Supported technologies:

``` text
Next.js
React
JavaScript
Tailwind CSS
Redux Toolkit
React Redux
Motion
Lenis
Lucide React
React Icons
```

Do not call it a production SaaS product unless the actual project
supports that claim.

------------------------------------------------------------------------

# 16. AEO question coverage

Every project page should make these questions answerable from visible
content:

``` text
What is [Project]?
Who built [Project]?
What was Vishal's role?
Why was it built?
Which technologies were used?
What are its main features?
How was the frontend implemented?
What architectural decisions were made?
How was the interface designed?
How was Motion used?
How was responsive behavior handled?
What worked?
What would be improved?
```

Do not turn all of these into literal FAQs. The case-study content
should answer them naturally.

------------------------------------------------------------------------

# 17. Semantic project content mapping

Use the current story structure:

``` text
project.name
    → H1

project.description
    → project introduction

project.role/year/category/technologies
    → snapshot

project.story.context
    → H2 Context

project.story.approach
    → H2 Approach + H3 items

project.story.design
    → H2 Design

project.story.engineering
    → H2 Engineering + H3 items

project.story.motion
    → H2 Motion

project.story.responsive
    → H2 Responsive

project.story.showcase
    → H2 Showcase

project.story.reflection
    → H2 Reflection
```

This preserves the current architecture while making the content highly
understandable to search engines and AI systems.

------------------------------------------------------------------------

# 18. Images

Every meaningful image must have accurate alt text.

Use the existing project media and showcase alt values.

Good:

``` text
ClassFuse Tailwind CSS utility formatter interface
```

Bad:

``` text
image
project
dashboard
screenshot
```

Do not keyword-stuff alt text.

Decorative images should use:

``` html
alt=""
```

Use `next/image` where appropriate and provide dimensions to reduce CLS.

------------------------------------------------------------------------

# 19. Motion, Lenis, Redux

## Motion

Content must exist before animation.

Never:

``` text
animation complete
    ↓
render SEO content
```

Instead:

``` text
semantic content
    ↓
Motion enhancement
```

## Lenis

The page must work normally if Lenis is disabled.

Never make project content, links, headings, or navigation dependent on
Lenis.

## Redux

Do not put SEO-critical content into Redux.

Do not make these depend on Redux initialization:

``` text
H1
project title
description
project body
metadata
canonical
JSON-LD
```

Use project data/server rendering for content and Motion values for
animation state.

------------------------------------------------------------------------

# 20. Client/server boundaries

Prefer:

``` text
Server page
    ↓
Server project lookup
    ↓
Semantic content
    ↓
Small client animation boundaries
```

Do not turn the entire project page into a Client Component merely
because Motion is used somewhere inside it.

SEO-critical content should remain server-renderable.

------------------------------------------------------------------------

# 21. Sitemap

Create:

``` text
app/sitemap.js
```

or the existing equivalent.

Generate the homepage plus all valid public projects directly from
`projects`.

Conceptually:

``` js
export default function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
        },

        ...projects.map((project) => ({
            url: `${baseUrl}/projects/${project.slug}`,
            lastModified: project.updatedAt
                ? new Date(project.updatedAt)
                : undefined,
        })),
    ];
}
```

Do not manually maintain project URLs.

Do not include invalid, private, debug, or noindex pages.

------------------------------------------------------------------------

# 22. Robots

Create:

``` text
app/robots.js
```

Allow public pages.

If the project actually has internal routes, disallow them
appropriately:

``` js
{
    rules: {
        userAgent: "*",
        allow: "/",
        disallow: [
            "/debug/",
            "/internal/",
            "/admin/"
        ]
    },
    sitemap: `${baseUrl}/sitemap.xml`
}
```

Do not add fake paths just for appearance.

Robots.txt is not a substitute for `noindex`.

------------------------------------------------------------------------

# 23. Static generation and invalid routes

Use `generateStaticParams()` for known project slugs where appropriate:

``` js
export function generateStaticParams() {
    return projects.map((project) => ({
        slug: project.slug,
    }));
}
```

For an unknown slug:

``` js
if (!project) {
    notFound();
}
```

Do not return a successful 200 page saying `Project not found`.

------------------------------------------------------------------------

# 24. Internal linking

Homepage:

``` text
Projects section
    ↓
Project detail
```

Project detail may link to:

``` text
Back to Projects
Previous Project
Next Project
Related Projects
Contact
```

Only render links whose targets actually exist.

Use real Next.js links.

Do not create JavaScript-only navigation for normal pages.

------------------------------------------------------------------------

# 25. Query/filter URLs

If the main project page has UI filters such as:

``` text
ALL
TOOLS
PRODUCTS
```

do not automatically create many indexable filter URLs.

The preferred indexable content is:

``` text
/
 /projects/[slug]
```

unless a filtered route has a genuine independent search purpose.

Avoid duplicate indexable content caused by UI state.

------------------------------------------------------------------------

# 26. Project link rules

Current data supports optional:

``` js
links: {
    live,
    github,
    figma
}
```

Render only what exists.

``` text
live exists → Live
github/source exists → Source
figma exists → Figma
missing → render nothing
```

Never render empty anchors.

Never use `#`, `undefined`, or `null` as fallback URLs.

------------------------------------------------------------------------

# 27. Data validation

Add a development/build validator if practical.

Validate:

``` text
project slug
unique slug
name
description
role
year
technologies
media
media.alt
story
seo.title
seo.description
updatedAt
external URLs when present
```

Also check:

``` text
duplicate SEO titles
duplicate SEO descriptions
broken internal links
invalid external URLs
missing project references
```

Fail early for critical missing data where practical.

------------------------------------------------------------------------

# 28. Accessibility

Every new SEO/AEO implementation must preserve:

``` text
semantic HTML
keyboard navigation
visible focus
logical focus order
color contrast
reduced motion
screen-reader labels
accurate alt text
native link/button semantics
```

Use native HTML before ARIA.

Do not replace links/buttons with clickable `<div>` elements.

------------------------------------------------------------------------

# 29. Performance

SEO work must not create unnecessary client JavaScript.

Monitor:

``` text
LCP
INP
CLS
```

Also inspect:

``` text
image weight
font loading
hydration cost
client boundaries
animation cost
network requests
```

Do not make every image priority.

Do not load SEO utilities as large client libraries when Next.js
metadata APIs are sufficient.

------------------------------------------------------------------------

# 30. Development and production

Development may use:

``` text
http://localhost:3000
```

Production metadata must use:

``` text
NEXT_PUBLIC_SITE_URL
```

Never emit localhost in:

``` text
canonical
Open Graph
Twitter/X
JSON-LD
sitemap
```

------------------------------------------------------------------------

# 31. Recommended SEO architecture

``` text
lib/
└── seo/
    ├── urls.js
    ├── metadata.js
    ├── jsonld.js
    └── validators.js

components/
└── seo/
    └── JsonLd.jsx
```

Do not duplicate responsibilities across multiple SEO utilities.

------------------------------------------------------------------------

# 32. Recommended helper API

``` js
buildSiteUrl()
buildProjectUrl(slug)
buildAbsoluteAssetUrl(path)

buildHomeMetadata()
buildProjectMetadata(project)

buildPersonJsonLd()
buildWebsiteJsonLd()
buildProjectJsonLd(project)

validateProjectSeo(project)
```

Follow the repository's existing naming conventions if they differ.

------------------------------------------------------------------------

# 33. Homepage JSON-LD relationship

Conceptually:

``` text
WebSite
   │
   └── ProfilePage
          │
          └── Person
                 ├── GitHub
                 └── LinkedIn
```

Only create relationships supported by actual data.

Do not invent social profiles.

------------------------------------------------------------------------

# 34. Project JSON-LD relationship

``` text
CreativeWork
     │
     └── creator
             │
             └── Person
```

The creator must consistently be:

``` text
Vishal Kumar Choudhary
```

when the visible page identifies him as the project creator/developer.

------------------------------------------------------------------------

# 35. No fake structured data

Never fabricate:

``` text
rating
review
award
price
client
organization
metric
revenue
users
ranking
testimonial
```

Structured data must match visible page content.

------------------------------------------------------------------------

# 36. SEO content truth

SEO must never upgrade the factual meaning of a project.

For example:

Current:

``` text
Current price comparison across supported sources
```

must not become:

``` text
Real-time global price tracking across all retailers
```

Current:

``` text
Reusable React UI components
```

must not become:

``` text
Enterprise design system used by thousands of developers
```

Specificity is good. Exaggeration is not.

------------------------------------------------------------------------

# 37. Implementation phases

## Phase 1 --- Audit

Inspect:

``` text
app/
data/
project data
layout
routing
existing metadata
existing sitemap
existing robots
Motion
Lenis
theme
Redux
```

Done when:

``` text
[ ] canonical project source identified
[ ] homepage route identified
[ ] dynamic project route identified
[ ] existing SEO architecture understood
[ ] no duplicate SEO source introduced
```

## Phase 2 --- Canonical SEO fields

Add:

``` text
seo.title
seo.description
seo.keywords where useful
updatedAt when verified
```

Done when all public projects have unique factual metadata.

## Phase 3 --- URL utilities

Implement:

``` text
buildSiteUrl
buildProjectUrl
buildAbsoluteAssetUrl
```

Done when no production metadata depends on localhost.

## Phase 4 --- Homepage metadata

Implement:

``` text
title
description
canonical
OG
Twitter/X
JSON-LD
```

Done when the homepage has one H1 and coherent metadata.

## Phase 5 --- Project metadata

Implement dynamic `generateMetadata()`.

Done when every project has unique:

``` text
title
description
canonical
OG image
social metadata
```

## Phase 6 --- JSON-LD

Implement homepage and project structured data.

Done when structured data matches visible content exactly.

## Phase 7 --- Sitemap/robots

Generate public URLs from project data.

Done when all four project routes are discoverable and no internal route
is unintentionally indexed.

## Phase 8 --- Semantic audit

Check:

``` text
H1
H2
H3
main
section
article
nav
links
images
```

Done when meaningful content exists without interaction.

## Phase 9 --- Internal linking

Verify:

``` text
Home → projects
Project → project listing
Project → previous/next/related
Project → contact
```

where appropriate.

## Phase 10 --- Accessibility/performance

Verify:

``` text
LCP
INP
CLS
keyboard
focus
contrast
alt text
reduced motion
client boundaries
```

## Phase 11 --- Production validation

Run:

``` bash
npm run lint
npm run build
```

and existing typecheck/tests if available.

------------------------------------------------------------------------

# 38. Validation matrix

## Homepage

``` text
[ ] exactly one H1
[ ] name visible
[ ] Frontend Developer identity visible
[ ] unique title
[ ] unique description
[ ] canonical
[ ] OG
[ ] Twitter/X
[ ] Person schema where appropriate
[ ] Website/ProfilePage schema where appropriate
[ ] real social links
[ ] project links crawlable
[ ] experience semantic
[ ] skills semantic
[ ] contact accessible
[ ] meaningful alt text
[ ] no hidden keyword blocks
[ ] no client-only SEO content
[ ] no Redux dependency for SEO content
[ ] no Lenis dependency for SEO content
[ ] mobile accessible
[ ] reduced motion supported
```

## Every project page

``` text
[ ] canonical project source
[ ] unique slug
[ ] real 404 for invalid slug
[ ] exactly one H1
[ ] project name consistent
[ ] description visible
[ ] role visible
[ ] year visible
[ ] category visible
[ ] technologies visible
[ ] context visible
[ ] approach visible
[ ] design visible
[ ] engineering visible
[ ] motion visible where applicable
[ ] responsive content visible
[ ] showcase accessible
[ ] reflection visible
[ ] unique SEO title
[ ] unique SEO description
[ ] canonical
[ ] OG
[ ] Twitter/X
[ ] JSON-LD
[ ] creator identity
[ ] valid optional links
[ ] sitemap inclusion
[ ] internal linking
[ ] correct alt text
[ ] no fabricated claims
[ ] no keyword stuffing
[ ] no hidden SEO text
```

------------------------------------------------------------------------

# 39. Browser validation

For each production route inspect:

``` text
View Source
DOM
<head>
```

Confirm:

``` html
<title>...</title>
<meta name="description" ...>
<link rel="canonical" ...>
<meta property="og:title" ...>
<meta property="og:description" ...>
<meta property="og:image" ...>
<script type="application/ld+json">...</script>
```

Important project content must exist without hover or animation
completion.

------------------------------------------------------------------------

# 40. AEO quality test

The rendered site should make these questions answerable directly:

``` text
Who is Vishal Kumar Choudhary?
What does he do?
Which frontend technologies does he use?
What projects has he built?
What is ClassFuse?
What is Spendwise?
What is System Canvas?
What is Next.js Master?
What was his role on each project?
Which technologies were used on each project?
```

If an answer requires an animation, hover, image inspection, or hidden
client state, improve the semantic content.

------------------------------------------------------------------------

# 41. Non-negotiable rules

1.  Do not hide SEO-critical content behind animation.
2.  Do not make SEO-critical content depend on Redux.
3.  Do not make SEO-critical content depend on Lenis.
4.  Do not unnecessarily convert server pages to Client Components.
5.  Do not duplicate project facts across SEO files.
6.  Do not fabricate structured data.
7.  Do not use hidden keyword blocks.
8.  Do not keyword-stuff titles/descriptions/alt text.
9.  Do not ship localhost URLs in production metadata.
10. Do not accidentally noindex public project pages.
11. Do not return 200 for missing projects when 404 is appropriate.
12. Do not treat AEO as a secret metadata trick.
13. Do not sacrifice performance for animation.
14. Do not sacrifice accessibility for visual effects.
15. Do not change factual project meaning for SEO.
16. Do not invent technologies or product capabilities.
17. Do not create a second project source of truth.
18. Do not casually change public project slugs.
19. Do not create fake FAQ schema.
20. Do not break the existing homepage or `/projects/[slug]`
    architecture.

------------------------------------------------------------------------

# 42. Final architecture

``` text
                 CANONICAL PORTFOLIO DATA
                          │
             ┌────────────┼────────────┐
             │            │            │
             ▼            ▼            ▼
         HOMEPAGE     PROJECT DATA   SOCIAL DATA
             │            │
             │            ▼
             │      /projects/[slug]
             │            │
             │            ▼
             │     SEMANTIC CASE STUDY
             │            │
             │     ┌──────┼──────┐
             │     ▼      ▼      ▼
             │ Metadata JSON-LD Sitemap
             │
             ▼
       CRAWLABLE INTERNAL LINKS
             │
             ▼
       SEARCH + AI DISCOVERY
```

Presentation remains progressive enhancement:

``` text
Semantic content
      ↓
Accessibility
      ↓
Metadata
      ↓
Structured data
      ↓
Crawlable URLs
      ↓
Motion
      ↓
Lenis
      ↓
Premium visual experience
```

------------------------------------------------------------------------

# 43. Final definition of done

The implementation is complete only when:

``` text
Homepage
+
Dynamic project pages
+
Canonical project data
+
Unique metadata
+
Canonical URLs
+
Open Graph
+
Twitter/X
+
Structured data
+
Sitemap
+
Robots
+
Semantic HTML
+
Internal linking
+
Accessible images
+
Real 404 semantics
+
Performance
+
Reduced motion
+
Production validation
```

all work together without changing the factual meaning of the portfolio.

The target is not:

> an impressive animated site that also has SEO.

The target is:

> a technically sound, semantically structured, search-discoverable
> frontend portfolio that happens to have an exceptional motion and
> visual system.
