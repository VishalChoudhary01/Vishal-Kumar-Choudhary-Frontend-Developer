# Custom Cursor

**Status:** Spec locked · **Category:** Cursor and pointer systems · **Default scope:** opted-in component region only

## Purpose
A replacement visual pointer inside an opted-in creative region, useful for a showcase or visual demo but not ordinary site-wide navigation.

## Visual composition
Use a small neutral cursor mark with a subtle brand accent and optional state label. Keep it smaller than the content it points at. Never hide the native cursor outside the explicitly opted-in region or for touch users.
Use existing semantic colors, typography, surfaces and radii from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). The pointer effect is a secondary layer; the actual content and action remain primary.

## Motion choreography
On pointer move, position directly with MotionValues (no spring lag for the core pointer). Optional hover state changes scale/label over 120–180 ms. Restore native cursor on leave, blur, disabled or unmount. No trail by default.

## Public API intent
enabled, regionRef, variant, size, labelForTarget callback/map, disabled. Must scope to a region and use pointer capability detection.
Public props require JSDoc. Do not create a site-wide pointer provider unless multiple real consumers need synchronized pointer state and the integration is explicitly approved.

## Accessibility and responsive behavior
Do not block native click/focus. Never cover text selection or inputs. Disable for touch/coarse pointer, keyboard-only and reduced motion. Accept when native cursor is restored for links, inputs, viewport leave and component unmount.

## Performance and implementation notes
Use pointer events and MotionValues; do not set React state on every pointer move. Bound the region, values and active elements. Clean listeners/observers and avoid excessive blur/filter work. Use motion/react and Tailwind CSS v4 only.

## Acceptance criteria
- Effect is scoped and never changes the underlying action semantics.
- Pointer leave/cancel/blur/unmount returns to a safe state.
- Touch and reduced-motion paths remain complete without cursor emulation.
- No pointer interception, horizontal overflow, excessive allocations or visible lag.
- Real browser/device performance is verified before approval.
