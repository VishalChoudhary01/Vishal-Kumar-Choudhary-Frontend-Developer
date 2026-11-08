# Navbar and Footer Engineering — Layout, Motion and Route Composition

**Audited branch:** `feat/labs-platform-integration`  
**Current-state date:** 2026-11-07  
**Status:** Current implementation reverse-engineered from source. This guide is the detailed authority for shared navigation/footer composition, responsive variants, motion, route conditions and accessibility behavior.

> **Important architecture distinction:** Footer is mounted by the root layout. Navbar is not. The Navbar is inserted by the homepage client shell, project-detail client shell and public Labs shell with different props. Do not move Navbar into RootLayout or assume that every route has the same header.

## 1. Source files and ownership

| Responsibility | Source |
|---|---|
| Root document and global Footer mount | `src/app/layout.js` |
| Navbar shell, context and route behavior | `src/app/components/layout/Navbar.js` |
| Desktop navigation container | `src/app/components/layout/DesktopNavigation.js` |
| Desktop single link / group flyout | `src/app/components/layout/DesktopNavigation/NavLink.js`, `NavGroup.js` |
| Full-screen responsive menu | `src/app/components/layout/MobileMenu.js` |
| Animated hamburger/close icon | `src/app/components/ui/HamburgerSVGButton.js` |
| Shared menu state | `src/app/providers/MobileMenuProvider.js` |
| Footer shell and pathname rules | `src/app/components/layout/Footer.js` |
| Footer composition | `src/app/components/layout/footer_comp/FooterAtmosphere.js`, `FooterClosing.js`, `FooterNavigation.js`, `FooterSocials.js`, `FooterMeta.js`, `FooterShutter.js` |
| Footer social interaction | `FooterSocialButton.js` |
| Closing headline reveal | `FooterClosingLine.js`, `FooterOutlinedWord.js` |
| Navigation/social data | `src/app/data/navigationData.js`, `socialData.js`, composed by `portfolio.js` |
| Global geometry, fonts and atmosphere tokens | `src/app/globals.css`, documented in `../design/LAYOUT-LAYERS-AND-TOKENS.md` |
| Page intro/revisit and route scroll reset | `src/app/providers/PageLoaderProvider.js` |
| Reduced-motion provider / scroll controller | `MotionProvider.js`, `SmoothScroll.js` |

## 2. Actual root layout layers

`src/app/layout.js` mounts the shared Footer after the route-child wrapper. It does not import or render Navbar.

    RootLayout (Server Component)
    └── html
        ├── head
        │   ├── theme-aware favicon
        │   └── pre-paint intro-revisit marker
        └── body.flex.min-h-full.flex-col
            └── AppProviders
                └── UIThemeProvider (next-themes class theme)
                    ├── div.flex-1
                    │   └── current route page / page-specific shell
                    │       └── Navbar only when that page shell inserts it
                    └── Footer (global mount; Footer applies pathname conditions)

The `AppProviders` order is:
1. `ActionToastProvider`
2. `MobileMenuProvider`
3. `MotionProvider`
4. `SmoothScroll`
5. `PageLoaderProvider`

Then `UIThemeProvider` owns the `html.light/html.dark` class context around route children and Footer.

The root body is a flex column; the route child wrapper is `flex-1`. This pushes the Footer to the bottom of short pages while allowing long page content to determine document height.

**Do not add Navbar to RootLayout.** It is deliberately page-shell-owned because homepage section anchors, project context, Labs account controls, authentication, privacy and admin workspaces have different header requirements.

## 3. Route-by-route Navbar and Footer rendering

The following is the behavior observed from the current page composition and Footer pathname logic.

