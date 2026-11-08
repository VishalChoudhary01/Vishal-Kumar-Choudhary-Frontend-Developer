# Hover Lift Card

**Status:** Spec locked · **Category:** Interactive cards and surfaces

## Purpose
A restrained elevation response for cards that are genuinely clickable or selectable.

## Visual composition
Card surface uses normal semantic border and minimal base shadow. Hover changes elevation by one level and translates upward only 2–3 px. Avoid scale and glow together.
Use [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md) as the authority for semantic surfaces, Manrope typography, spacing, 8/12/16 px radii, 1 px borders and restrained shadows. Light and dark themes must look equally intentional.

## Motion choreography
On fine-pointer hover/focus, translateY to -2 or -3 px and transition shadow token subtly over 160–220 ms. Press returns to origin. No spring bounce; reset on leave.

## Public API intent
children, href/onClick semantics, lift (default 2 px; cap 3), disabled. Do not make a non-interactive card appear clickable.
Document final props with JSDoc. Prefer composition through children/renderItem only where genuine content customization is needed. Avoid exposing internal Motion props.

## Accessibility and responsive behavior
Keyboard focus receives equivalent elevation and focus ring. Touch gets pressed feedback only. Reduced motion uses border/surface state rather than spatial lift. Accept when neighboring cards do not shift or overlap.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Use transform/opacity where possible, keep image/layout dimensions reserved, clean pointer/drag handlers, and pause work when not visible. No CSS file, alternate animation library or arbitrary new palette.

## Acceptance criteria
- Card is visually complete at rest and in both themes.
- Defining interaction is obvious, bounded and reversible where appropriate.
- Focus, keyboard, touch and reduced motion are supported.
- Text stays readable; no layout shift, clipping or unintended overflow occurs.
- Behavior is verified in a real browser, with tests for data/state transitions.
