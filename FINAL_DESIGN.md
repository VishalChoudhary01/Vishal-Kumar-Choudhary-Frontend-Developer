# FINAL DESIGN

**Portfolio — Vishal Kumar Choudhary**
*Production design reference — all sections, theme system, motion, contact API, and deployment.*

> This document describes the **current implementation** (source of truth: `src/app/globals.css`, `src/app/components/sections/*`, `src/app/components/layout/Navbar.js`, `src/app/providers/UIThemeProvider.js`, `src/app/data/portfolio.js`, `src/app/api/contact/route.js`). It replaces ad-hoc speculation: every value below is what the code actually ships.

---

## 1. System Overview

### 1.1 Concept

> **One interface, three disciplines — Design → Motion → Engineering.**

Warm, editorial surfaces carry a Deep Petrol brand accent. The Hero is a scroll-driven cinematic scene that demonstrates the disciplines instead of only describing them.

### 1.2 Page structure

```text
PAGE
├── NAVBAR (full-width bar at top → floating frame on scroll)
├── HERO — scroll scene + sticky viewport          (id="hero")
├── ABOUT — editorial philosophy                   (id="about")
├── EXPERIENCE — career progression                (id="experience")
├── EDUCATION — academic archive                   (id="education")
├── SKILLS — capability rows                       (id="skills")
├── PROJECTS — case-study archive                  (id="projects")
├── CONTACT — editorial contact form               (id="contact")
├── FOOTER — closing frame                         (id="footer")
```

### 1.3 Tech stack

- Next.js 16 (App Router) + React 19, JavaScript
- Tailwind CSS v4 (`@theme inline` semantic tokens)
- `motion/react` (Motion One)
- Lenis (smooth scroll), Redux Toolkit (UI state)
- Dark mode via `.dark` class on `<html>` (theme transition handled by the theme provider)
- Resend (contact form email delivery)

### 1.4 App provider hierarchy

```text
AppProviders
├── Provider (Redux store)
│   └── MotionProvider (reduced-motion detection)
│       └── SmoothScroll (Lenis)
│           └── PageLoaderProvider (isLoading, heroReady state)
│               └── UIThemeProvider (theme state + no-flash init)
│                   └── children (Navbar + page sections)
```

---

## 2. INTRO EXPERIENCE — "FOLD / PEEL" (Page Loader)

> The intro is a **global page loader** managed by `PageLoaderProvider`. It gates ALL hero and section animations across the app — home page and project detail pages. Content is always mounted but hidden until the loader completes.

### 2.1 Global loader architecture

File: `src/app/providers/PageLoaderProvider.js`

```text
AppProviders
  └─ PageLoaderProvider         ← manages isLoading, heroReady state
       └─ children (page.js)
```

**State:**
| Field | Type | Purpose |
|-------|------|---------|
| `isLoading` | boolean | Loader is visible (peel animation running) |
| `isInitialLoad` | boolean | First-ever page load (vs client navigation) |
| `heroReady` | boolean | Hero animations may start (outline draw, image reveal, content entrance) |

**Methods:**
| Method | Purpose |
|--------|---------|
| `completeLoading()` | Called when loader peel finishes → sets `heroReady = true` |
| `startLoading()` | Called on client-side navigation → re-shows loader |
| `skipLoader()` | Bypass loader entirely (reduced motion, fast nav) |

**Route-change scroll reset:**
On every pathname change (`usePathname()`), `resetScrollLocks()` clears any leftover scroll locks from overlays (PortfolioIntro, MobileMenu, SuccessModal) and scrolls to top. This prevents the scroll-wheel-locked bug that occurred when navigating between pages.

### 2.2 Page layer architecture

```text
LAYER 0  —  BODY BACKGROUND
            bg-[var(--background)]
            text-[var(--foreground)]
            min-h-screen flex flex-col

LAYER 1  —  LOADER (when isLoading === true)
            z-[9999]  fixed inset-0  100vw × 100dvh
            Covers everything. Content below is visibility: hidden.

LAYER 2  —  PORTFOLIO (always mounted)
            visibility: hidden until heroReady === true
            Navbar (fixed, z-50)
            HeroScene (sticky scroll-driven section)
            Section components
```

**Rendering gate in `page.js`:**

```jsx
const { isLoading, heroReady, completeLoading } = usePageLoader();

{/* Loader — visible during peel animation */}
{isLoading && <IntroExperienceSection onComplete={completeLoading} />}

{/* Content — always mounted, visibility gated on heroReady */}
<div style={{ visibility: heroReady ? "visible" : "hidden" }}>
  <Navbar />
  <HeroScene />
  {/* ...sections... */}
</div>
```

### 2.3 Component lifecycle

File: `src/app/components/sections/Intro_loader/IntroExperienceSection.js`

```text
PAGE LOAD
  → IntroExperienceSection mounts (z-[9999], fixed, covers viewport)
  → Surface covers entire viewport (100vw × 100dvh)
  → Body scroll locked (overflow: hidden on <html>)
  → Critical assets begin preloading (hero image)
  → "GOOD TO HAVE YOU HERE" fades in (0→1, y: 8→0)
  → CRAFTING letters perform individual animations
  → Letters settle
  → Brief pause
  → Surface fold/peels upward (y: 0 → -108%, rotate: -0.5°, scaleX: 1.01)
  → Waits for BOTH peel animation AND asset preload to finish
  → completeLoading() fires → heroReady = true
  → Hero outline draw begins, image reveals, content fades in
```

**State machine:** `"intro"` → `"pre-peel"` → `"peeling"` → `completeLoading()`

### 2.4 Asset preloading

The loader preloads critical assets before dismissing, ensuring hero animations don't start with unloaded images:

```js
const CRITICAL_ASSETS = ["/images/png/laptop-me.png"];

function preloadAssets(urls) {
  return Promise.all(
    urls.map((url) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; /* don't block on failed assets */
        img.src = url;
      })
    )
  );
}
```

**Dismissal logic:** Peel timer fires → checks `assetsReady` → if assets loaded, calls `onComplete()` immediately; if not, polls every 50ms until ready.

### 2.5 Hero animation gating

All hero entrance animations are gated on `heroReady` from `PageLoaderProvider`:

| Element | Gate mechanism |
|---------|---------------|
| **Image entrance** | `gatedEntrance` — stays at `initial` state until `heroReady` |
| **Content entrance** | `gatedContentAnim` — stays at `{opacity: 0, y: 12}` until `heroReady` |
| **DrawnTitle outline** | `DrawnCharacterLine` `ready` prop — characters stay clipped at `inset(0 100% 0 0)` |
| **DrawnTitle solid** | `drawComplete` state — only becomes `true` after outline finishes |

```jsx
/* Image */
const gatedEntrance = heroReady
  ? entrance
  : { ...entrance, animate: entrance.initial };

/* Content */
const gatedContentAnim = heroReady
  ? { opacity: 1, y: 0 }
  : { opacity: 0, y: 12 };

/* Outline characters */
<DrawnCharacterLine ready={heroReady} ... />
```

### 2.6 DrawnTitle sequencing

The title "FRONTEND DEVELOPER" uses a two-layer system gated on `heroReady`:

```text
heroReady = false
  → Layer 1 (solid): opacity 0
  → Layer 2 (outline): clipPath inset(0 100% 0 0) — hidden

heroReady = true
  → Layer 2 (outline): characters draw left→right via clipPath
  → Last character completes → setDrawComplete(true)
  → Layer 1 (solid): fades in (0.45s)
```

**No sessionStorage/localStorage/cookies** — loader plays on every page load and client-side navigation.

### 2.3 SVG Surface

- Full-viewport SVG with `viewBox="0 0 1440 900"` and `preserveAspectRatio="none"`
- Fill: `linear-gradient(var(--surface-2), var(--surface-3))`
- Bottom edge: organic bezier contour (asymmetric, non-sinusoidal)
- Subtle edge highlight: 1px stroke with `var(--border-subtle)` at 60% opacity
- Additional bottom edge detail SVG at z-20 for depth cue

### 2.4 Letter Animation — CRAFTING

Each letter is an independent character with its own personality:

| Letter | Personality | Direction | Special |
|--------|------------|-----------|---------|
| **C** | Jump | `y: 50→0`, scale 0.6→1 | Springy ease `[0.34, 1.56, 0.64, 1]` |
| **R** | Curious spin | `x: -40→0`, rotate -180°→0° | Arrives from left with spin |
| **A** | Heavy drop | `y: -60→0`, scale 1.15→1 | Drops from above, squash on land |
| **F** | Corner tip | `x: 30, y: -30`, rotate 45°→0° | Tips in from top-right |
| **T** | Sideways wobble | `x: 35→0`, scale 0.8→1 | Slides in like a flagpole |
| **I** | Springy shoot | `y: 55→0`, scale 0.9→1 | Fastest duration (0.35s), sharp spring |
| **N** | Casual slide | `x: 45→0`, scale 0.85→1 | Slides from right, relaxed ease |
| **G** | Rotational flourish | `x: 20, y: 40`, rotate -90°→0° | Last to arrive, longest duration (0.65s) |

**Stagger:** Letters start within 0.2s–1.18s range (NOT sequential — they overlap).
**Typography:** `clamp(2rem, 5vw, 4.5rem)`, `letter-spacing: 0.18em`, `font-display`.
**Reduced motion:** All letters use simplified fade+rise with no rotation/scale.

### 2.5 Peel Animation

- Surface translates `y: -108%` with `rotate: -0.5°`, `scaleX: 1.01`, `scaleY: 1.005`
- Tween: `duration: 0.78s`, `ease: [0.76, 0, 0.24, 1]`
- `transformOrigin: "50% 0%"` (peels from top)
- Total intro duration: ~2.1–2.4 seconds

### 2.7 Timer Safety

