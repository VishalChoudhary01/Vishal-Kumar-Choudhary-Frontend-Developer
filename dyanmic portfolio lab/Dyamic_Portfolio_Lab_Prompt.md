# DYNAMIC PORTFOLIO + LABS — PRODUCTION ARCHITECTURE IMPLEMENTATION

You are a Senior Frontend Engineer, Next.js Architect, Backend Engineer,
MongoDB Architect, API Architect, Performance Engineer, and Product Engineer
with 10+ years of production experience.

You are working on an existing personal portfolio application built with
Next.js.

Your responsibility is NOT to redesign the existing portfolio.

Your responsibility is to progressively transform the current static
portfolio-content architecture into a production-ready, database-backed,
dynamic portfolio system while preserving the existing UI, visual design,
motion system, responsive behavior, and project-detail experience.

The application must support:

- Dynamic portfolio content
- MongoDB persistence
- Express.js backend/API
- React Query for server-state management
- Next.js frontend
- Existing Motion / Lenis animation architecture
- Existing project detail pages
- Optional image/video media
- Future admin/content management
- Future authentication
- Separate Labs system
- Labs source-code access
- Labs analytics
- Strong performance isolation
- SEO-friendly public pages
- Safe media handling
- Clean separation between Portfolio and Labs

Do NOT rewrite the application unnecessarily.

Do NOT replace the existing UI architecture.

Do NOT introduce TypeScript unless explicitly requested.

The current project uses JavaScript.

---

# 1. CURRENT SYSTEM — SOURCE OF TRUTH

The existing portfolio currently contains static data structures for:

- profile/name/role
- about
- navigation
- social links
- resume
- experience
- education
- skills
- projects

The current portfolio object is conceptually:

portfolio
├── name
├── role
├── about
├── navigation
├── socialLinks
├── resumeUrl
├── experience
├── education
├── skills
└── projects

The current project model is significantly richer than a simple:

title + description + image.

Projects currently contain concepts such as:

- id
- number
- name
- slug
- category
- categoryLabel
- description
- role
- year
- technologies
- contribution
- features
- media
- links
- presentation
- motion
- status
- order
- featured
- content
- story

The project story can contain:

- context
- approach
- design
- engineering
- motion
- responsive
- showcase
- reflection

Showcase entries can contain:

- type
- src
- alt
- caption
- optional layout

Media can be:

- image
- video

IMPORTANT:

Do not flatten this existing content model into a simplistic database model.

The database schema must preserve the existing content capabilities.

---

# 2. PRIMARY ARCHITECTURAL DECISION

The system must become:

NEXT.JS FRONTEND
        │
        │ HTTP
        ▼
EXPRESS API
        │
        ▼
MONGODB

React Query sits between the Next.js UI and API for client-side server-state
management.

Conceptually:

Browser
   ↓
Next.js UI
   ↓
React Query
   ↓
API client
   ↓
Express API
   ↓
Service layer
   ↓
Repository/data-access layer
   ↓
MongoDB

Do NOT allow React components to directly communicate with MongoDB.

Do NOT put MongoDB logic inside Next.js components.

Do NOT put database queries inside React Query hooks.

React Query hooks call API functions.

API functions call Express endpoints.

Express controllers call services.

Services call repositories.

Repositories communicate with MongoDB.

---

# 3. MONOREPO / FOLDER STRUCTURE

Use a clear separation.

Recommended structure:

project-root/

├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (portfolio)/
│   │   │   │   ├── page.jsx
│   │   │   │   ├── about/
│   │   │   │   ├── experience/
│   │   │   │   ├── projects/
│   │   │   │   │   └── [slug]/
│   │   │   │   └── contact/
│   │   │   │
│   │   │   ├── labs/
│   │   │   │   ├── page.jsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.jsx
│   │   │   │
│   │   │   ├── layout.jsx
│   │   │   └── providers.jsx
│   │   │
│   │   ├── components/
│   │   │   ├── portfolio/
│   │   │   ├── projects/
│   │   │   ├── labs/
│   │   │   ├── shared/
│   │   │   └── ui/
│   │   │
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   ├── query/
│   │   │   ├── media/
│   │   │   └── utils/
│   │   │
│   │   ├── hooks/
│   │   ├── constants/
│   │   └── data/
│   │
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │
│   └── package.json
│
├── shared/
│   ├── constants/
│   └── schemas/
│
└── README.md

If the existing repository is not currently a monorepo, do NOT blindly
move everything at once.

First inspect the current project.

Then migrate incrementally.

---

# 4. IMPORTANT — PRESERVE EXISTING UI

Before changing data architecture:

1. Inspect all current portfolio components.
2. Identify which components consume:
   - portfolio
   - about
   - experience
   - education
   - skills
   - projects
