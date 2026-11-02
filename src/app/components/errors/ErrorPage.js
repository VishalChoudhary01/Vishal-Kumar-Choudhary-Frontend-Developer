'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import ErrorDiagnostics from './ErrorDiagnostics'
import { createReferenceId, getDiagnosticInfo, isProduction, safeProductionMessage, displayName } from './error-utils'

function CodeBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-md border border-black/10 bg-black/[0.025] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-neutral-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-neutral-300">
      {children}
    </span>
  )
}

function ActionButton({ children, onClick, href, secondary = false }) {
  const className = secondary
    ? 'inline-flex min-h-10 items-center justify-center rounded-md border border-black/10 px-3.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/15 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/30'
    : 'inline-flex min-h-10 items-center justify-center rounded-md bg-neutral-950 px-3.5 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/40 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-950 dark:focus-visible:ring-white/40 dark:focus-visible:ring-offset-neutral-950'

  if (href) return <Link href={href} className={className}>{children}</Link>
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
  const errorName = production ? undefined : info.name

  const retry = async () => {
    setIsRetrying(true)
    try {
      await Promise.resolve(reset?.())
    } finally {
      window.setTimeout(() => setIsRetrying(false), 350)
    }
  }

  const reload = () => window.location.reload()
  const entrance = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-white text-neutral-950 selection:bg-neutral-950 selection:text-white dark:bg-neutral-950 dark:text-white dark:selection:bg-white dark:selection:text-neutral-950 lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(0,0,0,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.045)_1px,transparent_1px)] [background-size:32px_32px] dark:opacity-50 dark:[background-image:linear-gradient(to_right,rgba(255,255,255,.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.045)_1px,transparent_1px)]" />

      <div className="relative mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col px-4 py-5 sm:px-6 sm:py-7 lg:h-full lg:min-h-0 lg:px-8 lg:py-6 xl:px-10">
        <motion.header {...entrance} transition={{ duration: 0.24, ease: 'easeOut' }} className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CodeBadge>{kind === 'not-found' ? '404 / NOT FOUND' : '500 / RUNTIME ERROR'}</CodeBadge>
            <CodeBadge>{production ? 'PRODUCTION' : 'DEVELOPMENT'}</CodeBadge>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-400 dark:text-neutral-500">Reference · {reference}</span>
        </motion.header>

        <div className="mt-5 grid flex-1 gap-5 lg:min-h-0 lg:grid-cols-[minmax(260px,0.72fr)_minmax(0,1.65fr)] lg:gap-6 xl:mt-6 xl:gap-8">
          <motion.section
            {...entrance}
            transition={{ duration: 0.28, delay: 0.04, ease: 'easeOut' }}
            className="min-w-0 self-start lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:justify-center"
            aria-labelledby="error-title"
          >
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-4xl font-semibold leading-none tracking-[-0.05em] sm:text-5xl">{status}</span>
              <h1 id="error-title" className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                {title}
              </h1>
            </div>

            {errorName && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                role="status"
                className="mt-4 flex min-w-0 items-start gap-2.5 border-l-2 border-red-500 bg-red-500/[0.06] px-3 py-2.5 dark:border-red-400 dark:bg-red-400/[0.08]"
              >
                <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 rounded-full bg-red-500 dark:bg-red-400" />
                <span className="min-w-0 break-words font-mono text-xs leading-5 text-red-700 dark:text-red-200">{displayName(info)}</span>
              </motion.div>
            )}

            <p className="mt-4 max-w-lg text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base sm:leading-7">
              {message}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {kind !== 'not-found' && <ActionButton onClick={retry}>{isRetrying ? 'Retrying…' : 'Try again'}</ActionButton>}
              <ActionButton href="/" secondary>Go home</ActionButton>
              {kind !== 'not-found' && <ActionButton onClick={reload} secondary>Reload</ActionButton>}
            </div>

            <div className="mt-5 space-y-1 border-t border-black/10 pt-3 text-[11px] text-neutral-500 dark:border-white/10 dark:text-neutral-400">
              <p className="break-all">Route <span className="font-mono text-neutral-700 dark:text-neutral-200">{pathname}</span></p>
              <p className="break-all">Reference <span className="font-mono text-neutral-700 dark:text-neutral-200">{reference}</span></p>
            </div>
          </motion.section>

          <motion.aside
            {...entrance}
            transition={{ duration: 0.3, delay: 0.09, ease: 'easeOut' }}
            className="min-w-0 rounded-xl border border-black/10 bg-white/80 shadow-[0_20px_70px_-48px_rgba(0,0,0,.4)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] dark:shadow-none lg:h-full lg:min-h-0 lg:overflow-hidden"
            data-diagnostics-panel
            aria-label="Error details and stack trace"
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-3 dark:border-white/10 sm:px-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">Developer diagnostics</p>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">Location and stack · {production ? 'production-safe view' : 'development detail'}</p>
              </div>
              <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-red-500/80" />
            </div>
            <div className="p-3 sm:p-4 lg:h-[calc(100%-57px)] lg:min-h-0">
              {production
                ? <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">The error was contained. Use the reference ID above to find the corresponding incident in server logs or your observability provider.</p>
                : <ErrorDiagnostics info={info} />}
            </div>
          </motion.aside>
        </div>
      </div>
    </main>
  )
}
