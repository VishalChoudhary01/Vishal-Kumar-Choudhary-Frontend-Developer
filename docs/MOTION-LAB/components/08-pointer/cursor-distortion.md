# Cursor Distortion

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A bounded visual distortion of an image or background near the pointer, for a high-end creative experiment only.

## Visual composition
The undistorted content remains complete and readable. Use one focal media asset and a limited distortion region. No chromatic aberration, aggressive liquify or distortion across text.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
On fine pointer move, map position to a localized subtle displacement with a low amplitude. Use GPU-friendly transform or approved SVG filter only if performance is proven; restore to zero on leave. No continuous simulation by default.

## Public API intent
src/alt, regionRef, intensity low, radius, disabled. Feature should gracefully fall back to static media where filters are unsupported.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
Disable for reduced motion, coarse pointers and lower capability if performance degrades. Provide meaningful static alternative. Accept only after real-device performance testing and no persistent filter artifacts.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
