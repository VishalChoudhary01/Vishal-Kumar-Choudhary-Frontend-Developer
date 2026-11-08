# Copy-to-Clipboard Feedback

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A small, accurate confirmation that content was copied successfully.

## Visual composition
Use an icon button or text action with copy icon; after success, replace with a check icon and concise status. Preserve button width and icon alignment. Do not use a large success animation or toast plus button confirmation redundantly.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
On confirmed clipboard success, crossfade icon from copy to check over 120–160 ms and hold 900–1400 ms before returning. On failure, show a real error message; never display success optimistically.

## Public API intent
value, onCopy (optional custom implementation), label, copiedLabel, onSuccess, onError, disabled. Component owns clipboard call only when browser permission/context supports it.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Accessible button name changes to copied state and status uses polite live region. Keyboard and touch supported. Reduced motion swaps icon immediately. Accept when only a successful copy shows success and failure is reported.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
