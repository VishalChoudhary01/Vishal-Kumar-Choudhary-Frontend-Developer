# Cursor Follower

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A secondary visual dot/ring that eases toward the native pointer, creating a controlled follower effect for a creative region.

## Visual composition
Use a small 12–20 px ring or dot, subtle border and optional brand fill only while over interactive content. Keep the native cursor visible unless the design explicitly replaces it.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
Pointer position updates a raw MotionValue; follower uses Soft/Balanced spring with short visible lag. Hover target can scale to 1.1–1.2 over 120–180 ms. On leave fade and return, not across the whole page.

## Public API intent
enabled, regionRef, size, followStrength, interactiveScale, disabled. Scope to a bounded region.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
Disable for touch and reduced motion. It must not intercept pointer events or cover text/cursor focus. Accept when follower catches up after stopping and hides cleanly on unmount.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
