# Gradient Bloom

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A soft, contained field of brand-tinted light that adds depth to a focused surface or hero artwork.

## Visual composition
Use a single radial bloom with one or two neighboring semantic brand tones and low opacity. The surrounding surface remains readable and neutral. No rainbow, purple/blue gradient, multiple blobs or full-screen haze.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
Bloom appears by opacity and modest scale (0.96→1) over 500–750 ms when the section enters or pointer enters. If pointer-responsive, shift center only within the container. It should settle and stop; no perpetual breathing by default.

## Public API intent
active, trigger, intensity low, size, containerRef, disabled. Color must resolve from semantic theme tokens.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Use static background under reduced motion. Keep it behind content and pointer-transparent. Accept when brand tint is subtle in both themes, text contrast is unchanged and no blur-heavy animation runs.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
