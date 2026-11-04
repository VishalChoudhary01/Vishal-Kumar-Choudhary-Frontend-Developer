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

const LAB_RUNTIME_REGISTRY = Object.freeze({
  "magnetic-interaction": lazy(() =>
    import("./experiments/magnetic-interaction")
  ),
  "scroll-driven-text-reveal": lazy(() =>
    import("./experiments/scroll-driven-text-reveal")
  ),
  "gradient-bloom": lazy(() =>
    import("./experiments/gradient-bloom")
  ),
  "generative-particle-field": lazy(() =>
    import("./experiments/generative-particle-field")
  ),
});

export function hasLabRuntime(runtimeKey) {
  return Boolean(
    runtimeKey &&
    Object.prototype.hasOwnProperty.call(LAB_RUNTIME_REGISTRY, runtimeKey)
  );
}

export function getLabRuntimeComponent(runtimeKey) {
  return LAB_RUNTIME_REGISTRY[runtimeKey] || null;
}
