/**
 * Code-owned runtime registry.
 *
 * Keep runtime imports literal and lazy. Only reviewed, code-owned
 * experiments belong here. Database records may choose a known runtime key,
 * but may never provide an import path or executable source.
 */
const LAB_RUNTIME_REGISTRY = Object.freeze({
  "magnetic-interaction": () =>
    import("./experiments/magnetic-interaction"),
  "scroll-driven-text-reveal": () =>
    import("./experiments/scroll-driven-text-reveal"),
  "gradient-bloom": () =>
    import("./experiments/gradient-bloom"),
  "generative-particle-field": () =>
    import("./experiments/generative-particle-field"),
});

export function hasLabRuntime(runtimeKey) {
  return Boolean(
    runtimeKey &&
    Object.prototype.hasOwnProperty.call(LAB_RUNTIME_REGISTRY, runtimeKey)
  );
}

export function loadLabRuntime(runtimeKey) {
  return LAB_RUNTIME_REGISTRY[runtimeKey] || null;
}
