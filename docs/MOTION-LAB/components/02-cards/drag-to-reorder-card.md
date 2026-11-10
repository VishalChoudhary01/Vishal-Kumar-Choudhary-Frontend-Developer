# Drag-to-Reorder Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A draggable item in a real sortable collection, with clear reorder feedback and stable data identity.

## Visual composition
The card looks like a normal list/card item. A dedicated 24–32 px drag handle is visually subtle but discoverable. Dragging state adds a restrained elevation and border emphasis; avoid ghosting the entire screen.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
Use Motion drag with axis and constraints supplied by the sortable parent. Dragged item lifts one elevation level and follows pointer; siblings animate layout to new positions. On release, spring settle with Drag settle preset. Do not reorder based on unstable array indices; use stable item IDs.

## Public API intent
items with stable id, onReorder, axis, disabled, renderItem, handleOnly default true. Keep reorder state controlled or clearly documented.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Keyboard users need move-up/down commands or an accessible reorder mode. Announce new position. Touch uses touch-action appropriate to axis. Reduced motion updates order without spatial animation. Accept when drag cancel restores original order and focus is retained.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
