'use client'

import { useEffect, useState } from 'react'
import ErrorPage from '@/app/components/errors/ErrorPage'

/* ==========================================================================
   CHUNK LOAD RECOVERY

   A lazy chunk can fail to load when the tab is running an older build than
   the server (rebuild, redeploy, hot reload). Navigation then throws
   ChunkLoadError, the error boundary mounts, and the page becomes a short
   dead-end screen that cannot scroll.

   When that specific failure happens, reload the page once so the client
   picks up the current build instead of showing the error page. A session
   guard prevents reload loops when the chunk genuinely cannot load.
   ========================================================================== */

const RELOAD_GUARD_KEY = 'portfolio:chunk-error-reloaded-at'
const RELOAD_GUARD_WINDOW_MS = 10000

function isChunkLoadError(error) {
    if (!error) return false

    const name = String(error.name || '')
    const message = String(error.message || '')

    return (
        name === 'ChunkLoadError' ||
        /loading chunk|failed to load chunk|loading dynamically imported module|dynamically imported module|importing a module script failed|load failed/i.test(
            message
        )
    )
}

function shouldAutoReload(error) {
    if (typeof window === 'undefined') return false
    if (!isChunkLoadError(error)) return false

    try {
        const lastReloadAt = Number(
            window.sessionStorage.getItem(RELOAD_GUARD_KEY) || 0
        )

        return Date.now() - lastReloadAt > RELOAD_GUARD_WINDOW_MS
    } catch {
        /* sessionStorage unavailable → show the error page instead of risking a loop */
        return false
    }
}

function markReloadAttempt() {
    try {
        window.sessionStorage.setItem(
            RELOAD_GUARD_KEY,
            String(Date.now())
        )
    } catch {
        /* ignore */
    }
}

export default function Error({ error, reset }) {
    const [willAutoReload] = useState(() => shouldAutoReload(error))

    useEffect(() => {
        console.error('[portfolio:error]', error)

        if (willAutoReload) {
            markReloadAttempt()
            window.location.reload()
        }
    }, [error, willAutoReload])

    /* While the reload is pending, avoid flashing the dead-end error screen. */
    if (willAutoReload) {
        return null
    }

    return <ErrorPage error={error} reset={reset} status={500} kind="runtime" />
}
