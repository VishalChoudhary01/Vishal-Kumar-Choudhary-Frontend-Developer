# Press Feedback

**Status:** Spec locked · **Milestone:** 2 — Interface Interactions · **Category:** Interactive actions

## Purpose and use
A reusable interaction treatment for controls needing tactile acknowledgement without changing their overall layout.

## Visual composition
No extra decorative surface. Keep the host control's shape, typography and color; use a subtle pressed overlay or scale around 0.985 only if it does not disturb adjacent content.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
Pointer/keyboard press immediately applies a 60–100 ms visual response and settles over 100–150 ms. Avoid elastic overshoot. Cancel restores the idle state. This is a primitive/recipe, not an element that wraps semantic behavior invisibly.

## Public API intent
asChild or render-prop composition only if existing conventions support it; otherwise document a small Pressable primitive with disabled and pressed callbacks. Do not clone children unsafely.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Preserve native keyboard and disabled behavior. Reduced motion uses color/opacity only. Accept when it does not intercept events, alter hit area or conflict with child transforms.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
