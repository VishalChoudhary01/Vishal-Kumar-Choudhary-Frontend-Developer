# Elastic Button

**Status:** Spec locked · **Milestone:** 2 — Interface Interactions · **Category:** Interactive actions

## Purpose and use
A deliberately elastic action for playful, expressive contexts such as a creative demo—not for payment, destructive or dense business controls.

## Visual composition
Keep the button shape and brand hierarchy simple. Deformation is limited to a small spring-driven scale/offset; no jelly shader, cartoon squash or extreme pill geometry.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
During press, apply a restrained compression (about 0.97); release springs to 1 with one subtle overshoot, then settles. Spring should be balanced/highly damped. Do not continuously deform on hover. Reduced-motion path is a quick color acknowledgement.

## Public API intent
label, variant, size, intensity (low/medium), disabled, onClick. Intensity cannot exceed documented safe bounds.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Keyboard activation receives the same press/release acknowledgement. Touch uses native press. Reduced motion removes overshoot. Accept when one settle is the maximum and text remains readable and stable.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
