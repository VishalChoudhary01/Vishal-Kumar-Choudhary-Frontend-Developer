export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

export function normalizeError(error) {
  const value = error instanceof Error ? error : new Error(String(error ?? 'Unknown error'))
  return value
}

/*
 * One-line human-readable failure label: "ReferenceError: direction is
 * not defined". Uses only fields normalized from the Error object itself
 * (name, message), which are identical between the server and client
 * passes, so this string is safe to render during SSR without risking a
 * hydration mismatch — unlike stack/frame data, which differ per pass.
 */
export function displayName(info) {
  if (!info) return 'Error'
  if (info.name && info.message && info.message !== info.name) {
    return `${info.name}: ${info.message}`
  }
  return info.message || info.name || 'Error'
}

/*
 * Reference ID for the error page metadata row.
 *
 * Hydration constraint: this string is rendered during SSR AND hydrated on
 * the client, so it MUST be identical in both passes. Any per-call entropy
 * (crypto.randomUUID, Date.now, Math.random) differs between the server
 * render and the client hydration render — that was the original mismatch.
 *
 * Strategy:
 *   1. digest — Next.js provides this stable server→client when present.
 *   2. kind+status-derived stable key (stamped into the rendered output via
 *      props) — stable for the lifetime of the surfacing incident.
 *   3. last-resort random value (no error object at all — cannot happen in
 *      the app's current call paths, kept for robustness).
 */
export function createReferenceId(error) {
  if (error?.digest) return String(error.digest)

  if (error instanceof Error) {
    const stableSeed =
      error.message || error.name || 'error'
    let hash = 0
    for (let i = 0; i < stableSeed.length; i++) {
      hash = (hash * 31 + stableSeed.charCodeAt(i)) | 0
    }
    return `ERR-${(hash >>> 0).toString(16).padStart(8, '0')}`
  }

  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {}

  return `ERR-${Date.now().toString(36)}`
}

export function parseStackFrame(stack) {
  if (!stack || typeof stack !== 'string') return null

  const lines = stack.split('\n')
  const patterns = [
    // Chromium / Node: at fn (file:line:column)
    /^\s*at\s+(.*?)\s+\((.*?):(\d+):(\d+)\)\s*$/,
    // Chromium / Node: at file:line:column
    /^\s*at\s+(.*?):(\d+):(\d+)\s*$/,
    // Firefox: fn@file:line:column
    /^\s*(.*?)@(.*?):(\d+):(\d+)\s*$/,
  ]

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (!match) continue

      if (pattern === patterns[0]) {
        return {
          functionName: match[1] || 'anonymous',
          file: cleanStackFile(match[2]),
          line: Number(match[3]),
          column: Number(match[4]),
        }
      }

      if (pattern === patterns[1]) {
        return {
          functionName: 'anonymous',
          file: cleanStackFile(match[1]),
          line: Number(match[2]),
          column: Number(match[3]),
        }
      }

      return {
        functionName: match[1] || 'anonymous',
        file: cleanStackFile(match[2]),
        line: Number(match[3]),
        column: Number(match[4]),
      }
    }
  }

  return null
}

function cleanStackFile(value) {
  if (!value) return value

  try {
    const url = new URL(value)
    return `${url.pathname}${url.search}`
  } catch {
    return value
      .replace(/^webpack-internal:\/\//, '')
      .replace(/^turbopack-internal:\/\//, '')
      .replace(/^file:\/\//, '')
  }
}

export function getDiagnosticInfo(error) {
  const normalized = normalizeError(error)
  const onClient = typeof window !== 'undefined'
  const location = onClient ? parseStackFrame(normalized.stack) : null

  return {
    name: normalized.name || 'Error',
    message: normalized.message || 'Unexpected application error.',
    digest: normalized.digest ? String(normalized.digest) : undefined,
    /* Stack-derived data (stack text itself, component name, file:line:col)
       is client-only: server stacks reference SSR chunk paths while client
       stacks reference browser chunk paths, so the same error produces
       different text in each render pass. Rendering them only on the client
       removes that whole class of hydration mismatch while still showing
       developers exactly what they need (the client frame they can act on). */
    stack: onClient ? normalized.stack : '',
    functionName: location?.functionName,
    file: location?.file,
    line: location?.line,
    column: location?.column,
    timestamp: onClient ? new Date().toISOString() : undefined,
    route: onClient ? window.location.pathname + window.location.search : undefined,
    source: onClient ? 'client' : 'server',
  }
}

export function safeProductionMessage(error) {
  if (!error) return 'Something went wrong while rendering this page.'

  // Next.js may provide a generic production message for server errors.
  const message = String(error.message || '')
  if (!message || /server|client|digest|unexpected/i.test(message)) {
    return 'Something went wrong while rendering this page.'
  }

  return message
}
