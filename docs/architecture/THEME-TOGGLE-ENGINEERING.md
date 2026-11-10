# Theme Toggle Engineering — Page-Wide View Transition

**Status:** Current implementation documented against `feat/labs-platform-integration` and aligned with the uploaded locked working baseline.  
**Primary UI:** `src/app/components/ui/ThemeToggle.js`  
**Orchestration:** `src/app/hooks/useThemeToggle.js`  
**Theme state:** `src/app/providers/UIThemeProvider.js` (`next-themes`)  
**Global styles and semantic tokens:** `src/app/globals.css`  
**Mount point:** `src/app/components/layout/Navbar.js`  
**Theme interaction SFX:** `/mp3/chop.mp3`, through `useUiSound`.

This is the current engineering source for maintaining, recreating or extending the theme toggle. The uploaded document **THEME-TOGGLE-WORKING-IMPLEMENTATION-NOTES.md** is treated as the locked visual/behavioral baseline. Where its illustrative paths or component examples differ from this repository, this guide records the repository's actual implementation.

---

## 1. Non-negotiable visual contract

This is a native View Transition cover/reveal, not a generic fade across every component.

Default usage in the current Navbar:

```jsx
<ThemeToggle />
```

The component defaults to:

```jsx
variant = "rectangle"
start = "bottom-up"
```

### Light → Dark

- The browser captures an OLD light snapshot and a NEW dark snapshot.
- The incoming NEW dark root snapshot is the animated layer.
- It begins with the configured clip-path and expands to cover the entire page.
- With `bottom-up`, the dark cover begins at the bottom and grows upward.
- The OLD light snapshot remains static underneath.

### Dark → Light

- The OLD dark snapshot is the animated layer.
- It begins full-screen and retracts toward the same configured origin.
- The NEW light snapshot remains static underneath and is revealed as the old dark layer contracts.
- It must not become an instantaneous theme swap or a cross-fade.

### Ownership

| Concern | Owner |
|---|---|
| Actual theme state and `<html>` class | next-themes / UIThemeProvider |
| Toggle button and user action | ThemeToggle |
| Direction, variant, snapshot animation orchestration | useThemeToggle |
| Page-wide visual transition | Native View Transition API |
| Shape/mask animation | CSS injected by useThemeToggle |
| Light/dark component styling | CSS variables + Tailwind `dark:` variant |
| Moon/Sun icon swap | Motion inside ThemeToggle |
| Theme toggle click sound | useUiSound inside ThemeToggle |

Do not add a second theme state store or mutate `document.documentElement.classList` independently of next-themes.

## 2. Actual repository file map

| File | Current responsibility |
|---|---|
| `src/app/components/ui/ThemeToggle.js` | Accessible toggle button, Moon/Sun icons, button Motion, click sound, callback and hook wiring |
| `src/app/hooks/useThemeToggle.js` | next-themes state read, hydration state, reduced-motion/browser fallbacks, View Transition CSS injection, direction/origin attributes, `startViewTransition`, cleanup |
| `src/app/providers/UIThemeProvider.js` | next-themes provider configuration |
| `src/app/layout.js` | Root HTML/body, AppProviders, UIThemeProvider, Footer placement and hydration suppression |
| `src/app/components/layout/Navbar.js` | Mounts the shared `<ThemeToggle />` in the navigation |
| `src/app/globals.css` | Tailwind v4 dark variant, semantic light/dark tokens and global styling |
| `src/app/lib/motion/ease.js` | `EASE_OUT_CSS`, used by the blinds transition |
| `src/app/hooks/useUiSound.js` | Shared sound-effects playback hook used by the toggle |

### Important difference from the uploaded example

The uploaded notes show a standalone `ActionSwapIcon` in `components/motion/action-swap.jsx`, a `ThemeToggle.jsx` file, and Lucide Sun/Moon icons. The audited repository does **not** currently have that standalone icon component.

Current implementation:
- file extension is `.js`;
- icon swap is inline in `ThemeToggle.js`;
- icons are `IoIosSunny` and `IoMoon` from `react-icons`;
- button/icon Motion variants are also inline in `ThemeToggle.js`.

Do not create or import the example `ActionSwapIcon` file just because it appears in the uploaded notes. A future refactor may extract it, but that would be an implementation change, not a documentation correction.

## 3. Provider and root layout

### UIThemeProvider

Current file: `src/app/providers/UIThemeProvider.js`.

The provider config is:

```jsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange={false}
>
  {children}
</ThemeProvider>
```

Meaning:
- `attribute="class"`: next-themes owns the `light` / `dark` class on the root HTML element.
- `defaultTheme="system"`: initial selection follows the system preference unless the user has a stored selection.
- `enableSystem`: system preference resolution is enabled.
- `disableTransitionOnChange={false}`: keep this false for the View Transition implementation; do not let next-themes suppress the transition behavior as a competing toggle mode.

The hook reads `resolvedTheme` and calls `setTheme(next)`. There is no second theme mutation.

### Actual RootLayout nesting

Current `src/app/layout.js` structure:

```text
<html lang="en" suppressHydrationWarning className={font variables + h-full + antialiased}>
└── <body className="flex min-h-full flex-col bg-background">
    └── AppProviders
        ├── ActionToastProvider
        ├── MobileMenuProvider
        ├── MotionProvider
        ├── SmoothScroll
        └── PageLoaderProvider
            └── UIThemeProvider
                ├── <div className="flex-1">{children}</div>
                └── <Footer />
```

The theme provider is inside `AppProviders`, and it wraps both route content and the global Footer. The View Transition on the root therefore captures the page-level content, not just the Navbar.

The root HTML uses `suppressHydrationWarning` because next-themes may apply the client-selected theme class after the server HTML has been produced.

### Actual project fonts

The uploaded example's Geist font snippet is illustrative and is not the portfolio's current root setup. The repository uses:
- Newsreader → `--font-newsreader`;
- Manrope → `--font-manrope`;
- Azeret Mono → `--font-azeret-mono`.

Do not replace the actual fonts with Geist as part of a theme-toggle change.

## 4. ThemeToggle button implementation

Current file: `src/app/components/ui/ThemeToggle.js`.

The public component API is:

```jsx
<ThemeToggle
  variant="rectangle"
  start="bottom-up"
  className="..."
  iconClassName="..."
/>
```

It also accepts normal button props through `...rest`, and an explicit `onClick` callback is handled as `onClickProp`.

### Render and state

The component receives from `useThemeToggle`:
- `isDark`;
- `mounted`;
- `toggle`.

Before mount:
- it renders an empty `h-4 w-4` span;
- the icon is not rendered;
- `aria-pressed` is undefined;
- the label safely defaults to “Switch to dark mode”.

After mount:
- when current theme is dark, show the Sun icon (action: switch to light);
- when current theme is light, show the Moon icon (action: switch to dark);
- `aria-pressed` reflects the current dark state;
- `aria-label` describes the action, not just the current icon.

### Button interaction Motion

The button is a `motion.button`:
- hover scale: 1.05;
- tap scale: 0.92;
- spring: stiffness 500, damping 30, mass 0.5.

The icon swaps through `AnimatePresence` with `mode="wait"` and `initial={false}`.

For the incoming icon:
- opacity 0 → 1;
- scale 0.5 → 1;
- rotation begins at -90° when the next state is dark, or +90° when the next state is light, then returns to 0°.

For the outgoing icon:
- opacity 1 → 0;
- scale 1 → 0.5;
- rotation moves in the opposite direction.

Icon transition spring:
- stiffness 420;
- damping 24;
- mass 0.45.

This small icon animation is owned by Motion. It is independent of the page-wide clip/mask transition owned by the View Transition API.

### Focus and hover

The current toggle:
- has a circular 36px hit area (`h-9 w-9`);
- uses semantic neutral text colors with dark-mode variants;
- has hover background/text styling;
- has a visible focus ring in both themes;
- has a `transition-colors duration-300` utility for the button's own hover color.

That local button hover transition is not a second page-wide theme transition. Do not confuse it with global body/background `transition-colors`.

## 5. Theme toggle click sound

The current component also registers:

```js
const { play: playThemeToggleSound } = useUiSound(
  "/mp3/chop.mp3",
  {
    volume: 0.25,
    interrupt: true,
  },
);
```

Click handler order:

1. Call the optional consumer-provided `onClickProp(event)`.
2. If the event was `preventDefault()`-ed, stop; do not play sound or switch theme.
3. Call `playThemeToggleSound()` directly inside the user interaction.
4. Call the theme `toggle()`.

The audio is supplemental. A browser autoplay restriction, failed decode or playback error must not prevent the theme change. `useUiSound` owns the shared Web Audio context and decoded buffer; the ThemeToggle component owns the call timing and volume.

