# Tooltip

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A short supplementary description for an otherwise clear control or label.

## Visual composition
Small surface with semantic elevated background, 1 px border, small radius 8 px and 11–12 px Manrope text. Max width around 280 px. Use a small optional caret only when it clarifies anchoring; no dark floating glass card.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
Show on hover/focus after a 300–500 ms delay; hide after 80–120 ms to avoid flicker. Enter uses opacity and y 2–4 px over 120–160 ms. Do not animate scale bounce. Dismiss on Escape where appropriate.

## Public API intent
content, children/trigger, side, align, delayDuration, disabled. Use a mature positioning primitive if present; don't implement collision math ad hoc.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Tooltip content is not interactive. Trigger receives aria-describedby while visible. Touch may open via a clearly specified long press or tap only if no conflict; never hide essential instructions only in tooltip. Reduced motion immediate. Accept with collision handling and no hover gap.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
