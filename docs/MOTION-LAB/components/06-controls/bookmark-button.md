# Bookmark Button

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A save-for-later toggle, usually icon-only or compact label-led.

## Visual composition
Use bookmark outline icon with 18–20 px glyph in 40–44 px target. Selected state uses semantic brand fill or a restrained filled glyph. Keep surrounding card and typography stable.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
On save, animate fill or path drawing over 140–200 ms, then a slight 1.03 scale at most. Unsave reverses. No flying icon into a fake folder unless a real destination is represented.

## Public API intent
saved, onChange/onToggle, label, count optional, disabled, loading. Controlled state preferred.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Use aria-pressed and clear accessible name. Reduced motion changes fill instantly. Accept when save request errors restore prior state and repeated toggles are serialized/handled.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
