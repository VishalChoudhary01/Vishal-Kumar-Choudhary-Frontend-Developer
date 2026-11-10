# Arrow Button

**Status:** Spec locked · **Milestone:** 2 — Interface Interactions · **Category:** Interactive actions

## Purpose and use
An action or link whose arrow communicates forward navigation or opening, suitable for card CTAs, inline links and compact hero actions.

## Visual composition
Use a quiet label-first composition with a 16–18 px arrow, modest icon-label gap and standard button/link typography. Keep arrow contrast secondary until hover. No oversized arrow or capsule by default.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
On hover/focus, translate arrow 2–4 px in the indicated direction and optionally rotate 0–8 degrees when that reinforces external/open semantics. Label does not shift. Use 150–190 ms Enter/Soft easing. Press state is a small color response, not a large scale bounce.

## Public API intent
label, href, direction (forward/back/up/down), showExternalMark, disabled, variant, onClick where button semantics apply.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Keyboard focus triggers the same arrow feedback without requiring hover. Reduced motion changes color only. Accept when arrow baseline is aligned and label width never changes on interaction.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