This is an active call site. The sound asset `public/mp3/chop.mp3` must not be classified as unassigned.

See [Sound Engineering](./SOUND-ENGINEERING.md) for the full shared audio lifecycle.

## 6. useThemeToggle hook — state and lifecycle

Current file: `src/app/hooks/useThemeToggle.js`.

### Inputs and defaults

```js
useThemeToggle({
  variant = "rectangle",
  start = "bottom-up",
})
```

It reads:
- `setTheme` and `resolvedTheme` from next-themes;
- `useReducedMotion()` from Motion;
- local `mounted` state for hydration-safe icon rendering.

The hook returns:

```js
{
  isDark,
  mounted,
  toggle,
}
```

`isDark` is calculated as `mounted && resolvedTheme === "dark"`. Before mount it remains false, avoiding a theme-dependent server/client icon mismatch.

### Injecting View Transition CSS once

The hook uses:

```js
const VT_STYLE_ID = "theme-toggle-view-transition";
```

On mount:
1. Check `document.getElementById(VT_STYLE_ID)`.
2. If the style element already exists, do nothing.
3. Otherwise create a `style` element.
4. Set its ID and `textContent = VT_CSS`.
5. Append it to `document.head`.

The injected stylesheet is page-global and intentionally remains available after an individual hook instance unmounts. It is not inserted once per click. Do not move the same CSS into multiple style nodes or append duplicates.

### Toggle orchestration

When the user activates the button:

1. Determine `next`: if current state is dark, target light; otherwise target dark.
2. Determine direction: `to-dark` or `to-light`.
3. Check reduced-motion and View Transition API support.
4. If reduced motion is active or `document.startViewTransition` is unavailable, call `setTheme(next)` directly and stop.
5. Resolve `document.documentElement`.
6. Set `data-theme-transition-direction`.
7. Set variant-specific attributes and CSS custom properties.
8. Call `document.startViewTransition(() => setTheme(next))`.
9. When the transition finishes (or rejects), remove temporary state and CSS properties.

The only theme mutation is `setTheme(next)` inside the View Transition update callback. Do not add a separate direct assignment to `html.className` or `classList`.

### Synchronous error fallback

If calling `document.startViewTransition` throws synchronously:
- call `setTheme(next)` directly;
- call `cleanupTransitionState(root)`;
- return without leaving transition attributes/styles behind.

### Finished promise cleanup

The hook observes `transition.finished`:
- rejection is caught;
- `finally` always calls `cleanupTransitionState(root)`.

The cleanup removes:
- `data-theme-transition`;
- `data-theme-transition-direction`;
- `--theme-transition-from`;
- `--theme-transition-origin`;
- `--theme-transition-slat`.

This cleanup is required so one transition's origin/variant cannot leak into the next toggle.

## 7. Temporary DOM contract between JavaScript and CSS

The hook communicates temporary state through the root HTML element.

Example dark entry:

```html
<html
  data-theme-transition="rect"
  data-theme-transition-direction="to-dark"
  style="--theme-transition-from: inset(100% 0 0 0)"
>
```

Example light return:

```html
<html
  data-theme-transition="rect"
  data-theme-transition-direction="to-light"
  style="--theme-transition-from: inset(100% 0 0 0)"
>
```

These attributes/properties exist only during the native View Transition. They are a temporary CSS contract, not persisted theme state.

### Base snapshot styling

The injected CSS:
- targets `::view-transition-image-pair(root)` while transition data exists;
- sets image-pair isolation to `auto`;
- sets both old and new root snapshots to `mix-blend-mode: normal`.

The current repository additionally sets explicit z-index values:
- static snapshot: z-index 0;
- animated snapshot: z-index 1.

This explicit layer order is present in the actual hook and should be preserved. It is more specific than the uploaded notes' simplified examples.

## 8. Transition variants and exact contracts

The hook currently implements four variants:

- `rectangle` (stored as data value `rect`);
- `circle`;
- `circle-blur`;
- `blinds`.

The default is rectangle. The component does not render a variant picker; the variant is a prop/API choice.

### 8.1 Rectangle

Dark entry:
- OLD light root snapshot: no animation, z-index 0.
- NEW dark root snapshot: z-index 1, runs `theme-rect-reveal`.
- Duration: 400ms.
- Easing: `ease-out`.
- From: `var(--theme-transition-from)`.
- To: `inset(0 0 0 0)`.

