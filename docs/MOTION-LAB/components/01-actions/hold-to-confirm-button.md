# Hold-to-Confirm Button

**Status:** Proposed · **Category:** Interactive actions · **Milestone:** 5 — Advanced interaction systems

## Purpose
A deliberate confirmation control for consequential actions where accidental activation should be harder than a normal click. The defining input is elapsed press duration, not loading progress or ordinary pressed feedback.

## Visual composition
- Begin as a conventional semantic button using the project's button sizing, typography, radius and semantic surface tokens.
- Show progress only while the pointer or key is held: prefer a restrained 1–2 px inset border sweep or compact progress track. Do not add a permanent ring, glow or oversized countdown.
- Keep the action label readable and stable. Supporting copy states the hold duration and cancellation behavior.
- Completed, holding, cancelled and disabled states must remain distinguishable without relying on color.

## Motion choreography
- Pointer down or Space key down begins a single progress animation from 0 to 1 over a bounded `holdDuration` (default 1,200 ms; valid range 600–3,000 ms).
- Drive progress with a MotionValue and Motion's `animate`; do not use an interval or per-frame React state.
- Release before completion, pointer cancel, configured pointer leave, blur, document hide, disable or unmount cancels the animation and returns progress to zero over 120–180 ms.
- Reaching 1 invokes `onConfirm` exactly once, then enters a brief completed state. Repeated pointer/key events must not invoke duplicate confirmations.
- A second activation while holding must not restart or accelerate the timer.

## Public API intent
`children`, `onConfirm`, `holdDuration`, `cancelOnLeave`, `disabled`, `progressStyle` (track/border), `onHoldingChange`, and `confirmationLabel`. Keep the callback caller-owned; the component does not perform the destructive operation itself.

## Accessibility and responsive behavior
- Use a native `button` with an accessible name and visible focus ring.
- Support pointer and keyboard hold: Space down begins and Space up cancels/commits according to progress. Do not suppress standard focus or disabled semantics.
- Assistive-technology activation that arrives as a synthesized click uses a documented two-step confirmation state: first activation arms, second activation within a short bounded window confirms. This avoids requiring a screen-reader user to sustain a key press.
- Under reduced motion, use the two-step confirmation path and omit animated progress; retain clear textual state feedback.
- Touch cancellation never confirms. The target remains at least 44 × 44 px.

## Performance and implementation notes
Use `motion/react` MotionValues and a cancellable animation control. Clean up on pointer cancellation, key release, visibility change and unmount. Do not attach global pointer state or animate box-shadow/filter. Keep the confirmation operation outside the component.

## Acceptance criteria
- Early release, pointer cancel, blur, visibility change and disabled transitions never confirm.
- A completed hold confirms exactly once.
- Keyboard and assistive-technology paths are usable and documented.
- Reduced motion preserves a safe confirmation path without animated progress.
- Progress resets cleanly and creates no layout shift or persistent timer.
