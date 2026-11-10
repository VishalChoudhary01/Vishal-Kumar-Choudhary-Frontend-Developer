# Noise Texture Motion

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A very subtle moving texture over a specific visual surface to prevent flat banding or support an art-directed scene.

## Visual composition
Texture must be nearly imperceptible and low contrast. Use existing local asset or supported SVG pattern; do not invent film-grain overlays over all UI. No noise on text or form fields.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
If motion is necessary, shift texture position a few pixels over a slow 6–10 s loop and pause when not visible. Prefer a static texture; do not animate filter turbulence per frame without measured need.

## Public API intent
enabled, intensity very low, speed, regionRef, disabled. Static asset/fallback required.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Reduced motion and low-power path are static. Texture is aria-hidden and pointer-transparent. Accept when it is not visible as a distracting pattern at normal zoom and does not degrade rendering.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
