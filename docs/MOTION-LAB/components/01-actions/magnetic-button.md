# Magnetic Button

**Status:** Spec locked · **Milestone:** 1 — Core Motion · **Category:** Interactive actions

## Purpose and use
A primary action that responds to a nearby pointer with restrained attraction. Use for a single high-value CTA in a spacious hero or interactive demo, never for every button in a form.

## Visual composition
A compact, confident button with a semantic brand fill, dark/light-safe contrast, 44–48 px control height, 8–12 px radius, aligned icon and label. The button remains optically centered in its field; surrounding pointer rings are optional demo framing, not part of the primitive.
Follow [00-DESIGN-SYSTEM.md](../../00-DESIGN-SYSTEM.md): semantic project colors, Manrope control typography, standard spacing, existing radii, 1 px semantic borders and restrained elevation. Support light and dark themes. Do not add component-specific colors, font families or shadows.

## Motion choreography
On fine-pointer move, measure pointer displacement from the button center, normalize against the field bounds, clamp translation to ±22 px and apply a 0.12 attraction factor. Smooth x/y using the Magnetic spring (180/22/0.35). Hover adds at most 1.02 scale; press returns toward 0.98. Leave/cancel/blur resets to origin. No cursor chasing on touch.

## Public API intent
href, label, variant, size, strength (default 0.12), maxDistance (22), disabled, onClick. Separate button and anchor semantics; do not force navigation.
The implementation must document the final JavaScript prop contract with JSDoc. Defaults should provide a complete component without caller-supplied animation values. Keep the API smaller than the internal Motion configuration.

## Interaction, accessibility and responsive behavior
Keyboard focus remains stationary but receives the normal focus ring; touch is a normal tap. Reduced motion disables attraction and scale while preserving hover/focus color feedback. Accept when pointer resets reliably, the button never escapes its field, and no page overflow occurs.
The component must work at narrow mobile widths without horizontal overflow. Decorative layers must not intercept pointer input. Use semantic elements and keep the visible focus indicator outside clipped layers.

## Performance and implementation notes
Use motion/react and Tailwind CSS v4 only. Prefer transform/opacity and MotionValues for high-frequency input. Clamp all pointer values. Clean up listeners and timers. Avoid layout animation unless the actual layout changes. Respect reduced motion using the engineering standard.

## Acceptance criteria
- The idle state is polished and useful without animation.
- The defining interaction matches the choreography above and has a clear reset/exit.
- Light/dark theme, keyboard, touch and reduced-motion paths are verified.
- The hit target and focus ring remain visible; no unintended layout shift or page overflow occurs.
- A real interactive demo and behavior-level tests are provided.
