# Animated Checkbox

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A compact multi-select control with clear checked/unchecked/indeterminate feedback.

## Visual composition
Use 18×18 px box (20 px large), 4 px radius, 1 px border and semantic brand fill. Checkmark is 12–14 px stroke with consistent cap/join. Keep label on the same baseline and a 44 px minimum row hit area.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
On check, surface color fills over 120–160 ms and pathLength draws checkmark over 140–180 ms. Indeterminate uses a static/drawn horizontal line. Uncheck fades/draws out; no bounce.

## Public API intent
checked, indeterminate, onChange, label, disabled, name, value, required. Preserve native form behavior.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Native checkbox input or equivalent accessible semantics. Space toggles. Label is associated. Reduced motion displays final mark. Accept when indeterminate is not submitted as checked and focus ring remains visible.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