- All timers stored in refs (`peelTimerRef`, `completeTimerRef`)
- Cleaned up on unmount via `useEffect` return
- `hasCalledComplete` ref prevents duplicate `onComplete` calls (React Strict Mode safe)
- Asset preload polling (`setInterval` 50ms) cleaned up on unmount
- `completeLoading()` in PageLoaderProvider is wrapped in `useCallback` to prevent identity recreation

---

## 3. Theme & Color System

All colors are CSS custom properties that switch per theme and are exposed as Tailwind utilities through `@theme inline`.

### 3.1 Light theme (`:root`)

| Role | Token | Value |
|---|---|---|
| Background | `--background` | `#f7f4ee` |
| Foreground | `--foreground` | `#1c1b19` |
| Surface 1 | `--surface-1` | `#fbf9f5` |
| Surface 2 | `--surface-2` | `#f1ece4` |
| Surface 3 | `--surface-3` | `#e8e1d7` |
| Surface elevated | `--surface-elevated` | `#fffcf7` |
| Surface inset | `--surface-inset` | `#ece7de` |
| Surface overlay | `--surface-overlay` | `rgb(28 27 25 / 55%)` |
| Text primary | `--text-primary` | `#1c1b19` |
| Text secondary | `--text-secondary` | `#625e57` |
| Text tertiary | `--text-tertiary` | `#817d75` |
| Text muted | `--text-muted` | `#938d83` |
| Text disabled | `--text-disabled` | `#bdb7ae` |
| Text inverse | `--text-inverse` | `#f1f0eb` |
| Border subtle | `--border-subtle` | `#eeeae3` |
| Border | `--border` | `#ded8cf` |
| Border strong | `--border-strong` | `#d3ccc1` |
| Brand (Deep Petrol) | `--brand` | `#176b68` |
| Brand hover | `--brand-hover` | `#0f5b58` |
| Brand pressed | `--brand-pressed` | `#124f4d` |
| Brand soft | `--brand-soft` | `#dceceb` |
| Brand muted | `--brand-muted` | `#c4dfdd` |
| Brand contrast | `--brand-contrast` | `#ffffff` |
| Success | `--success` | `#177452` |
| Warning | `--warning` | `#8a6115` |
| Error | `--error` | `#a33e38` |
| Info | `--info` | `#35627f` |
| Focus ring | `--focus-ring` | `var(--brand)` |

### 3.2 Dark theme (`.dark`)

| Role | Token | Value |
|---|---|---|
| Background | `--background` | `#0b0f0c` |
| Foreground | `--foreground` | `#f3f4ee` |
| Surface 1 | `--surface-1` | `#111311` |
| Surface 2 | `--surface-2` | `#171917` |
| Surface 3 | `--surface-3` | `#1d1f1d` |
| Surface elevated | `--surface-elevated` | `#222421` |
| Surface inset | `--surface-inset` | `#0e100f` |
| Surface overlay | `--surface-overlay` | `rgb(0 0 0 / 62%)` |
| Text primary | `--text-primary` | `#f3f4ee` |
| Text secondary | `--text-secondary` | `#b9bdb3` |
| Text tertiary | `--text-tertiary` | `#8e9489` |
| Text muted | `--text-muted` | `#747b70` |
| Text disabled | `--text-disabled` | `#4a5148` |
| Text inverse | `--text-inverse` | `#171a16` |
| Border subtle | `--border-subtle` | `#202320` |
| Border | `--border` | `#2b2e2b` |
| Border strong | `--border-strong` | `#383b38` |
| Brand | `--brand` | `#69bdb9` |
| Brand hover | `--brand-hover` | `#7ad0cc` |
| Brand pressed | `--brand-pressed` | `#55b3af` |
| Brand soft | `--brand-soft` | `#173332` |
| Brand muted | `--brand-muted` | `#2a4b49` |
| Brand contrast | `--brand-contrast` | `#0b0f0c` |
| Success | `--success` | `#63d3a5` |
| Warning | `--warning` | `#ebc66a` |
| Error | `--error` | `#f08a83` |
| Info | `--info` | `#81bee0` |

### 3.3 Stable primitives (never change between themes)

- **Petrol** — `petrol-50 … petrol-950` (`#edf8f7 … #102523`)
- **Warm stone** — `stone-50 … stone-950` (`#fbf9f5 … #1c1b19`)

### 3.4 Shape, elevation & motion tokens

| Token | Value |
|---|---|
| Radius sm / md / lg / xl / 2xl | `8 / 12 / 16 / 20 / 28px` |
| Shadow sm / md / lg | `1px` / `8px` / `16px` (warm-neutral alphas) |
| Theme transition | `520ms`, `cubic-bezier(0.22, 1, 0.36, 1)` (reduced to `120ms`) |
| Theme reveal radius | `--theme-reveal-radius` etc. (circular reveal) |

### 3.5 Semantic usage rules

- Brand accent is **Deep Petrol only**; never introduce a second accent.
- Prefer semantic tokens (`text-text-primary`, `bg-surface-2`, `border-border`) over raw hex.
- Never use `dark:bg-*` hard values — `.dark` swaps the token automatically.
- Status colors are semantic (success / warning / error / info) with `-soft` / `-contrast` variants.

---

## 4. Typography System

### 4.1 Locked font families

| Role | Font Family | CSS Variable | Weight | Purpose |
|---|---|---|---|---|
| **Display / Editorial** | Newsreader | `--font-display` (`--font-newsreader`) | 400 | Hero title, section headings, major titles, large numbers |
| **UI / Body** | Manrope | `--font-body` (`--font-manrope`) | 400–700 | Navigation, labels, body copy, descriptions, buttons, forms |
| **System / Technical** | Azeret Mono | `--font-mono` (`--font-azeret-mono`) | 400–500 | Dates, counters, records, technical metadata |
| **Logo** | Custom logo font | — | 500–700 | `VKr.` only |

### 4.2 Type scale

| Utility | Family | Size | Line height | Use |
|---|---|---|---|---|
| `type-display` | Display (Newsreader) | `clamp(2.5rem, 5vw+1rem, 5rem)` | 1.05 | Big serif statements |
| `type-heading` | Display | `clamp(1.75rem, 3vw+0.5rem, 3rem)` | 1.15 | Section titles |
| `type-subheading` | Body (Manrope) | `clamp(1.125rem, 1.5vw+0.25rem, 1.5rem)` | 1.35 | Group labels |
| `type-body` | Body | `clamp(1rem, 0.5vw+0.875rem, 1.125rem)` | 1.65 | Paragraphs |
| `type-body-small` | Body | `clamp(0.875rem, 0.4vw+0.8rem, 1rem)` | 1.55 | Secondary paragraphs |
| `type-metadata` | Body | `clamp(0.75rem, 0.3vw+0.7rem, 0.875rem)` | 1.5 | Uppercase metadata |
| `type-label` | Body | `clamp(0.8125rem, 0.35vw+0.75rem, 0.9375rem)` | 1.5 | Labels |
| `type-caption` | Body | `clamp(0.6875rem, 0.25vw+0.65rem, 0.75rem)` | 1.45 | Photo captions |

### 4.3 Font personality rules

- **Newsreader = CRAFT** — editorial, high-contrast serif. Weight 400 only. Tight line-height (0.88–1).
- **Manrope = CLARITY** — clean UI sans. 400 body, 500 emphasis, 600 nav/labels, 700 CTA.
- **Azeret Mono = ENGINEERING** — system/technical layer. 400 dates/counters, 500 important system info. Uppercase for labels. Letter-spacing 0.02–0.06em.
- `type-metadata` / `type-label` are uppercase by design.
- Keep typography restrained — personality comes from type + layout + motion, not decorative effects.

---

## 5. Motion Language

### 5.1 Centralized easings (`src/app/lib/motion/easings.js`)

| Name | Value | Use |
|------|-------|-----|
| `easeStandard` | `[0.22, 1, 0.36, 1]` | General UI transitions, navbar, hamburger, theme toggle |
| `easeSmooth` | `[0.16, 1, 0.3, 1]` | Richer, slower start, soft settle — entrances, reveals, everything premium |
| `easeOut` | `[0, 0, 0.2, 1]` | Element entering |
| `easeIn` | `[0.4, 0, 1, 1]` | Element leaving |
| `easeLinear` | `"linear"` | Scroll-linked raw mapping |

### 5.2 CSS ease (`src/app/lib/motion/ease.js`)

`EASE_OUT_CSS = "cubic-bezier(0.16, 1, 0.3, 1)"` — used in view transition CSS.

### 5.3 Motion patterns

| Pattern | Library | Config |
|---------|---------|--------|
| **Spring** | motion/react | `stiffness: 420–520, damping: 24–32, mass: 0.45–0.6` (logo, active dot, theme icon) |
| **Tween** | motion/react | Custom easing arrays, durations 0.14s–1.8s |
| **Scroll** | motion/react | `useScroll` + `useTransform` for hero choreography |
| **Layout** | motion/react | `layoutId="navbar-active-marker"` for shared layout animation |
| **View Transition** | Browser API | `document.startViewTransition()` for theme toggle |

### 5.4 Duration reference

| Token | Value | Used for |
|---|---|---|
| `--ease-editorial` | `[0.16, 1, 0.3, 1]` | Entrances, reveals, everything premium |
| Standard ease (lib) | `easeStandard` (`src/lib/motion/easings.js`) | Navbar/menus |
| Content entrance | `550–800ms` | Name / title / intro / CTA |
| Image reveal | `850–1100ms` | Initial photo reveal |
| Workflow-style entries | `~450–550ms perceived` | Sequential builds |
| Cursor spring | `{ stiffness: 120, damping: 20, mass: 0.15 }` | Subtle mouse parallax only |

### 5.5 Rules

