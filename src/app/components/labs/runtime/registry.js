/**
 * Code-owned runtime registry.
 *
 * Add a slug here only when its runtime is reviewed and safe to run in the
 * public application. Imports must remain dynamic so the Labs listing and
 * unrelated routes do not download experiment code.
 *
 * Never build a dynamic import path from database content and never evaluate
 * sourceCode stored in MongoDB in the main application runtime.
 */
const LAB_RUNTIME_REGISTRY = Object.freeze({
  // "approved-experiment-slug": () =>
  //   import("./experiments/approved-experiment-slug"),
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
