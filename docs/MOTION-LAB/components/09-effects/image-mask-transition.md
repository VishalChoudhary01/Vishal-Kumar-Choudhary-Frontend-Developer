# Image Mask Transition

**Status:** Spec locked · **Category:** Advanced visual effects

## Purpose
A transition between two real images using a deliberate clipping shape, suitable for a gallery slide or before/after presentation.

## Visual composition
Two images share the same frame and object-position policy. Use clean rectangular/curved mask geometry and an optional subtle divider. Do not add unrelated gradients or glow.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Effects are art-directed exceptions, not permission to invent a palette. The main content and function always outrank the visual effect.

## Motion choreography
On slide change, reveal the incoming image with a left-to-right or center-out clip over 450–650 ms; outgoing image remains until reveal finishes. User navigation interrupts or queues predictably. Reduced motion crossfades.

## Public API intent
items with id/src/alt, activeIndex, direction, onChange, duration, maskVariant, disabled. Stable keys required.
Document the API with JSDoc. Prefer named variants and safe bounds over arbitrary style strings or unbounded intensity props.

## Accessibility and responsive behavior
Expose current image label and controls; keyboard/touch navigation. Reduced motion crossfade or immediate. Accept when both image sizes are reserved, fast repeated changes don't corrupt state and alt text matches active image.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. SVG/canvas/filter complexity must be justified by the effect and profiled. Keep work local, bounded and pauseable. A static fallback is mandatory for every advanced effect.

## Acceptance criteria
- Visual effect has a clear purpose and stays subordinate to content.
- Motion has a trigger, bounded range, reset and reduced-motion fallback.
- No random palette, unbounded loop, layout shift or persistent rendering work.
- Keyboard/touch alternative and static fallback are usable.
- Performance is checked in a real browser/device before approval.