Light return:
- NEW light root snapshot: no animation, z-index 0.
- OLD dark root snapshot: z-index 1, runs `theme-rect-reverse`.
- Duration: 400ms.
- Easing: `ease-out`.
- From: full `inset(0 0 0 0)`.
- To: the same `--theme-transition-from` configured origin.

Rectangle origin map:

| start | `--theme-transition-from` |
|---|---|
| top-left | `inset(0 100% 100% 0)` |
| top-right | `inset(0 0 100% 100%)` |
| bottom-left | `inset(100% 100% 0 0)` |
| bottom-right | `inset(100% 0 0 100%)` |
| center | `inset(50% 50% 50% 50%)` |
| bottom-up | `inset(100% 0 0 0)` |

The `bottom-up` rectangle begins as a strip/cover clipped to the bottom region and reveals upward until the full incoming dark snapshot is visible. The same origin is the retract target when returning to light.

### 8.2 Circle

Dark entry animates NEW root:
- `clip-path: circle(0% at origin)` → `circle(150% at origin)`;
- duration 700ms;
- easing `cubic-bezier(0.4, 0, 0.2, 1)`.

Light return animates OLD root in reverse:
- `circle(150% at origin)` → `circle(0% at origin)`;
- same duration/easing.

Circle origin map:

| start | `--theme-transition-origin` |
|---|---|
| top-left | `0% 0%` |
| top-right | `100% 0%` |
| bottom-left | `0% 100%` |
| bottom-right | `100% 100%` |
| center | `50% 50%` |
| bottom-up | `50% 100%` |

### 8.3 Circle blur

This has the same NEW-on-entry / OLD-on-return snapshot rule and origin map as circle.

Dark entry:
- radius: 0% → 150%;
- filter: blur(8px) → blur(0);
- duration 700ms;
- easing `cubic-bezier(0.4, 0, 0.2, 1)`.

Light return reverses both the clip radius and blur. The blur belongs to the animated snapshot, not the live page components.

### 8.4 Blinds

The hook registers an animatable custom property:

```css
@property --theme-transition-slat {
  syntax: "<length>";
  inherits: false;
  initial-value: 72px;
}
```

The mask:
- uses a 90-degree linear gradient;
- uses the custom slat length and a 20px transparent gap;
- repeats horizontally;
- has mask size 72px 100%.

Dark entry:
- animate NEW root from slat -20px → 72px;
- duration 700ms;
- easing `EASE_OUT_CSS`.

Light return:
- animate OLD root from slat 72px → -20px;
- same duration/easing.

`EASE_OUT_CSS` is imported from `src/app/lib/motion/ease.js` and currently resolves to `cubic-bezier(0.16, 1, 0.3, 1)`.

The `start` prop does not position blinds; the current blinds mask uses the repeated slat pattern.

## 9. Snapshot direction — the rule that prevents the reverse animation bug

The browser creates an OLD and NEW root snapshot around the update callback.

| Theme direction | OLD snapshot | NEW snapshot | Animated snapshot |
|---|---|---|---|
| Light → Dark | Light | Dark | NEW |
| Dark → Light | Dark | Light | OLD |

Every variant must preserve this direction contract. If light return animates NEW instead of OLD, the dark layer will not visibly retract as specified.

## 10. Reduced motion and unsupported browser fallback

The hook uses Motion's `useReducedMotion()`.

If reduced motion is enabled:
- do not call `document.startViewTransition`;
- call `setTheme(next)` directly;
- preserve full theme functionality without the custom page-wide clip/mask animation.

If `document.startViewTransition` is unavailable:
- call `setTheme(next)` directly;
- rely on next-themes and the root `dark` class;
- do not break the button or other page interactions.

The injected CSS also has a `prefers-reduced-motion: reduce` rule that removes root snapshot animations if a transition is otherwise present.

## 11. Tailwind v4 and semantic theme styling

Current `src/app/globals.css` uses:

```css
@import "tailwindcss" source(none);
@source "../../src/app";
@custom-variant dark (&:where(.dark, .dark *));
```

The dark variant responds to the `.dark` class applied by next-themes.

The current app does not use the uploaded example's minimal white/black token set. It has a semantic token system:
- light values in `:root`;
- dark overrides under `html.dark`;
- semantic Tailwind mappings inside `@theme inline`.

Prefer tokens such as:
- `bg-background`;
- `text-text-primary`;
- `bg-surface-elevated`;
- `border-border`;
- `text-brand`.