| Route | Navbar/header | Footer | Footer section links |
|---|---|---|---|
| `/` | Full site Navbar via `HomePage`, default `context="site"` | Global Footer | Visible: About, Experience, Projects, Labs, Contact |
| `/projects/[slug]` | Navbar via `ProjectPageView`, `context="project"` | Global Footer | Hidden; social links, Privacy Policy and metadata remain |
| `/labs` | Navbar via `LabsPageShell`, project context + Labs account control + social links hidden | Global Footer | Hidden; social links, Privacy Policy and metadata remain |
| `/labs/[slug]` | Same LabsPageShell Navbar configuration | Global Footer | Hidden |
| `/labs/login` | Compact `AuthFrame` header, not the site Navbar | Global Footer returns null; AuthFrame renders its own compact footer | Not applicable |
| `/labs/signup` | Compact `AuthFrame` header | Global Footer returns null; AuthFrame renders its own compact footer | Not applicable |
| `/labs/forgot-password` | Compact `AuthFrame` header | Global Footer returns null; AuthFrame renders its own compact footer | Not applicable |
| `/labs/reset-password` | Compact `AuthFrame` header | Global Footer returns null; AuthFrame renders its own compact footer | Not applicable |
| `/labs/verify-email` | Compact `AuthFrame` header | Global Footer returns null; AuthFrame renders its own compact footer | Not applicable |
| `/privacy` | No portfolio Navbar; page uses `LegalDocumentPage` | Global Footer | Hidden |
| `/admin/**` | No portfolio Navbar; individual owner pages use local `LabsOwnerNavigation` where applicable | Global Footer remains mounted | Hidden |
| Root not-found / route error boundary | No portfolio Navbar from the page component | Root Footer remains part of the root layout | Hidden |
| Root `global-error.js` fallback | No portfolio Navbar | No global Footer; global error emits its own `html/head/body` | Not applicable |

### 3.1 Homepage composition

`src/app/page.js` is a Server Component that emits metadata/JSON-LD and renders `HomePage`.

`HomePage` places `<Navbar />` inside the visibility-gated page content, before HeroSection. The shared Footer is still outside that route child tree and is rendered by RootLayout.

The homepage footer link list is a fixed component-level array:
- About → `#about`
- Experience → `#experience`
- Projects → `#projects`
- Labs → `/labs`
- Contact → `#contact`

The Navbar's source data is `portfolio.navigation`, currently:
- About → `#about`, with Education → `#education` and Skills → `#skills` children;
- Experience → `#experience`;
- Projects → `#projects`;
- Labs → `/labs`;
- Contact → `#contact`.

The footer list is not identical to the Navbar data: it deliberately does not repeat the About submenu's Education/Skills children.

### 3.2 Project detail composition

`ProjectPageView` inserts `<Navbar context="project" />` before `ProjectDetail`.

Project context:
- sends the logo to `/` rather than the homepage `#hero` anchor;
- hides the desktop homepage section-navigation group;
- skips homepage section active-state IntersectionObserver setup;
- hides the homepage hamburger/mobile section menu;
- hides the Resume action;
- keeps social links visible from the `sm` breakpoint upward;
- retains ThemeToggle;
- does not enable LabsAccountControl.

The shared Footer remains below the project page through RootLayout. Because the route is not `/`, Footer does not render the homepage-only section links. Socials, Privacy Policy and FooterMeta remain.

### 3.3 Public Labs composition

`LabsPageShell` is used by both `/labs` and `/labs/[slug]`. It inserts:

```jsx
<Navbar
  context="project"
  showLabsAccount
  hideSocialLinks
  initialAuthUser={initialAuthUser}
  initialSessionResolved={initialSessionResolved}
  initialIsOwner={initialIsOwner}
/>
```

This reuses the compact project-context shape:
- the logo links back to `/`;
- no homepage section links, hamburger or Resume action;
- social icons are deliberately hidden;
- LabsAccountControl is displayed with server-resolved initial user/session/owner presentation;
- ThemeToggle remains visible.

The root Footer is not suppressed on `/labs` or `/labs/[slug]`. It uses the non-home footer layout (socials, Privacy Policy and metadata; no homepage section anchors).

### 3.4 Authentication route composition

The auth pages live in the route group `src/app/labs/(auth)/`; the group segment does not appear in public URLs.

Its layout renders `AuthFrame`, which has its own compact structure:
- header: V Kr. link to `/labs` and ThemeToggle;
- main: centered form panel, max-width 420px;
- footer: “LABS AUTHENTICATION” and “Back to Labs”.

