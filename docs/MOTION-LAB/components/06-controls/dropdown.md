# Dropdown

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A menu of actions or choices anchored to a control.

## Visual composition
Menu width fits its labels, typically 180–280 px, semantic elevated surface, 8–12 px radius, 1 px border and medium shadow. Items 36–44 px high with visible hover/focus and clear disabled/destructive semantics.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
Open with opacity and y 4 px over 140–190 ms; item hover changes surface instantly/quickly. Close faster than open. Do not stagger every menu item.

## Public API intent
items with id/label/type/action/href/disabled, open/onOpenChange, align, side, trigger. Distinguish menu actions from select list values.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Use menu/menuitem semantics for actions or listbox/option for selection—not interchangeable. Arrow keys, Home/End, Escape, focus return and outside click. Reduced motion no travel. Accept for long menus and viewport collision.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
