# Animated SVG Line

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A stroke-drawing treatment that visualizes a path, connector, signature or process sequence.

## Visual composition
Use a 1–2 px SVG stroke with semantic text-secondary/brand. Line should have a real relationship to the diagram or content; no decorative scribbles for their own sake.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
Animate pathLength from 0 to 1 over 500–1000 ms with Enter/Soft easing. Multi-path sequence follows visual reading order with 60–100 ms stagger. Scroll trigger once or explicit play. Do not loop.

## Public API intent
path(s), trigger, duration, stagger, strokeWidth, once, disabled. Support arbitrary viewBox but preserve aspect ratio.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Provide non-animated path and text equivalent. Reduced motion renders complete stroke. Accept when line caps/joins are crisp at responsive sizes and path does not animate before its section is ready.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
