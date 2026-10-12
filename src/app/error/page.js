'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DebugErrorPage() {
  const router = useRouter()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      router.replace('/')
    }
  }, [router])

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  throw new Error('Intentional development error from /debug/error. Inspect component, file, line and stack diagnostics.')
}
