# Morphing Icon Button

**Status:** Spec locked · **Milestone:** 2 — Interface Interactions · **Category:** Interactive actions

## Purpose and use
An icon-only or icon-led control whose icon changes shape to express a real binary state, such as menu/close, play/pause or add/remove.

## Visual composition
Use a 40–44 px hit target with a 16–20 px visual icon. Icon drawing uses the existing icon system or a small inline SVG when path morphing is required. Surface and border stay quiet.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
Animate between two explicit, semantically distinct states over 180–260 ms. Prefer line rotation/opacity for simple glyph changes; interpolate SVG paths only when compatible. No arbitrary spinning. Crossfade icons if path topology differs.

## Public API intent
state, icons or known variant, label/aria-label, pressed, disabled, onChange. Require an accessible name.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Button semantics and aria-pressed for toggles; state is not conveyed by icon alone if label is needed. Reduced motion swaps immediately with a minimal opacity change. Accept when icon alignment stays centered and no icon font layout shift occurs.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
