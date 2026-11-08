# Form Validation Feedback

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A field-level status transition for valid, invalid or pending form input.

## Visual composition
Keep field dimensions stable. Label and helper text have clear hierarchy; error uses semantic error token and concise copy. Border can change to error but never rely on color alone. Reserve message slot to avoid page jump.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
On validation result, fade/slide helper copy by 2–4 px over 140–200 ms; border transitions quickly. Do not shake fields by default. For submit error, move focus to first invalid field only under the form's validation strategy.

## Public API intent
state (idle/valid/invalid/pending), message, id, fieldId, children or field adapter. Integrate with React Hook Form/Zod patterns when present; don't own business validation.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Connect aria-describedby and aria-invalid; announce submit errors appropriately. Reduced motion updates message without travel. Accept when helper text does not cause large layout shift and errors identify how to fix the issue.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
