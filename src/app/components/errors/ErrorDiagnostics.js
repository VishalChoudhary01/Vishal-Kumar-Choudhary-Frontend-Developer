'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { motion } from 'motion/react'

const subscribeNoop = () => () => {}
const easeEnter = [0.16, 1, 0.3, 1]

/* ── Source extraction ─────────────────────────────────────────────────
   Scans the raw stack text for a project-source frame. Next.js dev chunks
   keep source-relative paths (e.g. ".../src/app/components/...") even in
   compiled stacks; production bundles generally do not. Everything here is
   best-effort and guarded: unusable stacks render as an explicit
   "unresolved" state rather than a fabricated location. */
function findSourceFrame(stack) {
  if (!stack || typeof stack !== 'string') return null
  const lines = stack.split('\n')
  for (const line of lines) {
    const m = line.match(
      /(?:src[\\/].*?\.(?:js|jsx|ts|tsx))(?:\?[^)\s]*)?:(\d+):(\d+)/
    )
    if (!m) continue
    const pathMatch = line.match(
      /((?:[A-Za-z]:)?[^\s()]*src[\\/][^\s()]*?\.(?:js|jsx|ts|tsx))/i
    )
    if (!pathMatch) continue
    return {
      file: pathMatch[1],
      line: Number(m[1]),
      column: Number(m[2]),
    }
  }
  return null
}

async function readSourceFile(file, line) {
  if (typeof window === 'undefined') return null
  if (!/^\/?src[\\/]/.test(file) || /\\/.test(file) ? !/\//.test(file) : false) {
    /* Windows dev stacks can contain backslashes; normalize below. */
  }
  const normalized = file.replace(/\\/g, '/').replace(/^\/+/, '')
  if (!/^src\//.test(normalized)) return null
  try {        const res = await fetch(`/api/source-snapshot?path=${encodeURIComponent(normalized)}`)
    if (!res.ok) return null
    const json = await res.json()
    if (!Array.isArray(json.lines)) return null
    const start = Math.max(1, line - 4)
    const end = Math.min(json.lines.length, line + 4)
    const lines = []
    for (let n = start; n <= end; n++) {
      lines.push({ n, text: String(json.lines[n - 1] ?? '') })
    }
    return { file: normalized, line, lines, availableUpTo: json.lines.length }
  } catch {
    return null
  }
}

const motionSubtle = (reducedVar, delay = 0) => ({
  initial: reducedVar ? false : { opacity: 0, y: 10 },
  animate: reducedVar ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 },
  transition: reducedVar
    ? { duration: 0 }
    : { duration: 0.26, delay, ease: easeEnter },
})

/* ── Rows ──────────────────────────────────────────────────────────────── */
function DiagRow({ label, value, mono = true, truncate = true }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <dt className="shrink-0 text-[9.5px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd
        className={`min-w-0 font-mono text-[11px] leading-4 text-neutral-800 dark:text-neutral-200 ${
          truncate ? 'truncate' : 'break-all'
        }`}
        title={typeof value === 'string' ? value : undefined}
      >
        {value}
      </dd>
    </div>
  )
}

/* ── Stack trace panel ─────────────────────────────────────────────────── */
function StackTracePanel({ stack }) {
  return (
    <section aria-label="Stack trace" className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 pb-2">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
          Stack trace
        </h3>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-black/20 scrollbar-thin">
        <pre
          tabIndex={0}
          role="region"
          aria-label="Stack trace frames, scrollable"
          className="min-h-full w-full whitespace-pre-wrap break-words p-3 font-mono text-[10.5px] leading-[1.55] text-neutral-700 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/30 dark:text-neutral-300 dark:focus-visible:ring-white/30"
        >
          {stack || 'No stack trace was available for this error.'}
        </pre>
      </div>
    </section>
  )
}

