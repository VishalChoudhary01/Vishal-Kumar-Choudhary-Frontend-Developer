# Cursor Spotlight

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A parent-level light layer that reveals an area around the pointer across multiple surfaces, distinct from the one-card Spotlight Card.

## Visual composition
The parent surface uses existing semantic tokens. The spotlight is broad, low opacity and may reveal subtle surface contrast; avoid bright flashlight effects or full-scene recoloring. Content remains above the layer.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
Track pointer position in the opted-in container and update a radial mask/gradient using MotionValues or CSS custom properties only if existing Tailwind setup allows. Fade in/out 140–200 ms. No heavy blur filter or React rerender per pointer event.

## Public API intent
enabled, containerRef, size (bounded), intensity low, disabled. Use one shared layer per region, not per child card.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
Disable on touch, keyboard-only and reduced motion. Keep pointer events transparent. Accept when the spotlight is clipped to its container, does not obscure focus and causes no page overflow.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
