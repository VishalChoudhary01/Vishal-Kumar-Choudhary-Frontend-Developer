# Public Homepage — Reconstruction and Motion Engineering

**Route:** /  
**Status:** IMPLEMENTED (current code-owned presentation)  
**Primary entry:** src/app/page.js → src/app/components/HomePage.js  
**Data:** src/app/data/portfolio.js and its data modules  
**Shared scroll contract:** ../architecture/SCROLL-AND-MOTION-ENGINEERING.md

This is a reverse-engineering guide. It records current component responsibilities, data sources, layout layers, interaction state and scroll-linked behavior so an engineer can rebuild the existing homepage without inventing a new design.

## 1. Route composition and page lifecycle

### Server route

src/app/page.js is the route-level server entry. It builds homepage metadata and structured data using portfolio profile/social links, then renders HomePage. Keep metadata/JSON-LD concerns in the server route; do not move database or client animation logic into it. The exact title, description, canonical, Open Graph/Twitter and WebSite/ProfilePage/Person graph are recorded in [SEO and AEO Engineering](../SEO-AND-AEO-IMPLEMENTATION.md).

### Client page shell

src/app/components/HomePage.js owns the visible section composition:

    RootLayout
    ├── AppProviders
    │   ├── ActionToastProvider
    │   ├── MobileMenuProvider
    │   ├── MotionProvider
    │   ├── SmoothScroll
    │   └── PageLoaderProvider
    ├── HomePage
    │   ├── PortfolioAnalyticsDeferred
    │   ├── PortfolioIntro (while isLoading)
    │   └── visibility-gated site content (until heroReady)
    │       ├── Navbar
    │       ├── HeroSection
    │       ├── About (lazy)
    │       ├── Education (lazy)
    │       ├── Skills (lazy)
    │       ├── Experience (lazy)
    │       ├── Projects (lazy)
    │       ├── Contact (lazy)
    │       └── PortfolioMascot (after heroReady)
    └── Footer (RootLayout)

The six lower sections are dynamically imported via the sections barrel and rendered through Suspense. The loading fallback is a lightweight section spinner. Do not replace this with eager imports of every below-fold animation/editor/media component.

HomePage keeps meaningful page content mounted but sets page-shell visibility to hidden until heroReady. The intro loader is a sibling overlay, not the parent of the entire page content. This distinction is important for reliable entrance timing.

## 2. Actual section order

| Order | Section ID | Component entry | Main data |
|---:|---|---|---|
| 1 | hero | HeroSection → CinematicHero or ReducedMotionHero | heroMotionConfig.js and image assets |
| 2 | about | aboutSection → AboutContent / AboutReduced | portfolio.about |
| 3 | education | EducationSection → dynamic pinned stack / static list | portfolio.education through education.data.js |
| 4 | skills | SkillsSection → dynamic categories / static list | portfolio.skills |
| 5 | experience | ExperienceSection | portfolio.experience |
| 6 | projects | ProjectsSection → category nav + project renderer | portfolio.projects |
| 7 | contact | ContactSection → intro + form | contact component constants/API |

Navbar and Footer are shared shell elements, not items inside the seven section components.

## 3. Shared page geometry and visual layers

- Sections use existing design tokens/classes from globals.css and the Tailwind theme configuration.
- Standard editorial content width is max-w-7xl.
- Several main sections use a desktop two-column editorial grid: left rail 180px, right content 1fr; smaller viewports collapse to one column.
- The homepage hero is its own sticky composition and intentionally does not follow the normal document section-height pattern.
- About, Skills, Experience, Projects and Contact use a left label/right content hierarchy and large vertical section spacing.
- Scroll transforms are Motion values rather than React state updated every scroll frame. Use CSS sticky positioning for the pin stage and Motion useScroll/useTransform for interpolated properties.

## 4. Section 01 — Cinematic Hero

### Components and files

