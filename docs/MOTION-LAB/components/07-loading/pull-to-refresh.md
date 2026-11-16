# Pull-to-Refresh

**Status:** Proposed · **Category:** Loading and progress · **Milestone:** 5 — Advanced interaction systems

## Purpose
A contained refresh interaction for a real scrollable feed or panel. A deliberate downward pull at the top edge requests fresh data; the component does not invent or fetch data itself.

## Visual composition
- Keep the refresh indicator compact and aligned with the scroll region's content edge.
- Use existing semantic brand/info/success/error tokens for pulling, refreshing, refreshed and failed states. Do not use a large spinning decoration or full-screen overlay.
- Content remains readable and scrollable. Reserve a small indicator area so activation does not cause a large layout jump.
- Provide a visible refresh button as an explicit alternative.

## Motion choreography
- Gesture is eligible only when the contained scroll region is at its top and the user begins in the configured top activation zone.
- Map downward drag to a bounded indicator displacement with resistance; default arm threshold 72 px and maximum pull 112 px.
- Crossing the threshold changes state from pulling to armed. Releasing while armed invokes the caller's async `onRefresh` once.
- While the promise is pending, hold a compact refreshing state. Resolve to refreshed or failed, then settle back to rest. Pointer cancel, upward movement or release below threshold cancels without calling the callback.
- No automatic retry or perpetual pulse.

## Public API intent
`children`, `onRefresh` (returns a Promise), `threshold`, `maxPull`, `activationZone`, `showRefreshButton`, `onRefreshError`, `disabled`, and optional `scrollContainerRef`. Keep refresh data ownership in the caller.

## Accessibility and responsive behavior
Use a labelled scroll region with a visible refresh button (native button) and `aria-busy` while refreshing. Announce refreshing/completed/failed politely once per operation. Touch scrolling remains native outside the activation zone; keyboard and assistive-technology users trigger refresh through the button. Reduced motion removes elastic displacement but retains button and state feedback.

## Performance and implementation notes
Use Motion drag/pointer primitives scoped to the contained top activation zone. Do not attach a global pull gesture or hijack document scrolling. Bound displacement and clean cancellation on unmount. Catch rejected refresh promises and always restore the indicator.

## Acceptance criteria
- Gesture only arms at scroll top and within the activation zone.
- Cancelled/short pulls never call `onRefresh`.
- A successful pull calls `onRefresh` exactly once and handles rejection.
- Keyboard/button refresh is equivalent and status announcements are concise.
- Native scrolling is not trapped and reduced motion remains fully functional.
