# Cursor Trail

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A short fading history of pointer positions for a deliberate creative demo, not a standard product interface.

## Visual composition
Use a few tiny dots or a thin line in one semantic accent. Maximum trail length is small (4–8 points) and opacity decays clearly. No rainbow, neon, particle cloud or long persistence.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
Sample pointer at animation-frame cadence or distance threshold. Each point fades and moves slightly toward the prior point, lifetime about 180–300 ms. Stop sampling when pointer stops or exits; cap active nodes and reuse them.

## Public API intent
enabled, colorVariant semantic, trailLength (cap 8), lifetime (180–300 ms), regionRef, disabled.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
Disable on touch, reduced motion and prefers no-motion context. Do not allocate unbounded nodes. Accept when trail cannot affect layout, is low-cost and disappears fully after pointer stops.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