The root Footer independently checks exact pathnames:
`/labs/login`, `/labs/signup`, `/labs/forgot-password`, `/labs/reset-password`, and `/labs/verify-email`.
For these paths it returns `null`, preventing the normal portfolio Footer from duplicating AuthFrame's compact footer.

Do not remove AuthFrame's footer when changing the global Footer condition. They are different components with different roles.

### 3.5 Privacy, owner/admin and error surfaces

- The Privacy Policy page uses `LegalDocumentPage` and its own contents navigation; it does not insert the shared site Navbar. The global Footer still follows the page.
- Owner analytics/source pages render a local `LabsOwnerNavigation` and local “Back to Labs” affordance. That is not the portfolio Navbar and has its own account menu/dropdown state.
- `not-found.js` renders ErrorPage as route content; root Footer is outside the route content and remains in the root layout. The not-found page itself does not add Navbar.
- `error.js` is a root route-segment error boundary; the normal root layout remains the surrounding layout, so the global Footer remains outside the error page.
- `global-error.js` is different: it emits its own html/head/body document and replaces the root layout, so it has neither the normal Navbar nor the global Footer.

## 4. Navbar structure and visual layout

### 4.1 Shared header frame

Navbar is a client component because it reads scroll MotionValues, uses shared menu state and handles client-side navigation.

The header is:
- fixed to the top edge, left and right 0;
- `z-50`;
- bordered and backdrop-blurred by 24px;
- animated with a 380ms transition over top, height, margin, border-radius, background, border and shadow;
- driven by `scrolled = scrollY > 24`.

| State | Small/mobile | Large desktop |
|---|---|---|
| At top | top 0, 60px high, full-width rectangle | 78px high, top 0 |
| Scrolled | top 0.5, side margin 2.5, 56px high, full pill | top 3, side margin 18, 68px high |

At rest the header uses elevated surface translucency and a subtle border. Scrolled state increases surface opacity and shadow; desktop uses its own lighter translucent surface/shadow treatment. The scroll state also:
- scales VKrLogo to 0.92 (origin-left);
- tightens navigation horizontal padding;
- preserves the logo's left alignment;
- changes the site-context grid to a compact row.

The site context uses a three-column desktop grid (`1fr auto 1fr`) so the section nav remains centered between the logo and right actions. Project context uses a normal flex row because it has no center nav.

### 4.2 Left, center and right regions

**Left:** VKrLogo link. Accessible name is “V Kr. home”, which contains the visible brand text. The click destination depends on context.

**Center:** DesktopNavigation only in site context. It is hidden below `lg`.

**Right:**
- social links, unless `hideSocialLinks` is true;
- divider only in site context;
- LabsAccountControl only when `showLabsAccount` is true;
- ThemeToggle always;
- Resume action only in site context and `lg` and above;
- HamburgerSVGButton only in site context, visible below `lg`.

Responsive social-link visibility differs by context:
- site context: `lg:flex`;
- project context: `sm:flex`, unless hidden by a caller such as LabsPageShell.

### 4.3 Desktop section navigation

DesktopNavigation iterates `portfolio.navigation` and selects:
- NavLink for entries without children;
- NavGroup for entries with children.

The parent labels use the active state from Navbar's `activeHref` and render `aria-current="page"` plus ActiveDot when selected. Links are 14px medium text, h-10 hit area, 16px horizontal padding, with a 220ms color/transform transition and 1px upward hover movement. Focus-visible uses a 2px brand ring and background offset.

NavGroup's child flyout:
- opens using CSS `group-hover` and `group-focus-within`, so pointer and keyboard focus can reach it;
- starts invisible, opacity 0, scale .98 and transitions over 180ms;
- panel is 240px wide with elevated translucent surface, border, blur and shadow;
- has the “Background” eyebrow;
- separators are inset borders on subsequent rows;
- child hover expands a small brand marker and shifts text 1px.

The group parent itself remains a link; the flyout items link to the configured child hashes.

### 4.4 Active section and anchor behavior

Navbar initializes `activeHref` from the current hash if that href exists in flattened navigation; otherwise it uses the first flattened entry's `activeHref`.

