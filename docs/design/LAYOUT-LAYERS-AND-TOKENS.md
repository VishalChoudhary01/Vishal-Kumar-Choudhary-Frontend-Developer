# Design Tokens and Layout Layers — Current Implementation

**Sources:** src/app/layout.js, src/app/globals.css, Tailwind CSS v4 via postcss.config.mjs.
**Status:** Current code-owned visual system, not a CMS theme editor.

## 1. Root document and font loading

RootLayout loads fonts through next/font/google:
- Newsreader, variable --font-newsreader, Latin, weight 400 → display/editorial typography.
- Manrope, variable --font-manrope, Latin, weights 400/500/600 → body/UI text.
- Azeret Mono, variable --font-azeret-mono, Latin, weights 400/500 → mono labels/technical metadata.

Root HTML includes these CSS variables, h-full and antialiased. The theme provider wraps the app; AppProviders owns UI providers and global scrolling. Footer is rendered in RootLayout and is shared across routes except the explicit Labs-auth pathname suppression. Navbar is not mounted in RootLayout: HomePage, ProjectPageView and LabsPageShell insert it with different context/feature props. The route matrix and detailed component contracts live in [Navbar and Footer Engineering](../pages/NAVBAR-AND-FOOTER-ENGINEERING.md).

The root body is flex min-h-full, background token and flex-col. A flex-1 wrapper around route children allows Footer to remain at the end of short pages.

The root also renders:
- metadataBase from buildSiteUrl;
- site title/description;
- manifest;
- theme-aware favicon link/script;
- pre-paint revisit marker script that reads sessionStorage and sets html[data-intro-seen] before first paint.

The inline revisit script is intentionally in the HTML head so returning visitors do not see a stale intro overlay before hydration. Do not move that logic into a post-hydration effect without reintroducing the flash.

## 2. Tailwind CSS v4 scanning

globals.css begins:
- @import tailwindcss source(none)
- explicit @source ../../src/app
- @custom-variant dark (&:where(.dark, .dark *))

This restricts Tailwind automatic class detection to app source; scanning stale Next build chunks previously created malformed utility strings. Keep the explicit source boundary unless the repository structure changes and the impact is tested.

PostCSS uses @tailwindcss/postcss. No standalone tailwind.config.js exists in the current branch tree; tokens are exposed through globals.css @theme inline and CSS custom properties.

## 3. Semantic token contract — light theme

### Surfaces

| Token | Value |
|---|---|
| background | #f7f4ee |
| foreground | #1c1b19 |
| surface-1 | #fbf9f5 |
| surface-2 | #f1ece4 |
| surface-3 | #e8e1d7 |
| surface-elevated | #fffcf7 |
| surface-inset | #ece7de |
| surface-overlay | rgb(28 27 25 / 55%) |

### Text

| Token | Value |
|---|---|
| text-primary | #111413 |
| text-secondary | #625e57 |
| text-tertiary | #817d75 |
| text-muted | #726c61 |
| text-disabled | #bdb7ae |
| text-inverse | #f1f0eb |

### Borders and brand

| Token | Value |
|---|---|
| border-subtle | #eeeae3 |
| border | #ded8cf |
| border-strong | #d3ccc1 |
| brand | #176b68 |
| brand-hover | #0f5b58 |
| brand-pressed | #124f4d |
| brand-soft | #dceceb |
| brand-muted | #c4dfdd |
| brand-contrast | #ffffff |

### Status/focus

- Success: #177452; hover #125c41; soft #eaf7f1.
- Warning: #8a6115; hover #6f4e10; soft #fbf3e1.
- Error: #a33e38; hover #87332e; soft #fbecea.
- Info: #35627f; hover #2b5068; soft #ebf3fa.
- Focus ring aliases brand.

### Shape and shadow

- radius-sm 8px; md 12px; lg 16px; xl 20px; 2xl 28px.
- shadows: 0 1px 2px at 4% dark, 0 8px 24px at 8%, 0 16px 48px at 12%.

### Typography

- --font-display → Newsreader.
- --font-body → Manrope.
- --font-mono → Azeret Mono.

### Theme transition

- duration 520ms.
- easing cubic-bezier(0.22, 1, 0.36, 1).
- theme reveal/origin variables are custom-property hooks used by theme transition UI. Keep theme reveal owned by the shared ThemeToggle/provider, not by individual pages.

## 4. Dark theme semantic overrides

The .dark class overrides semantic tokens in globals.css:

### Surfaces
- background #0b0f0c; foreground #f3f4ee.
- surface-1 #111311; surface-2 #171917; surface-3 #1d1f1d.
- surface-elevated #222421; surface-inset #0e100f.
- surface-overlay rgb(0 0 0 / 62%).

### Text
- primary #f3f4ee; secondary #b9bdb3; tertiary #8e9489.
- muted #7d8479; disabled #4a5148; inverse #171a16.

### Borders and brand
- border-subtle #202320; border #2b2e2b; border-strong #383b38.
- brand #69bdb9; hover #7ad0cc; pressed #55b3af.
- brand-soft #173332; brand-muted #2a4b49; contrast #0b0f0c.

### Status
- success #63d3a5; warning #ebc66a; error #f08a83; info #81bee0.
- Each has a semantic hover/soft/contrast variant in globals.css.

Use semantic Tailwind utilities such as bg-background, text-text-primary, border-border, bg-surface-1, text-brand, bg-brand-soft. Do not hardcode a separate dark:* color when the semantic token already responds to theme.

## 5. Stable primitive palettes

