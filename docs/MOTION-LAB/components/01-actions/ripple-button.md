# Ripple Button

**Status:** Spec locked · **Milestone:** 1 — Core Motion · **Category:** Interactive actions

## Purpose and use
A discrete press acknowledgement for actions where the click needs a visible origin. Not a decorative perpetual ripple.

## Visual composition
Keep the base button visually conventional. Render the ripple as a clipped circular layer using a translucent semantic brand tone, below the label and icon. Avoid high-contrast concentric rings or sound.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
On pointer down, record the local press origin and animate one circle from near-zero to the farthest corner radius while fading from modest opacity to zero over 420–560 ms. Support rapid repeated presses without stale ripples; cap concurrent ripple instances. Do not delay the click handler.

## Public API intent
label, variant, size, disabled, onClick, rippleColor (semantic token only). Native button behavior remains authoritative.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Keyboard activation starts the ripple at center. Touch starts at the touch point. Reduced motion renders a brief static pressed acknowledgement. Accept when click fires immediately, repeated activation works, and no ripple remains after unmount.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
