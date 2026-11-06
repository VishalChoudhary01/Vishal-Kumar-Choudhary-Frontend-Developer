# Like Button

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A toggle action for expressing appreciation, with count when backed by real data.

## Visual composition
Use a 40–44 px hit target with restrained icon size 18–20 px, label/count as secondary text. Selected fill uses semantic brand or existing product convention; avoid heart bursts, confetti or glowing halos by default.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
On toggle, icon fill/outline transitions over 140–180 ms with a subtle scale 1→1.08→1 over a single damped settle. Count change uses a small vertical number transition only when the count is shown. No duplicate network requests.

## Public API intent
pressed, count, onChange/onToggle, disabled, loading. Controlled state preferred. Count must come from actual source data.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Use button and aria-pressed, label the action, expose count. Keyboard toggles. Reduced motion swaps state without scale. Accept when optimistic updates roll back on error and count does not drift.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
