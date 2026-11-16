# Before/After Comparison Slider

**Status:** Proposed · **Category:** Micro-interaction controls · **Milestone:** 5 — Advanced interaction systems

## Purpose
A direct-manipulation image comparison control: the user moves a divider to reveal more or less of two aligned images. This is not an automatic image slide transition.

## Visual composition
- Two real images occupy the same reserved frame with a documented object-position policy.
- The before image is the base; the after image is clipped by a simple inset/clip-path tied to the divider.
- Labels are visible, concise and remain attached to their respective sides. A narrow semantic divider and handle mark the comparison boundary.
- Avoid gradient overlays, glow and excessive shadow. Preserve accurate image colors.

## Motion choreography
- Pointer drag updates a MotionValue from 0–100% and maps it to the clip boundary and divider position.
- Movement follows the pointer directly; do not spring behind the user's hand. Optional release settle must be minimal and disabled by default.
- Keyboard range input updates the same MotionValue and visual boundary.
- Drag cancellation restores the last committed comparison position; no automatic playback or slide transition occurs.

## Public API intent
`before` and `after` objects with `src`, `alt`, and optional `objectPosition`; `initialPosition`, `minPosition`, `maxPosition`, `orientation` (vertical divider or horizontal divider), `beforeLabel`, `afterLabel`, `onChange`, and `disabled`. Position is a finite percentage from 0–100.

## Accessibility and responsive behavior
- Provide a native range input or equivalent slider semantics with accessible name, min/max/current value and keyboard support.
- Announce the current percentage only when keyboard-operated; do not flood live regions during pointer drag.
- Both images need meaningful alternative text; decorative duplicate layers are hidden from assistive technology.
- Reduced motion retains immediate drag/keyboard comparison without spring or decorative transitions. Touch target is at least 44 px.

## Performance and implementation notes
Use `useMotionValue` and `useTransform` for divider and clip geometry. Reserve frame aspect ratio to avoid layout shift; load the base image first and decode the upper image before enabling comparison where practical. Do not place text inside the clipped image layer.

## Acceptance criteria
- Divider and clip boundary stay exactly aligned across resize and both orientations.
- Keyboard and touch produce the same values as pointer drag.
- Both images remain correctly described to assistive technology.
- Images do not resize or jump while the user compares.
- Reduced motion and disabled states retain a useful static comparison.
