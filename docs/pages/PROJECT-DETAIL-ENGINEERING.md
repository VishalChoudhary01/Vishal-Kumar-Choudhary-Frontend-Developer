# Project Detail Pages — Template Reconstruction and Content Contract

**Route pattern:** /projects/[slug]  
**Status:** IMPLEMENTED — code-owned data and fixed template  
**Server entry:** src/app/projects/[slug]/page.js  
**Client shell:** src/app/projects/[slug]/ProjectPageView.js  
**Template:** src/app/components/project-detail/ProjectDetail.js  
**Data source:** src/app/data/portfolio.js → projects assembled in src/app/data/projectsSeo.js and src/app/data/projectsData.js

## 1. Purpose and rendering model

Each canonical project uses one reusable detail-page template. Stable slugs identify records. The public URL is /projects/{slug}. Project details are not currently read from a general CMS or arbitrary page builder.

The route:
- uses generateStaticParams from portfolio.projects;
- sets dynamicParams=false so unknown slugs do not render an empty dynamic shell;
- generates canonical URL, Open Graph and Twitter metadata from each project;
- returns notFound() for an unknown slug;
- creates server-rendered CreativeWork JSON-LD via JsonLd/buildProjectJsonLd;
- computes previous/next navigation from the canonical order in portfolio.projects.

The page's SEO/media metadata is derived from project.seo and project.media. The visible client UI is mounted by ProjectPageView.

## 2. Route and component tree

    projects/[slug]/page.js (Server Component)
    ├── generateStaticParams()
    ├── generateMetadata()
    ├── JSON-LD
    └── ProjectPageView (Client Component)
        ├── PortfolioAnalyticsDeferred
        ├── PortfolioIntro (only while isLoading)
        └── visibility-gated page content (until heroReady)
            ├── Navbar(context="project")
            └── ProjectDetail
                ├── ProjectHero
                ├── ProjectSnapshot
                ├── ProjectContext? (content.context)
                ├── ProjectApproach? (content.approach)
                ├── ProjectDesign? (content.design)
                ├── ProjectEngineering? (content.engineering)
                ├── ProjectMotion? (content.motion)
                ├── ProjectResponsive? (content.responsive)
                ├── ProjectShowcase? (content.showcase; lazy)
                ├── ProjectReflection? (content.reflection; lazy)
                └── ProjectNavigation (lazy)

ProjectDetail uses a main wrapper with the existing background token. Static/essential sections are imported normally; Showcase, Reflection and ProjectNavigation use React.lazy with a skeleton fallback. Do not eagerly load heavy gallery/lightbox or navigation code before it is needed.

## 3. Exact section order and purpose

| Order | Section id | Component | Visibility condition | Current responsibility |
|---:|---|---|---|---|
| 1 | (hero; aria-labelledby project-hero-title) | hero/ProjectHero → ProjectDetailHero | Always | Project identity, product visual, summary/meta, action links and scroll cue |
| 2 | project-snapshot | snapshot/ProjectSnapshot | Always; component returns null when no technologies | Stack/technology presentation; desktop rail and mobile kinetic list |
| 3 | project-context | body/context/ProjectContext | content.context and story.context content | Problem/background statement, context paragraphs and contribution |
| 4 | project-approach | body/approach/ProjectApproach | content.approach and non-empty story.approach array | Ordered problem-solving / approach entries |
| 5 | project-design | body/design/ProjectDesign | content.design and story.design | Design rationale, statement and body paragraphs |
| 6 | project-engineering | body/engineering/ProjectEngineering | content.engineering and non-empty story.engineering array | Engineering decisions/list |
| 7 | project-motion | body/motion/ProjectMotion | content.motion and story.motion | Motion philosophy and animation implementation details |
| 8 | project-responsive | body/responsive/ProjectResponsive | content.responsive and story.responsive | Responsive strategy and breakpoint adaptations |
| 9 | project-showcase | showcase/ProjectShowcase (lazy) | content.showcase and non-empty story.showcase array | Gallery of project media with interactive lightbox |
| 10 | project-reflection | body/reflection/ProjectReflection (lazy) | content.reflection and usable story.reflection | What worked and what could improve |
| 11 | project-navigation | navigation/ProjectNavigation (lazy) | At least one previous or next project | Continue to adjacent project |

The content flags are not arbitrary page layout definitions. They turn approved known template sections on or off. A missing story field should cause the relevant section component to render null, not fabricate content.

## 4. Project data contract (current code-owned model)

The main project record is built from projectsData and enriched by projectsSeo. Field groups currently used by the template include:

| Field | Current purpose |
|---|---|
| id | Stable internal record key |
| number | Editorial sequence label |
| name | Project display title |
| slug | Canonical route identity |
| category / categoryLabel | Portfolio category and display text |
| description | Summary used by cards and metadata fallback |
| role / year | Project meta |
| technologies[] | Stack and snapshot data |
| contribution | Personal contribution paragraph |
| features[] | Product feature list where consumed |
| media | Primary card/hero image/video object with type, src and alt |
| links | Live/GitHub/product destinations as available |
| presentation | Card presentation mode/variant/emphasis/density |
| motion | Named entrance/media/hover/scroll preset selectors for project cards |
| status / order / featured | Portfolio grouping and emphasis |
| content | Boolean section flags (context, approach, design, engineering, motion, responsive, showcase, reflection) |
| story | Structured section content |
| seo | title, description, keywords added by projectsSeo |
| updatedAt | Current SEO data module adds a code-maintained date; not a CMS publication timestamp |

