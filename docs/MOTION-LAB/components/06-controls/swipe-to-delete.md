# Swipe-to-Delete

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A mobile-friendly row action that reveals deletion, requiring confirmation or an undo path for destructive content.

## Visual composition
Row content is normal and readable. Destructive action area uses semantic error-soft/error tokens and explicit Delete text; red does not appear until destructive intent is revealed. Do not hide the only delete action from non-touch users.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
Drag row on x with threshold and velocity guard; reveal action at a bounded offset and snap to open/closed. Actual deletion happens only after explicit action press, not merely drag threshold. Undo can animate row restoration if supported.

## Public API intent
children, onDelete, onUndo, revealWidth, threshold, disabled. Expose a separate delete button for keyboard/desktop.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Keyboard can tab to Delete without swiping. Touch supports horizontal gesture while preserving vertical scroll. Reduced motion uses immediate open/close. Accept when cancel restores row and accidental swipe never deletes.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
