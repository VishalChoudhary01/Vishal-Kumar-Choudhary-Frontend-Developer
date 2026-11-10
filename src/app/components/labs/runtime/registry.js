/**
 * Code-owned runtime registry.
 *
 * Keep runtime imports literal and lazy. Only reviewed, code-owned
 * experiments belong here. Database records may choose a known runtime key,
 * but may never provide an import path or executable source.
 *
 * Lazy component identities are created once at module scope. Importing this
 * registry does not fetch experiment chunks; React loads a chunk only when
 * that specific runtime is rendered.
 */
import { lazy } from "react";

export const MagneticInteractionRuntime = lazy(() =>
  import("./experiments/magnetic-interaction")
);
export const ScrollDrivenTextRevealRuntime = lazy(() =>
  import("./experiments/scroll-driven-text-reveal")
);
export const GradientBloomRuntime = lazy(() =>
  import("./experiments/gradient-bloom")
);
export const GenerativeParticleFieldRuntime = lazy(() =>
  import("./experiments/generative-particle-field")
);

const LAB_RUNTIME_KEYS = new Set([
  "magnetic-interaction",
  "scroll-driven-text-reveal",
  "gradient-bloom",
  "generative-particle-field",
]);

export function hasLabRuntime(runtimeKey) {
  return LAB_RUNTIME_KEYS.has(runtimeKey);
}