Do not add parallel theme state checks to individual components just to select static colors. Use the `dark:` variant or semantic token.

### Theme transition tokens in globals.css

The current global stylesheet also declares:
- `--theme-transition-duration: 520ms`;
- `--theme-transition-easing: cubic-bezier(0.22, 1, 0.36, 1)`;
- `--theme-reveal-radius`;
- `--theme-origin-x`;
- `--theme-origin-y`.

The active View Transition CSS in `useThemeToggle.js` currently uses explicit per-variant durations/easings and `--theme-transition-from/origin/slat`. Do not assume the global 520ms token controls the current rectangle/circle/blinds animations; it is not interpolated into the hook's injected CSS today.

## 12. Avoid competing theme animation

The root visual transition is owned by the View Transition API. Do not add:
- global `body { transition: background-color ... }` for the same theme change;
- page-wide background `transition-colors` utilities that produce a second full-page color sweep;
- a second custom full-screen overlay;
- Motion animation of every page section's background/text on theme changes.

Allowed:
- the ThemeToggle button's local hover color transition;
- Moon/Sun icon Motion;
- unrelated hover/focus/interaction transitions;
- ordinary component state animations unrelated to theme changes.

The Hero and Navbar should adopt the new semantic tokens through the root class/snapshot, not run another competing full-page theme animation.

## 13. Accessibility and hydration

Preserve:
- `"use client"` in ThemeToggle and the hook;
- `mounted` state set in an effect;
- empty placeholder before the theme is resolved;
- descriptive action-oriented `aria-label`;
- `aria-pressed` once mounted;
- keyboard activation through a native button;
- visible `focus-visible` ring in both themes;
- root `suppressHydrationWarning`;
- reduced-motion fallback.

Do not replace the native button with a clickable div or remove the action label.

## 14. Failure and cleanup matrix

| Failure / condition | Expected current behavior |
|---|---|
| First render before mount | Placeholder; no theme-dependent icon flash |
| Reduced motion enabled | Direct next-themes update, no custom View Transition |
| Browser lacks View Transition API | Direct next-themes update |
| `startViewTransition` throws synchronously | Direct theme update; cleanup temporary state |
| `transition.finished` rejects | Rejection swallowed; cleanup still runs |
| CSS animation not found | Theme state still changes; visual effect may be absent |
| Theme toggle sound blocked | Theme switch continues |
| Consumer `onClick` calls preventDefault | No sound and no theme change |
| User toggles repeatedly | Each completed transition removes its temporary attributes/properties before next use |

## 15. Safe edit guide for human developers and coding agents

### A. Change the default transition

Change the defaults in `ThemeToggle.js` / `useThemeToggle.js` only when the product decision changes. The current default is rectangle + bottom-up. Do not update one default while leaving docs or tests expecting another.

### B. Change rectangle origin

1. Confirm the requested origin is one of the supported keys.
2. Update `RECT_FROM` if a genuinely new origin is approved.
3. Keep the same CSS custom property contract `--theme-transition-from`.
4. Verify both reveal and reverse use the same origin.
5. Test both light→dark and dark→light.

### C. Add a transition variant

1. Define exact direction behavior for OLD and NEW snapshots.
2. Add CSS for both `to-dark` and `to-light`.
3. Set the static snapshot z-index 0 and animated snapshot z-index 1.
4. Define any custom property and initial value.
5. Add variant setup in `useThemeToggle.toggle()`.
6. Add cleanup for every new temporary attribute/custom property.
7. Add reduced-motion CSS and direct fallback behavior.
8. Add the variant to the documentation and acceptance checks.
9. Never implement only one direction.

### D. Change icon animation

The current icon is inline in `ThemeToggle.js`. Update the AnimatePresence/Motion values there. If extracting an ActionSwapIcon component, treat it as an explicit refactor:
- keep its API stable;
- avoid changing button state ownership;
- keep page-wide transition in `useThemeToggle`;
- update the file map and this document after the refactor.

### E. Change or remove the theme sound

- Current asset: `/mp3/chop.mp3`.
- Current volume: 0.25.
- Current policy: interrupt prior voice for the same hook instance.
- Preserve the onClick callback / preventDefault ordering.
- Sound failure must never block `toggle()`.
- Update Sound Engineering's active asset/callsite table when changing it.

### F. Change theme tokens

Update `globals.css` semantic light and dark values. Do not duplicate the theme state inside React components. Run contrast, focus, responsive and screenshot checks in both modes.

## 16. Debugging sequence

