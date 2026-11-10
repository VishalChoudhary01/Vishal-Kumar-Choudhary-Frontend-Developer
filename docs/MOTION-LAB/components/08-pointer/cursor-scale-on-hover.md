# Cursor Scale on Hover

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A scoped cursor or follower size change that communicates interactive target proximity.

## Visual composition
Keep normal cursor visible and follower geometry small. The state is a scale change, not a new button-like surface or text label. Avoid overlarge pointer circles.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
When entering a registered interactive target, animate scale from 1 to 1.15–1.25 over 120–160 ms; return over 120–180 ms. Only one target state is active at once and nested targets must not flicker.

## Public API intent
enabled, regionRef, targetSelector/registration API, scale (cap 1.25), disabled. Prefer explicit registration over broad global selector if project conventions allow.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
No change to native cursor hit testing. Disable for touch/reduced motion. Accept when focus-visible still communicates target and nested anchors/buttons produce stable behavior.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
