'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import ErrorDiagnostics from './ErrorDiagnostics'
import { createReferenceId, getDiagnosticInfo, isProduction, safeProductionMessage } from './error-utils'

function CodeBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.025] px-3 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300">
      {children}
    </span>
  )
}

function ActionButton({ children, onClick, href, secondary = false }) {
  const className = secondary
    ? 'inline-flex min-h-11 items-center justify-center rounded-full border border-black/10 px-5 text-sm font-medium text-neutral-900 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/15 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/30'
    : 'inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white shadow-[0_12px_30px_-18px_rgba(0,0,0,.7)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-950 dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-neutral-950'

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
  const eyebrow = kind === 'not-found' ? '404 / NOT FOUND' : '500 / RUNTIME ERROR'

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-neutral-950 selection:bg-neutral-950 selection:text-white dark:bg-neutral-950 dark:text-white dark:selection:bg-white dark:selection:text-neutral-950">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(0,0,0,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.045)_1px,transparent_1px)] [background-size:32px_32px] dark:opacity-50 dark:[background-image:linear-gradient(to_right,rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.045)_1px,transparent_1px)]" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 size-[42rem] -translate-x-1/2 rounded-full bg-neutral-900/[0.04] blur-3xl dark:bg-white/[0.04]"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-5 py-12 sm:px-8 lg:px-10">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-wrap items-center gap-2"
          >
            <CodeBadge>{eyebrow}</CodeBadge>
            <CodeBadge>{production ? 'PRODUCTION' : 'DEVELOPMENT'}</CodeBadge>
          </motion.div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-end lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.06, ease: 'easeOut' }}
            >
              <p className="font-mono text-[clamp(3.8rem,13vw,9rem)] font-semibold leading-[.8] tracking-[-0.08em] text-neutral-200 dark:text-white/[0.08]">
                {status}
              </p>
              <h1 className="mt-5 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.045em] sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300 sm:text-lg">
                {message}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {kind !== 'not-found' && <ActionButton onClick={retry}>{isRetrying ? 'Retrying…' : 'Try again'}</ActionButton>}
                <ActionButton href="/" secondary>Go home</ActionButton>
                {kind !== 'not-found' && <ActionButton onClick={reload} secondary>Reload</ActionButton>}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                <span>Route: <span className="font-mono text-neutral-700 dark:text-neutral-200">{pathname}</span></span>
                <span>Reference: <span className="font-mono text-neutral-700 dark:text-neutral-200">{reference}</span></span>
              </div>
            </motion.div>

            <motion.aside
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.14, ease: 'easeOut' }}
              className="rounded-3xl border border-black/10 bg-white/75 p-5 shadow-[0_24px_80px_-48px_rgba(0,0,0,.38)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-xs uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
                  Incident snapshot
                </span>
                <span className="size-2 rounded-full bg-current opacity-60" aria-hidden="true" />
              </div>

              <div className="mt-5 rounded-2xl border border-black/10 bg-black/[0.02] p-4 dark:border-white/10 dark:bg-white/[0.025]">
                <p className="text-sm font-medium">{production ? 'The error was contained.' : 'Detailed diagnostics are available below.'}</p>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                  {production
                    ? 'Use the reference ID to match this incident against your server logs or observability provider.'
                    : 'Use the component, file, line, column and stack information to jump directly to the failing code.'}
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Status</span>
                  <span className="mt-2 block font-mono text-sm">{status}</span>
                </div>
                <div className="rounded-2xl border border-black/10 p-4 dark:border-white/10">
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">Mode</span>
                  <span className="mt-2 block font-mono text-sm">{production ? 'prod' : 'dev'}</span>
                </div>
              </div>

              {!production && <ErrorDiagnostics info={info} />}
            </motion.aside>
          </div>
        </div>
      </div>
    </main>
  )
}
