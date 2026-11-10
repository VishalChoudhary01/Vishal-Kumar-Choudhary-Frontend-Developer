# Split Button

**Status:** Spec locked · **Milestone:** 2 — Interface Interactions · **Category:** Interactive actions

## Purpose and use
A compound action with one primary command and a separate menu trigger for related secondary actions.

## Visual composition
Two adjoining but independently focusable controls in one shared visual group. Primary label has clear hierarchy; divider is subtle; menu trigger has a 40–44 px target. Use one continuous surface and coordinated 8–12 px outer radius.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
Primary press uses standard feedback. Menu trigger rotates its chevron 0–180 degrees over 180 ms while the associated menu enters with a 120–180 ms opacity/short-y transition. Menu exit is quicker. No movement of the primary action when menu opens.

## Public API intent
primaryLabel, menuItems, open, onPrimaryAction, onOpenChange, disabled, align. Each menu item has a real action or destination.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Keyboard: tab to each part, Enter/Space on primary, Enter/Space/ArrowDown on menu trigger, Escape closes, focus returns to trigger. Touch opens menu with no hover assumptions. Accept when actions remain distinct and focus never becomes trapped incorrectly.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
