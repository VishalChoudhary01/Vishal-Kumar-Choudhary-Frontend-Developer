'use client'

import ErrorPage from '@/app/components/errors/ErrorPage'


export default function NotFound() {
  const error = new Error('The page you requested could not be found.')

  return <ErrorPage error={error} reset={() => window.history.back()} status={404} kind="not-found" />
}