- **No bounce / elastic** motion; **no infinite** animation.
- Scroll-driven scenes derive **every state from one normalized progress** — deterministic, reversible, fast-scroll safe.
- Animate only `transform` + `opacity` during scroll (never `top/left/width/height`).
- Respect `prefers-reduced-motion` (CSS kill-switch + `useReducedMotion` fallback component).

### 5.6 Reduced motion

- `useReducedMotion()` from `MotionProvider` context (detects `prefers-reduced-motion: reduce`)
- Affects: Hero (renders static `ReducedMotionHero`), Intro letters (simplified fade+rise), Theme toggle (skips view transition), SectionHeading (no masks)
- CSS kill-switch + JS fallback component for complete coverage

---

## 6. Layout System & Navbar

- Breakpoints used in motion code: `<640` mobile · `640–767` large mobile · `768–1023` tablet · `≥1024` desktop.
- `container-app`: `max-width: 1280px`, padding `clamp(1rem, 5vw, 3rem)`.
- **Navbar** (`src/app/components/layout/Navbar.js`):
  - **Rest** = full-length bar flush to the viewport edges (`top-0`, no side insets), height `78px` desktop / `60px` mobile. Heavy frosted glass: `bg-surface-elevated/60` desktop / `/70` mobile + `backdrop-blur-[24px]`, hairline border (`border-border/70`).
  - **Scrolled** (`scrollY > 24px`) = compact floating editorial frame — a rounded **rectangle**, never a pill: height `68px` / `56px`, radius `20px`, top `12px` desktop / `4px` mobile, inset `20px` desktop / `10px` mobile, `bg-surface-elevated/80` desktop / `/85` mobile, shadow applied.
  - One smoothed 380ms `[0.16, 1, 0.3, 1]` transition (top, height, margins, radius, colors, shadow) between the two states, driven from the shared scroll MotionValue (`useScroll` + `useMotionValueEvent` threshold) — no per-pixel renders, no competing scroll listener.
  - Desktop row = `1fr / auto / 1fr` grid with `grid-template-rows: 100%`, so every column fills the bar height and links/icons stay vertically centered regardless of the logo's taller container.
  - Content: logo (left) · nav (center, desktop only) · socials / divider / theme / resume (right, desktop only). Mobile: logo · theme · menu — no social icons in the compact bar.
  - Geometry system: **Navbar = rounded rectangle**, **Resume = pill**, **Theme = circle**, **Logo = circle asset**.
  - Logo: original V Kr. circular mark (design unchanged) with its **3D circular tilt on hover** (ring lifts in 3D, stroke widens); wraps to Home.
  - Nav links (`About Experience Projects Contact`, 14px / weight 500): text-only; hover = `text-primary` + −1px lift (220ms); **active = one shared 4px teal dot** below the label — no pills, no underline, no bold, no color swap.
  - Social icons (GitHub / LinkedIn / Mail, 18px, muted): no circles or boxes; hover = color + −1px lift (220ms). One subtle vertical divider before the theme control.
  - Theme toggle: `40×40` circle; icon crossfade 340ms `[0.16,1,0.3,1]` (sun exits rotate 45° scale 0.85; moon enters rotate −20° → 0, scale 0.85 → 1); hover = `surface-2` + scale 1.03.
  - Resume (desktop): brand pill `52px` tall, `22px` horizontal padding, 14px/500 text — keeps its pointer-origin cover reveal (cover grows from the exact pointer-entry point, retracts toward the exit point).
  - Mobile container: default `h-[60px]` / radius `24px` → scrolled `h-[56px]` / radius `20px`; top `4px`, inset `10px`; 40px+ hit areas inside the 60px bar.
  - Mobile menu = full-screen editorial sheet with large serif links numbered `01–`; focus trap + Escape + scroll lock; Resume + social actions in the footer.
  - z-order: hero scene layers `≤ 50` · navbar `50` · mobile menu `100` · theme reveal overlay `200`.

---

## 7. HERO — Full Specification

Directory: `src/app/components/sections/hero_comp/` · Reusable pieces: `src/app/components/common/EyebrowLabel.jsx`, `src/app/components/ui/EditorialCta.js`, `src/app/components/common/HeroAmbientBackground.js`

### 7.0 Component architecture (modular files)

The hero is split into single-responsibility files — the root `HeroSection.js` is the only import surface (`page.js` imports `HeroSection` from `./components/sections`):

```text
src/app/components/sections/
├── HeroSection.js              ← ROOT: reduced-motion switch → CinematicHero | ReducedMotionHero
├── hero_comp/
│   ├── CinematicHero.js        ← Scroll/cursor/parallax orchestration + desktop & mobile layout JSX (cfgInputRange ensures useTransform array-length parity per breakpoint)
│   ├── DrawnTitle.js           ← DrawnTitle (two-layer outline→solid title) + DrawnCharacterLine (per-character clipPath draw)
│   ├── MobileIntro.js          ← MobileIntro (post-hero mobile section) + MobileIntroItem (useInView staggered entrance)
│   ├── ReducedMotionHero.js    ← Static accessible fallback (all content readable, no scroll transforms)
│   ├── HeroImageOverlays.js    ← TakeoverOverlay (scroll dim) + ImageMeta (photo caption "Working / Building")
│   └── heroMotionConfig.js     ← Shared MOTION config (per-breakpoint keyframes, entrances, scroll phases) + NAME / DESCRIPTION / CTA_TEXT constants
```

**Data flow:** `HeroScene` → `CinematicHero` (owns all scroll MotionValues, refs, and gating) → renders `DrawnTitle`, `TakeoverOverlay`, `ImageMeta`, `MobileIntro` as pure children. `DrawnTitle` and `MobileIntro` read `MOTION`/content constants from `heroMotionConfig.js` directly; only animation-triggering props (`opacity`, `y`, `ready`, `onComplete`) pass down. The parent `<motion.h1>` owns ALL typography and scroll transforms — `DrawnTitle` never reads `scrollYProgress`.

### 7.1 Concept

The Hero is one continuous scroll composition, not a sequence of cinematic screens:

```text
READ (0→~0.12)          — full editorial composition is readable
TAKEOVER (→~0.5)        — typography settles, photo takes over
SETTLE / HOLD           — composition holds; no idle animation
HANDOFF (end)           — scene resolves into ABOUT
```

### 7.2 Scene architecture

```html
<section id="hero" style="height: {H}">
  <div class="sticky top-0 h-[100svh] overflow-hidden">   <!-- one master scene -->
     background (surface) + soft brand glow
     content layers (text block / photo)
     caption scrim + image meta
     scroll cue
  </div>
</section>
```

**Z-layering with the fixed Navbar** (the Hero image passes **beneath** it):

```text
0    hero background (surface) + soft brand glow        (z-0)
10   hero image frame + text content                    (z-10, one layer)
…    captions / scrims live inside the z-10 layer
50   navbar (fixed, full-width → floating frame)        (z-50)
50   hero scroll cue (bottom of the sticky viewport)
100  mobile menu overlay
200  theme circular-reveal overlay
```

**Scroll height per breakpoint** (`MOTION.*.height`):

| Breakpoint | Section height | Sticky travel |
|---|---|---|
| Desktop (≥1024) | `300svh` | `200svh` |
| Tablet (768–1023) | `280svh` | `180svh` |
| Large mobile (640–767) | `200svh` | `100svh` |
| Mobile (<640) | `180svh` | `80svh` |

**Master progress** — `scrollYProgress` mapped to `[0 → 1]` across `heroEnd` (`0.6` desktop, `0.56` tablet, `0.52` mobile-like). `exitTimeline` = the remaining `heroEnd → 1` segment.

**Input ranges** — Three sets of scroll-progress breakpoints drive all per-element transforms:

| Variable | Length | Used by |
|---|---|---|
| `desktopInputRange` | 6 `[0, 0.18, 0.4, 0.65, 0.82, 1]` | `titleScale`, `nameSize`, `imgFrameX/Scale/Y`, `desktopFrameRadius` on desktop |
| `tabletInputRange` | 5 `[0, 0.18, 0.4, 0.65, 1]` | Same transforms on tablet |
| `mobileInputRange` | 6 `[0, 0.12, 0.3, 0.5, 0.7, 1]` | Mobile/largeMobile `titleScale`, `nameSize` |

**`cfgInputRange`** — A breakpoint-aware input range used by the mobile image transforms (`mobileImgScale`, `mobileImgY`, `mobileImgX`, `mobileFrameScale`, `mobileFrameRadius`, `mobileImageFilter`). It selects the correct length for each breakpoint to ensure `useTransform` input and output arrays always have matching lengths (Motion throws "Both input and output ranges must be the same length" otherwise). Hardcoded output arrays (`mobileFrameRadius`, `mobileImageFilter`) also have tablet-specific 5-element variants.

### 7.3 Desktop / tablet layout

- **Desktop:** 12-column grid, `gap-4`, `px-[4vw]` — content `col-span-8`, photo `col-span-4`.
- **Tablet:** `grid-cols-[28%_72%]` — narrow content column, photo 72%.
- Text block: `absolute inset-0 flex flex-col justify-center` wrapper (centered vertically).
- Name block sits in a fixed-height holder with text anchored `absolute bottom-0`, font grows via `nameSize` keyframes without reflowing.
- Title scale origin `left top` + measured `introLift` keeps the gap constant on scroll.
- Eyebrow = reusable `EyebrowLabel` (`01 INTRODUCTION`), numeral watermark behind the label.
- Description + CTA follow below; CTA = underlined uppercase link `VIEW SELECTED WORK ↗`.

### 7.4 Desktop / tablet photo

- Frame: `aspect-[4/5]`, `max-width clamp(520px, 36vw, 700px)` desktop / `clamp(360px, 30vw, 500px)` tablet.
- Scroll motion: frame slides left, scales up, shifts vertically. Caption scrim precedes caption text.
- Entrance: image `opacity 0→1`, `scale 1.08→1`, `y 12→0` (1100ms desktop / 900ms tablet).

