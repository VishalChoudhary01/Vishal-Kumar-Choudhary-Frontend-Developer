'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import ErrorDiagnostics from './ErrorDiagnostics'
import { createReferenceId, getDiagnosticInfo, isProduction, safeProductionMessage, displayName } from './error-utils'

/*
 * Compact error dashboard.
 *
 * Layout goals (see refactor spec):
 *   - Viewport-fitted on desktop: content fits without page scrolling at
 *     common laptop sizes (min-h-dvh, NOT h-screen + big padding).
 *   - Balanced two-column grid on desktop; single column on mobile.
 *   - The status code is metadata, not the hero: badge-sized, monospace.
 *   - Diagnostics are laid out alongside the summary, not below it.
 *   - Entrance motion is subtle (opacity + 12px rise, 200–280ms).
 *   - No wheel/touch interception, no scroll locking, no Lenis: the page
 *     scrolls with native browser behavior when content exceeds the
 *     viewport (small screens, short viewports, long messages).
 */

function CodeBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.025] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300">
      {children}
    </span>
  )
}

function ActionButton({ children, onClick, href, secondary = false }) {
  const className = secondary
    ? 'inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium text-neutral-900 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/15 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/30'
    : 'inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-950 px-4 text-sm font-medium text-white shadow-[0_12px_30px_-18px_rgba(0,0,0,.7)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-950 dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-neutral-950'

  if (href) {
    return <Link href={href} className={className}>{children}</Link>
  }

  return <button type="button" onClick={onClick} className={className}>{children}</button>
}

export default function ErrorPage({ error, reset, status = 500, kind = 'runtime' }) {
  const pathname = usePathname() || '/'
  const [isRetrying, setIsRetrying] = useState(false)
  const production = isProduction()

  const info = useMemo(() => getDiagnosticInfo(error), [error])
  const reference = useMemo(() => createReferenceId(error), [error])
  const message = production ? safeProductionMessage(error) : info.message
  const title = kind === 'not-found' ? 'Route not found' : 'Something failed'
  /* Stable error name for SSR-safe red emphasis on the real failure.
     info.name comes from the Error object itself (e.g. "ReferenceError"),
     identical across server and client passes, so it can be rendered
     during SSR without mismatch. */
  const errorName = production ? undefined : info.name

  const retry = async () => {
    setIsRetrying(true)
    try {
      await Promise.resolve(reset?.())
    } finally {
      window.setTimeout(() => setIsRetrying(false), 350)
    }
  }

  const reload = () => {
    window.location.reload()
  }

  const entrance = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 } }
  const easeOut = { duration: 0.24, ease: 'easeOut' }
  const banner = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } }

  return (
    <main className="relative min-h-dvh bg-white text-neutral-950 selection:bg-neutral-950 selection:text-white dark:bg-neutral-950 dark:text-white dark:selection:bg-white dark:selection:text-neutral-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(0,0,0,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.045)_1px,transparent_1px)] [background-size:32px_32px] dark:opacity-50 dark:[background-image:linear-gradient(to_right,rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.045)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        {/* ── Header: badges ──────────────────────────────────── */}
        <motion.div
          {...entrance}
          transition={easeOut}
          className="flex flex-wrap items-center gap-2"
        >
          <CodeBadge>{kind === 'not-found' ? '404 / NOT FOUND' : '500 / RUNTIME ERROR'}</CodeBadge>
          <CodeBadge>{production ? 'PRODUCTION' : 'DEVELOPMENT'}</CodeBadge>
        </motion.div>

        {/* ── Two-column dashboard ───────────────────────────── */}
        <div className="mt-5 grid gap-6 sm:mt-7 lg:grid-cols-[1fr_minmax(340px,440px)] lg:items-start lg:gap-10">
          {/* ── Left column: summary + actions + metadata ──── */}
          <motion.div
            {...entrance}
            transition={{ duration: 0.26, delay: 0.04, ease: 'easeOut' }}
            className="min-w-0"
          >
            <div className="flex items-baseline gap-3 sm:gap-4">
              <span className="font-mono text-4xl font-semibold leading-none tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-5xl">
                {status}
              </span>
              <h1 className="min-w-0 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                {title}
              </h1>
            </div>

            {errorName && (
              <motion.div
                {...banner}
                transition={easeOut}
                role="status"
                className="mt-4 flex min-w-0 items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-3.5 py-2.5 dark:border-red-400/25 dark:bg-red-400/[0.09]"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 rounded-full bg-red-500 dark:bg-red-400"
                  style={{ width: 8, height: 8 }}
                />
                <span className="min-w-0 break-words font-mono text-[12.5px] leading-5 text-red-700 dark:text-red-200">
                  {displayName(info)}
                </span>
              </motion.div>
            )}

            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base sm:leading-7">
              {message}
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              {kind !== 'not-found' && <ActionButton onClick={retry}>{isRetrying ? 'Retrying…' : 'Try again'}</ActionButton>}
              <ActionButton href="/" secondary>Go home</ActionButton>
              {kind !== 'not-found' && <ActionButton onClick={reload} secondary>Reload</ActionButton>}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span className="min-w-0 break-all">Route: <span className="font-mono text-neutral-700 dark:text-neutral-200">{pathname}</span></span>
              <span className="min-w-0 break-all">Reference: <span className="font-mono text-neutral-700 dark:text-neutral-200">{reference}</span></span>
            </div>
          </motion.div>

          {/* ── Right column: diagnostics dashboard ─────────── */}
          <motion.aside
            {...entrance}
            transition={{ duration: 0.26, delay: 0.1, ease: 'easeOut' }}
            className="min-w-0 self-stretch rounded-2xl border border-black/10 bg-white/75 p-4 shadow-[0_24px_80px_-48px_rgba(0,0,0,.38)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none sm:p-5"
            data-diagnostics-panel
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                Incident snapshot
              </span>
              <span className="size-1.5 rounded-full bg-current opacity-60" aria-hidden="true" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-black/10 px-3 py-2.5 dark:border-white/10">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Status</span>
                <span className="mt-1 block font-mono text-xs">{status}</span>
              </div>
              <div className="rounded-xl border border-black/10 px-3 py-2.5 dark:border-white/10">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Mode</span>
                <span className="mt-1 block font-mono text-xs">{production ? 'prod' : 'dev'}</span>
              </div>
            </div>

            <p className="mt-3 text-[13px] leading-5 text-neutral-600 dark:text-neutral-400">
              {production
                ? 'The error was contained. Use the reference ID to match this incident against your server logs or observability provider.'
                : 'Use the error, location and stack information to jump directly to the failing code. Stack trace expanded below when available.'}
            </p>

            {!production && <ErrorDiagnostics info={info} />}
          </motion.aside>
        </div>
      </div>
    </main>
  )
}