- src/app/components/sections/HeroSection.js: reduced-motion branch selector.
- src/app/components/sections/hero_comp/CinematicHero.js: main animated hero composition and scroll graph.
- heroMotionConfig.js: text, durations, breakpoints, keyframes and input ranges.
- DrawnTitle.js: outlined character draw and solid-text handoff.
- MobileIntro.js: mobile-only explanatory CTA block.
- HeroImageOverlays.js: image takeover overlays and caption metadata.
- src/app/components/common/HeroAmbientBackground.js: ambient blurred background layers.
- src/app/providers/PageLoaderProvider.js: loader gate.
- ReducedMotionHero.js: non-cinematic accessible fallback.

### Layout reconstruction

1. Outer section #hero uses a breakpoint-dependent tall scroll runway.
2. An inner sticky top-0 h-svh overflow-hidden viewport holds the visible composition.
3. Ambient background sits behind hero content.
4. The image frame and title/content layers are independently transformed.
5. Overlay/scrim and image metadata sit above the picture.
6. Mobile uses its own composition and a separate MobileIntro; desktop/tablet use the main content layout.
7. Resume/Explore Projects CTA routes to the projects anchor through the shared resume/action component.

### Breakpoints and scroll runway

useBreakpoint defines: mobile under 640px, largeMobile 640–767px, tablet 768–1023px, desktop 1024px and above.

| Profile | Hero height | Hero scroll ends (normalized page progress) | Cursor parallax |
|---|---:|---:|---:|
| Desktop | 300svh | 0.60 | 5px X / 3px Y |
| Tablet | 280svh | 0.56 | 3px X / 2px Y |
| Large mobile | 200svh | 0.52 | disabled |
| Mobile | 180svh | 0.52 | disabled |

The inner sticky viewport is 100svh. Outer height is the scroll runway; changing it alters the perceived speed and handoff distance of every scroll transform.

### Motion graph

The main scroll source is Motion useScroll with target heroRef and offsets ["start start","end start"].

The source value is scrollYProgress. Two derived timelines are created:
- heroTimeline maps [0, heroEnd] to [0,1].
- exitTimeline maps [heroEnd,1] to [0,1].

Desktop input range: [0, 0.18, 0.4, 0.65, 0.82, 1].  
Tablet input range: [0, 0.18, 0.4, 0.65, 1].  
Mobile input range: [0, 0.12, 0.3, 0.5, 0.7, 1].

The derived Motion values currently control:

| Property/layer | Source/range | Result |
|---|---|---|
| Main title scale | heroTimeline → profile keyframe arrays | Desktop settles from 1 to 0.55; tablet to 0.62; mobile to 0.88 |
| Name size | heroTimeline → profile nameSize | Responsive typography interpolation |
| Image frame X/scale/Y | heroTimeline → MOTION.desktop/tablet arrays | Frame moves left, grows and shifts vertically |
| Frame radius | heroTimeline → breakpoint radius arrays | Large radius reduces toward 6px on desktop; mobile composition reaches 0px |
| Frame opacity | exitTimeline [0.55,0.9,1] → [1,.7,.5] | Image fades during exit/handoff |
| Overlay | heroTimeline [.13,.5] → [0,.12] | Slight image takeover tint |
| Caption scrim | heroTimeline [.02,.1] → [0,1] | Caption contrast appears early |
| Image metadata | heroTimeline [.06,.22] | opacity 0→1 and y 12→0 |
| Scroll cue | heroTimeline [0,.1] / [0,.2] | fades and moves down 14px |
| Ambient glow | scrollYProgress | scale .8→1.08; opacity .07→.035→0 |
| Image crop | scrollYProgress | small inner crop X/Y shifts |
| Cursor parallax | normalized pointer MotionValues | combined with image crop on desktop/tablet only |

Cursor listeners are attached only for non-mobile-like breakpoints and removed in effect cleanup. Motion values feed transforms without causing a React render for every pointer frame.

### Entrance sequence and title layers