3. Identify project-detail components.
4. Identify showcase rendering.
5. Identify media rendering.
6. Identify Motion/Lenis architecture.
7. Identify SEO metadata generation.
8. Identify loading/error/not-found states.
9. Identify responsive behavior.
10. Identify existing Lighthouse/performance work.

Do not replace components just because data now comes from an API.

The UI should continue receiving normalized data in a shape close to
the existing data model.

---

# 5. DATABASE DOMAIN MODEL

MongoDB must be organized around real domains.

Do NOT create one giant Portfolio document.

Use separate collections.

Recommended:

profiles
about
navigation
social_links
experiences
education
skills
projects
labs
users
lab_events

Potential future:

site_settings
media_assets
project_metrics
lab_versions

Do not create future collections unless they are actually required.

---

# 6. PROFILE MODEL

Profile document:

{
  name,
  role,
  bio,
  resumeUrl,
  email,
  seo,
  status,
  createdAt,
  updatedAt
}

Example:

{
  name: "Vishal Kumar Choudhary",
  role: "Frontend Developer",
  resumeUrl: "/resume.pdf"
}

Keep contact/email configuration separate if security requires it.

Never expose private backend secrets through public profile APIs.

---

# 7. ABOUT MODEL

Preserve the current structure.

Example:

{
  heading,
  paragraphs: [],
  capabilities: [
    {
      index,
      title,
      items: []
    }
  ],
  status,
  updatedAt
}

Do not convert paragraphs into one large string.

---

# 8. EXPERIENCE MODEL

Preserve the existing experience structure.

Example:

{
  slug/id,
  number,
  company,
  role,
  date,
  logo,
  overview,
  build: [],
  impact: [],
  metadata: {
    stack,
    focus
  },
  order,
  published,
  createdAt,
  updatedAt
}

IMPORTANT:

logo is optional.

Support:

logo: URL/string

or

logo: null

Do not store large binary image data directly inside MongoDB.

Store media references/URLs.

---

# 9. EDUCATION MODEL

Example:

{
  id,
  year,
  degree,
  institution,
  logo,
  order,
  published,
  createdAt,
  updatedAt
}

Keep it intentionally simple.

---

# 10. SKILLS MODEL

Preserve:

category
number
title
context
primary
supporting

Example:

{
  id,
  number,
  title,
  context,

  primary: [
    {
      name,
      icon,
      note
    }
  ],

  supporting: [],

  order,
  published
}

Do not hardcode the skill list in components.

---

# 11. PROJECT MODEL

This is the most important model.

DO NOT simplify the existing project object.

Preserve the existing concepts.

Recommended structure:

{
  _id,
  id,
  slug,

  number,
  name,

  category,
  categoryLabel,

  description,

  role,
  year,

  technologies: [],

  contribution,

  features: [],

  media: {
    type,
    src,
    alt,
    poster
  },

  links: {
    live,
    github
  },

  presentation: {
    mode,
    variant,
    emphasis,
    density
  },

  motion: {
    entrance,
    media,
    hover,
    scroll
  },

  status,
  order,
  featured,

  content: {
    context,
    approach,
    design,
    engineering,
    motion,
    responsive,
    showcase,
    reflection
  },

  story: {
    context: {
      statement,
      body: []
    },

    approach: [
      {
        title,
        body
      }
    ],

    design: {
      statement,
      body
    },

    engineering: [
      {
        title,
        body
      }
    ],

    motion: {
      statement,
      body
    },

    responsive: {
      desktop,
      tablet,
      mobile
    },

    showcase: [
      {
        type: "image | video",
        src,
        alt,
        caption,
        layout,
        poster
      }
    ],

    reflection: {
      statement,
      worked: [],
      improve
    }
  },

  seo: {
    title,
    description,
    image
  },

  publishedAt,
  createdAt,
  updatedAt
}

---

# 12. MEDIA ARCHITECTURE

IMPORTANT:

Images and videos are OPTIONAL.

The database must NOT assume every project has media.

Valid examples:

media: null

media: {
  type: "image",
  src: "...",
  alt: "..."
}

media: {
  type: "video",
  src: "...",
  poster: "...",
  alt: "..."
}

Showcase may also be empty:

showcase: []

or:

showcase: [
  {
    type: "image",
    src,
    alt,
    caption
  }
]

or:

showcase: [
  {
    type: "video",
    src,
    poster,
    alt,
    caption
  }
]

---

# 13. MEDIA STORAGE RULE

DO NOT store:

- raw image binary
- raw video binary
- huge base64 strings

inside MongoDB.

MongoDB stores metadata/reference.

Example:

{
  provider: "cloudinary",
  url: "...",
  publicId: "...",
  type: "image",
  width,
  height,
  size,
  alt
}

The exact media provider should remain configurable.

Do not hard-code the application to one provider unless already decided.

