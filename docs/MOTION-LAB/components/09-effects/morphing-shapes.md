# Morphing Shapes

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
An SVG shape that transitions among a finite set of compatible paths for a purposeful state/illustration change.

## Visual composition
Use a restrained SVG line/fill based on semantic brand or surface tokens. Keep stroke weight consistent and composition simple. No arbitrary multicolor organic blob backgrounds.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
Interpolate compatible path data only when path topology is suitable; otherwise crossfade between two SVGs. Transition 450–700 ms with Soft easing. Trigger only on state or user action; no random shape morph loop.

## Public API intent
state/variant, paths (validated compatible), duration, fill/stroke semantic tokens, disabled. Prefer named variants over arbitrary caller SVG strings.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
SVG has accessible title/description only when informative; otherwise aria-hidden. Reduced motion swaps path instantly. Accept when paths do not self-intersect, distort unpredictably or expose invalid geometry.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
