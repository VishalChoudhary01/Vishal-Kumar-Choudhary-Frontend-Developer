# 3d-image-gallery

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A spatial image browsing composition for a small curated set where depth helps reveal the collection.

## Visual composition
Use real images, consistent card sizes/aspect ratios and subdued surfaces. Perspective is moderate (800–1200 px); visible layers are limited. Avoid extreme cover-flow distortion and text on rotating faces.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
Active card remains nearly frontal; adjacent cards offset and rotate no more than 8–12 degrees. Selection changes spring to focus while others move to adjacent slots. Drag/keyboard selection is optional but must be deterministic.

## Public API intent
items with id/src/alt/title, activeIndex, onChange, orientation, perspective, disabled. Stable IDs required.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Provide visible previous/next controls, keyboard selection and reduced-motion flat carousel. Accept when perspective does not hide image content, tab order follows reading order and touch interaction is natural.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