- PageLoaderProvider server-renders isLoading=true and heroReady=false.
- First visit: PortfolioIntro completes → loader is removed → next animation frame sets heroReady=true.
- Revisit: session flag is read in a layout effect before paint; overlay is skipped, then heroReady is enabled on the next frame.
- Hero content/image entrance variants remain gated until the false-to-true readiness transition.
- DrawnTitle renders a decorative outline layer that draws letter-by-letter; the final solid gradient text fades in only after the outline completes. The outlined duplicate is aria-hidden; only one accessible H1 is exposed.
- MobileIntro uses useInView once with margin -60px 0px, with heading/description/CTA delays from MOTION.mobileIntroEntrance.

### Rebuild constraints

Do not flatten the hero into one image and a title. Keep independent layers and Motion value ownership. Do not drive scroll-linked style through setState on every scroll event. Keep the sticky parent runway and per-breakpoint input arrays in sync. If changing a keyframe array, its input range must have the same number of points.

## 5. Section 02 — About

### Files

- sections/aboutSection.js
- sections/about_comp/AboutContent.js
- AboutMaskedWords.js
- AboutCapabilities.js
- capability card subcomponents in about_comp/
- AboutReduced.js
- src/app/data/aboutData.js

The section ID is about; it uses section number 02. Desktop layout: a 180px label rail plus a content column. Supporting headline comes from portfolio.about.heading. Three body paragraphs come from portfolio.about.paragraphs[0..2]; first two occupy a two-column body grid and the third is constrained to a max-width.

Three capability records come from portfolio.about.capabilities. Current data groups:
- Frontend: React, Next.js, JavaScript.
- Interaction: Motion, scroll systems, transitions.
- Engineering: responsive UI, reusable systems, performance.

### Entrance motion

AboutMaskedWords splits each paragraph into words. Each word is placed inside a clipping span; the inner Motion span enters from y 118% to y 0%. Trigger is useInView(ref,{once:true,margin:"-40px 0px"}). Duration is 0.5s; each word adds 0.045s stagger; paragraph delays are 0.1,0.2,0.3. It releases the will-change:transform hint after the expected entrance duration to avoid permanently promoting every word into a compositor layer.

On reduced motion, AboutReduced renders static text and capability cards.

## 6. Section 03 — Education

### Files

- EducationSection.js
- education_comp/education.data.js
- education_comp/education.motion.js
- EducationStack.js, EducationCard.js, header/intro and handoff components
- EducationStatic.js

Education data is code-owned. education.data.js maps each record to a two-digit record number and derives the earliest/latest numeric year.

### Dynamic sticky 3D scroll stage

- Outer section is #education.
- Wrapper: h-[310svh].
- Inner panel: sticky top-0 h-[100svh] overflow-hidden.
- Wrapper scroll progress uses target offsets ["start start","end start"].
- PIN_RUNWAY=210, PIN_HEIGHT=100, so PIN_SCROLL_FACTOR=(100+210)/210.
- Derived progress is clamped: min(1, scrollYProgress * PIN_SCROLL_FACTOR).
- Focal timeline is held from 0 to 0.1, moves across cards from 0.1 to 0.82, then holds on final item until wrapper finishes.
- useMotionValueEvent converts continuous focal value to active integer index. That state is for semantic/current index, not frame-by-frame transforms.

The profile sets CSS perspective and depth transform values:
- Desktop: perspective 1500px, max Z 104, max Y 92, scale minimum .9, opacity minimum .14, rotation amplitude 1.1.
- Tablet: perspective 1300px, Z 64, Y 70, scale minimum .94, rotation amplitude .7.
- Mobile: perspective 1100px, Z 56, Y 58, scale minimum .94, rotation amplitude .5.

Each card has independent Motion values for Y, Z, scale, opacity, content opacity and rotation, derived from the relative distance between its index and the focal value. depthOf() uses tanh and smoothstep-like interpolation to avoid abrupt linear transitions.

A handoff line appears near the end of the pin stage: progress [.6,.82] drives opacity 0→1 and y 8→0; label “Learning → Building”.

### Reduced motion

