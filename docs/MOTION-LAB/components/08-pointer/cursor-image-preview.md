# Cursor Image Preview

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
An image preview that appears near the pointer while hovering a real item in a gallery or link list.

## Visual composition
Use a real image supplied by the item, stable aspect ratio, modest 4–8 px radius, semantic border and restrained shadow. Image should be cropped intentionally; no arbitrary overlay or caption unless item data provides it.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
Reveal image with opacity and scale 0.98→1 over 160–220 ms, follow pointer with a Soft spring and a bounded offset. Track only one current item; exit quickly. Position should flip near viewport/container edges.

## Public API intent
items with id/image/alt/label, activeId, containerRef, size, offset, disabled. No image search or generated placeholder inside component.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
Underlying item remains fully keyboard operable; focus shows a static inline preview or accessible text alternative. Disable on touch and reduced motion. Accept when image loads/errors gracefully and preview never covers important controls.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
