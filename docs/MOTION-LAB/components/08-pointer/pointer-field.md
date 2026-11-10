# Pointer Field

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A bounded interaction area that maps pointer distance into values used by magnetic or proximity-based child components.

## Visual composition
Use a neutral container with optional subtle concentric distance guides in demos only. The actual reusable field should not force grid artwork, labels or borders. Its bounds and center must be deterministic.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
Track normalized x/y from -1 to 1 relative to the field center. Provide bounded MotionValues or a callback with throttle/frame discipline. On leave, reset to zero. Children may map field output to their own safe ranges.

## Public API intent
children, onPointerChange, strength, pointerValues/context if shared usage is proven, disabled, fieldRef. Avoid global singleton.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
Touch receives no fake cursor state. Reduced motion provides zero or static center values. Accept when resizing, scroll offset and pointer cancellation do not produce stale values.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
