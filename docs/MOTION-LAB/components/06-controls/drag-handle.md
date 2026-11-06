# Drag Handle

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A dedicated pointer/keyboard affordance for moving a sortable item.

## Visual composition
Use a subtle grip icon (16–18 px) with a 32–44 px hit target. Default color tertiary; hover/focus uses secondary or brand. Keep card edges and layout unchanged.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
On press/drag, increase handle contrast and expose dragging state; the parent controls item lift and sibling layout. Handle itself has no independent animated travel. Release resets visually.

## Public API intent
label, disabled, drag attributes/listeners from parent, keyboardMove callbacks if supported. Do not own reorder data.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Accessible name explains move action. Keyboard users can invoke move up/down; announce result. Touch area is generous and touch-action only on handle. Reduced motion no extra movement. Accept when drag listeners do not break click/focus.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