/* ── Source code context ───────────────────────────────────────────────── */
function SourceCodeContext({ source, file, line, reducedVar }) {
  const [snip, setSnip] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const inputsReady = source === 'client' && Boolean(file) && Boolean(line)
    /* Resolve asynchronously in both branches so the effect body never
       calls setState synchronously (lint restriction); the failed state
       simply travels the same microtask path as a real fetch. */
    let cancelled = false
    const fetched = inputsReady
      ? readSourceFile(file, line)
      : Promise.resolve(null)
    fetched
      .then((result) => {
        if (cancelled) return
        if (result) setSnip(result)
        else setFailed(true)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [source, file, line])

  if (failed) {
    return (
      <section aria-label="Source code context" className="min-w-0">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
          Source code context
        </h3>
        <p className="mt-2 text-[12px] leading-5 text-neutral-500 dark:text-neutral-400">
          Original source context could not be resolved for this error; the
          stack trace above retains the available frames.
        </p>
      </section>
    )
  }

  if (!snip) return null

  return (
    <motion.section
      {...motionSubtle(reducedVar, 0.12)}
      aria-label="Source code context"
      className="min-w-0"
    >
      <h3 className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
        Source code context
      </h3>
      <p className="mt-1 break-all font-mono text-[10.5px] text-neutral-600 dark:text-neutral-300">
        {snip.file} · line {snip.line}
      </p>
      <div className="mt-2 max-h-56 overflow-auto overscroll-contain rounded-xl border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-black/20 scrollbar-thin">
        <table className="w-full border-collapse font-mono text-[10.5px] leading-[1.55]">
          <tbody>
            {snip.lines.map(({ n, text }) => {
              const failing = n === snip.line
              return (
                <tr
                  key={n}
                  className={
                    failing
                      ? 'border-l-2 border-red-500 bg-red-500/[0.09] dark:border-red-400 dark:bg-red-400/[0.12]'
                      : 'border-l-2 border-transparent'
                  }
                >
                  <td
                    aria-hidden="true"
                    className={`w-10 select-none pr-2 text-right ${
                      failing
                        ? 'text-red-600 dark:text-red-300'
                        : 'text-neutral-400 dark:text-neutral-600'
                    }`}
                  >
                    {n}
                  </td>
                  <td
                    className={`whitespace-pre-wrap break-words py-px pr-3 ${
                      failing
                        ? 'text-red-700 dark:text-red-200'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {text || ' '}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.section>
  )
}

/* ── Developer diagnostics ─────────────────────────────────────────────── */
export default function ErrorDiagnostics({ info }) {
  const [copied, setCopied] = useState('')
  const reducedVar = useSyncExternalStore(
    subscribeNoop,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false
  )

  /* Stack-derived diagnostic values (file/line/column, stack text,
     timestamp) only exist after hydration: server stacks reference SSR
     chunk paths while client stacks reference browser chunk paths, so
     rendering them during SSR would mismatch the client pass.
     useSyncExternalStore gives a false snapshot on the server and after
     hydration guarantees the subscribed snapshot is used instead of the
     initial server value. */
  const mounted = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )

  const copy = async (key, value) => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      window.setTimeout(() => setCopied(''), 1200)
    } catch {
      /* clipboard unavailable — leave button inert rather than crashing */
    }
  }

  const location = info.file
    ? `${info.file}:${info.line ?? '?'}:${info.column ?? '?'}`
    : undefined

  const rootCause = info.functionName
    ? `Failure inside ${info.functionName}${
        location ? ` (${location})` : ''
      }. The function referenced a value that is not in scope at that point, throwing a ${info.name}. Fix the source shown below rather than masking the throw.`
    : undefined

  const reduced = reducedVar

  return (
    <section
      aria-label="Developer diagnostics"
      data-testid="developer-diagnostics"
      className="mt-0 flex min-h-0 min-w-0 flex-col border-0 bg-transparent p-0 lg:h-full lg:overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
          Developer diagnostics
        </h2>
        {mounted && location && (
          <button
            type="button"
            onClick={() => copy('location', location)}
            className="shrink-0 rounded-full border border-black/10 px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/10 dark:hover:bg-white/10 dark:focus-visible:ring-white/30"
          >
            {copied === 'location' ? 'Copied' : 'Copy location'}
          </button>
        )}
      </div>

      {mounted && info.stack ? (
        <>
          {/* Two columns: diagnostics (left) + stack (right), collapsing
              to a single column below lg. min-h-0 + overflow keep both
              columns independently scrollable on short viewports. */}
          <motion.div
            {...motionSubtle(reduced, 0.04)}
            className="mt-3 grid min-h-0 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.4fr)] lg:overflow-hidden"
          >
            <div className="min-w-0 lg:min-h-0 lg:overflow-y-auto lg:pr-2">
              <dl className="min-w-0">
                <DiagRow label="Error" value={info.name} />
                <DiagRow label="Component" value={info.functionName} />
                <DiagRow label="Location" value={location} />
                <DiagRow label="Route" value={info.route} />
                <DiagRow label="Source" value={info.source} />
                <DiagRow label="Timestamp" value={info.timestamp} />
                <DiagRow label="Digest" value={info.digest} />
              </dl>
              <div className="mt-3 border-t border-black/5 pt-2.5 dark:border-white/10">
                <dt className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  Message
                </dt>
                <dd className="mt-1 break-words font-mono text-[11px] leading-5 text-neutral-800 dark:text-neutral-200">
                  {info.message}
                </dd>
              </div>
              {rootCause && (
                <div className="mt-3 rounded-xl border-l-2 border-red-500/50 bg-red-500/[0.05] px-3 py-2.5 dark:border-red-400/50 dark:bg-red-400/[0.06]">
                  <dt className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-red-600 dark:text-red-300">
                    Root cause
                  </dt>
                  <dd className="mt-1 text-[12px] leading-5 text-neutral-700 dark:text-neutral-200">
                    {rootCause}
                  </dd>
                </div>
              )}
            </div>

            <div className="flex min-h-0 min-w-0 flex-col lg:overflow-hidden">
              <StackTracePanel stack={info.stack} />
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => copy('stack', info.stack)}
                  className="rounded-full border border-black/10 px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/10 dark:hover:bg-white/10 dark:focus-visible:ring-white/30"
                >
                  {copied === 'stack' ? 'Copied' : 'Copy stack'}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Full-width source context under both columns */}
          <div className="mt-3 shrink-0 border-t border-black/5 pt-3 dark:border-white/10 lg:max-h-40 lg:overflow-y-auto">
            <SourceCodeContext
              source={info.source}
              file={info.file}
              line={info.line}
              reducedVar={reduced}
            />
          </div>
        </>
      ) : (
        <p className="mt-2 text-[12.5px] leading-5 text-neutral-500 dark:text-neutral-400">
          {mounted
            ? 'No stack trace was available for this error.'
            : 'Collecting diagnostics…'}
        </p>
      )}
    </section>
  )
}