When the theme switch does not animate, inspect:

1. Is UIThemeProvider mounted around the route and Footer?
2. Does next-themes change the root HTML class to `light` or `dark`?
3. Has the hook mounted and injected `#theme-toggle-view-transition`?
4. Does the browser expose `document.startViewTransition`?
5. Is reduced motion enabled?
6. Does the root temporarily receive `data-theme-transition`?
7. Is direction `to-dark` or `to-light`?
8. Is the expected shape/origin custom property set?
9. Is the correct snapshot selected (NEW for dark entry; OLD for light return)?
10. Is the static/animated snapshot z-index ordered correctly?
11. Does the final root class remain correct?
12. Are temporary attributes and CSS variables removed?
13. Does direct fallback still switch the theme when animation is unavailable?

### Common direction mistakes

- Dark entry: animate `::view-transition-new(root)`.
- Light return: animate `::view-transition-old(root)`.
- Do not animate both snapshots simultaneously.
- Do not add a descendant space before the view-transition pseudo-element selector.

## 17. Manual acceptance checklist

### Theme state and hydration
- [ ] Provider applies the correct class for light, dark and system.
- [ ] No hydration warning is introduced.
- [ ] Toggle placeholder is stable before mount.
- [ ] `aria-label` describes the next action.
- [ ] `aria-pressed` reflects the current state.
- [ ] Keyboard activation works.
- [ ] Focus ring is visible in both themes.

### Rectangle default
- [ ] Light → Dark: incoming dark snapshot grows from bottom-up.
- [ ] Dark → Light: outgoing dark snapshot retracts to bottom.
- [ ] Repeat both directions at least twice.
- [ ] No generic cross-fade replaces the cover/reveal.

### Other variants
- [ ] Circle works in both directions and all six origins.
- [ ] Circle-blur works in both directions and all six origins.
- [ ] Blinds works in both directions.
- [ ] Unsupported variant does not get treated as a supported design.

### Fallback and cleanup
- [ ] Reduced-motion mode changes theme without custom transition.
- [ ] Browser without View Transition API still changes theme.
- [ ] Synchronous start error still changes theme and cleans temporary state.
- [ ] Finished/rejected transition always cleans attributes and properties.
- [ ] Repeated toggles do not preserve stale origins or directions.

### Theme styling and sound
- [ ] Navbar, homepage, project detail, Labs and Footer respond to the root theme class where mounted.
- [ ] Both semantic token sets are readable.
- [ ] No competing global background transition exists.
- [ ] Theme click sound plays on eligible user activation.
- [ ] Sound blocked/failing does not prevent theme switch.
- [ ] Consumer `onClick` preventDefault prevents both sound and theme change.

## 18. Current implementation gaps / review notes

These are observations, not changes made by this documentation task:

1. The hook does not validate `variant` or `start` against known values. An unknown variant can reach the generic branch but have no matching CSS selector. Keep callers to the documented supported values; consider runtime validation only in a separate implementation task.
2. Rectangle origin lookup assumes a valid key. An invalid `start` can produce an invalid CSS custom-property value and fall back to the reveal keyframe's default.
3. The injected style element is intentionally retained in document.head for page lifetime; there is no hook-unmount removal.
4. The global CSS transition-duration token is 520ms, while actual shape keyframes use explicit 400ms/700ms values.
5. The uploaded document's proposed separate ActionSwapIcon is not currently present in the repository.
6. Current ThemeToggle sound was not called out in the uploaded notes, but is implemented in the actual component and is documented here.
7. Native View Transition visual behavior still requires browser verification in the target Chromium/WebKit/Firefox versions; source presence alone is not proof of identical rendering across engines.

## 19. Source-of-truth rules

1. Uploaded `THEME-TOGGLE-WORKING-IMPLEMENTATION-NOTES.md` provides the locked intended cover/reveal behavior and design rationale.
2. Current `ThemeToggle.js`, `useThemeToggle.js`, `UIThemeProvider.js`, `layout.js` and `globals.css` define the actual repository implementation.
3. This document reconciles the intended behavior with the actual file paths and current code differences.
4. Theme state belongs to next-themes. Do not create a parallel theme store.
5. Page-wide motion belongs to the native View Transition. Do not add a second page-wide animation.
6. Motion owns only the button/icon micro-interactions.
7. Sound remains optional and must not gate the theme action.
8. Update this document, Sound Engineering and Layout/Token docs together whenever the theme system changes.
