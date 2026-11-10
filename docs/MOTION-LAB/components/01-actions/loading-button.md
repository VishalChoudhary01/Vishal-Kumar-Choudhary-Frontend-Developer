# Loading Button

**Status:** Spec locked · **Milestone:** 2 — Interface Interactions · **Category:** Interactive actions

## Purpose and use
A button that represents an asynchronous operation and prevents duplicate submission while pending.

## Visual composition
Preserve button width and label position through loading. Place a 14–16 px spinner in a reserved icon slot or replace a trailing icon; do not collapse text or add a large loader. Use semantic disabled/busy state.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
On pending, show a short 120–180 ms opacity transition and rotate a small stroke spinner continuously only while active. On success/error, transition to a concise state icon/label only if caller supplies a real result. Restore only when operation resolves.

## Public API intent
label, loading, loadingLabel, successLabel, errorLabel, disabled, type, onClick/onSubmit. Component does not fabricate async behavior.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Use disabled and aria-busy; preserve form submit semantics. Reduced motion replaces spinner rotation with a static activity glyph or text. Accept when repeated submit is prevented and original width remains stable.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
