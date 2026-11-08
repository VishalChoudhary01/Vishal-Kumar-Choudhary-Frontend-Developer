# Animated Tabs

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A single-select tab row that switches between peer panels or views and clearly indicates the active tab.

## Visual composition
Use compact text-first tabs with 40–44 px hit targets. Active state is semantic brand text or subtle surface; inactive tabs use secondary text. A shared 1–2 px underline or modest inset surface carries active state. Avoid giant pill tabs.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
On selection, shared layoutId indicator moves between tabs over 180–240 ms Standard easing. Panel content may crossfade over 140–200 ms; do not slide large distances. Keep indicator width tied to active tab label.

## Public API intent
tabs with id/label/disabled, value/defaultValue, onValueChange, orientation. Use actual tab semantics only when switching in-place panels.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
Arrow keys move among tabs, Home/End jump, Enter/Space activates when manual activation is used. Provide tablist/tab/tabpanel relationships and focus management. Reduced motion switches indicator instantly. Accept when tab and panel IDs remain stable.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
