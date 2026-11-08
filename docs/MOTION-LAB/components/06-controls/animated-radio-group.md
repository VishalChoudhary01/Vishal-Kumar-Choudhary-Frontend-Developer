# Animated Radio Group

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A single-choice control among a small set of mutually exclusive options.

## Visual composition
Use standard 18–20 px radio outer ring and 8–9 px inner dot. Label text 13–15 px. Group spacing 12–20 px. Selected state uses semantic brand, not a different color per option.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
Selected dot scales 0.7→1 with brief opacity and ring color transition over 140–180 ms. Moving selection may use a low-key shared indicator for segmented variants; avoid liquid morph by default.

## Public API intent
value/defaultValue, options, onValueChange, name, orientation, disabled, required. Each option has stable value and label.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Use radiogroup/radio semantics with arrow-key movement, Home/End if conventional, and one tab stop. Reduced motion changes selection immediately. Accept when disabled options and required form behavior work.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