---

# 14. PROJECT API

Public endpoints:

GET /api/v1/projects

GET /api/v1/projects/featured

GET /api/v1/projects/:slug

GET /api/v1/projects/:slug/showcase

Admin endpoints can later be:

POST /api/v1/admin/projects

PATCH /api/v1/admin/projects/:id

DELETE /api/v1/admin/projects/:id

Do NOT expose admin routes publicly without authentication/authorization.

---

# 15. PORTFOLIO API

Public endpoints:

GET /api/v1/profile

GET /api/v1/about

GET /api/v1/navigation

GET /api/v1/social-links

GET /api/v1/experience

GET /api/v1/education

GET /api/v1/skills

GET /api/v1/projects

Optionally provide:

GET /api/v1/portfolio

but only if the payload remains reasonably small.

Prefer section-level APIs when they improve caching/performance.

---

# 16. DO NOT FETCH EVERYTHING UNNECESSARILY

Homepage should not request:

- complete project stories
- all project showcase images
- all video metadata
- Labs source code
- Monaco configuration
- Lab implementation data

Homepage needs only the data required for the homepage.

Example:

GET /api/v1/projects?featured=true

returns lightweight project cards.

Project detail:

GET /api/v1/projects/class-fuse

returns the complete case study.

This is critical for performance.

---

# 17. PROJECT DATA NORMALIZATION

Create a frontend normalizer.

Example:

normalizeProject(apiProject)

The normalizer converts backend data into the exact shape expected by
existing components.

This prevents backend schema decisions from leaking throughout the UI.

Example:

API
 ↓
normalizeProject()
 ↓
Existing ProjectHero
Existing ProjectStory
Existing ProjectShowcase
Existing ProjectMetrics

Do NOT make every component understand database-specific fields.

---

# 18. REACT QUERY ARCHITECTURE

Use TanStack React Query.

Recommended:

lib/
└── query/
    ├── queryClient.js
    ├── queryKeys.js
    ├── portfolioQueries.js
    ├── projectQueries.js
    └── labQueries.js

API layer:

lib/api/
├── client.js
├── portfolioApi.js
├── projectApi.js
└── labApi.js

Hooks:

hooks/
├── usePortfolio.js
├── useProjects.js
├── useProject.js
├── useLabs.js
└── useLab.js

Flow:

Component
 ↓
useProject(slug)
 ↓
React Query
 ↓
projectApi.getProject(slug)
 ↓
Express API

Do NOT:

Component
 ↓
fetch()
 ↓
MongoDB

---

# 19. REACT QUERY KEY DESIGN

Use stable keys.

Examples:

["profile"]

["about"]

["experience"]

["education"]

["skills"]

["projects"]

["projects", "featured"]

["project", slug]

["project", slug, "showcase"]

["labs"]

["lab", slug]

["lab", slug, "source"]

Avoid inconsistent query keys.

Create centralized query-key definitions.

---

# 20. CACHING STRATEGY

Portfolio content changes rarely.

Therefore configure appropriate stale times.

For example:

Profile:
long stale time

Skills:
long stale time

Experience:
long stale time

Projects:
moderate/long stale time

Project detail:
moderate/long stale time

Labs:
shorter stale time if content changes frequently

Do NOT refetch portfolio content on every render.

Avoid unnecessary polling.

---

# 21. NEXT.JS SERVER/CLIENT BOUNDARY

Use Server Components wherever possible.

Public portfolio content should preferably be fetched on the server when
the page benefits from:

- SEO
- fast initial HTML
- reduced client JavaScript

Use client components only where required for:

- interaction
- Motion
- forms
- React Query-dependent client state
- dynamic user interaction

Do not turn the entire application into:

"use client"

This is forbidden unless genuinely necessary.

---

# 22. REACT QUERY + NEXT.JS

Do not blindly use React Query for every server-rendered piece.

Use the appropriate strategy.

Recommended:

SEO-critical public content:
Server-side fetch / server rendering

Interactive client-side data:
React Query

Authenticated dynamic data:
React Query

Lab analytics:
React Query

Lab source access:
React Query + authenticated request

The architecture should use React Query where it provides actual value.

---

# 23. LABS IS A SEPARATE DOMAIN

IMPORTANT:

Do NOT add:

portfolio.labs

Do NOT add Labs into:

projects[]

Labs is a separate domain.

Conceptually:

PORTFOLIO
├── profile
├── about
├── experience
├── education
├── skills
└── projects

LABS
├── experiments
├── demos
├── source
├── users
└── analytics

---

# 24. LAB MODEL

Example:

{
  _id,
  slug,

  title,
  description,

  category,

  tags: [],

  technologies: [],

  status,

  featured,

  order,

  thumbnail,

  preview,

  demoConfig,

  sourceAccess,

  sourceCode,

  media,

  seo,

  createdAt,
  updatedAt
}

