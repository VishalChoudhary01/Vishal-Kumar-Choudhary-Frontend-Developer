# Modal / Dialog

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A blocking interaction requiring focused decision or data entry, not a container for unrelated page content.

## Visual composition
Use an elevated dialog panel with clear title, concise body and aligned actions. Width 400–560 px for standard dialogs, responsive to viewport, 16 px radius, 1 px border and large semantic shadow. Backdrop neutral and controlled.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
Backdrop fades 160–220 ms; panel enters with opacity and y 8–12 px over 220–300 ms. Exit 150–200 ms. No scale-from-zero or heavy blur. Content should be ready at open; no long stagger.

## Public API intent
open, onOpenChange, title, description, children, size, modal, initialFocusRef. Use native dialog or existing accessible dialog primitive where available.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Focus trap, Escape policy, focus return, labelledby/describedby, inert background and scroll lock are required for modal. Reduced motion immediate/fade. Accept with keyboard, screen reader and mobile viewport checks.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
