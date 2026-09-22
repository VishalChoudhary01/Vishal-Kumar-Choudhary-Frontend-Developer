'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

function Row({ label, value, mono = false }) {
  if (value === undefined || value === null || value === '') return null

  return (
    <div className="grid gap-1 border-t border-black/5 py-3 first:border-t-0 dark:border-white/10 sm:grid-cols-[150px_1fr] sm:gap-4">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
        {label}
      </dt>
      <dd className={mono ? 'min-w-0 break-all font-mono text-xs leading-5 text-neutral-800 dark:text-neutral-200' : 'text-sm text-neutral-800 dark:text-neutral-200'}>
        {value}
      </dd>
    </div>
  )
}

async function copyText(value) {
  if (!value) return false
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

export default function ErrorDiagnostics({ info }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState('')

  const copy = async (key, value) => {
    const ok = await copyText(value)
    if (!ok) return
    setCopied(key)
    window.setTimeout(() => setCopied(''), 1200)
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-black/10 bg-black/[0.025] dark:border-white/10 dark:bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left outline-none transition-colors hover:bg-black/[0.035] focus-visible:ring-2 focus-visible:ring-black/30 dark:hover:bg-white/[0.05] dark:focus-visible:ring-white/30 sm:px-5"
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500 dark:text-neutral-400">
            Developer diagnostics
          </span>
          <span className="mt-1 block text-sm text-neutral-700 dark:text-neutral-300">
            Development-only runtime information
          </span>
        </span>
        <span className="grid size-8 shrink-0 place-items-center rounded-full border border-black/10 text-sm dark:border-white/10">
          {open ? '−' : '+'}
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-black/10 px-4 pb-5 dark:border-white/10 sm:px-5">
              <dl className="mt-1">
                <Row label="Error" value={info.name} />
                <Row label="Message" value={info.message} />
                <Row label="Component" value={info.functionName} />
                <Row label="File" value={info.file} mono />
                <Row label="Line" value={info.line} />
                <Row label="Column" value={info.column} />
                <Row label="Route" value={info.route} mono />
                <Row label="Source" value={info.source} />
                <Row label="Timestamp" value={info.timestamp} mono />
                <Row label="Digest" value={info.digest} mono />
              </dl>

              {info.file && (
                <button
                  type="button"
                  onClick={() => copy('location', `${info.file}:${info.line ?? '?'}:${info.column ?? '?'}`)}
                  className="mt-4 rounded-full border border-black/10 px-3 py-2 text-xs font-medium transition-colors hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 dark:border-white/10 dark:hover:bg-white/10 dark:focus-visible:ring-white/30"
                >
                  {copied === 'location' ? 'Copied location' : 'Copy location'}
                </button>
              )}

              {info.stack && (
                <details className="mt-4 overflow-hidden rounded-xl border border-black/10 dark:border-white/10">
                  <summary className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-black/30 dark:text-neutral-400 dark:focus-visible:ring-white/30">
                    Stack trace
                  </summary>
                  <div className="border-t border-black/10 dark:border-white/10">
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words p-4 font-mono text-[11px] leading-5 text-neutral-700 dark:text-neutral-300">
                      {info.stack}
                    </pre>
                    <div className="border-t border-black/10 p-3 dark:border-white/10">
                      <button
                        type="button"
                        onClick={() => copy('stack', info.stack)}
                        className="rounded-full border border-black/10 px-3 py-2 text-xs font-medium transition-colors hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                      >
                        {copied === 'stack' ? 'Copied stack' : 'Copy stack'}
                      </button>
                    </div>
                  </div>
                </details>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
