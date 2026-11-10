# Liquid Distortion

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A localized image/media displacement that simulates fluid movement for a special experimental preview.

## Visual composition
Use one real image or shape, a restrained displacement field and clearly bounded clipping. Keep content outside distortion layer crisp. No chrome, neon or random shader noise.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
Trigger a short displacement pass (300–600 ms) on hover/click; amplitude stays low and returns to zero. If implemented with SVG filters, keep filter region tight and avoid expensive full-viewport filters. No continuous simulation without explicit demo controls.

## Public API intent
src/alt, intensity low, trigger, duration, disabled. Feature-detect SVG filter support; static fallback always exists.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Reduced motion renders original media. Disable on coarse pointer if trigger is hover. Accept only after real-device/browser profiling and exact cleanup of animation/filter state.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
