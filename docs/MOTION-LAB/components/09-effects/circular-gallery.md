# Circular Gallery

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A radial arrangement of a small number of selectable images or items, intended for a focused art-directed feature.

## Visual composition
Use 5–9 items maximum, consistent thumbnails and a clear active center/card. Labels remain readable. Keep depth and shadows subtle; no spinning wheel metaphor or random color chips.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
On selection, rotate the ring by the shortest angular path and elevate active item with small scale/opacity change. Use a spring settle; no autoplay spin. Drag rotates only if it has an accessible alternative.

## Public API intent
items, activeIndex, onChange, radius, itemCount capped, disabled. Calculate positions from stable ordered data.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Provide previous/next buttons and keyboard navigation; reduced motion renders a flat grid/list or swaps active item. Accept when labels are not upside-down, small screens don't clip and circular order is preserved.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
