# Text-Slide Button

**Status:** Spec locked · **Milestone:** 2 — Interface Interactions · **Category:** Interactive actions

## Purpose and use
A CTA whose label transitions between two meaningful text lines to communicate a state or destination, without using a gimmick.

## Visual composition
A fixed-height text viewport sized for the longer label, with both text rows aligned to the same baseline. Use standard button geometry and no extra gradient or shadow.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
On hover/focus, the current label moves upward by one line and the secondary label enters from below over 180–240 ms. The text viewport clips both rows. On leave restore the initial label. Reserve width and height to avoid layout shift; if labels differ in width, use a stable min-width or crossfade.

## Public API intent
label, hoverLabel, href, variant, direction (up/down), disabled, onClick. Both strings should be short and meaningful.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Keyboard focus triggers the same response. Reduced motion swaps labels with an opacity transition or keeps primary text visible. Accept when no label clips, the control does not resize and no essential information exists only on hover.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
