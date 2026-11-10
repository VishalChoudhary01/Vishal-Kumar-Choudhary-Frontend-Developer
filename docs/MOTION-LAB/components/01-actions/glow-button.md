# Glow Button

**Status:** Spec locked · **Milestone:** 2 — Interface Interactions · **Category:** Interactive actions

## Purpose and use
A premium emphasis action where a restrained local light reinforces a primary CTA. Use sparingly and never as the default for every action.

## Visual composition
Semantic brand-filled or outlined button, 8–12 px radius, readable contrast. Glow is a low-opacity brand-tinted shadow/overlay just beyond the edge; no rainbow gradient, glass plate or broad bloom that obscures nearby content.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
On hover/focus, fade a separate glow layer from 0 to a restrained opacity over 180–240 ms. Optional pointer position shifts the highlight a small bounded distance. On leave, fade over 180 ms. Do not animate blur radius or box-shadow on every frame; animate opacity instead.

## Public API intent
label, href, variant (filled/outlined), glowIntensity (constrained low/medium), disabled. No unconstrained arbitrary color prop.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Touch uses pressed feedback only. Reduced motion disables the emitted light and keeps the semantic active state. Accept when glow does not reduce text contrast, overlap neighboring controls or appear as a neon halo.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