Do NOT put implementation code directly into the public Labs listing response.

---

# 25. LAB LISTING PERFORMANCE

The /labs page must NOT load:

- Monaco
- all source code
- all demo implementations
- all videos
- all GIFs
- every heavy dependency

The listing should load:

- title
- description
- category
- tags
- stack
- thumbnail
- lightweight preview metadata

Only load the actual lab implementation on:

/labs/[slug]

---

# 26. MONACO PERFORMANCE ISOLATION

Monaco must NEVER be imported globally.

Do NOT import Monaco in:

layout.jsx

providers.jsx

portfolio components

homepage components

project components

Instead:

dynamic import

ssr: false

and load Monaco only when the user enters a lab/source viewer.

Example concept:

dynamic(
  () => import("@monaco-editor/react"),
  {
    ssr: false,
    loading: () => <CodeEditorSkeleton />
  }
)

The final implementation must verify that Monaco is absent from
portfolio route initial bundles.

---

# 27. LAB SOURCE SECURITY

Never send source code to anonymous users and hide it with CSS.

Wrong:

GET /labs/:slug
→ source code included
→ UI hides source until login

Correct:

GET /labs/:slug
→ public metadata only

Authenticated request:

GET /api/v1/labs/:slug/source

Server:

authenticate
 ↓
authorize
 ↓
return source

The browser should receive source code only after authorization.

---

# 28. LAB AUTHENTICATION

Authentication is required only for protected Labs functionality.

Recommended initial UX:

Anonymous:
- browse Labs
- view demo
- interact with demo
- view metadata

Authenticated:
- view source
- copy source
- optionally save/favorite later

Do NOT require authentication merely to browse the Labs page unless product
requirements explicitly change.

---

# 29. LAB ANALYTICS

Create:

lab_events

Example:

{
  labId,
  userId: nullable,
  eventType,
  sessionId,
  metadata,
  createdAt
}

Supported event types initially:

VIEW

INTERACTION

CODE_VIEW

CODE_COPY

Do NOT track everything.

Do not create noisy analytics.

Keep analytics privacy-conscious.

---

# 30. LAB MEDIA

Labs may contain:

- image
- video
- GIF
- poster image

But media must be lazy-loaded.

Do not load all Lab media on the listing page.

For video:

- poster first
- preload="none"
- load when required
- avoid autoplay unless intentional
- prefer optimized video formats over large GIFs

For images:

- Next/Image
- responsive sizes
- correct dimensions
- lazy loading where appropriate

---

# 31. PORTFOLIO PERFORMANCE BOUNDARY

This is a HARD requirement.

Visiting:

/

must NOT load:

- Monaco
- Lab source
- Lab runtime
- Lab video
- Lab-specific heavy dependencies

Visiting:

/projects/class-fuse

must NOT load:

- Monaco
- Lab source
- unrelated Lab dependencies

Visiting:

/labs

must NOT load:

- every Lab runtime
- Monaco
- every source file

Only:

/labs/[slug]

may load the selected Lab runtime.

---

# 32. MEDIA PERFORMANCE

For portfolio/project media:

Use:

next/image

where appropriate.

Every image must have:

- width/height or intrinsic dimensions
- meaningful alt
- responsive sizing

Do not blindly use:

loading="eager"

for every image.

Only critical above-the-fold media should be prioritized.

Project showcase media below the fold should be lazy-loaded.

---

# 33. VIDEO PERFORMANCE

Videos are optional.

If video exists:

{
  type: "video",
  src,
  poster,
  alt
}

Rules:

- poster must be supported
- preload="none" by default
- lazy load when appropriate
- avoid huge source files
- do not load hidden videos
- do not load every showcase video immediately

---

# 34. SEO

Dynamic portfolio pages must retain SEO quality.

For:

/projects/[slug]

generate metadata dynamically from project data.

Example:

title:
project.name

description:
project.description

OpenGraph:
project media if available

If no media exists:

use safe fallback OG image.

Labs should also have dynamic metadata.

---

# 35. NOT FOUND HANDLING

For:

/projects/[slug]

If project doesn't exist:

render proper Next.js not-found experience.

Do NOT return:

undefined

empty page

broken UI

For:

/labs/[slug]

same requirement.

---

# 36. ERROR HANDLING

Backend:

Central error middleware.

Never leak:

- stack traces
- database credentials
- internal paths
- sensitive information

Frontend:

Use proper:

loading
error
empty
not-found

states.

Do not show raw API errors to users.

---

# 37. API RESPONSE FORMAT

Use consistent response envelopes.

Success:

{
  success: true,
  data: ...
}

Error:

{
  success: false,
  error: {
    code,
    message
  }
}