Only site context sets up active-section tracking:
- flattens parent/child navigation entries;
- maps hash hrefs to existing document elements;
- uses IntersectionObserver with root margin `-25% 0px -55% 0px`;
- thresholds: 0, .2, .4, .6, .8, 1;
- among intersecting entries, selects the section with the greatest intersection ratio;
- updates `activeHref`;
- disconnects the observer on cleanup.

Project context skips this observer because its page does not contain homepage section targets. Labs also uses project context, so it does not try to observe homepage sections.

For a hash destination, the scroll helper:
1. finds the target element;
2. measures the live header height (fallback 60px);
3. subtracts header height plus 16px from the target's document position;
4. updates the URL hash with `history.replaceState`;
5. uses `window.lenis.scrollTo(top,{force:true})` when Lenis exists;
6. otherwise uses native `window.scrollTo({behavior:"smooth"})`.

Only hash hrefs are intercepted as section jumps. Route destinations such as `/labs` follow normal Next navigation behavior. Navbar should not add its own scroll controller; it delegates to the route's existing Lenis/native policy.

## 5. Mobile menu — overlay and interaction contract

The full-screen menu is not rendered as a separate route. Navbar owns its presence with `AnimatePresence mode="wait"` and `MobileMenuProvider` supplies `mobileMenuOpen/toggleMobileMenu/closeMobileMenu`.

### 5.1 Overlay layout

- fixed inset 0, `z-[100]`, `lg:hidden`, background token;
- `role="dialog"`, `aria-modal="true"`, accessible label “Navigation menu”;
- 72px top row with V Kr. logo and close button;
- vertically centered navigation content with responsive horizontal gutters;
- large editorial link labels using `clamp(2.5rem, 7vw, 5rem)`;
- safe-area bottom padding for the Resume/social action footer.

The menu's initial/exit graph is opacity 0→1, y 10→0 and exit y 8, duration .32s using the shared `easeStandard`.

### 5.2 Menu entrance and nested groups

- main links rise from y20/opacity0 to rest; duration .38s;
- stagger base is .035s; first-link delay .08s;
- bottom action delay is calculated from the number of top-level links;
- nested submenu uses AnimatePresence with height 0→auto and opacity 0→1 over .3s;
- nested child labels enter x -8→0, opacity0→1, duration .28s with .035s stagger;
- chevron rotates 0↔180 over .3s.

For a group item, first tap expands it; tapping the same group again navigates to its parent href. Child links navigate directly. The top-level numbered marker is an editorial label, not an ordered-list state.

### 5.3 Scroll and focus ownership

When MobileMenu mounts:
- captures current `window.scrollY` and pathname;
- locks body overflow and position; sets top to the negative captured scroll position and width 100%;
- focuses the close button after 80ms;
- traps Tab/Shift+Tab within focusable elements;
- Escape closes the menu;
- the close button is the same HamburgerSVGButton rendered in open state.

