# Directional Hover Button

**Status:** Spec locked · **Milestone:** 1 — Core Motion · **Category:** Interactive actions

## Purpose and use
A button whose subtle highlight enters from the side nearest the pointer, giving directional feedback without moving the control itself.

## Visual composition
Use the project's standard button geometry, semantic surface and border. A low-opacity brand highlight sits as a clipped inner layer; label and icon stay crisp and stationary. Do not turn the surface into a neon gradient.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
Determine pointer entry edge from local pointer coordinates. Reveal a soft rectangular highlight from that edge over 180–240 ms using Enter easing; on leave, fade and retract over 140–180 ms. The button box never translates or rotates. Use one highlight layer only.

## Public API intent
label, href, variant, size, directionMode (auto or fixed), disabled, onClick. Direction is visual only; it cannot change the action.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Touch receives a normal pressed state, not a simulated hover. Keyboard focus uses a visible ring and a restrained static brand surface. Reduced motion uses immediate low-opacity highlight. Accept when edge detection is stable at corners and no highlight bleeds outside the radius.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