Do not create a different response structure for every endpoint.

---

# 38. VALIDATION

Every backend write endpoint must validate input.

Use a validation layer.

Validate:

- required strings
- slug format
- URLs
- media type
- project status
- ordering
- arrays
- nested story structure

Reject malformed payloads before MongoDB.

---

# 39. SLUG RULES

Project and Lab slugs must:

- be unique
- be URL safe
- be lowercase
- use hyphens
- not contain arbitrary user-generated unsafe paths

MongoDB indexes must enforce uniqueness.

---

# 40. DATABASE INDEXES

At minimum:

projects.slug unique

projects.status

projects.featured

projects.order

projects.year

labs.slug unique

labs.status

labs.featured

labs.order

lab_events.labId

lab_events.createdAt

Potential compound indexes should only be introduced when supported by
actual query patterns.

Do not blindly index every field.

---

# 41. DATABASE CONNECTION

MongoDB connection must be centralized.

Example:

backend/src/config/database.js

Requirements:

- connection reuse
- environment variables
- graceful startup failure
- graceful shutdown
- no connection creation per request

Never hardcode:

Mongo URI

credentials

JWT secret

API keys

media provider credentials

---

# 42. ENVIRONMENT VARIABLES

Use:

frontend:

NEXT_PUBLIC_API_URL

backend:

PORT
MONGODB_URI
CORS_ORIGIN
JWT_SECRET
MEDIA_PROVIDER_*
NODE_ENV

Do not expose backend secrets through NEXT_PUBLIC_*.

---

# 43. CORS

Express must explicitly configure allowed origins.

Do not use:

origin: "*"

for authenticated production APIs.

Allow configured frontend origin(s).

---

# 44. SECURITY

Implement baseline protections:

- CORS
- input validation
- rate limiting where appropriate
- authentication middleware
- authorization middleware
- safe error responses
- HTTP security headers
- request size limits
- URL validation
- media validation
- Mongo query sanitization
- no secrets in frontend bundle

---

# 45. ADMIN ARCHITECTURE

Do not build a huge CMS initially.

Prepare the backend so an admin layer can be added later.

Future:

/admin

Possible capabilities:

- edit profile
- edit about
- edit experience
- edit education
- edit skills
- create/edit projects
- upload media
- publish/unpublish projects
- create/edit Labs
- manage Lab source

But first migration should focus on:

database
API
frontend integration
performance

Do not overbuild the admin panel in Phase 1.

---

# 46. STATIC DATA MIGRATION

The current static data is the initial source of truth.

Create migration/import scripts.

Example:

scripts/
└── seed.js

Seed:

- profile
- about
- navigation
- social links
- experience
- education
- skills
- projects

Do NOT manually retype all existing content.

Convert the existing data structures into seed data.

IMPORTANT:

The migration must preserve all existing project story content.

No text should disappear.

No project showcase item should disappear.

No technology entry should disappear.

No project link should disappear.

No responsive story should disappear.

---

# 47. MIGRATION STRATEGY

Do NOT perform a risky big-bang rewrite.

Use:

PHASE 1
Existing static frontend remains functional.

PHASE 2
Backend + MongoDB created.

PHASE 3
Static content seeded.

PHASE 4
One portfolio section migrated.

PHASE 5
Remaining sections migrated.

PHASE 6
Projects migrated.

PHASE 7
Project detail migrated.

PHASE 8
Labs introduced.

PHASE 9
Authentication.

PHASE 10
Analytics.

At every phase the application must remain runnable.

---

# 48. DUAL-SOURCE FALLBACK

During migration, optionally support:

API → database

fallback → static data

But this must be temporary.

Do NOT leave permanent confusing dual-source logic.

Use a feature flag if necessary.

Example:

USE_REMOTE_CONTENT=true

Once migration is validated:

remove fallback.

---

# 49. PROJECT DETAIL ARCHITECTURE

Current route:

/projects/[slug]

should become:

route
 ↓
fetch project by slug
 ↓
normalize project
 ↓
ProjectHero
 ↓
ProjectContext
 ↓
ProjectApproach
 ↓
ProjectDesign
 ↓
ProjectEngineering
 ↓
ProjectMotion
 ↓
ProjectResponsive
 ↓
ProjectShowcase
 ↓
ProjectReflection

Sections should render conditionally based on:

project.content

Example:

content.showcase === true

then:

<ProjectShowcase />

If content.showcase is false:

do not render it.

---

# 50. OPTIONAL CONTENT

Every project section must be optional.

For example:

story.design = null

must not break rendering.

story.showcase = []

must not create an empty section.

story.reflection = null

must not break the page.

The renderer must be defensive.

---

# 51. PROJECT MEDIA FALLBACK

If:

media === null

the project hero must still work.

Possible fallback:

- gradient
- visual background
- project typography
- neutral placeholder

Do not show broken image icons.

---

# 52. NAVIGATION

Navigation should remain controlled.

Do not automatically generate navigation from every MongoDB collection.

The primary navigation can be stored dynamically, but must be validated.

Expected future navigation:

About
Experience
Projects
Labs
Contact

Labs is a first-class route.

It is NOT a project.

---

# 53. PERFORMANCE BUDGET

Establish measurable budgets.

Public portfolio:

- strong Lighthouse performance
- no unnecessary client JavaScript
- no Monaco
- no Lab runtime
- no Lab media
- no unnecessary API requests
- no layout shift from images
- optimized LCP media
- minimal hydration

Labs listing:

- no Monaco
- no full source payload
- lightweight thumbnails
- lazy media

Lab detail:

- heavy dependencies allowed only when needed
- dynamic imports
- Monaco isolated
- media lazy loaded

---

# 54. CODE SPLITTING

Heavy dependencies must be isolated.

Potential heavy modules:

- Monaco
- chart libraries
- video players
- complex experiment runtimes
- physics libraries
- editors

Do not import these from:

layout
providers
global components

Use dynamic imports at the feature boundary.

---

# 55. BUNDLE ANALYSIS

Add a bundle-analysis workflow.

Before/after migration compare:

- homepage JS
- project-detail JS
- labs listing JS
- lab detail JS

The migration must NOT accidentally increase the homepage bundle
because of Labs.

---

# 56. API PERFORMANCE

Avoid:

N+1 queries.

Project listing must not fetch full story data for every project.

Example listing response:

{
  slug,
  name,
  description,
  category,
  categoryLabel,
  technologies,
  media,
  featured,
  order
}

Detail response contains the full story.

---

# 57. CACHE STRATEGY

Public content can be cached.

Use appropriate:

HTTP cache headers

and/or

Next.js caching/revalidation

and/or

React Query caching.

Do not cache authenticated source code publicly.

Lab source must never be accidentally served through a public cache.

---

# 58. SOURCE CODE STORAGE FOR LABS

Source can initially be stored as:

sourceCode: {
  language,
  files: [
    {
      path,
      content
    }
  ]
}

However:

DO NOT include sourceCode in public Lab API responses.

Later this can evolve to:

GitHub repository integration

or

versioned source snapshots.

Design the service layer so storage can change later.

---

# 59. LAB VERSIONING — FUTURE READY

Do not implement full versioning unless required.

But structure services so:

Lab
 ↓
LabVersion

can be introduced later.

This allows:

v1
v2
v3

without rewriting the Labs architecture.

---

# 60. ANALYTICS ARCHITECTURE

Analytics must remain separate from content.

Do not add:

views: 1234

directly into the Lab document for every event.

Instead:

lab_events

Example:

{
  labId,
  userId,
  eventType,
  sessionId,
  metadata,
  createdAt
}

Aggregated analytics can later be calculated.

---

# 61. USER MODEL

Do not overbuild authentication.

Initial user:

{
  email,
  passwordHash,
  role,
  createdAt,
  updatedAt
}

Roles:

user
admin

Never store plain passwords.

Use secure password hashing.

---

# 62. AUTHORIZATION

Middleware:

authenticateUser

authorizeRole

Example:

GET /labs/:slug/source
→ authenticated user

POST /admin/projects
→ admin

PATCH /admin/projects/:id
→ admin

DELETE /admin/projects/:id
→ admin

---

# 63. FRONTEND AUTH STATE

Do not store sensitive authentication data in localStorage if avoidable.

Prefer secure HTTP-only cookies for session/authentication.

React Query should handle authenticated API state.

---

# 64. IMAGE / VIDEO UPLOAD FLOW

Do not:

browser
→ Express
→ MongoDB binary

Instead preferably:

browser
→ media provider signed upload
→ media URL
→ Express
→ MongoDB metadata

For protected admin uploads, use signed server-generated upload credentials.

---

# 65. CONTENT EDITING PRINCIPLE

Database-backed does NOT mean every field must become an arbitrary rich-text
editor.

Keep structured fields structured.

Examples:

paragraphs → array

features → array

technologies → array

story sections → structured objects

This keeps rendering predictable.

---

# 66. DO NOT STORE PRESENTATION LOGIC IN DATABASE

Database can contain:

presentation.variant = "interface"

But React component logic remains in code.

Do NOT store React component names such as:

"ProjectHeroV3"

inside MongoDB.

Do NOT store executable JavaScript.

Database describes content/configuration.

Frontend owns rendering.

---

# 67. DO NOT STORE COMPONENT CODE IN PORTFOLIO

Portfolio content:

text
media references
metadata
links
structured story

Component implementation:

Git repository

Source code

React components

These remain code.

---

