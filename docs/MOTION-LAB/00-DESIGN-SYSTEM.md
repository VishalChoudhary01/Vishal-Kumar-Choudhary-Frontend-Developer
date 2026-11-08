# Motion Lab — Locked Design System

**Status: LOCKED**  
This document governs every Motion Lab component. Individual specs may tune scale and choreography but may not silently redefine the visual system.

## 1. Design direction

Create an understated, premium toolkit suited to a considered SaaS product, developer tool or serious portfolio. The visual language is editorial and functional: warm neutral surfaces, deep petrol as the primary accent, controlled contrast, careful typography and measured depth.

The component must look trustworthy before it moves. The impression is precision, material quality and responsive feedback—not spectacle.

### Reject
- Neon rainbow, candy, purple-blue “AI” gradients or default multicolor glow.
- Glassmorphism on every surface, excessive blur, luminous outlines or large ambient halos.
- Random floating blobs, decorative dots, arbitrary grids or unrelated particles.
- Heavy black shadows, stacked shadows, glossy bevels and faux 3D depth.
- Excessive pill shapes, oversized radii, inflated whitespace and oversized controls.
- Bouncy movement as the default for business UI.
- Letter-by-letter animation on every heading, perpetual motion without user intent, or motion that delays reading.
- Emojis as interface icons, placeholder labels, lorem ipsum or fake functionality.

## 2. Existing project tokens are authoritative

Use the semantic variables in src/app/globals.css and their Tailwind v4 theme mapping. Do not make a parallel palette.

| Intent | Light | Dark | Tailwind |
|---|---|---|---|
| Page | #f7f4ee | #0b0f0c | bg-background |
| Surface 1 | #fbf9f5 | #111311 | bg-surface-1 |
| Surface 2 | #f1ece4 | #171917 | bg-surface-2 |
| Surface 3 | #e8e1d7 | #1d1f1d | bg-surface-3 |
| Elevated | #fffcf7 | #222421 | bg-surface-elevated |
| Primary text | #111413 | #f3f4ee | text-text-primary |
| Secondary text | #625e57 | #b9bdb3 | text-text-secondary |
| Tertiary text | #817d75 | #8e9489 | text-text-tertiary |
| Subtle border | #eeeae3 | #202320 | border-border-subtle |
| Border | #ded8cf | #2b2e2b | border-border |
| Strong border | #d3ccc1 | #383b38 | border-border-strong |

Brand is deep petrol: light #176b68; dark #69bdb9. Use bg-brand, text-brand, border-brand, bg-brand-soft, text-brand-contrast, hover:bg-brand-hover and active:bg-brand-pressed. Success, warning, error and info use their corresponding semantic tokens. Status color is meaningful state, not decoration.

All components support light and dark themes. Use semantic classes; never hard-code dark/light pairs when an existing semantic token adapts. Check text, border, focus and disabled contrast in both themes.

## 3. Typography

Existing project fonts are authoritative:
- **Manrope:** body copy, control labels, metadata and UI text.
- **Newsreader:** editorial display headings only, when the role justifies it.
- **Azeret Mono:** technical identifiers, compact metadata and purposeful numeric readouts.

| Role | Desktop | Mobile | Weight / line height |
|---|---:|---:|---|
| Display | 48–72 px | 36–48 px | regular; 0.95–1.05 |
| Section heading | 28–40 px | 24–32 px | 500–600; 1.1–1.2 |
| Component title | 18–24 px | 18–22 px | 600; 1.2–1.35 |
| Body | 14–16 px | 14–16 px | 400–500; 1.45–1.65 |
| Control label | 13–15 px | 13–15 px | 500–600; 1.2–1.4 |
| Metadata | 11–12 px | 11–12 px | 500; 1.3–1.5 |
| Technical label | 10–11 px | 10–11 px | mono, sparingly |

Keep labels short, concrete and sentence case. Uppercase mono is reserved for concise technical metadata. Avoid extreme tracking on normal text. Never animate text in a way that makes it hard to read or delays access to its content.

## 4. Spacing and geometry

Use Tailwind's 4 px increment scale.

| Intent | Value |
|---|---:|
| Hairline/icon gap | 4 px |
| Tight gap | 8 px |
| Compact gap | 12 px |
| Standard gap | 16 px |
| Comfortable gap | 20 px |
| Section gap | 24 px |
| Large section gap | 32 px |
| Layout gap | 40–48 px |
| Major separation | 64–80 px |

Use 8–16 px internal spacing for compact controls and 16–24 px for card content. Keep repeated gaps consistent. Align icon, label and control centerlines; do not fake vertical alignment with arbitrary translations. Reserve the final layout size before animation to avoid reflow.

## 5. Radius, border and surfaces

