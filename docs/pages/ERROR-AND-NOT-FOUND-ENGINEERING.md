# Error, Not-Found and Recovery Engineering

**Audited branch:** `feat/labs-platform-integration`  
**Current-state date:** 2026-11-07  
**Shared UI:** `src/app/components/errors/ErrorPage.js`

This guide covers the root App Router error surfaces. It does not replace feature-specific loading, empty, retry or validation states.

## 1. Shared route-level error surfaces

| File | Next.js boundary | Current behavior |
|---|---|---|
| `src/app/not-found.js` | Root not-found boundary | Renders shared ErrorPage with status 404 and `kind="not-found"`; its reset callback goes to browser history back |
| `src/app/error.js` | Root route-segment runtime error boundary | Logs the error in the browser; performs one guarded auto-reload for chunk-load failures; otherwise renders shared ErrorPage with status 500 |
| `src/app/global-error.js` | Root global error boundary | Supplies its own `html`, `head` and `body`, logs the error and renders the shared status-500 ErrorPage |
| `src/app/components/errors/ErrorPage.js` | Shared presentation | Production-safe message, development diagnostics, reference ID, route context, retry/home/reload actions |

There is no root `src/app/loading.js` in the audited tree. Do not invent a universal global loading state; retain the loading/skeleton behavior owned by each page or feature.

## 2. ErrorPage presentation contract

The shared page:
- uses an accessible main/heading structure and Motion entrance treatment;
- displays HTTP-like status, a short title, environment label and a stable error reference;
- provides **Try again** for runtime errors, **Go home** for navigation and **Reload** for runtime errors;
- includes route and reference context;
- shows a production-safe message in production;
- renders `ErrorDiagnostics` only outside production;
- respects light/dark semantic styling and uses a responsive layout that avoids horizontal overflow.

For not-found state the primary label is “Route not found”, the status is 404 and the runtime-only retry/reload controls are omitted. The current root not-found handler uses `window.history.back()` for the underlying reset callback; the shared not-found presentation offers the home action.

## 3. Chunk-load recovery

The root `error.js` recognizes common chunk/dynamic-module load failures (including `ChunkLoadError`). In that case it reads `portfolio:chunk-error-reloaded-at` from sessionStorage and auto-reloads only when the last reload attempt is older than the 10-second guard window.

Before reloading it records the current time. If sessionStorage is unavailable, or the guard window has not elapsed, it shows the error page instead of risking a reload loop. This recovery is deliberately limited to recognized chunk-loading failures; generic application errors are not automatically retried.

Do not broaden auto-reload to all errors. A persistent runtime/data failure could otherwise create an infinite reload loop.

## 4. Production versus development diagnostics

`ErrorPage` calls `getDiagnosticInfo` and derives a stable reference:
1. Next.js `error.digest` when present;
2. a deterministic error-name/message hash for ordinary Error instances;
3. a last-resort generated reference when no stable Error object exists.

In production, the visible message uses `safeProductionMessage(error)`; stack/file/line diagnostics are not rendered. The diagnostic panel explains that the reference ID can be used to find the incident in server logs/observability tooling.

In development, `ErrorDiagnostics` can parse the client stack, identify a project source frame and request a small source snippet from `/api/source-snapshot`. That route is development-only and returns 404 in production. Preserve the production guard, source-root containment check and path traversal rejection; do not expose source snapshots through a production diagnostic endpoint.

The error boundaries log errors for diagnosis. Do not add logging of session cookies, tokens, passwords, source contents, SMTP secrets, provider credentials or contact-message bodies.

## 5. Retry semantics and feature-owned states

The root ErrorPage retry calls the Next.js boundary `reset` callback. Reload performs a full page reload. Go home navigates to `/`.

These actions are not substitutes for a feature-level retry. For example:
- Analytics query failures should preserve the dashboard shell and provide report retry/stale feedback.
- Labs source loading should distinguish guest, unverified, unpublished, unavailable and transport-failure states.
- Editor/preview/publish actions should preserve draft content and show operation-specific errors.
- Contact submission should preserve the entered message after validation or transport failure.
- Media failure should use the documented next media source or unavailable fallback, not a global route error.
- Authentication email/verification failures should use generic account-safe messaging.

A feature should throw into the root boundary only for an unrecoverable render/runtime failure, not for an expected empty result, validation failure or recoverable API error.

## 6. Implementation and test checklist

- [ ] Unknown route renders the root 404 design and offers a reliable home path.
- [ ] Runtime boundary reset retries without discarding unrelated user state.
- [ ] Generic render error shows a non-sensitive production message.
- [ ] Development error can show diagnostics when the source-snapshot endpoint is available.
- [ ] Production source-snapshot endpoint remains 404.
- [ ] ChunkLoadError triggers one reload and does not enter a repeated reload loop.
- [ ] Non-chunk errors never auto-reload.
- [ ] sessionStorage-denied behavior falls back to the visible error page.
- [ ] Error page is keyboard-operable, screen-reader meaningful and responsive at zoom/mobile sizes.
- [ ] Light/dark theme and reduced-motion behavior remain correct.
- [ ] No secrets or user-submitted content appear in visible errors or logs.

This source review did not run browser QA or simulate deployment chunk mismatches; these are acceptance checks, not passed tests.
