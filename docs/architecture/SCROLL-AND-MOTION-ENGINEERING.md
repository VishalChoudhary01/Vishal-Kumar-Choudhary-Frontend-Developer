# Scroll and Motion Engineering — Global Contracts

**Status:** Current implementation reference, audited from feat/labs-platform-integration.
**Primary stack:** Motion (motion/react), Lenis, CSS sticky positioning, IntersectionObserver, matchMedia, requestAnimationFrame.
**Purpose:** Explain which scroll controller owns each route, where motion values are created, how page transitions reset scroll, and which sections use scroll progress versus viewport entry.

## 1. Global scroll ownership

The app intentionally does not use one scroll engine for every route.

| Route family | Scroll owner | Policy |
|---|---|---|
| Public homepage and other ordinary portfolio routes | Lenis | Smooth wheel scrolling |
| /projects/[slug] | Lenis | Retains portfolio scroll behavior |
| /labs and descendants | Native browser document scrolling | No Lenis instance |
| /admin and descendants | Native browser document scrolling | No Lenis instance |

Files:
- src/app/lib/lenis/SmoothScroll.js
- src/app/lib/lenis/scroll-policy.mjs
- src/app/providers/AppProviders.js
- src/app/providers/PageLoaderProvider.js

scroll-policy.mjs defines native roots ['/labs','/admin']. A route is inside a root only when pathname equals the root or begins with root + '/'. Invalid or non-root path strings do not enable Lenis. All other eligible paths use Lenis.

SmoothScroll reads pathname from Next Navigation and derives useLenis. If false, it destroys any active window.lenis instance and removes the global reference. If true, it creates Lenis with:
- duration: 1.3
- smoothWheel: true
- wheelMultiplier: 0.9
- touchMultiplier: 1
- syncTouch: false

It owns one requestAnimationFrame loop calling lenis.raf(time). Cleanup cancels the RAF, clears window.lenis only if it still points at that instance, and destroys Lenis.

Do not place a second Lenis instance inside a page or add a competing wheel listener. The Labs/Admin native-scroll policy exists to keep wheel input on the document and avoid scroll capture around long tables, Monaco editors, previews, menus and owner workspace panels.

## 2. Route-change scroll reset and scroll locks

PageLoaderProvider watches usePathname. On route change it calls resetScrollLocks with shouldUseLenis(pathname).

The reset:
- clears html/body inline overflow;
- clears body position/top/width;
- removes body overflow-hidden;
- if Lenis is active, calls window.lenis.scrollTo(0,{immediate:true,force:true});
- otherwise calls window.scrollTo({top:0,left:0,behavior:"instant"}).

The Lenis path is necessary because clearing window.scrollY alone does not clear Lenis's internal target. The native path must not call an old Lenis instance after a route has moved into Labs/Admin.

Overlays such as intro loader, mobile menu and modal can temporarily lock page scrolling. Every route transition must leave those locks cleared. New overlays should own a complete unlock/cleanup path and must not use a permanent body overflow rule.

## 3. Homepage hero — sticky cinematic scroll graph

Source: src/app/components/sections/hero_comp/CinematicHero.js and heroMotionConfig.js.

The hero is not a viewport-height section. It is a tall scroll runway with an inner sticky viewport:
- Desktop: outer height 300svh; hero timeline completes at 0.60 progress.
- Tablet: 280svh; completes at 0.56.
- Large mobile: 200svh; completes at 0.52.
- Mobile: 180svh; completes at 0.52.
- Inner composition: sticky top-0, h-svh, overflow-hidden.

The local progress source uses useScroll(target:heroRef, offset:["start start","end start"]). heroTimeline maps page progress [0,heroEnd] to [0,1]; exitTimeline maps [heroEnd,1] to [0,1].

Keyframe ranges:
- Desktop [0,.18,.4,.65,.82,1]
- Tablet [0,.18,.4,.65,1]
- Mobile [0,.12,.3,.5,.7,1]

Keep each output keyframe array the same length as its input range. The graph controls title scale, name font size, image frame translation/scale/vertical offset, border radius, scrim/overlay, image metadata, scroll cue, crop and glow. Cursor input is an independent MotionValue graph, enabled desktop/tablet only. It is normalized around viewport center and combined with crop MotionValues. Do not update React state on each scroll or pointer event.

## 4. Education — pinned 3D scroll story

Source: src/app/components/sections/EducationSection.js, education_comp/education.motion.js, EducationStack.js.

This is the second true scroll timeline on the homepage. It uses a 310svh section containing a sticky 100svh stage. The focal card travels through an ordered stack while the stage remains pinned.

