# Cursor Label

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A small contextual label that follows the pointer over a specific interactive object, such as “View”, “Drag” or “Open”.

## Visual composition
Use a compact surface or plain text label with 10–12 px Manrope/mono only where meaningful. Label is secondary, high contrast and width constrained. No huge cursor badge or gradient pill.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
Show on hover after 80–120 ms, follow pointer with small 8–12 px offset and Soft spring, then fade/scale subtly over 120–180 ms. Hide immediately on leave/cancel and avoid pointer jitter.

## Public API intent
label, enabled, offset, side, region, disabled. Label content must describe the action actually available.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
The label is aria-hidden; underlying interactive element keeps its accessible name. Do not cover controls. Disable on touch and reduced motion. Accept when it stays inside bounds or flips position near edge.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
