# Cursor Text Replacement

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A contextual pointer label that replaces the cursor's visual shape with concise action text over a defined target.

## Visual composition
Text is a 10–12 px semibold label with compact padding and semantic contrast. No oversized pill, excessive radius or animated text scramble. Keep label short (one or two words).
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
On target entry, crossfade cursor mark to label over 120–180 ms; follow pointer with small bounded spring lag. On target leave, fade back to cursor. No movement of the underlying target.

## Public API intent
targets with id/label, regionRef, offset, disabled. Labels must map to actual actions.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
Hide visual replacement from AT; underlying links/buttons keep names. Disable on touch and reduced motion. Accept when labels don't cover target text or escape region, and native cursor remains usable.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
