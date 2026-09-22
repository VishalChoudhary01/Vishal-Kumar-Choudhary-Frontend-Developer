/**
 * Server-side error observability hook for Next.js.
 *
 * Keep this logger intentionally provider-agnostic. Replace logServerError with
 * Sentry/Datadog/OpenTelemetry/etc. later without changing the error UI.
 */
export async function register() {
  // Reserved for future OpenTelemetry / observability initialization.
}

export async function onRequestError(error, request, context) {
  const payload = {
    timestamp: new Date().toISOString(),
    digest: error?.digest,
    name: error?.name,
    message: error?.message,
    stack: error?.stack,
    request: {
      path: request?.path,
      method: request?.method,
    },
    context: {
      routerKind: context?.routerKind,
      routePath: context?.routePath,
      routeType: context?.routeType,
      renderSource: context?.renderSource,
      revalidateReason: context?.revalidateReason,
      renderType: context?.renderType,
    },
  }

  console.error('[portfolio:request-error]', JSON.stringify(payload))
}
