# Magnetic Grid

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A grid of interactive items that respond to pointer proximity with slight bounded attraction, suitable for a small creative tile cluster.

## Visual composition
Items keep consistent grid geometry, semantic surfaces, readable content and standard radius. Only the hovered item or a very small local neighborhood responds. No full-grid jitter.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
Map pointer proximity to bounded 2–5 px translations using local MotionValues; falloff is smooth and distance-limited. Return to original positions on leave. No rotation and no layout reflow.

## Public API intent
items/renderItem, gap, strength low, radius, disabled. Keep item IDs stable; avoid per-cell global listeners if parent can share pointer data.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Disable on touch and reduced motion. Pointer interactions must not overlap neighboring targets or move hit areas unpredictably. Accept when grid remains aligned and no layout shift occurs.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
