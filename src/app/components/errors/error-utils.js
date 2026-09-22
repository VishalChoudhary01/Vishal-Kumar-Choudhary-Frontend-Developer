export function isProduction() {
  return process.env.NODE_ENV === 'production'
}

export function normalizeError(error) {
  const value = error instanceof Error ? error : new Error(String(error ?? 'Unknown error'))
  return value
}

export function createReferenceId(error) {
  if (error?.digest) return String(error.digest)

  // Stable enough for the lifetime of the displayed error object.
  // This is deliberately client-side only and is not used as a security identifier.
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  } catch {}

  return `ERR-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
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
  const location = parseStackFrame(normalized.stack)

  return {
    name: normalized.name || 'Error',
    message: normalized.message || 'Unexpected application error.',
    digest: normalized.digest ? String(normalized.digest) : undefined,
    stack: normalized.stack || '',
    functionName: location?.functionName,
    file: location?.file,
    line: location?.line,
    column: location?.column,
    timestamp: new Date().toISOString(),
    route: typeof window !== 'undefined' ? window.location.pathname + window.location.search : undefined,
    source: typeof window !== 'undefined' ? 'client' : 'server',
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
