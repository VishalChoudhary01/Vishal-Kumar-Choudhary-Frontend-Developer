'use client'

import { useEffect } from 'react'
import ErrorPage from '@/app/components/errors/ErrorPage'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('[portfolio:error]', error)
  }, [error])

  return <ErrorPage error={error} reset={reset} status={500} kind="runtime" />
}