- useScroll target section, offsets ["start start","end start"].
- PIN_RUNWAY=210 and PIN_HEIGHT=100.
- PIN_SCROLL_FACTOR=(PIN_HEIGHT+PIN_RUNWAY)/PIN_RUNWAY.
- pinProgress is clamped to min(1, scrollYProgress * PIN_SCROLL_FACTOR).
- focal value holds initially, interpolates card sequence through the middle, and holds on the final card to complete the handoff.
- useMotionValueEvent converts the continuous focal value into active integer index state; transforms themselves remain motion values.

Each stack card computes relative distance to the focal index and derives Y, Z, scale, opacity, content opacity and rotation. The component's depthOf helper smooths the relationship with tanh/smoothstep-like shaping. Profile constants:
- desktop: perspective 1500px, max Z 104, max Y 92, min scale .90, min opacity .14, rotation amplitude 1.1;
- tablet: perspective 1300px, max Z 64, max Y 70, min scale .94, rotation amplitude .7;
- mobile: perspective 1100px, max Z 56, max Y 58, min scale .94, rotation amplitude .5.

The handoff is a separate graph around [0.6,.82] and must not be mixed into each card's focal transform. Reduced motion renders EducationStatic rather than a 3D pin timeline.

## 5. Section reveal versus scroll-linked motion

These are different contracts and should stay separate.

### Viewport-entry reveal (one-time)

Common components use Motion useInView with once:true and margin/amount gates. When the target enters the viewport, elements animate from a small opacity/vertical offset to rest. Examples:
- About masked words: margin -40px 0, y 118%→0, .5s, .045s per-word stagger.
- Experience main block: margin -80px 0, opacity0/y16→1/y0, .6s.
- Project card: margin -60px 0, scale .94→1, .7s.
- Showcase: amount .12, margin bottom -8%, opacity0/y24→rest.
- Project navigation: amount .2, margin bottom -8%.
- Project context/body items: projectItemReveal preset.

A one-time entry reveal does not have to reverse when scrolling upward. Do not describe it as scroll progress.

### Scroll-linked continuous transform

These read a normalized progress and map it to transform values; they may reverse when the user scrolls back:
- Cinematic hero (sticky runway).
- Education 3D stack (pinned runway).
- Project hero background parallax (single viewport, y0→-18).
- Project media softDepth scaling (["start end","center center"], [.82,1]).

### Interaction/pointer motion

ProjectMedia reads pointer position relative to its media bounds and uses hover presets for scale/perspective/translation. It must remain separate from scroll-scale and entrance transforms. This allows one motion graph to change without unintentionally resetting another.

## 6. Project detail motion

- Hero: projectHeroMotion.js stores the editorial ease [0.22,1,0.36,1]; atmosphere/title/block/visual/cue durations and stagger delays. Hero content remains hidden until page-loader readiness; reduced motion has zero-duration/opacity-only behavior. Scroll-linked y=-18 belongs to the background visual only; text does not parallax.
- Snapshot: useInView once amount .2, margin bottom -8%; desktop rail versus mobile kinetic list is a structural responsive switch, not merely CSS scaling.
- Showcase: reduced-motion signal uses useSyncExternalStore(matchMedia) to keep server/initial client render deterministic; useInView once amount .12 and margin bottom -8%.
- Navigation: useInView once amount .2; previous item x=-12, next x=12, next delay .05s; duration .55.
- Story body lists use projectItemReveal and receive a reduced flag.

## 7. Reduced motion and hydration

The code has explicit useReducedMotion branches in many animated section components. Preserve static alternatives rather than relying only on CSS motion-reduce classes. For matchMedia values read during hydration, useSyncExternalStore or the shared hook with a stable server snapshot; avoid a server/client initial-state mismatch.

Do not:
- use useScroll without a stable target/offset contract;
- use React setState on every scroll tick for visual transforms;
- create multiple RAF loops for one scroll controller;
- apply Lenis within Labs/Admin;
- leave a Motion transform permanently active after reduced motion changes;
- make a reveal's content inaccessible before its animation is ready;
- couple scroll transforms to an unrelated page section.

## 8. Rebuild verification matrix

| Test | Expected |
|---|---|
| Direct load / | Lenis active after hydration; homepage intro lifecycle works |
| /projects/[slug] | Lenis active; project detail hero background parallax works |
| Navigate from portfolio into /labs | Lenis cleaned up; native scrolling begins; page starts at top |
| Navigate from /labs into project detail | stale Lenis target not reused; new Lenis created and target starts at top |
| Long owner source page | mouse wheel scrolls document to the end; Monaco/editor controls do not trap wheel |
| Resize while on homepage | breakpoint-specific hero config swaps; no broken keyframe lengths |
| Scroll up/down | continuous hero, education, project media graphs are reversible |
| prefers-reduced-motion | hero/education and section-specific static paths render immediately |
| Mobile horizontal category/tab controls | active option remains visible without stealing vertical page scroll |
