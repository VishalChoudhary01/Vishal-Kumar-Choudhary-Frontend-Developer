'use client'

import { useEffect } from 'react'
import ErrorPage from '@/app/components/errors/ErrorPage'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('[portfolio:global-error]', error)
  }, [error])

  return (
    <html lang="en">
      <head>
        <title>Application error</title>
      </head>
      <body className="m-0 min-h-dvh bg-white p-0 dark:bg-neutral-950">
        <ErrorPage error={error} reset={reset} status={500} kind="runtime" />
      </body>
    </html>
  )
}