EducationSection returns EducationStatic: ordinary section header and responsive list/grid of cards. No pinned scroll, transforms or perspective.

## 7. Section 04 — Skills

### Files and state

- SkillsSection.js
- skills_comp/SkillCategory.js, SkillPrimary.js, SkillSupporting.js, SkillContext.js and category subcomponents
- src/app/data/skillsData.js

The section uses id skills, supporting heading “What I build with.”, section number 04. Each category contains id, number, title, context, primary[] (name/icon/note), and supporting[].

Dynamic mode holds one activeId. Each category announces visibility through onVisible(id); the section marks the currently visible category. Reduced-motion mode renders StaticSkills and disables animated category entrances.

SkillCategory uses Motion and useInView; its RISE configuration staggers the number, title, primary skills and supporting tags. Consult the exact component for per-field timing changes; do not invent a shared scroll timeline—the active category is viewport visibility state.

## 8. Section 05 — Experience

### Files and data

- ExperienceSection.js
- experience_comp/ExperienceCompanySelector.js
- ExperienceCompanyHeader.js
- ExperienceDetailTabs.js
- ExperienceTabContent.js
- ExperienceMetadata.js
- desktop and mobile watermark components
- experience.constants.js
- portfolio.experience in src/app/data/portfolio.js

The section number is 05. Main title is “Where I've applied my craft.” Experience records provide company, role, date, logo, overview, build steps, optional impact and metadata.

### State/interaction model

- activeIndex selects the employer/experience record.
- activeTab is one of Overview, Build, Impact.
- Changing employer resets the tab to Overview.
- Impact tab is removed if the selected record has no impact entries.
- Company selector supports arrow navigation; mobile uses a horizontal selector that scrolls the active option into the visible edge buffer (16px).
- Detail tabs use ARIA tablist/tab/tabpanel semantics, a measured underline indicator and ArrowLeft/ArrowRight roving focus.
- On desktop, an experience watermark appears near the active role; mobile uses a distinct mobile watermark composition.

### Entrance and transitions

The main content uses useInView once with margin -80px 0px. It enters opacity0/y16 to opacity1/y0, 0.6s, delay .1. Employer header transitions through AnimatePresence mode wait: opacity0/y10 (mobile) or y14 (desktop) to visible; exit opacity0 and y-5/y-6; .45s mobile, .55s desktop. Tab panel transitions use .3s mobile or .4s desktop with short Y displacement. Reduced-motion branch renders panel and content directly without those transitions.

## 9. Section 06 — Projects

### Files and data

- ProjectsSection.js
- projects_comp/ProjectCategoryNav.js
- ProjectRenderer.js
- ProjectPresentation.js
- ProjectMedia.js, ProjectMeta.js and presentation subcomponents
- project.constants.js
- src/app/lib/motion/projectPresets.js
- portfolio.projects

The section has categories generated from project data, with All always first. Category labels use explicit labels where defined and a title-case fallback for unknown keys.

### Filtering and reveal

- activeCategory defaults to all.
- Each category initially shows up to 3 projects.
- View more projects appears only if the selected category contains more than 3.
- Switching categories resets expanded state to the first three entries.
- If no projects match, an explicit empty state is shown.
- Category view switches use AnimatePresence mode wait; entrance opacity0/y12, exit opacity0/y-8, duration .4s, ease [.22,1,.36,1].
- Category nav measures the active button and animates an underline indicator. On small screens the horizontal row scrolls the selected category into view; edge buffer is 16px mobile, 28px desktop.

### Project card layout and motion

ProjectRenderer supports editorial, product, interactive and visual modes; unsupported values fall back to editorial. Each presentation reads project-defined mode/variant/motion with defaults from project.constants.js.

ProjectPresentation:
- Triggers once when card reaches view (margin -60px 0px).
- Whole-card scale settles 0.94→1 in .7s.
- Category/title/description/media children use named entrance presets via resolvePreset(ENTRANCE_PRESETS,...).
- Visual mode places media before description.
- Featured editorial projects receive flagship treatment.
- Reduced motion renders without scale/entrance transforms.

