# Cursor-Based Parallax

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A local scene where pointer position shifts a few visual layers to create tactile depth inside a hero or demo.

## Visual composition
Limit to two or three actual scene layers. Keep primary text fixed and readable. Use real shapes/images with semantic tones, no random blobs or compulsory glow.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
Normalize pointer within container and map each layer to a bounded offset of ±2–6 px, with Soft spring smoothing. Reset on leave. Avoid rotating large scenes or combining strong parallax with tilt/scale.

## Public API intent
layers with depth, containerRef, intensity low, disabled. Expose layer mapping by data depth, not arbitrary selectors globally.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
Disable on touch and reduced motion. Keep all layer edges within clipping boundary. Accept when no layout movement occurs and text does not shift.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