globals.css @theme inline exposes the stable Petrol and Warm Stone primitive shades. They are intentional fixed shades and do not switch with theme:
- Petrol 50–950: #edf8f7, #dceceb, #c4dfdd, #9fcac7, #69bdb9, #3f9e9a, #176b68, #0f5b58, #124f4d, #173332, #102523.
- Stone 50–950: #fbf9f5, #f7f4ee, #f1ece4, #e8e1d7, #ded8cf, #d3ccc1, #b6afa5, #938d83, #817d75, #625e57, #1c1b19.

Prefer semantic colors for page UI; use primitive classes only where a fixed shade is intentional (e.g. branded artwork/illustration).

## 6. Root visual and interaction layers

    html
    ├── pre-paint favicon/revisit scripts
    └── body (flex column, min-height)
        └── AppProviders
            ├── ActionToastProvider
            ├── MobileMenuProvider
            ├── MotionProvider
            ├── SmoothScroll
            └── PageLoaderProvider
                └── UIThemeProvider
                    ├── flex-1 route content (page shells insert Navbar where appropriate)
                    └── global Footer (except five Labs auth pathnames)

This exact nesting matters:
- ActionToastProvider makes action feedback available across pages.
- MobileMenuProvider shares menu open/close state across navbar and menu.
- MotionProvider is the shared Motion boundary.
- SmoothScroll owns Lenis/native route switching.
- PageLoaderProvider owns intro state and route scroll reset.
- UIThemeProvider owns theme context.
- Footer is root-layout-global, but suppresses itself on the five explicit Labs auth pathnames. Navbar is supplied by page shells, not the root layout. Home, project, Labs, auth, privacy, admin, not-found and global-error distinctions are documented in pages/NAVBAR-AND-FOOTER-ENGINEERING.md.

Individual pages create their own stacking contexts. Use each page/component's local z-index in context; this document deliberately does not invent a global numeric z-index scale where none is centralized.

## 7. Common section layout pattern

The main editorial sections generally use:
- full-width relative section with bg-background;
- horizontal gutters around 20–24px mobile, 32px small tablet and 40–48px desktop;
- max-width approximately 1280px / max-w-7xl;
- desktop grid with 180px section label rail and flexible content column;
- one-column layout at smaller widths;
- generous vertical spacing which increases toward desktop.

This is a pattern, not a utility that every section must duplicate. Education/hero/contact/projects have intentional variants documented in HOME-PAGE-ENGINEERING.md.

## 8. Global CSS behaviors

- box-sizing border-box globally.
- html/body min-height 100%.
- body background/color/font use semantic theme variables.
- html scroll-padding-top: 94px for fixed header/hash target offset.
- CSS scroll-behavior is not set because Lenis owns smooth scroll and double-smoothing programmatic jumps is incorrect.
- scrollbar is thin, theme-aware and uses border/brand tokens; WebKit size 8×8, 2px transparent border, rounded.
- intro overlay is hidden before first paint for revisit if html[data-intro-seen] exists.
- .logo-solid::before paints the solid VKrLogo overlay so one semantic text node supplies the accessible name.

## 9. Recreation and QA constraints

- Load local next/font variables; do not rely on late client Google Fonts requests.
- Preserve semantic token usage in both themes.
- Validate both themes with actual contrast checks after visual changes.
- Keep Tailwind scan source limited to app source.
- Do not add scroll-behavior:smooth while Lenis is active.
- Keep scroll-padding-top aligned with actual fixed navbar geometry.
- Verify focus ring in both themes and on all interactive card/button states.
- Test 320/375/768/1024/1440 CSS viewport widths and 200% browser zoom.
- Verify intro marker before first paint for revisits; new users must still see the intro.


## 10. Theme Toggle and page-wide transition ownership

The root UIThemeProvider is the source of the document's light/dark class. The theme button and native View Transition orchestration are documented in [../architecture/THEME-TOGGLE-ENGINEERING.md](../architecture/THEME-TOGGLE-ENGINEERING.md).

Key boundary:
- next-themes owns resolved theme and the `html.light/html.dark` class;
- View Transition API captures and animates the page-wide OLD/NEW root snapshots;
- `useThemeToggle.js` supplies direction/origin attributes and transition CSS;
- Motion handles only the local Moon/Sun icon and button feedback;
- Tailwind semantic tokens style the final light/dark page;
- the toggle's click sound is a separate optional `useUiSound` action documented in [../architecture/SOUND-ENGINEERING.md](../architecture/SOUND-ENGINEERING.md).

Do not add a global background-color fade or a second full-screen overlay. The current hook has explicit shape durations (rectangle 400ms; circle, circle-blur and blinds 700ms); the global `--theme-transition-duration: 520ms` token does not currently control those keyframes.

## 11. Navbar and Footer composition boundary

The root layout mounts only the shared Footer; it does not mount a global Navbar. The Navbar is supplied by HomePage, ProjectPageView and LabsPageShell:
- homepage uses the full site context with section links, desktop navigation, mobile full-screen menu, social links and Resume;
- project detail uses project context with logo-to-home, ThemeToggle and social links, but no homepage section nav, hamburger or Resume;
- public Labs reuses project context, suppresses social links and adds the Labs account control;
- Labs auth uses AuthFrame's own header/footer and suppresses the root Footer;
- Privacy, Admin, not-found and ordinary route error content do not insert the portfolio Navbar. The root Footer remains unless the pathname is one of the five Labs auth exclusions; global-error replaces the root layout and therefore has no shared Footer.

For the complete path-condition table, DOM composition and Motion details, use [Navbar and Footer Engineering](../pages/NAVBAR-AND-FOOTER-ENGINEERING.md). Do not turn the local AuthFrame or LabsOwnerNavigation into aliases for the portfolio Navbar/Footer.
