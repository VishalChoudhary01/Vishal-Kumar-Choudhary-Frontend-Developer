# Animated Toggle

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A binary setting control for an immediate on/off preference.

## Visual composition
Use a 40×22 px or 44×24 px track with a 16–18 px thumb, 2–3 px internal inset and a semantic brand fill only when on. Label sits outside the control and is aligned to its vertical center. Shape is modestly rounded because the control's geometry is functional.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
Thumb translates by the track travel distance over 160–220 ms Standard easing; track color crossfades over 140–180 ms. No exaggerated overshoot. State changes immediately on activation; animation only visualizes the state.

## Public API intent
checked/defaultChecked, onCheckedChange, label, disabled, name, value. Use native checkbox semantics visually styled as switch.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Use role=switch only if established native input implementation does not cover the intended semantics; expose aria-checked/label and disabled. Keyboard Space toggles. Reduced motion updates immediately. Accept when label click toggles and form integration works.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
