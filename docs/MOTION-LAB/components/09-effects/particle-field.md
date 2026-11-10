# Particle Field

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A pointer-reactive or ambient field of a small number of particles for a creative coding demonstration, not a general page background.

## Visual composition
Particles use one muted accent and restrained opacity/size variation within a contained canvas/SVG. Keep particle count low (default 24, cap 60 DOM elements) and avoid starfield/neon/cosmic visuals.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
Particles drift slowly only when the demo is active/visible. Pointer repulsion/attraction is local and bounded; smooth with MotionValues/RAF rather than React rerenders. Pause off-screen and on hidden document. No unbounded random reset.

## Public API intent
count, seed, interaction (none/attract/repel), speed low, regionRef, enabled, disabled. Deterministic seed for stable preview.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Provide static fallback for reduced motion; disable interaction and continuous drift. Respect device/performance budget. Accept only after profiling; no hydration randomness, memory growth or page-level pointer capture.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