ProjectMedia keeps scroll, entrance, hover and depth as separate transform graphs:
- Scroll scale uses useScroll(target:scrollWrapRef,offset:["start end","center center"]); default softDepth grows from 0.82 to 1 as its top reaches viewport center. It is reversible on scroll-up.
- Hover preset can scale media and, for perspective-enabled presets, add rotateX/rotateY and small translations based on normalized pointer coordinates.
- A local IntersectionObserver controls lazy media rendering/loading.
- Image/video media is selected from project data; project actions are shared.
- useReducedMotion sets the scroll transform to identity and removes depth movement.

## 10. Section 07 — Contact

### Files

- ContactSection.js
- contact_comp/ContactIntro.js
- ContactAtmosphere.js
- ContactForm.js, ContactFormFields.js
- contactForm.validation.js
- contactForm.api.js
- src/app/api/contact/route.js

The section uses id contact, section number 07, label CONTACT and supporting heading “Let's build something worth exploring.” It composes an ambient atmosphere, intro and form.

### Form state/validation

Fields are name, email, projectType, message. Validation is shared in contactForm.validation.js:
- Name: required, at least 2 characters.
- Email: required and matches the email regex.
- Project type: required.
- Message: required, 10–1200 characters.

Field blur validates that field. Submit validates all fields and focuses the first invalid field. The form state machine is idle → submitting → success/error. Success opens the success modal; failure shows actionable error text. Values are retained on validation/network errors. Full state ownership, keyboard/radio behavior, request/response mapping, SMTP server flow, email template, environment variables, privacy and security review items are documented in [Contact Form and Email Engineering](./CONTACT-FORM-AND-EMAIL-ENGINEERING.md).

Client API helper POSTs JSON to /api/contact. Server validates again and sends via Gmail SMTP using server-only GMAIL_USER, GMAIL_APP_PASSWORD and CONTACT_TO_EMAIL. Missing configuration returns 503, malformed JSON 400, validation 422 and transport failure 500. Never expose SMTP values client-side.

The client also opens SuccessModal after { ok: true }; the modal plays /mp3/confirmation-002.mp3 via useUiSound. For full component tree, four-state lifecycle, email HTML/text builder, Gmail TLS settings, SMTP timeout/cleanup, API error handling and known security gaps, see [Contact Form and Email Engineering](./CONTACT-FORM-AND-EMAIL-ENGINEERING.md).

## 11. Shared navigation, footer and interactions

- Navbar.js reads scrollY with Motion and toggles scrolled appearance after 24px. Active hash/section follows configured navigation entries. It supports site/project contexts, desktop nav, shared mobile-menu context, social links, theme toggle, resume action and optional Labs account control.
- MobileMenuProvider.js owns open/toggle/close state so menu trigger and menu use the same source of truth.
- Footer.js is global in root layout; it uses an in-view gate (once, amount .18, margin -4%) before reveal. It has reduced-motion handling, homepage-only footer links and suppression on the five Labs auth routes.
- Navbar itself is not in RootLayout: HomePage, ProjectPageView and LabsPageShell insert different Navbar contexts. Project detail has no homepage section menu; Labs uses project context with socials hidden and LabsAccountControl enabled.
- The Labs auth route group uses AuthFrame instead of Navbar and has its own mini-footer; the root Footer returns null on those five routes. Privacy/Admin/not-found retain the root Footer but do not insert the portfolio Navbar; global-error replaces the root layout.
- **Detailed shared-shell source of truth:** [Navbar and Footer Engineering](./NAVBAR-AND-FOOTER-ENGINEERING.md) records the route matrix, DOM layers, full responsive/menu interactions and Footer/Vee shutter/atmosphere motion.

## 12. Data contract (current static source)