### 7.5 Desktop mouse parallax

- Only on non-touch breakpoints; applied to the inner image. Cursor factor: `x ±5`, `y ±3` (desktop); `±3/±2` tablet; disabled on mobile.

### 7.6 Scroll cue

- "Scroll to explore" + mouse outline at `bottom-[7vh]`, z-50; fades out over the first ~10% of the hero timeline.

### 7.7 Mobile / large-mobile composition

A separate single-column composition; text is never covered by the photo. Name + role above the photo, photo zooms to full-width during scroll, intro block follows below — rendered by `MobileIntro.js` (`MobileIntro` + `MobileIntroItem`, mounted only when `isMobileLike`).

### 7.8 Reduced-motion fallback

`ReducedMotionHero` (`ReducedMotionHero.js`) renders static centered composition with all content readable, no scroll transforms. `HeroScene` in `Hero.js` selects it via `useReducedMotion()` from `MotionProvider`.

### 7.9 Interaction & accessibility

- CTA: real link (`#work`), keyboard focusable, visible focus ring.
- Image alt text provided. Decorative metadata uses `aria-hidden`.
- Heading structure: one `h1` (FRONTEND DEVELOPER); body text is `p`.


---

## 8. ABOUT — Full Specification

File: `src/app/components/sections/aboutSection.js` · Reusable piece: `src/app/components/common/SectionHeading.js`

### 8.1 Concept

Editorial philosophy + capability system. About answers *how this person thinks/builds* — one asymmetric two-column editorial grid:

```text
LEFT                                RIGHT
ABOUT (label)                       Designing with code. (display statement)
                                    body paragraphs (masked word reveal)
                                    capability index — 01 / 02 / 03
```

Everything reveals **once** on viewport entry and settles to a static, fully-opaque state.

### 8.2 Section layout

- Section: `id="about"`, `bg-[var(--background)]`, padding `px-5 py-28` → `sm:px-8 sm:py-36` → `md:px-10` → `lg:py-44`; content `max-w-7xl`.
- Asymmetric grid: `grid gap-10 md:gap-14 lg:grid-cols-[180px_1fr] lg:gap-16`.

### 8.3 Body — masked word-by-word reveal

- Paragraphs 1–2: `mt-12 grid gap-10 md:grid-cols-2 md:gap-8`. Paragraph 3: `mt-10 max-w-3xl`.
- `MaskedWords`: each word in an `overflow-hidden` clip, inner word rises `y: 118% → 0%` — `duration 0.5s`, stagger `0.045s` per word.

### 8.4 Capability system

Three-column grid (desktop) / stacked list (mobile) with `gap-px` dividers, `--border-subtle` borders, watermark numbers, hover accent lines. Cards use `bg-[var(--surface-1)]`.

---

## 9. EXPERIENCE — Full Specification

File: `src/app/components/sections/ExperienceSection.js` · Data: `src/app/data/portfolio.js`

An **interactive editorial timeline** — "where I worked → what I did → how I built → what impact it had".

### 9.1 Layout

Mirrors About's asymmetric two-column grid: `lg:grid-cols-[180px_1fr]`. Inner timeline `32% / 68%` on desktop.

### 9.2 Company navigation

#### Desktop / Tablet (≥768px)

- **Vertical timeline:** 6px dot + 1px connecting rail, active = brand dot + full opacity.
- Company names use full `company` field from data.
- Sticky sidebar: `md:sticky md:top-[140px]`.

#### Mobile (<768px) — Horizontal Scroll Rail

- **Single-row horizontal scroll** with `snap-x snap-mandatory`.
- Company names use `shortCompany` field when available (strips "Pvt. Ltd.", "Private Limited" etc.).
- **Active tab styling:** brand-colored 2px bottom border (`border-[var(--brand)]`), full opacity, `text-[var(--text-primary)]`.
- **Inactive tabs:** `text-[var(--text-muted)]`, opacity 0.6.
- **Trailing padding:** `pr-20` (80px) on mobile, `pr-24` (96px) on sm+ — last tab never touches the right edge.
- **Overflow containment:** nav has `overflow-hidden` to prevent page-level horizontal scroll.
- **Edge fades:** left/right gradient fades appear when scrollable in that direction.
- **Scroll-into-view:** `ensureActiveTabVisible()` scrolls the active tab into comfortable view (16px edge buffer) on selection.
- **Keyboard:** ArrowLeft/ArrowRight with `scrollIntoView`.

```js
// Short company names in portfolio.js
{ id: "cling-multi", company: "Cling Multi Solution Pvt. Ltd.", shortCompany: "Cling Multi" }
{ id: "cloudily-scripts", company: "Cloudily Scripts Pvt Ltd", shortCompany: "Cloudily Scripts" }
```

### 9.3 Detail Tabs — OVERVIEW / BUILD / IMPACT

- Full ARIA `role=tablist / tab / tabpanel`.
- Active = brand text + animated underline.
- **Indicator positioning:** uses `offsetLeft` / `offsetWidth` (content-relative, not viewport-relative) for correct alignment during scroll.
- Impact tab auto-hides when a company has no impact content.

### 9.4 Watermark

- Selected company's logo as background watermark; `onError` hides it; logos in `/public/images/companylogo/`.
- Mobile: fixed viewport-centered backdrop, fades by scroll position.
- Desktop/tablet: absolute positioned under the heading.

### 9.5 Data model

Four companies (Tetr College, BI Hub, Cling Multi, Cloudily). Build/impact are arrays. Impact is qualitative only — **never fabricated metrics**.

### 9.6 Reduced-motion fallback

Static timeline, all companies visible, no pinned choreography, no crossfade transitions.

---

## 10. EDUCATION — Full Specification

File: `src/app/components/sections/EducationSection.js` · Data: `src/app/components/sections/education_comp/`

**"Where I built the foundation."** — editorial academic archive with a pinned scroll-driven 3D card stage.

### 10.1 Concept

Every breakpoint uses the same pinned scroll stage: the section pins with the heading held at the top of the viewport while a 3D card stage runs the records through shallow spatial depth in the middle of the screen — cards come forward, become focal, then recede. A live counter sits vertically centered beside the stage on tablet/desktop.

### 10.2 Layout

- Header follows About-style asymmetric grid: `lg:grid-cols-[minmax(0,11rem)_1fr]`.
- Stage row: `md:grid-cols-[minmax(0,9fr)_minmax(0,17fr)]` — counter left, card stage right.
- Section height: `310svh` (pinned viewport `100svh`).

### 10.3 Card stage

- `EducationStack` handles the 3D depth animation driven by `pinProgress`.
- Depth profiles per breakpoint defined in `education.motion.js`.
- `focalIndex` derives which record is currently focal from progress.

### 10.4 Live Counter (EducationIntro)

The counter beside the card stack shows the current record number, total, degree, and institution.

#### Number animation

- **Slide-up on change:** number (01, 02, 03, 04) slides up from below and fades in when `activeIndex` changes.
- Old number slides up and fades out simultaneously.
- Uses `AnimatePresence mode="popLayout"` for smooth exit/enter.
- Duration: 450ms, ease: `[0.22, 1, 0.36, 1]`.
- Container: `inline-block` with `overflow-hidden` and `align-baseline` — no fixed width, sizes to content naturally.
- `initial={false}` — no animation on first render.

#### Total display

- `/ 04` total sits on the same baseline as the number in a `flex items-baseline gap-2` row.
- Matching `lineHeight` ensures vertical alignment.
- Never animates — always static.

#### Text mask reveal

- Degree + institution text slides up from below with opacity fade.
- Old text slides up and fades out.
- Wrapped in `overflow-hidden` container for mask effect.
- Duration: 400ms, same easing.

```jsx
// Number row structure
<div className="flex items-baseline gap-2">
  <span className="relative inline-block overflow-hidden align-baseline" style={{ height: "clamp(1.75rem, 4vw, 2.5rem)" }}>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span key={number} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }}>
        {number}
      </motion.span>
    </AnimatePresence>
  </span>
  <span style={{ lineHeight: "clamp(1.75rem, 4vw, 2.5rem)" }}>/ {totalLabel}</span>
</div>
```

### 10.5 Handoff

"Learning → Building" chapter bridge appears as the last record resolves (`progress [0.6 → 0.82]`).

### 10.6 Records

