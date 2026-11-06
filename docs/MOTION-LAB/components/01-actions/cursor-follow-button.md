# Cursor-Follow Button

**Status:** Spec locked · **Milestone:** 2 — Interface Interactions · **Category:** Interactive actions

## Purpose and use
A button whose small internal label, glyph or trailing indicator responds locally to the pointer. It is distinct from Magnetic Button: the button container remains fixed.

## Visual composition
Keep the button surface and geometry fixed. Only a small inner glyph or label offset responds; maintain enough padding so content never touches the edge. Brand styling remains semantic and restrained.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
Map local pointer position to a small ±3–5 px inner-content translation, damp with a soft spring, and reset on leave. Do not translate the entire button. If a cursor label is shown, it must be subordinate and must not cover the CTA.

## Public API intent
label, href, follower (icon/text), intensity capped to 5 px, disabled. No viewport-global cursor dependency.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Disable pointer follower on touch and reduced motion; retain standard hover/focus/pressed feedback. Accept when button box does not move and the internal content remains optically centered at all times.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