portfolio.js composes current code-owned homepage content:
- about: heading, three paragraphs, three capability groups.
- education: records used to compute year range and numbered card labels.
- skills: ordered categories with primary and supporting skills.
- experience: employer records with overview/build/impact and metadata.
- projects: project card data and project detail story/media/links.
- navigation, socialLinks, resumeUrl, name and role.

The current UI does not read these fields from a general Portfolio CMS. The project-detail page uses the same project object family, with stable slug and structured story fields. Future content-field decisions are documented separately; do not retrofit this page using arbitrary HTML or a page builder.

## 13. Recreation/QA checklist

- Confirm section order and IDs before creating anchors/navigation.
- Match section label numbers, max-widths, gutters, spacing and two-column collapse.
- Preserve Hero's sticky 100svh child and breakpoint-specific outer scroll runway.
- Verify first-visit intro and revisit flow on same tab.
- Verify heroReady transition timing so title outline and image entrances replay.
- Verify Education pinned stack on desktop/tablet/mobile and static mode under reduced motion.
- Verify category filter resets View more and scrolls current category into view on mobile.
- Verify experience keyboard operation and ARIA tab semantics.
- Verify project card media loading and reversible scroll scale.
- Verify Contact validation, error response and successful email configuration.
- Verify Navbar hash/scroll state and mobile menu focus/scroll-lock cleanup.
- Test light/dark themes, 200% zoom, narrow widths and prefers-reduced-motion.


## 14. Additional verified component-level notes

### Skills — exact viewport gate and category interaction

SkillsSection consumes portfolio.skills, which is composed from src/app/data/skillsData.js through src/app/data/index.js and src/app/data/portfolio.js. There is also a same-named skills_comp/skillsData.js module in the section folder; SkillsSection does not import that local copy. Treat portfolio.skills as the actual rendered data source and do not modify the duplicate copy expecting the page to change.

Each SkillCategory has one useInView target:
- once: true;
- margin: "-25% 0px -10% 0px".

The exact RISE graph (all opacity 0 → 1, with ease [0.22,1,0.36,1] and duration .6 seconds) is:
| Element | Initial Y | Delay |
|---|---:|---:|
| Numeral | 16px | 0s |
| Category title | 12px | .06s |
| Primary skills | 10px | .12s |
| Supporting skills | 8px | .18s |
| Context line | 6px | .24s |

When category enters view, it calls the parent onVisible(category.id). The parent activeId is semantic active-category state only. It is not used to continuously scrub category transforms.

Primary skill controls:
- Mouse hover and keyboard focus temporarily set hoverNote to the skill note.
- Click toggles selectedSkill; aria-pressed tracks this selected state.
- Context line chooses hoverNote, then selectedSkill.note, then category.context.
- Primary skills without a note are not interactive.
- The skill note is contextual supporting copy, not a tooltip popup.
- Desktop primary controls render understated underline/brand hover and scale feedback; narrow layout renders compact pills.
- SkillContext crossfades its keyed text opacity 0/y3→1/y0 over .18 seconds.

Static reduced-motion path renders StaticSkills and SkillCategory animate=false; category rows remain readable and no viewport-triggered entrance is required.

### Experience — complete section grid and tab semantics

ExperienceSection is a normal document-flow section, not a pinned scroll scene. Its responsive wrapper is:
- section gutters px-5 / sm:px-8 / md:px-10;
- vertical spacing py-28 / sm:py-36 / lg:py-44;
- max-width max-w-7xl;
- desktop label/content grid uses 180px + 1fr.

The active employer is selected with activeIndex. The visible tabs are filtered from TAB_LABELS; Impact exists only when the active record has non-empty impact entries. Selecting a different employer resets activeTab to Overview.

The content entrance is gated by useInView once with margin "-80px 0px", opacity0/y16→1/y0, duration .6, delay .1. Employer header uses AnimatePresence mode wait. Desktop and mobile watermarks are different components rather than one transformed desktop watermark.