Four records from `portfolio.education`: MCA (BHU 2023), BCA (ANC 2020), I.Sc (2017), Matric (St. Xavier's 2015). Each card shows degree, institution, year, and a stack of relevant coursework (`EducationStack`).

### 10.7 Reduced-motion fallback

`StaticEducation` renders all records in a `grid-cols-1 md:grid-cols-2` grid, fully readable, no pinned choreography, no counter animation.

---

## 11. SKILLS — Full Specification

File: `src/app/components/sections/SkillsSection.js` · Data: `src/app/components/sections/skills_comp/`

**"What I build with."** — editorial capability archive with staggered row entrances.

### 11.1 Concept

One continuous editorial archive — hairline dividers, record numerals, primary/supporting hierarchy. Never independent cards.

### 11.2 Layout

Same asymmetric grid as About: `lg:grid-cols-[180px_1fr]`. SectionHeading provides "SKILLS" label + "What I build with." statement.

### 11.3 Categories

Five categories, each with number, title, context line, primary skills (with icons via `SkillIcon`), and supporting skills:

1. **Frontend Engineering** — React, Next.js, JavaScript (+ TypeScript, Vue.js, Astro)
2. **UI & Styling** — Tailwind CSS, CSS, Responsive Design (+ Component Architecture, Design Systems)
3. **State, Data & Integration** — Redux Toolkit, REST APIs, JSON (+ Swagger, Zod)
4. **Forms & Interaction** — React Hook Form, Motion, Lenis (+ Form Validation, Scroll Choreography)
5. **Creative Engineering** — Matter.js (+ Physics-based Interaction, Experimental Motion)

### 11.4 Dynamic behavior

- Each category row observes viewport entry and runs staggered entrance: number → title → primary → supporting → context.
- The most recently entered row keeps a "currently reading" state.
- Desktop hover: divider draws in teal, numeral tilts, content nudges right, primary skill hover shows practical-use note.
- Mobile: rows stack with natural wrapping, context always readable.

### 11.5 Reduced-motion fallback

Static list, all information visible, no transforms.

---

## 12. PROJECTS — Full Specification

File: `src/app/components/sections/ProjectsSection.js` · Data: `src/app/components/sections/projects_comp/`

**"What I actually built."** — curated editorial project explorer with category-driven discovery.

### 12.1 Architecture

```text
SectionHeading ("PROJECTS" / "What I actually built.")
  ↓
CategoryNavigation (data-driven, horizontal scroll rail)
  ↓
Filtered ProjectList (AnimatePresence transitions)
  ↓
ProjectRenderer (per project) → Editorial | Product | Interactive | Visual
  ↓
View More Projects button (show 3 → expand all)
```

### 12.2 Layout

Same asymmetric grid: `lg:grid-cols-[180px_1fr]`. Category nav + project list in the right column.

### 12.3 Category Navigation (ProjectCategoryNav)

#### All breakpoints — horizontal scroll rail

- All category tabs always render in a single horizontal row (no View More on tabs).
- Horizontal scroll with `snap-x snap-mandatory` on mobile.
- **Trailing padding:** `pr-6` (mobile) / `pr-8` (sm+) inside the scroll container — last tab always comfortably revealable.

#### Active tab styling

- `text-[var(--brand)]` + `bg-[var(--brand-soft)]` background.
- Animated underline indicator: `motion.span` with `position: absolute`, `bottom: 0`, `height: 2px`, `bg-[var(--brand)]`.
- Indicator positioning uses `offsetLeft` / `offsetWidth` (content-relative, not viewport-relative) — correct during scroll.
- Transition: 350ms, ease `[0.22, 1, 0.36, 1]`.

#### Scroll behavior

- **`ensureActiveTabVisible()`:** checks if the active tab is comfortably visible (16px edge buffer mobile, 32px desktop). Only scrolls when the tab is partially hidden or too close to an edge.
- **Edge fades:** left/right gradient fades based on `canScrollLeft` / `canScrollRight` scroll position tracking.
- **ResizeObserver** + scroll listener for responsive recalculation.
- **Post-scroll re-measurement:** scroll event listener + 400ms fallback timer re-measures the indicator after smooth scroll completes.
- **Initial render:** left-aligned, no scrollIntoView on mount.

#### Desktop

- All tabs fit without scrolling (no horizontal scroll on desktop).
- If categories exceed width, horizontal scroll remains available.
- No forced centering.

### 12.4 View More Projects

- **Initial count:** 3 projects shown by default.
- **View More button:** centered below the project list, styled as `bg-[var(--surface-2)]` pill with chevron-down icon.
- **Expand:** shows all remaining projects.
- **Reset:** switching categories resets to 3 projects.
- **StaticProjects:** same View More behavior (no animation variant).

```js
const INITIAL_PROJECT_COUNT = 3;
const hasHiddenProjects = filteredProjects.length > INITIAL_PROJECT_COUNT;
const visibleProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, INITIAL_PROJECT_COUNT);
```

### 12.5 Mobile Information Hierarchy

Refined spacing system for mobile project cards:

| Element | Gap |
|---|---|
| Metadata row (number + year) | `mb-5` (20px) |
| Category label | `mb-2` (8px) |
| Title | `mt-2` from category (8px) |
| Description | `mt-4` from title (16px) |
| Image | `mt-8` from description (32px) |
| Technologies | `mt-8` from image (32px) |
| Contribution | `mt-8` (32px) |
| Features | `mt-6` (24px) |
| Actions | `mt-8` (32px) |
| Project separator | `mt-20 sm:mt-24 lg:mt-28` (80/96/112px) |

#### Number + Year (mobile)

- Inline on same baseline: `01 2026`
- Number: `text-[1.5rem]`, brand color
- Year: `type-caption`, muted, smaller
- `inline-flex items-baseline gap-2.5`

### 12.6 Project renderers

Four presentation modes dispatched by `ProjectRenderer`:

- **EditorialProject** — number + year left rail (desktop), content + media right. Featured variant gets larger media.
- **ProductProject** — interface-focused layout with dominant media.
- **InteractiveProject** — media-first for interactive demos.
- **VisualProject** — cinematic layout, media before description.

All renderers share the same mobile spacing system.

### 12.7 Project data

Four published projects, each with: id, name, slug, category, description, role, year, technologies, contribution, features, media, links, presentation config, and optional `story` for case-study detail pages.

### 12.8 Project detail pages

Dynamic routes at `src/app/projects/[slug]/` render case-study narratives from the `story` object.

**Files:**
```text
src/app/projects/[slug]/page.js          ← Dynamic route page
src/app/components/project-detail/
├── ProjectDetail.js                      ← Root layout: assembles all sections (lazy-loaded heavy sections)
├── hero/ProjectHero.js                   ← Project hero with name, description, meta
├── hero/ProjectHeroVisual.js             ← Hero image with lazy loading + skeleton
├── hero/ProjectHeroEyebrow.js            ← Eyebrow label with masked rise animation
├── hero/ProjectHeroMeta.js               ← Role, year, type, stack metadata
├── hero/ProjectHeroScrollCue.js          ← "Scroll" cue at bottom
├── snapshot/ProjectSnapshot.js           ← Quick project snapshot row
├── body/context/ProjectContext.js         ← Project context statement + body
├── body/approach/ProjectApproach.js      ← Approach cards with numbered items
├── body/design/ProjectDesign.js          ← Design philosophy statement + body
├── body/engineering/ProjectEngineering.js ← Engineering approach cards
├── body/motion/ProjectMotion.js          ← Motion system description
├── body/responsive/ProjectResponsive.js  ← Responsive breakpoints
├── body/reflection/ProjectReflection.js  ← Reflection: worked / improve (lazy-loaded)
├── showcase/ProjectShowcase.js           ← SHOWCASE section wrapper (lazy-loaded)
├── showcase/ProjectShowcaseGrid.js       ← Conditional mosaic grid layout
├── showcase/ProjectShowcaseMedia.js      ← Individual image/video tile (lazy-loaded + skeleton)
├── showcase/ProjectShowcaseTile.js       ← Alternative tile (lazy-loaded + skeleton)
└── navigation/ProjectNavigation.js       ← Prev/next project links (lazy-loaded)
```

**Data flow:** `page.js` finds project by slug from `portfolio.projects` → passes to `ProjectDetail` → each section reads its portion from `project.story.*`.

**Content gating:** Each section checks `project.content.sectionName` (boolean) before rendering.

**Lazy loading & code splitting:** Heavy sections are loaded on demand to reduce initial bundle size:
- `ProjectShowcase`, `ProjectReflection`, `ProjectNavigation` use `React.lazy()` + `Suspense`
- Each shows a `<SectionSkeleton />` fallback while loading
- `ProjectHeroVisual` uses IntersectionObserver to defer image fetch until in viewport
- All showcase images/videos use IntersectionObserver with 300px rootMargin

### 12.9 Showcase — Conditional Mosaic Grid

The Showcase section uses a **conditional mosaic grid** that adapts its layout based on image count:

**Files:**
- `src/app/components/project-detail/showcase/ProjectShowcase.js` — section wrapper with heading, scroll-reveal animation
- `src/app/components/project-detail/showcase/ProjectShowcaseGrid.js` — grid layout logic
- `src/app/components/project-detail/showcase/ProjectShowcaseMedia.js` — individual image/video tile

**Grid behavior:**

| Image count | Layout | First tile | Other tiles |
|---|---|---|---|
| **1 image** | Single centered | `mx-auto max-w-4xl aspect-[16/10]` | — |
| **2 images** | 2-column grid | `aspect-[4/3]` | `aspect-[4/3]` |
| **3 images** | 2-col, first spans full | `col-span-full aspect-[16/9]` | `aspect-[4/3]` |
| **4 images** | 2×2 equal grid | `aspect-[4/3]` | `aspect-[4/3]` |
| **5+ images** | Mosaic: featured first + 2-col | `col-span-full aspect-[16/9]` | `aspect-[4/3]` |

**CSS classes:**
- Grid: `grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6`
- Single: `grid grid-cols-1 gap-5 sm:gap-6`
- All tiles: `rounded-[14px] overflow-hidden`
- Mobile: always single column

**Media tile (`ProjectShowcaseMedia`):**
- `next/image` with `fill` prop for responsive images
- Parent `<figure>` has `relative w-full overflow-hidden bg-surface-2`
- Aspect ratio from `spanClass` prop (e.g., `aspect-[4/3]`, `aspect-[16/9]`)
- Hover: subtle scale `1.02` with 700ms ease-out transition
- Gradient overlay on hover (bottom 1/3, `from-black/50`)
- Caption: `font-mono text-[0.68rem] uppercase tracking-[0.16em]` with drop shadow
- Video support: `<video>` with `poster`, `muted`, `playsInline`, `controls`

**Section animation:**
- `motion.div` wrapper with `initial={{ opacity: 0, y: 24 }}` → `animate={{ opacity: 1, y: 0 }}`
- Triggered by `useInView` with `once: true`, `amount: 0.12`
- Duration: 0.9s, ease: `[0.16, 1, 0.3, 1]`
- Respects `prefers-reduced-motion`

**Lazy loading & skeleton:**
- `ProjectShowcaseMedia` uses IntersectionObserver to defer `next/image` fetch until in viewport (300px rootMargin)
- First image (`index === 0`) still uses `priority` but actual fetch is deferred
- Shows `<Skeleton />` shimmer placeholder while image loads
- `onLoad` callback sets `loaded` state to fade in the image and remove skeleton
- Video elements use `preload="metadata"` and `onLoadedData` for skeleton dismissal

**Data structure:**
```js
story.showcase = [
  {
    type: "image" | "video",
    src: "/images/projects/example.png",
    alt: "Description for accessibility",
    caption: "Visible caption overlay",
  },
  // ... more items
]
```

### 12.10 Reduced-motion fallback

`StaticProjects` renders all project cards with View More behavior, fully readable, no animation, no AnimatePresence transitions.

---

## 13. CONTACT — Full Specification

File: `src/app/components/sections/ContactSection.js`
API: `src/app/api/contact/route.js`
Email: `src/app/data/contactEmail.js`
Resend: `src/app/lib/resend.js`

**"Let's build something worth exploring."** — premium editorial contact form with server-side email delivery.

### 13.1 Concept

The Contact section follows the same asymmetric two-column editorial grid as About / Skills / Projects / Experience. The form is NOT inside a card — it uses editorial hairline rules as field boundaries.

### 13.2 Layout

```text
LEFT (lg: 180px)              RIGHT (lg: 1fr)
CONTACT (label)               Let's build something worth exploring. (display)
                              Have an idea, a product, or an interesting problem? (intro)
                              ─── Form ───
                              Your name · Email address (side by side on md+)
                              What are you building? (project type selector)
                              Message (textarea + character counter)
                              [Send Message] button
                              ───
                              Prefer email? → direct email link (copy to clipboard)
```

- Background: subtle atmospheric treatment with slow-breathing `brand-soft` and `surface-2` radial fields.
- Padding: `clamp(90px, 11vw, 170px)` vertical, `clamp(24px, 5vw, 80px)` horizontal.

### 13.3 Form fields

**ContactField** (`ContactField.jsx`) — reusable editorial form field:
- Transparent background, 1px resting hairline as field boundary.
- Teal accent line draws from the left on focus (scaleX, transform-only).
- States: resting → hover (hairline darkens) → focused (teal accent) → filled → error (red accent + error text).
- Supported: `input` and `textarea` via `as` prop. Error text animates in with `y: -4 → 0`.

**ContactProjectType** (`ContactProjectType.jsx`) — editorial option selector:
- Options: Landing Page, Web App, Product, Experiment, Other.
- Selectable editorial rows with fixed-width check slot (zero selection jitter).
- Keyboard accessible: Tab, Arrow keys, Home/End.
- Selected state: brand text, brand check, persistent brand underline.

### 13.4 Form state machine

```text
idle → submitting → success (modal opens)
                 → error (inline error message, values preserved for retry)
```

- Validation: on blur and on submit (never aggressively while typing). First invalid field receives focus.
- Constraints: name ≥ 2 chars, email valid regex, projectType required, message 10–1200 chars.

### 13.5 Submit button (ContactSubmit)

- Uses inline styles for guaranteed color resolution: `backgroundColor: var(--brand)`, `color: var(--brand-contrast)`.
- Hover/focus: `var(--brand-hover)`.
- Disabled state: `opacity-45` when form is invalid or submitting.
- Arrow icon slides in on hover (450ms editorial ease).
- Loading dots pulse animation while submitting.

### 13.6 Success modal (SuccessModal)

On successful submission, a premium modal overlay appears:
- Portal-mounted on `<body>` with backdrop blur (`surface-overlay` + `backdrop-blur-[6px]`).
- Animated SVG checkmark with stroke drawing effect (circle + path).
- Staggered content reveal: checkmark → title ("Message received") → description → CTA button.
- CTA: "Send another message" — closes modal, resets form to idle state.
- Keyboard: Escape dismisses. Backdrop click dismisses.
- Body scroll locked while open.
- Focus management: stores previous focus, restores on close.
- `z-[200]` backdrop, `z-[201]` modal.

### 13.7 Toast notification (Toast)

Portal-mounted toast with:
- Slide-up + blur entrance animation.
- Animated SVG checkmark icon with `pathLength` animation.
- Progress bar auto-dismiss indicator (4500ms default).
- Pause on hover/focus.
- Uses theme tokens: `bg-surface-elevated/95`, `border-border`, `text-text-primary`.
- `z-[180]`.

### 13.8 Contact field hierarchy

```text
ContactSection
├── SectionAtmosphere (background radial fields)
├── SectionHeading ("CONTACT")
├── SectionHeading ("Let's build something worth exploring.")
├── ContactIntro (invitation copy)
├── ContactForm
│   ├── ContactField (name)
│   ├── ContactField (email)
│   ├── ContactProjectType (project type)
│   ├── ContactField (message, textarea)
│   ├── ContactSubmit (send button)
│   ├── SuccessModal (on success)
│   └── Toast (notification)
└── ContactDirectEmail (copy-to-clipboard email link)
```

### 13.9 API — POST /api/contact

**Route:** `src/app/api/contact/route.js`

**Flow:**
1. Check Resend is configured (`RESEND_API_KEY`). Return 503 if not.
2. Check receiving email (`CONTACT_TO_EMAIL`). Return 503 if not.
3. Parse JSON body. Return 400 if invalid.
4. Validate fields server-side (same rules as client). Return 422 with field errors.
5. Build email via `buildContactEmail()` (HTML + plain text).
6. Send via `resend.emails.send()`. Return 500 on failure.
7. Return `{ ok: true }` on success.

**Email payload:**
```js
{
  from: getFromEmail(),          // "onboarding@resend.dev" or custom
  to: [CONTACT_TO_EMAIL],       // inbox that receives messages
  replyTo: values.email,        // visitor's email for easy reply
  subject: "New message from {name}",
  text: "plain text version",
  html: "styled HTML email template"
}
```

**Server-side validation:**
- `name`: required, ≥ 2 chars
- `email`: required, valid regex
- `projectType`: required, must be a valid key from `PROJECT_TYPE_LABELS`
- `message`: required, 10–1200 chars

**Email template** (`contactEmail.js`):
- Inline-style HTML (email-client compatible).
- Editorial layout: header bar → title → brand tick → meta rows (name, email, project type) → message → footer.
- All user content HTML-escaped before template insertion.

**Environment variables:**
| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | Yes | Resend API key for email delivery |
| `CONTACT_TO_EMAIL` | Yes | Inbox address receiving portfolio messages |
| `RESEND_FROM_EMAIL` | No | Verified sender (default: `onboarding@resend.dev`) |

### 13.10 Reduced-motion fallback

- Static form, all fields visible and functional.
- Atmospheric background: static surface only (no breathing animation).
- ContactField accent line renders as a solid line (no scaleX animation).
- SuccessModal and Toast animations are simplified.

---

## 14. FOOTER — Full Specification

File: `src/app/components/layout/Footer.js`

Editorial closing frame with closing typography, navigation, socials, and metadata.

### 14.1 Layout

```text
─── top divider ───
        ↓ 64–80px
STILL
BUILDING.
        ↓ 48–64px
ABOUT  EXPERIENCE  PROJECTS  CONTACT       GitHub  LinkedIn  Email
        ↓ 80–100px
─── bottom divider ───
        ↓ 28–36px
© 2026       BASED IN Patna       NEXT.JS · MOTION · TAILWIND       END OF PAGE
```

Container: `max-w-1280px`, same left/right padding as main sections (`clamp(1.5rem, 8vw, 7rem)`).

### 14.2 Desktop Composition

**Three clear groups:**

1. **Closing statement** — "STILL BUILDING." dominant serif, `clamp(4rem, 10vw, 11rem)`, 75% max width.
2. **Navigation + Socials** — one horizontal row via `flex md:flex-row md:justify-between`. Navigation left, socials right.
3. **Metadata rail** — 4-column grid below a divider: `1fr 1fr 1.4fr auto`.

Vertical rhythm:
- Top divider → closing: `clamp(3rem, 5vw, 5rem)`
- Closing → nav/socials: `clamp(2.5rem, 4vw, 4rem)`
- Nav/socials → bottom divider: `clamp(3.5rem, 5.5vw, 5rem)`
- Divider → meta: `clamp(1.5rem, 2.5vw, 2rem)`

### 14.3 Mobile Composition

- Closing statement: full width, `clamp(4rem, 17vw, 7rem)`.
- Navigation: vertical list.
- Socials: below navigation.
- Meta: vertical stack.

### 14.4 Subcomponents

- `FooterClosing` — "STILL BUILDING." serif statement with staggered line reveal. "BUILDING." has outline text with brand-color wipe on hover.
- `FooterNavigation` — horizontal row on desktop (`flex gap-x-9`), 2-column grid on mobile. Each link has teal underline from left on hover.
- `FooterSocials` — animated gradient border buttons (GitHub, LinkedIn, Email) with icon→arrow swap on hover.
- `FooterMeta` — 4-column grid with top hairline divider. Year, location, stack, "END OF PAGE" marker.

### 14.5 Motion

- Entire footer fades in via `useInView` (`once: true`, `margin: -15%`).
- Closing: line-by-line reveal (opacity + translateY 80px → 0), 900ms.
- Nav/socials: opacity + translateY 14px → 0, 700ms, 120ms delay.
- Meta: opacity + translateY 12px → 0, 550ms, 260ms delay.
- All use `[0.16, 1, 0.3, 1]` easing.
- Respect `prefers-reduced-motion`.

---

## 15. Theme System

### 15.1 ThemeProvider

- State: `preference` ("light" | "dark" | "system"), `resolvedTheme` ("light" | "dark").
- Resolution: stored preference → system preference → default fallback.
- DOM: `<html class="dark" data-theme="dark">`.
- System preference listener: updates when `prefers-color-scheme` changes.
- `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `disableTransitionOnChange={false}`.

### 15.2 ThemeToggle component (`src/components/ui/ThemeToggle.js`)

Renders a `motion.button` with:
- `whileHover: { scale: 1.05 }`, `whileTap: { scale: 0.92 }`
- Spring: `stiffness: 500, damping: 30, mass: 0.5`
- Icon swap via `AnimatePresence mode="wait"` with spring transition (`stiffness: 420, damping: 24, mass: 0.45`)
- Rotation: light→dark icon rotates -90°→0°, dark→light rotates 90°→0°
- Icons: `IoSunny` (light mode) / `BsFillMoonFill` (dark mode) from `react-icons`
- 40×40 circle button. Dispatches `theme-toggle` custom event.
- `aria-label` updates to "Switch to light/dark theme".

### 15.3 View Transition hook (`src/hooks/useThemeToggle.js`)

**View Transition API integration** — theme toggle triggers a native `document.startViewTransition()` with injected CSS animations.

**Variants:**

| Variant | CSS Animation | Duration |
|---------|---------------|----------|
| `rectangle` | Clip-path inset expansion/contraction from configurable origin | 400ms ease-out |
| `circle` | Clip-path circle expand/contract | 700ms cubic-bezier(0.4, 0, 0.2, 1) |
| `circle-blur` | Same as circle + blur(8px)→blur(0) | 700ms |
| `blinds` | Mask-based vertical slat reveal using `@property --theme-transition-slat` | 700ms ease-out |

**Start positions for rectangle:** `top-left`, `top-right`, `bottom-left`, `bottom-right`, `center`, `bottom-up`
**Start positions for circle:** `top-left`, `top-right`, `bottom-left`, `bottom-right`, `center`, `bottom-up`

**Reduced motion:** Falls back to plain `setTheme()` with no view transition.

**Direction awareness:** `data-theme-transition-direction="to-dark" | "to-light"` determines which snapshot (old/new) animates and which stays static.

**CSS variables set during transition:**
- `--theme-transition-from` (rectangle clip-path)
- `--theme-transition-origin` (circle origin)
- `--theme-transition-slat` (blinds, `@property` animated)

**Cleanup:** On `transition.finished`, all `data-theme-*` attributes and CSS properties are removed from `<html>`.

### 15.4 ThemeTransition overlay

- Cinematic circular reveal from the theme toggle position.
- Expanding overlay covers viewport → theme committed + overlay removed in same frame (zero flash).
- CSS `clip-path: circle()` animation driven by `--theme-reveal-radius` and `--theme-origin-x/y`.
- Theme transition: `520ms`, `cubic-bezier(0.22, 1, 0.36, 1)` (reduced to `120ms`).

### 15.5 No-flash initialization

- CSS `@media (prefers-color-scheme: dark)` sets dark defaults immediately.
- `ThemeProvider` useEffect applies localStorage override after hydration.

---

## 16. Shared Components

### 16.1 SectionHeading (`src/components/common/SectionHeading.js`)

Reusable across About, Experience, Education, Skills, Projects, Contact.

Props: `heading` (section label), `supporting` (display statement), `align`, `supportingId`, `size` ("default" | "compact").

**Two-tier hierarchy:**
1. **Heading** (section label, e.g., "ABOUT") — `text-brand`, letter-by-letter masked rise
2. **Supporting** (display statement, e.g., "Designing with code.") — word-by-word masked cascade

**Animation layers:**
1. Label letters rise through `overflow: hidden` masks (tight stagger: 0.032s)
2. Statement words cascade through individual masks (step: 0.055s)
3. Datum line: brand tick draws first (0.7s), hairline follows (0.7s)

**Variants:** `editorial` (serif, brand-colored label, datum line) | `minimal` (sans, secondary-colored)

**Sizes:** `compact` | `default` | `large`

### 16.2 AnimatedOutlineText (`src/components/common/AnimatedOutlineText.js`)

Reusable editorial typography: **outline draws → outline settles → solid fill appears**.

- Each character: clipPath `inset(0 100% 0 0)` → `inset(0 0% 0 0)`
- Character duration: 0.16s, stagger: 0.055s
- Fill delay: 0.55s after outline completes
- Supports strings, arrays, or React nodes

### 16.3 EyebrowLabel (`src/components/common/EyebrowLabel.jsx`)

Reusable across Hero and other sections.

Props: `label` (default "INTRODUCTION"), `number` (default "01"), `align` ("left" | "center").

**Structure:** faint oversized serif numeral watermark behind a readable uppercase label.

- `align="left"`: numeral behind label's top-left (desktop hero)
- `align="center"`: numeral centered behind label (mobile)
- Numeral opacity: 7% light / 18% dark
- Numeral size: `text-[55px]` mobile, scales with breakpoints

### 16.4 EditorialCta (`src/components/ui/EditorialCta.jsx`)

Quiet editorial underline link (not a button):
- Text: uppercase, `type-label`
- Underline: thin neutral hairline + teal accent segment (35% at rest → 100% on hover)
- Arrow: `ArrowUpRight` SVG, moves `x: 5, y: -2` on hover
- Press: `scale: 0.98`
- Expanded hit area via negative margins

### 16.5 EditorialNumber (`src/components/ui/EditorialNumber.js`)

Large faint numeral for section numbering:
- `text-[clamp(4rem,10vw,7rem)]`, `font-body`, `font-medium`
- Active: opacity 0.16, Inactive: opacity 0.05
- Positioned `absolute -left-1 top-1/3`

### 16.6 VKrLogo (TwoRingLogo)

Original V Kr. circular mark with 3D tilt on hover. Used in navbar.

3D ring system + text:
- 4 concentric SVG circles at `r="29"` with different stroke widths
- On hover: rings rotate in 3D (rotateX/rotateY 360°) with staggered timing (1.2s → 1.8s)
- Text: "V Kr." — outline layer + solid layer with clipPath reveal
- `perspective: 800px`, `transform-style: preserve-3d`

### 16.7 Buttons

**ActionButton:** `motion.button` with icon motion (direction, distance, rotate, scale).
**DownloadButton:** With progress state (`downloading`, `completed`, `error`), icon animation.

### 16.8 ResumeButton

Brand pill CTA with pointer-origin cover reveal animation. Links to `/resume.pdf`.

### 16.9 HeroAmbientBackground

Three animated radial gradient blobs for atmospheric depth:
- Main teal atmosphere (24s cycle)
- Lower-left warm light (30s cycle)
- Lower-right gold warmth (32s cycle)
- Top gradient fade keeps typography area quiet
- Subtle radial vignette

### 16.10 Toast

Portal-mounted notification with progress bar, pause-on-hover, animated icon. Used by ContactForm.

### 16.11 SuccessModal

Portal-mounted success confirmation with animated checkmark, backdrop blur, keyboard dismiss. Used by ContactForm.

### 16.12 Skeleton

**File:** `src/app/components/ui/Skeleton.js`

Reusable animated placeholder component for loading states.

- Uses `bg-surface-2` background for theme-consistent appearance
- Shimmer animation: `@keyframes shimmer` sweeps a `via-white/15` gradient across the skeleton
- Accepts `className` for arbitrary sizing and `rounded` for corner radius
- Renders `aria-hidden="true"` (decorative)
- **Used by:** ProjectMedia, ProjectShowcaseMedia, ProjectShowcaseTile, ProjectHeroVisual, ProjectDetail fallbacks

```jsx
<Skeleton className="absolute inset-0" rounded="rounded-none" />
<Skeleton className="h-8 w-32" rounded="rounded-md" />
<Skeleton className="aspect-[16/9]" rounded="rounded-[14px]" />
```

### 16.13 LazyImage

**File:** `src/app/components/ui/LazyImage.js`

Generic lazy-loading wrapper that defers image/video loading until the element enters the viewport.

- **IntersectionObserver** with configurable `rootMargin` (default `200px 0px` for early loading)
- Shows `<Skeleton />` placeholder while loading
- Fades real media in via `transition-opacity duration-500` on load
- Supports both `image` (default) and `video` types
- Falls back to native `loading="lazy"` when IntersectionObserver is unavailable

---

## 17. Data Architecture

### 17.1 Single source of truth

`src/app/data/portfolio.js` — all portfolio data: name, role, navigation, social links, experience, education, projects. Sections import and enrich this data (adding display numbers, category labels, etc.) rather than duplicating content.

### 17.2 Section data files

| Section | Data file | Source |
|---|---|---|
| Experience | `portfolio.experience` | Direct from `portfolio.js` |
| Education | `education.data.js` | Enriches `portfolio.education` with record numbers, totals, period |
| Skills | `skillsData.js` | Independent data (not in `portfolio.js`) |
| Projects | `projectsData.js` | Enriches `portfolio.projects` with display numbers, category labels, showcase images |
| Contact | `contactEmail.js` | Email template and config for Resend API |

---

## 18. Responsive System

| Breakpoint | Label | Key differences |
|---|---|---|
| `<640px` | Mobile | Single column, no parallax, reduced zoom, compact navbar, horizontal chip scroll |
| `640–767px` | Large mobile | Similar to mobile, slightly larger type/spacing |
| `768–1023px` | Tablet | Two-column grids, reduced hero zoom, vertical timeline |
| `≥1024px` | Desktop | Full editorial grid, 12-col hero, mouse parallax, floating navbar frame |

---

## 19. Deployment Configuration

### 18.1 Environment variables

| Variable | Required | Where |
|---|---|---|
| `RESEND_API_KEY` | Yes (for contact form) | Vercel / hosting env |
| `CONTACT_TO_EMAIL` | Yes (for contact form) | Vercel / hosting env |
| `RESEND_FROM_EMAIL` | No | Custom verified sender |

### 18.2 Static assets

| Asset | Location | Notes |
|---|---|---|
| Company logos | `/public/images/companylogo/` | SVG/PNG, used as Experience watermarks |
| Project showcase images | `/public/images/projects/` | Showcase gallery images |
| Hero photo | `/public/images/png/laptop-me.png` | Hero section photo |
| Resume | `/public/resume/vishal_kumar_choudhary_frontend_developer.pdf` | Served via Resume button |

### 18.3 Build & deploy

- **Framework:** Next.js App Router (static + API routes).
- **Hosting:** Vercel recommended (automatic preview deploys, serverless API routes for `/api/contact`).
- **Build:** `npm run build` — static generation for pages, serverless functions for API.
- **No database required** — all data is in `src/data/portfolio.js`. Contact form delivers via Resend email.

### 18.4 Post-deploy checklist

- [ ] Set `RESEND_API_KEY` in hosting environment
- [ ] Set `CONTACT_TO_EMAIL` in hosting environment
- [ ] Optionally set `RESEND_FROM_EMAIL` to a verified domain sender
- [ ] Verify `/resume.pdf` is accessible
- [ ] Test contact form end-to-end (submit → email received)
- [ ] Check theme toggle works (localStorage + system preference)
- [ ] Verify all company logos render in Experience section
- [ ] Test on mobile (touch, no parallax, scroll snap chips)
- [ ] Test reduced-motion (system preference or browser devtools)

### 18.5 What changes when deployed (vs local)

| Aspect | Local | Deployed |
|---|---|---|
| Contact form | May fail without `RESEND_API_KEY` | Works with env vars set |
| Resume link | Points to `/resume.pdf` | Same — ensure file exists in `/public` |
| Theme persistence | `localStorage` on same origin | Same — works per domain |
| API routes | Next.js dev server | Vercel serverless functions |
| Email delivery | Requires Resend setup | Requires Resend setup |
| Performance | Dev mode | Optimized static + edge caching |
| Images | Served from `/public` | Same — CDN-cached on Vercel |

---

## 20. Performance Considerations

- **Transform-only animation:** Hero and intro use `transform`, `opacity`, `clipPath` — no layout thrashing
- **Lenis:** `requestAnimationFrame` loop, destroyed on unmount
- **Image:** `loading="eager"` for hero image, `decoding="async"`
- **Client components:** Scoped to interaction boundaries (Hero, Navbar, Intro, ThemeToggle)
- **No manual rAF loops** outside Lenis and hero scroll
- **Timer cleanup:** All `setTimeout` refs cleared on unmount
- **Strict Mode safe:** `useRef` guards against duplicate effects
- **Lazy loading:** IntersectionObserver-based deferred loading for project images and showcase media (300px rootMargin for early loading)
- **Skeleton placeholders:** Shimmer animation during image/video load provides visual feedback without layout shift
- **Code splitting:** Heavy project detail sections (`ProjectShowcase`, `ProjectReflection`, `ProjectNavigation`) lazy-loaded via `React.lazy()` to reduce initial JS bundle
- **Deferred network requests:** Image `src` and video `src` set only when element enters viewport — no unnecessary network requests for off-screen content

---

## 21. Accessibility

- `aria-hidden="true"` on decorative SVGs, gradients, ambient blobs
- `aria-label` on interactive elements (nav, hamburger, theme toggle)
- `aria-current="page"` / `aria-current="location"` on active nav links
- Focus trap in mobile menu with ESC key support
- `aria-pressed` on theme toggle
- `prefers-reduced-motion` respected across all motion systems
- Focus-visible rings on all interactive elements (`ring-brand`)
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`

---

## 22. Animation Timing Summary

| System | Duration | Easing |
|--------|----------|--------|
| Intro total | ~2.1–2.4s | — |
| Intro supporting text | 0.45s | `[0.16, 1, 0.3, 1]` |
| Intro letters | 0.35–0.65s each | Per-letter springs |
| Intro peel | 0.78s | `[0.76, 0, 0.24, 1]` |
| Navbar state change | 380ms | `[0.16, 1, 0.3, 1]` |
| Theme toggle icon | Spring | `stiffness: 420, damping: 24` |
| Theme rectangle | 400ms | ease-out |
| Theme circle | 700ms | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Hero image entrance | 1.1s | `[0.16, 1, 0.3, 1]` |
| Hero content entrance | 0.7s | `[0.16, 1, 0.3, 1]` |
| SectionHeading label | 0.45s per letter | `[0.22, 1, 0.36, 1]` |
| SectionHeading statement | 0.6s per word | `[0.16, 1, 0.3, 1]` |
| Active dot | Spring | `stiffness: 520, damping: 32` |
| Lenis smooth scroll | 1.3s duration | smooth |

---

## 23. Deliberate design decisions / change log

| # | Decision | Why |
|---|---|---|
| 1 | Name font grows inside a fixed-height holder, anchored bottom | Growth never reflows the title/intro → even spacing while scrolling |
| 2 | Title scale origin `left top` + measured intro lift | Intro translates **up** in lockstep with the shrinking title |
| 3 | Eyebrow = `INTRODUCTION` word + faint oversized serif `01` watermark | Editorial chapter marker; `01` visible but never dominant |
| 4 | Desktop name base 20px, growth capped at 40px | Matches approved look without wrap/drift side-effects |
| 5 | No full-width cream bottom gradient on the hero | Photo stays clean; caption handled by its own scrim |
| 6 | Caption scrim precedes caption text | Text is never readable before its dark layer exists |
| 7 | Mobile photo: card radius `16→0px`, modest zoom, origin top-center | Subtly rounded card settling to a clean editorial edge |
| 8 | Mobile hero scroll heights shortened (200/180svh) | Intro arrives quickly under the photo |
| 9 | Reusable `EyebrowLabel` (label/number/align props) | One component drives desktop + centered mobile variants |
| 10 | Hero–navbar layering: scene `≤ z-50`, navbar fixed `z-50` | Hero glides under the frosted bar |
| 11 | Navbar: full-width bar → compact floating frame (380ms morph) | Stable navigation that never competes with the Hero |
| 12 | Heavy glass: `bg-surface-elevated` 60–85% + `backdrop-blur-[24px]` | Strong translucency keeps content readable |
| 13 | Nav links: active = one shared 4px teal dot | Quiet editorial utility language |
| 14 | About capability box softened to `--border-subtle` | `--border` was too loud in both themes |
| 15 | Experience rebuilt as interactive editorial timeline | Company is the identity, work is the story |
| 16 | Education uses pinned 3D card stage | Spatial depth makes the academic archive feel cinematic |
| 17 | Skills uses staggered row entrances with "currently reading" state | Editorial archive feel, not a flat shopping list |
| 18 | Projects uses data-driven category filtering with AnimatePresence | Smooth transitions between filtered views |
| 19 | Contact form uses inline styles for button colors | Tailwind theme utilities weren't resolving reliably for the submit button |
| 20 | Success confirmation uses a portal-mounted modal, not inline replacement | Premium overlay with backdrop blur and animated checkmark |
| 21 | Toast auto-dismisses with progress bar, pauses on hover | Non-intrusive but informative confirmation |
| 22 | Contact API validates server-side independently of client | Security: never trust client-side validation alone |
| 23 | Footer uses "STILL BUILDING." as closing statement | Forward-looking, editorial tone matching the portfolio voice |
| 24 | All sections share the `lg:grid-cols-[180px_1fr]` asymmetric grid | Consistent editorial rhythm from About through Contact |
| 25 | Reduced-motion: every section has a static fallback tree | All content readable without any animation |
| 26 | Projects: View More shows 3 projects, expand reveals rest | Reduces initial scroll depth on mobile; cleaner first impression |
| 27 | Projects: category tabs always render, no View More on rail | Scroll rail is simpler than expand/collapse; all tabs discoverable |
| 28 | Projects: mobile spacing uses 8px baseline grid | Consistent editorial rhythm: tight category→title, medium title→desc, large desc→image |
| 29 | Projects: indicator uses offsetLeft/offsetWidth | Content-relative measurement stays correct during scroll unlike getBoundingClientRect |
| 30 | Experience: mobile company selector uses scroll-into-view | Active company tab always comfortably visible after selection |
| 31 | Experience: shortCompany field strips "Pvt. Ltd." on mobile | Company names fit comfortably in the horizontal scroll rail |
| 32 | Experience: nav overflow-hidden prevents page-level scroll | Trailing padding for last tab without causing horizontal overflow |
| 33 | Education: counter number slides up on index change | Motion makes the record transition feel intentional and editorial |
| 34 | Education: text mask-reveals from below | Consistent with the portfolio's masked-word reveal language |
| 35 | Education: number/total share baseline in flex row | Proper vertical alignment between animated number and static total |
| 36 | Hero split into modular files under `sections/hero/` (root `Hero.js`, `CinematicHero.js`, `DrawnTitle.js`, `MobileIntro.js`, `ReducedMotionHero.js`, `HeroImageOverlays.js`, `heroMotionConfig.js`) | Single-responsibility components with identical behavior; shared MOTION config becomes one source of truth; dead code (`DrawnWord`, `interpolate`) and a stale duplicate `CinematicHero.js` removed |
| 37 | IntersectionObserver-based lazy loading for project cards and showcase images | Defers network requests until content enters viewport; 300px rootMargin ensures images start loading before they're fully visible |
| 38 | Skeleton shimmer placeholders during media load | Provides visual feedback while images/videos load, prevents layout shift, matches theme surfaces |
| 39 | `React.lazy()` code splitting for project detail sections | `ProjectShowcase`, `ProjectReflection`, `ProjectNavigation` load on demand; reduces initial JS bundle for project detail pages |
| 40 | ProjectHeroVisual lazy loading with skeleton | Hero project image defers fetch until in viewport; skeleton placeholder shown during load |
| 41 | Hero `useTransform` input/output range parity fix | `cfgInputRange` selects the correct input range length per breakpoint (6 desktop/mobile, 5 tablet) to match config output array lengths; hardcoded `mobileFrameRadius`/`mobileImageFilter`/`mobileFrameScale` output arrays are also conditional per breakpoint |