# 68. LABS VS PROJECTS

Projects:

Professional proof.

Labs:

Experimental work.

Projects have:

case studies
contribution
engineering story
showcase
reflection

Labs have:

interactive demo
experiment metadata
source code
configuration
analytics

Never mix these domains.

---

# 69. OBSERVABILITY

Backend should have structured logging.

At minimum:

request
method
route
status
duration

Do not log:

passwords
tokens
source code
private user data

---

# 70. TESTING

Backend:

- API tests
- validation tests
- service tests
- repository tests where valuable

Frontend:

- normalization tests
- API integration tests
- critical rendering tests

E2E:

- homepage
- project detail
- Labs listing
- Lab detail
- authenticated source access

---

# 71. ACCEPTANCE TEST — PORTFOLIO

The homepage must:

- render existing content
- preserve current design
- preserve current Motion
- preserve current responsive behavior
- load project cards
- not load project story unnecessarily
- not load Labs runtime
- not load Monaco
- not load Lab source

---

# 72. ACCEPTANCE TEST — PROJECT

/projects/class-fuse

must:

- load by slug
- return correct project
- preserve existing content
- preserve story sections
- preserve showcase
- preserve image/video support
- generate SEO metadata
- handle missing media
- handle missing optional sections
- remain responsive

Existing project content must remain intact.

---

# 73. ACCEPTANCE TEST — LABS

/labs

must:

- list experiments
- load lightweight metadata
- not load Monaco
- not load all source
- not load every demo runtime
- not load every video

/labs/[slug]

must:

- load only selected experiment
- lazy-load heavy runtime
- dynamically load Monaco only when required
- support image/video
- handle missing media
- support analytics

---

# 74. ACCEPTANCE TEST — SOURCE ACCESS

Anonymous:

GET /labs/example/source

→ 401/403

Authenticated:

GET /labs/example/source

→ source

Admin:

can manage Labs.

Source must never be present in anonymous Lab payload.

---

# 75. ACCEPTANCE TEST — PERFORMANCE

Verify with browser/network/bundle tools.

Homepage:

Monaco:
NOT PRESENT

Lab source:
NOT PRESENT

Lab runtime:
NOT PRESENT

Lab video:
NOT PRESENT

Project detail:

Monaco:
NOT PRESENT

Labs listing:

Monaco:
NOT PRESENT

All Lab source:
NOT PRESENT

Only selected Lab detail may load heavy dependencies.

---

# 76. ACCEPTANCE TEST — DATABASE

Verify:

- unique project slugs
- unique lab slugs
- proper indexes
- timestamps
- validation
- no duplicated records
- no orphaned media references
- no duplicated projects after seed

---

# 77. ACCEPTANCE TEST — DATA MIGRATION

Compare static source and MongoDB.

For every project verify:

name
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
showcase
reflection

No content may disappear.

---

# 78. IMPLEMENTATION PHASES

## PHASE 0 — ARCHITECTURE AUDIT

Inspect the existing project.

Deliver:

- current folder structure
- current data flow
- current component dependencies
- project detail architecture
- media architecture
- Motion/Lenis architecture
- performance risks
- proposed migration map

DONE WHEN:

No implementation begins before the current architecture is understood.

---

## PHASE 1 — BACKEND FOUNDATION

Create:

Express app
Mongo connection
config
middleware
error handling
logging
API versioning

DONE WHEN:

Health endpoint works:

GET /api/v1/health

and MongoDB connection is verified.

---

## PHASE 2 — DATABASE MODELS

Create models for:

Profile
About
Navigation
Social
Experience
Education
Skills
Project
Lab
User
LabEvent

DONE WHEN:

Schemas validate correctly and indexes exist.

---

## PHASE 3 — SEED MIGRATION

Convert current static files into seed data.

DONE WHEN:

MongoDB contains the same content as the current static portfolio.

No content is lost.

---

## PHASE 4 — PUBLIC API

Implement:

profile
about
navigation
social
experience
education
skills
projects

DONE WHEN:

All endpoints return validated normalized responses.

---

## PHASE 5 — FRONTEND API LAYER

Create:

api client
React Query client
query keys
portfolio hooks
project hooks
normalizers

DONE WHEN:

Components do not contain raw fetch logic.

---

## PHASE 6 — MIGRATE PORTFOLIO

Replace static imports with API-backed data.

Do this section by section.

DONE WHEN:

UI remains visually/functionally equivalent.

---

## PHASE 7 — PROJECT DETAIL

Migrate:

/projects/[slug]

to dynamic API-backed rendering.

DONE WHEN:

All existing projects render correctly.

---

## PHASE 8 — MEDIA SYSTEM

Implement optional image/video media.

DONE WHEN:

Projects work correctly with:

image
video
no media

and media is optimized/lazy-loaded.

---