Existing radius tokens:
- 8 px: compact fields, small buttons and controls.
- 12 px: standard buttons, menus and compact cards.
- 16 px: primary cards and panels.
- 20 px: large feature surfaces only.
- 28 px: only genuinely large soft surfaces.

Prefer 8, 12 and 16 px. Pill geometry is reserved for status chips, toggles and controls whose shape requires it. Use 1 px semantic borders. Do not combine a bright border and bright glow on every edge. Surface contrast should establish hierarchy before shadow is added.

## 6. Shadows and elevation

Use existing semantic shadows:
- Small: 0 1px 2px, subtle separation.
- Medium: 0 8px 24px, menus and modestly floating surfaces.
- Large: 0 16px 48px, overlays or intentionally elevated surfaces only.

Normal cards should not need heavy shadows. Hover elevation is one step at most. Avoid colored shadows by default. A named light effect (Glow Button, Gradient Bloom) may use local brand-tinted emission at restrained opacity. Never animate a large blur or box-shadow every frame; animate a separate opacity layer instead.

## 7. Control sizing

| Control | Default | Compact | Large |
|---|---:|---:|---:|
| Text button height | 44 px | 36 px | 48 px |
| Icon button | 40 × 40 px | 32 × 32 px | 44 × 44 px |
| Input height | 44 px | 36 px | 48 px |
| Toggle track | 40 × 22 px | — | 44 × 24 px |
| Checkbox/radio | 18 × 18 px | 16 × 16 px | 20 × 20 px |
| Tooltip | content sized | — | max width 280 px |
| Card content padding | 20 px | 16 px | 24 px |

Interactive target is normally at least 44 × 44 px even when the visible icon is smaller. Keep the visual icon optical size; use hit-area padding to reach the target.

## 8. Iconography

Use the existing Lucide React / React Icons conventions after inspecting nearby components. Prefer 16, 18, 20 and 24 px icons with consistent stroke and optical alignment. Do not mix outline, filled, emoji and custom 3D icon styles in one family. Icons must clarify meaning.

## 9. Motion pacing

| Token | Duration | Use |
|---|---:|---|
| Instant | 80–120 ms | tiny state acknowledgement |
| Feedback | 120–180 ms | press, hover color, focus feedback |
| Control | 180–260 ms | tabs, toggles, menus |
| Reveal | 320–520 ms | cards, drawers, content entrance |
| Editorial | 550–850 ms | large typography or image reveal |
| Ambient | 2.4 s+ | purposeful loop or marquee only |

Easing presets:
- Standard: [0.22, 1, 0.36, 1] — general settle.
- Enter: [0.16, 1, 0.3, 1] — deliberate entrance.
- Exit: [0.4, 0, 1, 1] — controlled exit.
- Linear: [0, 0, 1, 1] — continuous progress only.
- Soft: [0.2, 0.8, 0.2, 1] — subtle transition.

Spring presets:

| Name | Stiffness | Damping | Mass | Use |
|---|---:|---:|---:|---|
| Snappy | 420 | 34 | 0.6 | compact controls and snapping |
| Balanced | 260 | 28 | 0.8 | general spatial interaction |
| Soft | 170 | 24 | 0.9 | restrained card movement |
| Magnetic | 180 | 22 | 0.35 | pointer attraction |
| Drag settle | 300 | 30 | 0.7 | drop and reorder settle |

Do not use a generic spring for everything. Use physics for attraction, drag, snapping and elastic controls; use timed easing for opacity, color and editorial reveals. No unbounded overshoot. If motion oscillates more than one restrained settle, increase damping or remove the spring.

## 10. Composition rules

- Prefer transform and opacity. Do not animate width, height, padding or margins every frame unless explicitly required.
- Use Motion layout animation for real layout changes and stable keys.
- For text masks, reserve the full text box before clipping the fill layer.
- Pointer input is local and bounded. A component must not cause horizontal page overflow.
- Expensive loops stop when off-screen; ambient motion has a purpose and reduced-motion fallback.
- Keep separate layers for content, highlight, elevation and mask.
- Do not stack unrelated movement effects.

## 11. Responsive rules

Design mobile first. Preserve an equivalent touch interaction; do not pretend touch has hover. Cursor-specific effects are disabled on coarse pointers. Clamp decorative geometry so it never creates horizontal overflow. Do not shrink control targets below 44 px to preserve a desktop composition. Reduce movement distance and complexity on narrow screens before shrinking text.

## 12. Production quality checklist

Inspect both themes, contrast, baseline alignment, wrapping, shadow stacking, radius consistency, clipping, focus rings, target sizes, pointer reset, touch, keyboard, disabled behavior, reduced motion, scroll performance, layout shift, hydration and narrow viewports. A component that only looks correct in one screenshot or only while hovered is not ready.