On unmount:
- clears the focus timer;
- resets body overflow/position/top/width;
- restores captured scroll only if pathname is unchanged (it must not apply the old page's scroll offset to a destination route).

Navbar also listens for Escape while open and restores focus to the original hamburger after the menu closes. These cleanup paths are intentional and must be preserved. Route navigation is deferred until the exit animation finishes; hash navigation is then scheduled on the next animation frame and uses the shared section-scroll helper.

HamburgerSVGButton animates three SVG strokes into a close “X”: top/bottom lines rotate around the center, middle line fades/scales away. The button has a 40px default target, aria-label toggles Open/Close menu, aria-expanded and aria-controls, plus whileTap scale .92.

## 6. Footer structure and responsive layout

Footer is a client component mounted once by RootLayout. The root route content lives in a flex-1 sibling wrapper; Footer follows it as the final root layer.

Main Footer content:
1. absolute decorative atmosphere background;
2. centered content container, max-width 1280px;
3. top divider;
4. “STILL BUILDING.” closing headline;
5. conditional footer navigation plus social buttons;
6. Privacy Policy link;
7. metadata row separated by another divider;
8. 24-strip shutter layer above the background.

Responsive container:
- full width up to 1280px;
- gutters: px-6, sm:px-8, md:px-12, lg:px-20;
- vertical padding: py-7, sm:py-8, lg:py-10;
- closing line uses `clamp(3.25rem, 8vw, 8.5rem)`, max width 75% but full width at max-md;
- navigation/social row is stacked at small widths and becomes a horizontal row at md;
- footer navigation uses two columns on small widths and flex-wrap at md;
- metadata is one centered column, two columns at sm, and four columns at md.

### 6.1 Conditional footer content

- FooterNavigation is rendered only when `pathname === "/"`.
- On every other route with the footer visible, the nav/social row aligns social links to the right at md.
- FooterSocials comes from `portfolio.socialLinks`.
- Privacy Policy link is always in the normal Footer.
- FooterMeta is always in the normal Footer with current year, “BASED IN PATNA”, “NEXT.JS · MOTION · TAILWIND” and “END OF PAGE”.
- Footer returns null only for the five explicit Labs auth pathnames listed in Section 3.4.
- Route family does not otherwise suppress the Footer: public project, Labs, privacy, admin, 404 and route-error surfaces keep it through RootLayout.

### 6.2 Social buttons

FooterSocials renders only records with both an href and icon. Each FooterSocialButton:
- is a 40px circular button with border and translucent surface;
- has `aria-label` and title set from the social label;
- uses an external target with `noopener noreferrer` except `mailto:`;
- animates the original icon upward by 260% over 320ms;
- changes to the platform brand color on hover/focus (GitHub, LinkedIn, Email);
- moves an ArrowUpRight icon from below to center after an 80ms delay;
- supports focus-visible border/ring and prefers-reduced-motion transition suppression.

### 6.3 Metadata and footer links

FooterNavigation uses a 2-column mobile grid, then a flexible baseline-aligned row at md. Each link uses a mono uppercase 0.68rem label, 0.12em tracking and a brand underline that scales from 0 to full width on hover/focus. The Privacy Policy link uses a compact text style and focus outline.

FooterMeta animates from translate-y-3/opacity0 to rest using a 700ms CSS transition unless reduced motion is active. Its metadata grid changes from one centered column to two columns at sm, then four columns at md.

## 7. Footer motion and Vee interaction

### 7.1 Reveal gate

Footer observes its own section once using:
- `useInView(sectionRef, { once:true, amount:0.18, margin:"0px 0px -4% 0px" })`;
- `heroReady` from PageLoaderProvider.

`revealReady = heroReady && isInView`.

This ensures the footer does not animate while the page intro is still covering the content and does not start its entrance until the Footer is near the viewport. The `once` gate means the reveal does not replay on every scroll pass.

### 7.2 Atmosphere

FooterAtmosphere is decorative, aria-hidden and pointer-events-none:
- in resting/offscreen state it renders a static theme-specific atmosphere layer;
- after the reveal gate it renders the light or dark Motion background cycle;
- each cycle transitions through four CSS custom-property colors and returns to the first;
- duration is 20 seconds, easeInOut, repeating infinitely;
- reduced motion uses the static equivalent and does not start the color loop.

Light and dark colors are the `--atmosphere-light-a…d` and `--atmosphere-dark-a…d` tokens in globals.css. Keep them in the token layer; do not embed an independent palette inside Footer components.

### 7.3 Divider, closing line and navigation entrance

- Top divider begins scaleX0/opacity0 and reveals from left to right over .8s with [0.16,1,0.3,1].
- FooterClosingLine moves each line from y80px/opacity0 to y0/opacity1 over .9s. “STILL” delay .08s; “BUILDING.” delay .16s.
- The navigation/social row starts y8/opacity0, then moves to y0/opacity1 over .9s with .15s delay.
- FooterMeta uses its own 700ms translate/opacity transition.

The closing headline's secondary word is initially outlined using text stroke and a transparent fill. Hover/focus on its parent triggers a brand-color overlay that reveals through a clip-path wipe over .85s. The effect is not a navigation action.

### 7.4 Vee footer scan event

FooterOutlinedWord listens for the custom `vee-footer-scan-hit` event on the element marked `data-mascot-scan-target="footer-building"`.

When Vee emits the event:
- the brand fill becomes active;
- the highlight is held for 1450ms in normal motion mode;
- it then returns to outline unless hover/focus is still active;
- a later scan clears/restarts the pending timer;
- cleanup removes the event listener and timeout.

This is a cross-component browser event contract. Preserve the exact event name and target attribute when changing Vee's footer scan target or the Footer headline.

### 7.5 Shutter reveal

FooterShutter creates 24 full-width horizontal strips, each occupying one twenty-fourth of the Footer's height with a 1px overlap to avoid sub-pixel gaps. They start in place and slide out when `revealReady` becomes true:
- even indices slide left to -101%;
- odd indices slide right to +101%;
- duration .85s;
- each strip has an additional .035s index-based delay.

The overlay is pointer-events-none and aria-hidden. It is not rendered in reduced-motion mode. Do not mistake the strips for a vertical-column wipe.

## 8. Shared motion, theme and scroll contracts

- Navbar scroll styling reads Motion's `useScroll` value and subscribes with `useMotionValueEvent`; it does not create a second RAF loop or Lenis instance.
- Homepage anchor jumps use the existing Lenis instance when active and native smooth scrolling otherwise. The route policy in `scroll-policy.mjs` keeps /labs and /admin native-scroll.
- PageLoaderProvider clears stale overlay scroll locks on route changes and uses the correct controller-specific reset. MobileMenu must continue restoring its captured position only on same-route close.
- Navbar/ Footer surfaces use semantic tokens (surface, border, text, brand, atmosphere) so next-themes changes their colors. ThemeToggle is shared; Navbar and AuthFrame only host it.
- MotionProvider exposes the hydrated reduced-motion preference; Footer uses `useReducedMotion` and its own static background / no-shutter path. Keep entrance, background cycling and shutter disabled or immediate for reduced motion.
- Header and Footer use page-local z-index values (Navbar z-50, mobile overlay z-100, desktop nav flyout z-50, owner menu z-80, footer shutter z-30). This is the observed local layering, not a centralized global z-index scale.

## 9. Accessibility and failure/behavior preservation

- Keep the primary nav, mobile nav, footer nav, Privacy Policy link and all social links semantically labelled.
- Keep the hamburger's dynamic Open/Close label, expanded state and controls reference.
- Keep MobileMenu dialog semantics, keyboard focus trap, Escape action, focus restoration and body scroll cleanup.
- Keep desktop flyout keyboard reachable via focus-within, not hover-only.
- Keep focus-visible rings and text/underline cues; do not rely only on color for active navigation.
- Keep theme and reduced-motion behavior for every decorative animation.
- Keep the Footer Vee scan target attribute and event listener lifecycle synchronized.
- Ensure footer artwork remains pointer-events-none so it cannot block page interaction.
- Preserve the AuthFrame mini-footer when suppressing global Footer on Labs auth routes.

## 10. Change checklist

When changing Navbar/Footer:
- [ ] Confirm the page shell that owns Navbar; do not add a second global instance.
- [ ] Check `context`, `showLabsAccount` and `hideSocialLinks` callers.
- [ ] Confirm homepage section IDs match `navigationData` and footer hash links.
- [ ] Verify top/scrolled geometry at mobile, tablet and desktop sizes.
- [ ] Check active section state when scrolling both down and up.
- [ ] Verify project/Labs contexts never observe homepage section anchors.
- [ ] Check route navigation waits for mobile menu exit and does not restore stale scroll.
- [ ] Check keyboard group flyouts, nested menu expansion, focus trap and focus restoration.
- [ ] Check global Footer is absent on all five Labs auth routes and AuthFrame footer remains.
- [ ] Check footer section links are home-only while social/privacy/meta remain on other visible routes.
- [ ] Check footer is not accidentally removed from /labs, /admin, /privacy, project details or 404.
- [ ] Check first-visit intro/revisit path before testing Footer reveal timing.
- [ ] Check Footer atmosphere starts only after heroReady + in-view; reduced motion is static.
- [ ] Check scan event and 24-strip shutter still work.
- [ ] Check next-themes light/dark, keyboard focus and 200% zoom.

This source review describes code as found on the audited branch. It does not claim a browser screenshot, axe run, reduced-motion test, mobile QA or Vee scan interaction test was executed during this documentation update.