## PHASE 9 — PERFORMANCE HARDENING

Implement:

code splitting
dynamic imports
media optimization
API caching
React Query caching
bundle analysis
request reduction

DONE WHEN:

Portfolio pages do not load Labs/Monaco dependencies.

---

## PHASE 10 — LABS FOUNDATION

Create:

/labs
/labs/[slug]

Create Lab API.

DONE WHEN:

Labs is independent from Projects.

---

## PHASE 11 — LAB PERFORMANCE ISOLATION

Implement:

dynamic Lab runtime
dynamic Monaco
lazy media
source endpoint separation

DONE WHEN:

Portfolio bundle does not include Labs heavy dependencies.

---

## PHASE 12 — AUTHENTICATION

Implement:

user authentication
HTTP-only session/cookie
authentication middleware
authorization

DONE WHEN:

source access is protected.

---

## PHASE 13 — LAB SOURCE

Implement:

source endpoint
source file model
Monaco viewer

DONE WHEN:

Only authenticated users receive source.

---

## PHASE 14 — LAB ANALYTICS

Implement:

VIEW
INTERACTION
CODE_VIEW
CODE_COPY

DONE WHEN:

Events are stored independently from Lab content.

---

## PHASE 15 — ADMIN FOUNDATION

Prepare admin APIs.

Do NOT overbuild UI.

DONE WHEN:

Admin-only CRUD APIs are protected and validated.

---

## PHASE 16 — FINAL PERFORMANCE / SECURITY AUDIT

Audit:

Lighthouse
bundle size
network waterfall
Mongo queries
API latency
cache behavior
CORS
authentication
authorization
media
SEO
404
error states

DONE WHEN:

No critical performance/security regression exists.

---

# 79. DEFINITION OF DONE

The implementation is NOT complete merely because:

"MongoDB works."

It is complete only when all of these are true:

### Architecture

[ ] Next.js frontend separated from Express backend

[ ] MongoDB accessed only through backend

[ ] Services/repositories separated

[ ] API versioning exists

[ ] validation exists

### Portfolio

[ ] profile dynamic

[ ] about dynamic

[ ] experience dynamic

[ ] education dynamic

[ ] skills dynamic

[ ] projects dynamic

[ ] project details dynamic

### Project content

[ ] existing project story preserved

[ ] optional sections supported

[ ] image supported

[ ] video supported

[ ] no-media state supported

[ ] showcase preserved

### React Query

[ ] query client configured

[ ] stable query keys

[ ] API functions separated

[ ] hooks separated

[ ] caching configured

[ ] unnecessary refetching prevented

### Performance

[ ] Monaco absent from portfolio

[ ] Labs runtime absent from portfolio

[ ] Lab source absent from portfolio

[ ] videos lazy loaded

[ ] images optimized

[ ] project listing lightweight

[ ] project detail loads full content only when needed

[ ] homepage does not fetch every project story

### Labs

[ ] separate domain

[ ] separate route

[ ] separate model

[ ] separate API

[ ] lightweight listing

[ ] heavy detail loading isolated

[ ] source protected

[ ] Monaco dynamically imported

[ ] analytics separated

### Security

[ ] authentication

[ ] authorization

[ ] secure cookies

[ ] validation

[ ] CORS

[ ] rate limiting where appropriate

[ ] secrets protected

[ ] source code protected

### SEO

[ ] project metadata dynamic

[ ] Lab metadata dynamic

[ ] OpenGraph support

[ ] proper not-found handling

### Migration

[ ] no content loss

[ ] no duplicated content

[ ] no broken existing project pages

[ ] static source can be removed after validation

---

# 80. FINAL ENGINEERING RULE

The most important architectural principle is:

CONTENT IS DATA.

RENDERING IS CODE.

PORTFOLIO IS A CONTENT DOMAIN.

LABS IS AN INTERACTIVE APPLICATION DOMAIN.

MONGODB STORES CONTENT AND CONFIGURATION.

EXPRESS OWNS BUSINESS/API LOGIC.

NEXT.JS OWNS PRESENTATION AND SEO.

REACT QUERY OWNS CLIENT SERVER-STATE.

AUTHENTICATION OWNS ACCESS.

MEDIA STORAGE OWNS LARGE FILES.

ANALYTICS OWNS EVENTS.

Do not collapse all of these responsibilities into one layer.

The final system must remain easy to extend when the portfolio grows from:

4 projects → 10 projects → 30 projects

and Labs grows from:

5 experiments → 50 experiments

without making the homepage progressively heavier.

Before completing each phase, report:

1. What was changed
2. Why it was changed
3. Files created
4. Files modified
5. Data migrated
6. API endpoints added
7. Performance impact
8. Security implications
9. Tests performed
10. Exact Definition of Done status

Never silently skip a requirement.