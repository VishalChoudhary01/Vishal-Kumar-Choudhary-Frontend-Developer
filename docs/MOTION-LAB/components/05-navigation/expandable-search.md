# Expandable Search

**Status:** Spec locked · **Category:** Navigation and layout

## Purpose
A compact search trigger that expands into an editable field while preserving a clear search affordance.

## Visual composition
Closed state shows a labelled icon button; open state shows a 240–360 px field depending on available space. Use semantic input surface, 8–12 px radius and subtle border. Clear/cancel controls have proper targets.
Use the project's semantic colors, Manrope type, 8/12 px control radius, 1 px border and existing elevation from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the interface quiet and clearly hierarchical in both themes.

## Motion choreography
Expand width/layout over 180–260 ms while keeping search icon anchored; input fades in quickly and receives focus after expansion. Collapse on Escape and optionally when empty/outside click. Do not delay text entry.

## Public API intent
value, onChange, onSubmit, open, onOpenChange, placeholder, autoFocusOnOpen, disabled. Keep filtering/submission controlled by caller.
Document the final contract with JSDoc. Prefer controlled state and stable item IDs; do not expose Motion internals to consuming pages.

## Accessibility and responsive behavior
Input has accessible label, Escape behavior, clear button name and focus restoration. Mobile uses full-width inline expansion or dedicated row rather than tiny field. Reduced motion changes state immediately. Accept when layout does not cover adjacent actions.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Keep transitions on transform/opacity where possible; layout animation is permitted only for real size/position changes. Clean up focus, scroll-lock and event listeners. Do not add a new global navigation system unless the exact task asks for it.

## Acceptance criteria
- Navigation/disclosure semantics are correct and active state is clear without animation.
- Keyboard, focus return, Escape and touch behaviors match the component's role.
- Motion is restrained, reversible and does not shift unrelated page content.
- Both themes and reduced-motion behavior are verified.