Common story shapes observed:
- context: statement, body[].
- approach: array of ordered items.
- design: statement, body[] or text.
- engineering: array of ordered implementation items.
- motion: statement and motion-specific structured entries.
- responsive: structured responsive entries/notes.
- showcase: media item array.
- reflection: statement, worked[], improve.

Do not normalize these into a CMS schema without inspecting every record and every consumer. The source data is authoritative for exact optional shapes.

## 5. Section engineering details

### Hero

Component chain: ProjectHero → ProjectDetailHero → ProjectHeroVisual, ProjectHeroBackground, ProjectHeroContent, ProjectHeroScrollCue.

The root is a min-h-[100svh] overflow-clip section. It reads scroll progress from its own section using offsets ["start start","end start"]. The background visual alone is translated from y=0 to y=-18 as progress reaches 1 when motion is allowed. Text content remains stable; this is intentional separation between background parallax and the content layer.

The project hero has separate visual, atmosphere/background, content and cue layers. Entrance contract in projectHeroMotion.js:
- easing [0.22,1,0.36,1];
- durations: atmosphere 1.1s, title .9s, general block .7s, visual 1.1s, cue .7s;
- delays: atmosphere 0, eyebrow .05, visual .15, title .1, description .25, meta .35, actions .4, cue .7.
- heroEntrance(reduced, {delay,y,blur,ready}) returns instant opacity for reduced motion; holds at hidden state while loader ready=false; otherwise opacity/y and optional blur animate to visible.

Hero mobile layout places content toward bottom with browser-safe spacing. Tablet centers content. Desktop reserves the right half for visual and positions text left using a 44vw layout split. Preserve that responsive composition rather than using the homepage hero's scroll-driven frame takeover.

### Snapshot

ProjectSnapshot uses desktop horizontal optical rail and mobile vertical kinetic list under 768px. It detects the breakpoint with useSyncExternalStore(matchMedia), using a deterministic server snapshot for hydration. It uses useInView once, amount .2 and margin "0px 0px -8% 0px". Desktop rail and mobile list must be documented/tested independently. If technologies is empty the section is omitted.

### Context

ProjectContext reads story.context; it renders only when section data is present. Its content includes a statement and body; project.contribution is an optional distinct subsection. Text entries use projectItemReveal preset and respect useReducedMotion.

### Approach

ProjectApproach uses story.approach, and is omitted for missing or empty arrays. Ordered items are rendered by ProjectApproachList/Item, with reduced-motion behavior passed from the section.

### Design

ProjectDesign uses story.design.statement and story.design.body. Body may be a single value or an array; ProjectDesignBody normalizes to an array and reveals each paragraph using projectItemReveal keyed by index/content.

### Engineering

ProjectEngineering renders only for a non-empty story.engineering array. It delegates list behavior to ProjectEngineeringList/Item. The section label is ENGINEERING and supporting sentence is “How the interface was structured and implemented.”

### Motion

ProjectMotion renders only if story.motion exists. Statement falls back to a descriptive sentence if not provided. The section delegates to ProjectMotionList. Keep motion narrative separate from project-card motion presets; the latter control discovery cards only.

### Responsive

ProjectResponsive renders only if story.responsive exists. It delegates to ProjectResponsiveList/Item and respects reduced motion. The section explains adaptive behavior, not a generic list of screen sizes.

### Showcase

ProjectShowcase is lazy. It returns null if story.showcase is not a non-empty array. It reads prefers-reduced-motion using useSyncExternalStore to avoid a server/hydration mismatch. useInView once, amount .12, margin "0px 0px -8% 0px" controls an opacity0/y24 reveal. It composes ProjectShowcaseGrid, media cells and ProjectShowcaseLightbox. Gallery media must retain original ordering, alt text and media type from project data.

### Reflection

ProjectReflection is lazy and only renders if story.reflection has useful statement/worked/improve data. It renders separate worked and improve blocks. Do not display an empty reflection heading.

### Previous/next navigation

ProjectNavigation is lazy. It is omitted if both prevProject and nextProject are null. It uses useInView once amount .2 margin "0px 0px -8% 0px". Previous enters from x=-12; next x=12; both use opacity0→1 and duration .55; next has .05s delay. Reduced motion makes both instant.

## 6. Data flow and URL behavior

1. page.js reads slug from App Router params.
2. Project record is found in canonical portfolio.projects.
3. Previous/next records are derived from the same ordered array.
4. The structured project object is passed to ProjectPageView.
5. ProjectDetail reads project.content feature flags and passes the same project record to each section.
6. Each section reads only its story subtree; SEO reads project.seo/media.

This means editing a story entry changes what a fixed section displays; changing a content flag toggles a prebuilt section. A dynamic CMS should persist structured fields and continue to render this template.

## 7. Recreation constraints

- Preserve canonical slug list and generateStaticParams.
- Preserve real 404 behavior via dynamicParams=false/notFound.
- Preserve server-side metadata and JSON-LD.
- Keep intro/heroReady lifecycle shared with homepage.
- Keep hero background parallax separate from content.
- Keep section order and content flags unchanged until an approved PRD decision.
- Preserve lazy loading for Showcase, Reflection and Navigation.
- Maintain all optional-section empty guards.
- Do not allow CMS fields to inject JSX, CSS, script, arbitrary section order or layout.
- Verify gallery lightbox keyboard, focus, close and reduced-motion behavior.
- Test desktop/mobile snapshot variants and 200% zoom.