Company selector and tab navigation are real keyboard interactions:
- company selector supports arrow navigation;
- tabs use tablist/tab/tabpanel roles and ArrowLeft/ArrowRight roving focus;
- underline position is measured rather than guessed from text length;
- mobile selector scrolls active item with a 16px edge buffer.
Keep tab state/reset logic, ARIA relationships and mobile selector scroll behavior if rebuilding the section.

### Contact — reveal, atmosphere and form lifecycle

ContactSection section geometry:
- gutters px-[clamp(24px,5vw,80px)];
- vertical padding py-[clamp(90px,11vw,170px)];
- max-width max-w-7xl;
- desktop 180px section rail + content column;
- sequence: section label → supporting heading → ContactIntro → ContactForm;
- ContactAtmosphere is an absolute background layer; content uses relative z-10.

ContactAtmosphere:
- root spans the section with pointer-events-none and aria-hidden=true;
- useInView gates the expensive background animation;
- if reduced motion or offscreen, the animated layer is not rendered;
- while in view, an inner layer scales [1,1.04,1] in a 42-second easeInOut infinite cycle;
- two ambient blurred color layers use about 120px and 140px blur.
This gate prevents the last section's infinite animation from running for the entire offscreen session.

ContactIntro:
- useInView once with margin "-60px 0px";
- opacity0/y14 → opacity1/y0;
- reveal .6s with easing [0.16,1,0.3,1], .08 delay;
- reduced motion is immediately visible.

ContactForm:
- useInView once with margin "-60px 0px";
- values/errors/status/modal state are owned within ContactForm;
- status is idle/submitting/success/error;
- field blur validates one field;
- project type selection clears its current error;
- submit validates all fields and focuses the first invalid field;
- request payload sends trimmed name/email/message and projectType;
- success opens the success modal;
- failure preserves values and shows submitError;
- reset starts from INITIAL_FORM_VALUES and INITIAL_FORM_ERRORS.
- CONTACT_MOTION uses reveal .6s, focus .35s, error .25s with y=-4, and background duration 42s.
- CONTACT_STAGGER records name .06, projectType .18, message .24 and submit .3; keep these values aligned with ContactFormFields/ContactRevealRow when adjusting field entrances.

The visual field validation is not the server security boundary. The API independently validates every field before Gmail SMTP delivery.

### Shared Navbar and Footer layout

Navbar:
- root scroll listener is Motion useScroll/useMotionValueEvent;
- compact/scrolled state toggles at scrollY > 24;
- active section state is derived from flattened portfolio.navigation links and section visibility, only meaningful on homepage;
- project context has no homepage section targets;
- mobileMenuOpen is shared through MobileMenuProvider;
- Escape/route navigation closes menu; focus/scroll-lock cleanup must remain intact;
- optional LabsAccountControl is a route-context prop, not always present.

Footer:
- global root layout element;
- useInView once, amount .18, margin "0px 0px -4% 0px";
- actual shutter/reveal waits for both heroReady and footer isInView;
- reduced motion skips the animated wait;
- homepage-only hash navigation is hidden on project detail routes where anchors do not exist;
- footer is suppressed on the explicit Labs auth path list.
See design/LAYOUT-LAYERS-AND-TOKENS.md for actual font, semantic theme tokens, root layers and global CSS.

### Shared navigation/footer detail pointer

This homepage guide documents how its Navbar and Footer participate in the home composition. The complete reusable route/context contract (including project, Labs, Labs auth, Privacy, Admin, not-found and global-error behavior) is maintained in [Navbar and Footer Engineering](./NAVBAR-AND-FOOTER-ENGINEERING.md). Keep page composition here and shared-shell behavior in that guide to avoid duplicate/conflicting route rules.

### SEO/AEO implementation pointer

The homepage's metadata and Person/WebSite/ProfilePage JSON-LD are server-rendered in `src/app/page.js` using `lib/seo/metadata.js` and `lib/seo/jsonld.js`. See [SEO and AEO Engineering](../SEO-AND-AEO-IMPLEMENTATION.md) for current metadata strings, canonical and social fields, sitemap/robots and cross-route rules.
