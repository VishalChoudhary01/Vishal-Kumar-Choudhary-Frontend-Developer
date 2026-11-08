# Navigation Underline

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A subtle active/hover underline for inline or primary navigation links.

## Visual composition
Use normal link typography and spacing. Underline is 1–2 px, offset enough to avoid touching descenders, with semantic brand color. No animated full-width capsules or glow.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
On hover/focus, underline grows from the chosen edge or follows active route using shared layoutId over 160–220 ms. Active route persists after hover. The label itself stays still.

## Public API intent
items, activeHref, direction (left/right/center), onNavigate. Use anchor semantics and preserve Next Link conventions.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
Focus-visible receives underline and ring. Touch does not rely on hover; active route remains visible. Reduced motion renders underline immediately. Accept when underline does not move layout or obscure glyphs.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
