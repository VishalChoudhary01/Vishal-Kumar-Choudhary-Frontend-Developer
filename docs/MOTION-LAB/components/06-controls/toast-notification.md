# Toast Notification

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A transient status message after an action, such as saved, copied or failed.

## Visual composition
Use a compact semantic surface with icon only if it reinforces status, concise title/body and optional action. 12 px radius, 1 px border and medium elevation. Status colors are limited to success/warning/error/info roles.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
Enter from a consistent edge with opacity/y 6–10 px over 180–240 ms; stack with layout animation only when several toasts coexist. Exit over 140–180 ms. Progress countdown (if used) must be accurate and pause on hover/focus.

## Public API intent
id, title, description, status, duration, action, onDismiss, position. Prefer a central toast provider/queue if multiple consumers need it.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Use aria-live polite for routine status and assertive only for urgent error. Pause timeout on hover/focus; close button accessible. Reduced motion fade only. Accept when stacked items don't cover key controls and timers clean up.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
