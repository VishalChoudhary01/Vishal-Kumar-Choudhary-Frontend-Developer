# Range Slider

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A numeric range selector with immediate, precise feedback.

## Visual composition
Track height 3–4 px, thumb 16–20 px with a visible 44 px hit area. Inactive track uses border/subtle surface; filled track uses semantic brand. Value label appears only when useful; avoid oversized bubble by default.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
Thumb follows drag directly without spring lag; filled track maps exact numeric progress. Value tooltip can fade in over 120 ms during drag/focus. Snap to step on release only if explicit step behavior requires it.

## Public API intent
min, max, step, value/defaultValue, onValueChange, label, showValue, disabled. Validate bounds and step.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Native range input preferred. Keyboard arrows/page/home/end follow native semantics. Use aria-valuetext for formatted values. Touch drag must not trap page scroll outside the thumb. Reduced motion removes tooltip travel. Accept across min/max/step edge cases.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
