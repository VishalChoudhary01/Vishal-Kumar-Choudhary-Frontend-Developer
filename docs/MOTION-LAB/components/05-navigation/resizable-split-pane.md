# Resizable Split Pane

**Status:** Proposed · **Category:** Navigation and layout · **Milestone:** 5 — Advanced interaction systems

## Purpose
A two- or three-pane workspace whose adjacent panels can be resized by moving a divider. This is real layout manipulation, not a magnetic drag handle or a range control detached from content.

## Visual composition
- Use stable semantic surfaces, a quiet 1 px divider and a clear but compact resize handle.
- Panels retain their own content hierarchy and scroll behavior. The outer container keeps its dimensions while the internal split changes.
- Do not add glow, 3D tilt or a floating resize overlay. The divider remains aligned with the shared pane boundary.
- On narrow viewports, use a documented stacked layout or disable resizing below a configurable breakpoint.

## Motion choreography
- Pointer/touch drag updates a bounded MotionValue representing the first pane's percentage or pixel basis.
- Clamp continuously to each pane's min/max constraints; do not allow panels to collapse accidentally.
- During active drag, prioritize direct pointer response over spring lag. A restrained settle may be applied only after release or to keyboard step changes.
- Resizing changes actual grid/flex allocation; it is an intentional layout change, not a decorative transform.
- Pointer cancellation restores the last committed size.

## Public API intent
`children` or `panes`, `orientation` (horizontal/vertical), `defaultSize`, `minSize`, `maxSize`, `step`, `disabled`, `onResize`, and optional `storageKey` only when persistence is explicitly requested. Define whether values are percentages or pixels and validate constraints.

## Accessibility and responsive behavior
- Divider uses `role="separator"`, `aria-orientation`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-controls`.
- Arrow keys resize by `step`; Home/End move to valid limits. Provide a visible focus ring and a minimum 44 px touch target along the divider.
- Reduced motion keeps direct resizing but removes settle animation. Keyboard resizing remains available on touch devices.
- Keep keyboard tab order within each pane logical and stable.

## Performance and implementation notes
Use `useMotionValue` for the live split value and Motion's drag/pointer primitives for the handle. Keep DOM geometry reads out of the pointer frame loop; cache bounds and refresh on resize. Do not use React state for every pointer movement. Keep panel content mounted to avoid losing form state or scroll position.

## Acceptance criteria
- The divider cannot exceed pane min/max constraints.
- Pointer cancel restores the last committed value.
- Keyboard, touch and screen-reader separator semantics work.
- Pane content state and scroll positions survive resizing.
- Narrow screens never create horizontal overflow or inaccessible panes.
