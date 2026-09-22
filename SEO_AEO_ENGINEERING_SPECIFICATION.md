# SEO + AEO Engineering Specification
## Production Portfolio Standard for AI Coding Agents

> **Purpose:** This document is the project-wide SEO, AEO, accessibility, crawlability, structured-data, content, performance, and information-architecture specification for a production-grade portfolio belonging to a **Frontend Developer / Design Engineer**.
>
> **Audience:** AI coding agents, frontend engineers, designers, reviewers, and future maintainers.
>
> **Core principle:** SEO/AEO is an architectural concern. It must be considered whenever a page, section, component, route, project, animation, or data model is created or modified.

---

## Table of Contents

1. [Project Context](#1-project-context)
2. [Core Principle](#2-core-principle)
3. [Single Source of Truth](#3-single-source-of-truth)
4. [Homepage SEO](#4-homepage-seo)
5. [Every Indexable Page Needs a Purpose](#5-every-indexable-page-needs-a-purpose)
6. [Heading and Semantic HTML Rules](#6-heading-and-semantic-html-rules)
7. [Project Detail Page Requirements](#7-project-detail-page-requirements)
8. [AEO Content Principles](#8-aeo-content-principles)
9. [Answer-Ready Content](#9-answer-ready-content)
10. [Dynamic Project Metadata](#10-dynamic-project-metadata)
11. [Title Rules](#11-title-rules)
12. [Meta Description Rules](#12-meta-description-rules)
13. [Canonical URLs](#13-canonical-urls)
14. [Open Graph](#14-open-graph)
15. [Social Card Metadata](#15-social-card-metadata)
16. [JSON-LD / Structured Data](#16-json-ld--structured-data)
17. [Structured Data Integrity](#17-structured-data-integrity)
18. [Sitemap](#18-sitemap)
19. [Robots](#19-robots)
20. [Debug and Private Routes](#20-debug-and-private-routes)
21. [404 and Route Semantics](#21-404-and-route-semantics)
22. [Images](#22-images)
23. [Motion and SEO](#23-motion-and-seo)
24. [Lenis and SEO](#24-lenis-and-seo)
25. [Client Component Boundaries](#25-client-component-boundaries)
26. [Redux Toolkit and SEO](#26-redux-toolkit-and-seo)
27. [Theme Switching and SEO](#27-theme-switching-and-seo)
28. [Internal Linking](#28-internal-linking)
29. [Breadcrumbs](#29-breadcrumbs)
30. [Static Generation and Rendering](#30-static-generation-and-rendering)
31. [Project Data Validation](#31-project-data-validation)
32. [Slug Rules](#32-slug-rules)
33. [Update Dates](#33-update-dates)
34. [Author and Entity Consistency](#34-author-and-entity-consistency)
35. [Content Originality](#35-content-originality)
36. [AEO Question Model](#36-aeo-question-model)
37. [AEO Entity Consistency](#37-aeo-entity-consistency)
38. [Performance as SEO](#38-performance-as-seo)
39. [Accessibility as SEO/AEO](#39-accessibility-as-seoaeo)
40. [Search Index Control](#40-search-index-control)
41. [Error Pages and SEO](#41-error-pages-and-seo)
42. [Development vs Production](#42-development-vs-production)
43. [Site URL Configuration](#43-site-url-configuration)
44. [Page and Section Implementation Rules](#44-page-and-section-implementation-rules)
45. [Shared Section Components](#45-shared-section-components)
46. [AEO-Friendly Project Content Model](#46-aeo-friendly-project-content-model)
47. [SEO/AEO Review Before Completion](#47-seoaeo-review-before-completion)
48. [Homepage Checklist](#48-homepage-checklist)
49. [Project Page Checklist](#49-project-page-checklist)
50. [Agent Definition of Done](#50-agent-definition-of-done)
51. [Final Architecture](#51-final-architecture)

---

# 1. Project Context

The portfolio uses:

- Next.js App Router
- React
- TypeScript or JavaScript according to the existing repository
- Tailwind CSS
- Motion
- Lenis smooth scrolling
- `next-themes`
- Redux Toolkit
- reusable UI components
- reusable motion components
- data-driven project detail pages
- dynamic `/projects/[slug]` routes
- shared primitives such as:
  - `Section`
  - `Container`
  - `SectionHeading`
  - `Button`
  - `Reveal`
  - `ProjectCard`

The portfolio is positioned as a **Frontend Developer / Design Engineer**.

The website must optimize simultaneously for:

- traditional search engines
- search discovery
- generative/AI search visibility
- accessibility
- semantic HTML
- crawlability
- indexability
- link discoverability
- shareability
- performance
- maintainability
- technical credibility

---

# 2. Core Principle

Do **not** build:

```text
Visual page
    ↓
Animations
    ↓
SEO added afterward
```

Build:

```text
Canonical content/data
    ↓
Semantic HTML
    ↓
Metadata
    ↓
Structured data
    ↓
Crawlable URLs
    ↓
Accessible UI
    ↓
Motion enhancement
    ↓
Premium visual presentation
```

The content must remain understandable without:

- Motion
- Lenis
- JavaScript-driven scroll behavior
- parallax
- hover effects
- pinned sequences
- visual transitions

Motion and smooth scrolling are presentation enhancements.

They are never the primary carrier of meaning.

---

# 3. Single Source of Truth

All project information must originate from one canonical project data model.

Do **not** maintain separate project information for:

- project cards
- project detail pages
- metadata
- Open Graph
- JSON-LD
- sitemap
- related projects
- project navigation
- social metadata

Use one canonical data source.

Example:

```ts
export type Project = {
  slug: string

  title: string

  tagline: string

  shortDescription: string

  description: string

  role: string

  year: number

  status?: string

  category: string

  industry?: string

  technologies: string[]

  services?: string[]

  featured?: boolean

  cover: {
    src: string
    alt: string
    width: number
    height: number
  }

  content: {
    overview: string
    challenge?: string
    approach?: string
    solution: string
    architecture?: string
    interaction?: string
    motion?: string
    performance?: string
    accessibility?: string
    outcome?: string
  }

  links: {
    live?: string
    source?: string
  }

  seo: {
    title: string
    description: string
    keywords?: string[]
  }

  updatedAt: string
}
```

The exact schema may differ. The single-source-of-truth principle must not.

The project data should drive:

```text
UI
metadata
Open Graph
JSON-LD
sitemap
project navigation
related projects
SEO validation
```

---

# 4. Homepage SEO

The homepage must clearly communicate:

```text
Who is this person?
What do they do?
What do they specialize in?
What technologies do they use?
What type of work do they create?
How can someone contact them?
```

Preferred title pattern:

```text
[Name] — Frontend Developer & Design Engineer
```

Avoid:

```text
Welcome to my portfolio
My Website
Home
Creative Portfolio
```

The homepage description should naturally explain the person's specialization.

Example:

```text
Portfolio of [Name], a frontend developer and design engineer
building high-performance digital experiences with React, Next.js,
TypeScript, Motion, and modern web technologies.
```

Do not keyword-stuff.

---

# 5. Every Indexable Page Needs a Purpose

Every public/indexable route must have a clear purpose.

Before creating a page, answer:

```text
What is this page about?
Why should it exist independently?
What information does it provide?
What user intent does it serve?
```

Do not create indexable pages that contain only:

- decoration
- animation
- duplicated content
- placeholder text
- thin project summaries
- client-only generated content
- visual effects without meaningful page information

---

# 6. Heading and Semantic HTML Rules

## H1

Every major indexable page should have one primary heading.

Homepage:

```html
<h1>Frontend Developer & Design Engineer</h1>
```

Project page:

```html
<h1>Project Name</h1>
```

Do not create multiple competing H1s.

Do not replace semantic headings with styled `<div>` elements.

## Heading hierarchy

Use:

```text
H1
 ├── H2
 │    ├── H3
 │    └── H3
 ├── H2
 └── H2
```

Example:

```text
H1: Project Name

H2: Overview

H2: The Challenge

H2: The Approach

H2: Frontend Architecture

H3: Component System
H3: State Management

H2: Interaction Design

H2: Motion System

H2: Performance

H2: Accessibility

H2: Outcome
```

Do not choose heading levels based only on visual size.

---

# 7. Project Detail Page Requirements

Every project detail page must contain enough visible content to understand the project without interacting with the interface.

Recommended minimum:

```text
Project title
Tagline
Short description
Role
Year
Category
Technologies
Overview
Challenge
Approach
Solution
Technical implementation
Outcome
```

When applicable:

```text
Architecture
Component system
State management
Interaction design
Motion design
Performance
Accessibility
Testing
Deployment
Results
```

The project page should naturally answer:

```text
What was built?
Why was it built?
Who built it?
What was my role?
How was it built?
Which technologies were used?
What technical decisions were made?
What was the result?
```

---

# 8. AEO Content Principles

AEO is not a magic meta tag.

Do not create:

```html
<meta name="aeo">
```

There is no need for an artificial "AI optimization" metadata layer.

AEO should mean making information:

- clear
- factual
- extractable
- semantically organized
- attributable
- internally consistent
- useful to humans

Do not create:

- hidden keywords
- fake FAQs
- keyword blocks
- robotic text
- content that exists only for search engines

Write for humans first.

---

# 9. Answer-Ready Content

Important facts should be expressed directly.

Prefer:

```text
The application was built with Next.js, TypeScript,
Tailwind CSS and Motion.
```

Instead of:

```text
A modern collection of carefully orchestrated technologies
powered the experience.
```

Use precise language for:

- role
- technologies
- responsibilities
- dates
- architecture
- performance
- accessibility
- outcomes
- constraints
- decisions

The goal is high information density without robotic prose.

---

# 10. Dynamic Project Metadata

For:

```text
app/projects/[slug]/page.tsx
```

generate metadata from project data.

Conceptually:

```ts
export async function generateMetadata({ params }) {
  const { slug } = await params

  const project = getProjectBySlug(slug)

  if (!project) {
    return {}
  }

  return {
    title: project.seo.title,
    description: project.seo.description,

    alternates: {
      canonical: buildProjectUrl(project.slug),
    },

    openGraph: {
      type: "article",
      title: project.seo.title,
      description: project.seo.description,
      url: buildProjectUrl(project.slug),
      images: [
        {
          url: project.cover.src,
          width: project.cover.width,
          height: project.cover.height,
          alt: project.cover.alt,
        },
      ],
    },
  }
}
```

Never hardcode identical metadata across every project.

---

# 11. Title Rules

## Homepage

```text
[Name] — Frontend Developer & Design Engineer
```

## Project page

```text
[Project Name] — Frontend Development Case Study | [Name]
```

## About page

```text
About [Name] — Frontend Developer & Design Engineer
```

Rules:

- describe the actual page
- keep wording natural
- avoid keyword stuffing
- keep the main topic recognizable
- do not repeat the same title for unrelated pages

Avoid:

```text
React Next.js TypeScript Developer Portfolio React Developer
Next.js Developer UI UX Web Design...
```

---

# 12. Meta Description Rules

Every indexable page should have a useful, unique description.

Example:

```text
A frontend engineering case study covering the architecture,
interaction design, performance work and responsive implementation
behind Project X.
```

Do not:

- duplicate descriptions across every project
- stuff keywords
- describe information not present on the page
- write vague marketing language with no factual meaning

---

# 13. Canonical URLs

Every indexable public page should have one canonical URL.

Example:

```text
https://example.com/projects/project-name
```

Centralize URL creation in something like:

```text
lib/seo/urls.ts
```

Recommended conceptual helpers:

```ts
buildSiteUrl()
buildProjectUrl(slug)
buildAbsoluteAssetUrl(path)
```

Use the same URL logic for:

- canonical metadata
- Open Graph
- JSON-LD
- sitemap
- internal absolute references when needed

Never emit localhost URLs in production metadata.

---

# 14. Open Graph

Major public pages should have:

```text
og:title
og:description
og:image
og:url
og:type
```

Project pages should use project-specific images.

Do not use one generic image for every project unless there is a deliberate design reason.

Open Graph is primarily for link previews and share presentation. It should not be treated as a direct ranking mechanism.

---

# 15. Social Card Metadata

Where appropriate, define social card metadata using the same source data.

Examples:

```text
twitter:card
twitter:title
twitter:description
twitter:image
```

Do not maintain a separate content source just for social cards.

---

# 16. JSON-LD / Structured Data

Structured data should describe what the page genuinely represents.

For the homepage, suitable types may include:

```text
Person
WebSite
ProfilePage
```

For projects, use an appropriate work/creative type when justified by the actual content.

Example:

```json
{
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Project Name",
  "description": "Project description",
  "url": "https://example.com/projects/project-name",
  "image": "https://example.com/projects/project-name/cover.webp",
  "creator": {
    "@type": "Person",
    "name": "Your Name"
  }
}
```

Do not add structured-data properties simply because they exist in Schema.org.

Only add facts that are true.

---

# 17. Structured Data Integrity

Structured data must match visible page content.

If the page says:

```text
Role: Frontend Developer
```

do not put:

```text
Role: Product Manager
```

in structured data.

Do not fabricate:

- ratings
- reviews
- prices
- awards
- dates
- organizations
- clients
- authors
- metrics
- results

Structured data is a machine-readable representation of the page, not a second marketing story.

---

# 18. Sitemap

Create:

```text
app/sitemap.ts
```

Generate URLs from the canonical project data.

Conceptually:

```ts
import type { MetadataRoute } from "next"
import { projects } from "@/data/projects"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },

    ...projects.map((project) => ({
      url: `${baseUrl}/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt),
    })),
  ]
}
```

Do not manually maintain project URLs.

Adding a valid project should automatically make it eligible for sitemap generation.

---

# 19. Robots

Create:

```text
app/robots.ts
```

Allow public pages.

Disallow internal/debug/private routes where appropriate.

Example:

```ts
import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL!

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/debug/",
        "/internal/",
        "/admin/",
      ],
    },

    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

Do not accidentally block:

```text
/
/projects/
/projects/[slug]
```

Remember that `robots.txt` controls crawling behavior. It should not be treated as a replacement for a `noindex` directive when a URL must not appear in search results.

---

# 20. Debug and Private Routes

Debug pages such as:

```text
/debug/error
```

must not become public indexed content.

Use appropriate protection and/or indexing controls.

Do not rely only on robots.txt if a route must definitely stay out of search indexes.

---

# 21. 404 and Route Semantics

Invalid project routes should produce real 404 semantics.

Prefer Next.js `notFound()` for missing projects.

Do not return a successful page response that merely says:

```text
Project not found
```

for a non-existent public route.

A beautiful UI does not justify incorrect HTTP semantics.

---

# 22. Images

Every meaningful image must have accurate alt text.

Good:

```text
Analytics dashboard showing real-time sales metrics
```

Bad:

```text
dashboard
image
project image
```

Decorative imagery should use:

```html
alt=""
```

Do not stuff keywords into alt attributes.

Use `next/image` where appropriate.

Prefer known image dimensions to reduce layout shifts.

---

# 23. Motion and SEO

Motion must enhance existing content.

Bad:

```text
Content exists only after a Motion sequence completes.
```

Good:

```text
Semantic content exists.
Motion controls how it enters and transforms visually.
```

The site should remain understandable when:

```text
Motion is disabled.
```

Do not hide all meaningful content behind animation state.

Do not make SEO/content depend on a client-side animation lifecycle.

---

# 24. Lenis and SEO

Lenis is global scroll infrastructure.

Do not create separate Lenis instances for individual sections.

Do not make important content dependent on Lenis initialization.

This must remain true:

```text
No Lenis
    ↓
page still renders
    ↓
content remains accessible
    ↓
links remain usable
```

Do not attach essential semantic information only to scroll callbacks.

Do not replace normal document navigation with a scroll-only navigation model.

---

# 25. Client Component Boundaries

Do not convert entire pages to Client Components just because Motion or one interactive widget requires client execution.

Prefer:

```text
Server page
   ↓
Server-rendered content
   ↓
small client animation/interaction boundary
```

Conceptual example:

```text
ProjectPage
├── ProjectHero
├── ProjectMetadata
├── ProjectContent
└── AnimatedProjectGallery   ← client
```

This helps keep:

- semantic HTML
- server rendering
- SEO-critical content
- reduced client JavaScript

in good shape.

---

# 26. Redux Toolkit and SEO

Do not put SEO-critical page meaning into Redux merely because Redux Toolkit is already used.

Do not make:

- H1
- project title
- project description
- project body
- canonical
- SEO metadata

depend on client-side Redux initialization.

SEO-critical content should be accessible from the server/data layer.

Do not dispatch scroll updates to Redux on every animation frame.

Do not use Redux for transient animation state unless there is a strong established architectural reason.

Prefer:

```text
Redux
    → application/global state

React state
    → local component state

Motion values
    → animation state

Server/data layer
    → SEO/content data
```

---

# 27. Theme Switching and SEO

Use the existing `next-themes` architecture.

Theme changes should affect:

- colors
- surfaces
- borders
- contrast
- visual treatment

Theme should not create separate semantic content.

Do not maintain:

```text
Dark-mode SEO copy
Light-mode SEO copy
```

The content should remain the same.

---

# 28. Internal Linking

Use real crawlable links.

Prefer:

```tsx
<Link href={`/projects/${project.slug}`}>
  View case study
</Link>
```

instead of:

```tsx
<div onClick={() => router.push(...)}>
```

when the target is a normal navigable page.

Project detail pages should provide meaningful links to:

```text
Back to work
Previous project
Next project
Related projects
About
Contact
```

Internal linking should be generated from project data wherever practical.

---

# 29. Breadcrumbs

Use breadcrumbs when they improve navigation.

Project example:

```text
Home
  →
Work
  →
Project Name
```

If breadcrumb structured data is used, it must exactly represent the visible breadcrumb trail.

Never create breadcrumbs solely for schema manipulation.

---

# 30. Static Generation and Rendering

Projects are often known ahead of time and change relatively infrequently.

When appropriate, use:

```ts
generateStaticParams()
```

for known project slugs.

Conceptually:

```ts
export function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }))
}
```

Choose static generation, revalidation, or dynamic rendering based on the actual content lifecycle.

For a normal portfolio, static rendering is usually an excellent default.

---

# 31. Project Data Validation

Project data must be validated during development/build.

Require, at minimum:

```text
slug
title
description
role
year
technologies
cover
content
seo.title
seo.description
updatedAt
```

Validate:

```text
slug uniqueness
metadata completeness
URL correctness
image existence where practical
non-empty headings
project existence
internal-link targets
```

A missing critical field should fail development/build validation where practical rather than silently generating a poor SEO page.

---

# 32. Slug Rules

Slugs should be:

- lowercase
- stable
- unique
- descriptive
- URL-safe

Good:

```text
fintech-dashboard
interactive-commerce-platform
design-system-explorer
```

Bad:

```text
Project1
myProjectFinal2
awesome-project-new
```

Do not casually change public project slugs after publication.

If a public slug changes, establish a redirect strategy.

---

# 33. Update Dates

Keep a meaningful:

```text
updatedAt
```

for each project.

Use it when the actual content/project record changes.

Do not change it simply because someone visited the page.

Use it when appropriate for sitemap `lastModified`.

---

# 34. Author and Entity Consistency

Keep the portfolio owner's identity consistent throughout:

```text
homepage
about
project pages
metadata
JSON-LD
social metadata
```

If the portfolio states:

```text
Frontend Developer & Design Engineer
```

do not randomly alternate between:

```text
UI Designer
Product Manager
Full Stack Engineer
Creative Developer
```

unless all are genuinely accurate.

Maintain one coherent professional identity.

For appropriate structured data, use the same canonical person identity:

```json
{
  "@type": "Person",
  "name": "Your Name",
  "url": "https://example.com",
  "jobTitle": "Frontend Developer & Design Engineer"
}
```

Only connect genuine public profiles.

---

# 35. Content Originality

Project case studies must describe actual work.

Avoid generic claims such as:

```text
This innovative platform leverages cutting-edge technology
to deliver seamless digital experiences.
```

Prefer concrete engineering information:

```text
The dashboard uses server-rendered project content,
Motion for interaction choreography, and a shared component
system for consistent responsive layouts.
```

Specificity is valuable.

Where metrics exist, state real metrics.

Where metrics do not exist, do not invent them.

---

# 36. AEO Question Model

Every important project should naturally make it possible to answer:

```text
What is [Project Name]?
Who built [Project Name]?
What was [Name]'s role?
What technologies were used?
Why was the project built?
What problem did it solve?
How was it implemented?
What frontend architecture was used?
How was the interface designed?
How was Motion used?
How was performance handled?
How was accessibility handled?
What was the result?
```

The page does not need to turn all of these into literal FAQs.

The information simply needs to be present and clear.

---

# 37. AEO Entity Consistency

Use consistent names for:

- person
- project
- company/client
- technology
- role
- date
- outcome

For example, if the project is officially named:

```text
Analytics Platform
```

do not call it:

```text
Analytics Platform
Analytics Dashboard
Analytics SaaS
Analytics App
```

randomly unless those are actually separate names/contextual names.

Keep the entity recognizable.

---

# 38. Performance as SEO

Every implementation must consider:

```text
LCP
INP
CLS
image weight
font loading
JavaScript size
hydration cost
client component boundaries
animation cost
network requests
```

Do not sacrifice fundamental performance for visual spectacle.

For this portfolio:

```text
Content and structure first
Performance second
Motion third
```

The correct relationship is:

```text
fast content
    ↓
semantic structure
    ↓
progressive enhancement
    ↓
motion
```

not:

```text
animation
    ↓
large client bundle
    ↓
content becomes usable later
```

---

# 39. Accessibility as SEO/AEO

Every new page/component/section must consider:

```text
semantic HTML
keyboard navigation
focus order
focus visibility
color contrast
reduced motion
screen readers
alt text
form labels
button/link semantics
ARIA only where necessary
```

Use native semantics first.

Do not replace:

```html
<button>
```

with:

```html
<div onClick={...}>
```

when the element is functionally a button.

---

# 40. Search Index Control

Every route should conceptually be classified as:

```text
INDEX
```

or:

```text
NOINDEX
```

Typical public routes:

```text
/
/about
/projects/project-a
/projects/project-b
/contact
```

Typical internal/testing routes:

```text
/debug/error
/internal/*
/admin/*
```

Do not accidentally apply `noindex` to public portfolio/project routes.

---

# 41. Error Pages and SEO

404 and runtime error pages are different.

404:

```text
The requested resource does not exist.
```

500/runtime error:

```text
The application failed while rendering this page.
```

Production error pages must not expose sensitive server implementation details.

Development may show:

```text
error name
message
component
file
line
column
stack
digest
```

Production should prefer:

```text
safe message
route
reference/digest
retry
home
```

Do not expose:

- secrets
- tokens
- API keys
- cookies
- authorization headers
- database credentials
- internal infrastructure details

---

# 42. Development vs Production

## Development

Detailed diagnostic information may be shown when safely available:

```text
TypeError
Cannot read properties of undefined...

Component:
ProjectsSection

File:
src/components/sections/ProjectsSection.tsx

Line:
142

Column:
19

Stack:
...
```

## Production

Prefer:

```text
Something went wrong while rendering this page.

Reference:
7f2c91...

Route:
/projects/example

[Try again]
[Go home]
```

Do not pretend exact server source information is always available to the browser in production.

Use a digest/reference ID to correlate user-facing failures with server-side logs.

---

# 43. Site URL Configuration

Do not scatter production domain strings across the codebase.

Use an environment-driven value such as:

```text
NEXT_PUBLIC_SITE_URL
```

Example:

```text
https://example.com
```

Normalize the base URL.

Use it consistently for:

```text
canonical
Open Graph
JSON-LD
sitemap
absolute image URLs
social metadata
```

Never emit:

```text
http://localhost:3000
```

in production metadata.

---

# 44. Page and Section Implementation Rules

Whenever an AI agent creates or changes a page or section, it must inspect:

```text
1. Data source
2. Semantic structure
3. H1/H2/H3 hierarchy
4. Metadata implications
5. Canonical URL implications
6. Structured-data implications
7. Internal linking
8. Accessibility
9. Server/client boundary
10. Motion behavior
11. Lenis behavior
12. Theme behavior
13. Redux usage
14. Performance
15. Indexability
```

The agent must not stop at:

```text
Section.tsx
Section CSS
```

It must consider the page as a complete information system.

---

# 45. Shared Section Components

Reusable components such as:

```text
Section
Container
SectionHeading
Button
Badge
Divider
Reveal
ProjectCard
```

must preserve semantic structure.

Example:

```tsx
<Section>
  <Container>
    <SectionHeading
      eyebrow="Selected Work"
      title="Projects that combine design and engineering"
      description="..."
    />

    ...
  </Container>
</Section>
```

These components should produce meaningful semantic HTML while remaining visually flexible.

Reusable components are part of the SEO architecture because they help enforce consistency.

---

# 46. AEO-Friendly Project Content Model

The project data model should expose enough information for both page rendering and search/AI interpretation.

Recommended conceptual model:

```ts
type Project = {
  slug: string
  title: string
  tagline: string

  seo: {
    title: string
    description: string
    keywords?: string[]
  }

  role: string
  year: number
  category: string

  technologies: string[]

  summary: string

  content: {
    overview: string
    challenge?: string
    approach?: string
    solution: string
    architecture?: string
    interaction?: string
    motion?: string
    performance?: string
    accessibility?: string
    outcome?: string
  }

  cover: {
    src: string
    alt: string
    width: number
    height: number
  }

  images?: {
    src: string
    alt: string
    width: number
    height: number
  }[]

  links?: {
    live?: string
    source?: string
  }

  updatedAt: string
}
```

The same object should be able to generate:

```text
Project card
Project page
Metadata
Open Graph
JSON-LD
Sitemap entry
Related project links
Previous/next links
SEO validation
```

---

# 47. SEO/AEO Review Before Completion

Before an AI agent marks any page as complete, verify:

```text
[ ] Clear purpose
[ ] Useful H1
[ ] Semantic HTML
[ ] Correct heading hierarchy
[ ] Meaningful visible content
[ ] Unique title
[ ] Unique description
[ ] Canonical URL
[ ] Correct Open Graph metadata
[ ] Correct page URL
[ ] Structured data when justified
[ ] Real internal links
[ ] Correct image alt text
[ ] No broken links
[ ] No placeholder copy
[ ] No hidden SEO text
[ ] No keyword stuffing
[ ] Mobile layout
[ ] Keyboard navigation
[ ] Reduced-motion support
[ ] Correct theme behavior
[ ] No unnecessary client boundary
[ ] No SEO dependency on Redux
[ ] No SEO dependency on Lenis
[ ] Motion enhances rather than carries content
[ ] Correct indexability
[ ] Production-safe metadata
```

---

# 48. Homepage Checklist

```text
[ ] Clear personal identity
[ ] Clear professional title
[ ] Strong introductory summary
[ ] Selected work section
[ ] About section
[ ] Skills/technology information
[ ] Experience where relevant
[ ] Contact information
[ ] Internal links
[ ] Person structured data when appropriate
[ ] WebSite/ProfilePage structured data when appropriate
[ ] Correct canonical URL
[ ] Correct Open Graph image
[ ] Sitemap inclusion
[ ] Mobile accessibility
[ ] Reduced-motion behavior
```

---

# 49. Project Page Checklist

```text
[ ] Project exists in canonical data source
[ ] Unique slug
[ ] Unique title
[ ] Unique SEO title
[ ] Unique SEO description
[ ] Clear H1
[ ] Role defined
[ ] Year defined
[ ] Category defined
[ ] Technologies defined
[ ] Cover image
[ ] Useful cover alt text
[ ] Overview
[ ] Challenge where applicable
[ ] Approach
[ ] Solution
[ ] Technical implementation
[ ] Architecture where relevant
[ ] Interaction/motion details where relevant
[ ] Performance details where relevant
[ ] Accessibility details where relevant
[ ] Outcome
[ ] Live link verified
[ ] Source link verified
[ ] Dynamic metadata
[ ] Canonical URL
[ ] Open Graph metadata
[ ] Structured data where justified
[ ] Included in sitemap
[ ] Linked from project listing
[ ] Related projects where appropriate
[ ] Previous/next navigation where appropriate
[ ] Invalid slug returns 404
```

---

# 50. Agent Definition of Done

An AI agent must not claim a page is production-ready simply because:

```text
npm run dev
```

works.

The page is complete only when:

```text
content
+
semantic HTML
+
metadata
+
canonical
+
structured data
+
internal linking
+
accessibility
+
performance
+
motion compatibility
+
theme compatibility
+
routing correctness
+
indexability
```

have all been considered.

Before completion, run relevant checks such as:

```text
npm run lint
npm run build
```

and any available:

```text
typecheck
tests
```

Fix issues caused by the implementation.

Do not hide errors with:

```text
@ts-ignore
eslint-disable
force flags
legacy-peer-deps
swallowed exceptions
```

unless a genuinely necessary, documented reason exists.

---

# 51. Final Architecture

The desired portfolio architecture is:

```text
                         PROJECT DATA
                              │
              ┌───────────────┼────────────────┐
              │               │                │
              ▼               ▼                ▼
             UI             SEO             JSON-LD
              │               │                │
              ▼               ▼                ▼
        Project Page      Metadata          Structured Data
              │               │                │
              └───────────────┼────────────────┘
                              ▼
                        INDEXABLE PAGE
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
               Users       Search        AI systems
```

Sitemap flow:

```text
Project Data
    ↓
Sitemap
    ↓
Crawler discovery
    ↓
Canonical URL
    ↓
Indexing
```

Content flow:

```text
Semantic HTML
    ↓
Human understanding
    ↓
Machine interpretation
    ↓
Search / AI discoverability
```

Presentation flow:

```text
Semantic content
    ↓
Motion enhancement
    ↓
Lenis smooth scrolling
    ↓
Premium design-engineering experience
```

---

# Non-Negotiable Rules

The following rules are mandatory unless there is a documented architectural reason to deviate.

1. **Do not hide SEO-critical content behind animation.**
2. **Do not make SEO-critical content depend on Redux initialization.**
3. **Do not make SEO-critical content depend on Lenis.**
4. **Do not convert whole pages to Client Components unnecessarily.**
5. **Do not duplicate project content across multiple files.**
6. **Do not fabricate structured data.**
7. **Do not use hidden keyword blocks.**
8. **Do not keyword-stuff titles/descriptions/alt text.**
9. **Do not ship localhost URLs in production metadata.**
10. **Do not let debug routes become publicly indexable.**
11. **Do not return 200-style pages for missing projects when a real 404 is appropriate.**
12. **Do not treat AEO as a secret metadata trick.**
13. **Do not sacrifice page performance for animation.**
14. **Do not sacrifice accessibility for visual effects.**
15. **Do not expose sensitive server-side error details to production users.**
16. **Do not create a second global scroll, theme, Redux, or Motion infrastructure layer when one already exists.**
17. **Every new section must be checked for semantic, SEO, AEO, accessibility, performance, and routing implications.**
18. **Every project page must derive its core SEO metadata from the canonical project data source.**
19. **Every public indexable page must have a clear purpose.**
20. **Motion must enhance content, never replace it.**

---

# Recommended Project Structure

A practical implementation may look like:

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── about/
│   │   └── page.tsx
│   │
│   ├── projects/
│   │   └── [slug]/
│   │       └── page.tsx
│   │
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── manifest.ts
│   ├── not-found.tsx
│   ├── error.tsx
│   └── global-error.tsx
│
├── data/
│   └── projects.ts
│
├── lib/
│   ├── seo/
│   │   ├── metadata.ts
│   │   ├── jsonld.ts
│   │   ├── urls.ts
│   │   └── validators.ts
│   │
│   └── projects/
│       └── get-project.ts
│
├── components/
│   ├── seo/
│   │   └── JsonLd.tsx
│   │
│   ├── ui/
│   │   ├── Section/
│   │   ├── Container/
│   │   ├── SectionHeading/
│   │   └── Button/
│   │
│   ├── motion/
│   │   ├── Reveal/
│   │   ├── Stagger/
│   │   ├── Parallax/
│   │   └── TextReveal/
│   │
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectHero.tsx
│   │   ├── ProjectContent.tsx
│   │   └── RelatedProjects.tsx
│   │
│   └── sections/
│       ├── Hero/
│       ├── About/
│       ├── Experience/
│       ├── Skills/
│       ├── Projects/
│       ├── Experiments/
│       └── Contact/
│
├── providers/
│   ├── ThemeProvider.tsx
│   ├── ReduxProvider.tsx
│   └── SmoothScrollProvider.tsx
│
└── store/
    ├── index.ts
    └── slices/
```

This exact folder structure is not mandatory. The separation of concerns is.

---

# Final Principle

The portfolio should not be built as:

```text
"an impressive animated site that also has SEO"
```

It should be built as:

```text
A technically sound, semantically structured,
search-discoverable frontend application
that happens to have an exceptional motion/design system.
```

The target is:

```text
Excellent UX
+
Strong frontend architecture
+
Semantic HTML
+
Accessible content
+
Fast rendering
+
Crawlable routes
+
Accurate metadata
+
Accurate structured data
+
Clear project case studies
+
Strong internal linking
+
Motion as progressive enhancement
=
Production-grade design-engineering portfolio
```
