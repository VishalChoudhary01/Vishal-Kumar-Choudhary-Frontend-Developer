# Fullscreen Menu

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A site-level or section-level navigation panel that temporarily replaces normal content with clear route choices.

## Visual composition
Use a full viewport semantic surface, strong typographic hierarchy and grouped links. Limit to two levels unless information architecture requires more. Keep background calm; no heavy glass blur or moving gradient.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
Open: backdrop opacity 0→1 and panel clip/fade or y entrance over 320–450 ms. Links stagger 35–55 ms after panel is readable. Close uses 180–260 ms exit. Background scroll lock only while open and cleaned up.

## Public API intent
open, items, onNavigate, onClose, placement/variant, initialFocusRef. Reuse existing router link conventions.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
Focus trap, Escape close, focus return, inert/aria-hidden background and scroll lock required. Reduced motion opens/closes immediately or fades minimally. Accept when keyboard navigation is complete and no focus leaks behind overlay.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
