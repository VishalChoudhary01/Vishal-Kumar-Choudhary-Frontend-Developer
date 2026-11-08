# Popover

**Status:** Spec locked · **Category:** Micro-interaction controls

## Purpose
A compact interactive surface anchored to a trigger for supplementary controls or structured actions.

## Visual composition
Use an elevated semantic surface, 1 px border, 12 px radius, modest shadow and 12–16 px internal padding. Width content-driven, constrained to viewport. Header/action hierarchy must be clear.
Apply semantic theme colors and typography from [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md). Keep the control's idle appearance trustworthy, compact and legible. Do not add unnecessary decorative surfaces.

## Motion choreography
Open with opacity and y 4–6 px over 150–220 ms. Close over 120–160 ms. No scaling from zero. Position with collision-aware anchor logic and a stable transform origin.

## Public API intent
open/defaultOpen, onOpenChange, trigger, children, side, align, modal, disabled. Do not roll custom positioning if project already has a supported primitive.
Document the final public props with JSDoc. The component must not silently invent data or own unrelated business logic.

## Accessibility and responsive behavior
Keyboard trigger, Escape close, focus management according to modal/nonmodal semantics, outside click and focus return. Reduced motion removes travel. Accept around viewport edges, zoom and keyboard-only flow.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4. Prefer native HTML inputs and platform semantics where possible. Use a proven accessible primitive already in the project for complex overlay/focus behavior. Clean timers, listeners and observers. Respect reduced motion.

## Acceptance criteria
- Native semantics and form behavior remain correct.
- All states have a non-animated, understandable representation.
- Keyboard, touch, focus and reduced-motion paths work.
- Both themes have appropriate contrast and consistent geometry.
- Async feedback reflects real operation results, never optimistic fiction.
