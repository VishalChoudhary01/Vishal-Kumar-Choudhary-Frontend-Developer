"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/* ==========================================================================
   PAGE LOADER CONTEXT
   ==========================================================================

   Drives the cinematic intro loader (the "CRAFTING" letters + surface
   peel) and gates page content behind it.

   First visit  → the intro plays in full. Content stays hidden
                  (`isLoading=true`, `heroReady=false`) until the peel
                  finishes, then `completeLoading()` reveals it.
   Revisit      → the intro is skipped before first paint, so the peel
                  surface is never painted or left stranded on an empty
                  page.

   TWO-PART reveal, on BOTH paths: `isLoading` (the overlay) is cleared
   first, and `heroReady` is flipped one frame LATER via requestAnimationFrame.
   The hero entrance animations — the FRONTEND/DEVELOPER outline draw +
   solid reveal, the VKr logo ring, the hero image fade — are all driven by
   the heroReady false→true transition. Flipping heroReady in the SAME
   commit lets Motion coalesce it into the mount state, so those animations
   never run (outline sticks, solid never appears).

   The revisit decision itself runs in a layout effect, which commits BEFORE
   the browser paints — so on a revisit the overlay is unmounted before paint
   (no flash, no stranded peel).

   This provider also resets leftover scroll locks on route changes.
   ========================================================================== */

const PageLoaderContext = createContext(null);

export function usePageLoader() {
  const ctx = useContext(PageLoaderContext);

  if (!ctx) {
    throw new Error("usePageLoader must be used within a PageLoaderProvider");
  }

  return ctx;
}

/**
 * Safely resets all scroll locks that may have been left behind
 * by the intro loader, MobileMenu, SuccessModal, or any other overlay.
 */
function resetScrollLocks() {
  const html = document.documentElement;
  const body = document.body;

  /* Clear any inline overflow locks */
  html.style.overflow = "";
  body.style.overflow = "";
  body.style.position = "";
  body.style.top = "";
  body.style.width = "";

  /* Also remove Tailwind utility class locks */
  body.classList.remove("overflow-hidden");

  /*
   * Scroll to top on route change.
   *
   * The reset must go through Lenis when it is active: resetting only
   * `window.scrollY` leaves Lenis' internal target at the previous page's
   * position, so it immediately scrolls the new page back down.
   */
  if (window.lenis && typeof window.lenis.scrollTo === "function") {
    window.lenis.scrollTo(0, { immediate: true, force: true });
  } else {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }
}

/* --------------------------------------------------------------------------
   SESSION VISIT FLAG
   -------------------------------------------------------------------------- */

const VISIT_KEY = "vkr-intro-seen";

/*
 * Key used by intermediate builds — still honored so tabs that completed
 * the intro under an earlier build don't replay it after this update.
 */
const LEGACY_VISIT_KEY = "vkr-intro-visited";

/**
 * True if this browser tab has already played the intro this session.
 * SSR always returns false (intro plays), which keeps hydration consistent —
 * the skip is applied in a layout effect before first paint.
 * Storage failures fall back to "not seen" (safe: intro plays).
 */
function hasSeenIntro() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return (
      window.sessionStorage.getItem(VISIT_KEY) === "1" ||
      window.sessionStorage.getItem(LEGACY_VISIT_KEY) === "1"
    );
  } catch {
    return false;
  }
}

function markIntroSeen() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(VISIT_KEY, "1");
  } catch {
    /* Ignore — worst case the intro plays again next visit. */
  }
}

/*
 * `useLayoutEffect` warns during SSR, so fall back to `useEffect` on the
 * server. The skip only ever runs in the browser.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function PageLoaderProvider({ children }) {
  /*
   * SSR renders the loader (isLoading=true) and hides content (heroReady=false)
   * for every visitor, since the server cannot know the session state. The
   * very first client commit then skips the loader if the intro was already
   * seen this session — before the browser paints, so nothing flashes.
   */
  const [isLoading, setIsLoading] = useState(true);
  const [heroReady, setHeroReady] = useState(false);

  /* Ref to prevent duplicate completions. */
  const hasCompleted = useRef(false);

  /**
   * Called when the intro animation finishes — reveals the page.
   *
   * `heroReady` flips one frame AFTER the overlay unmounts, not in the same
   * commit. The hero entrance animations (the FRONTEND/DEVELOPER outline
   * draw + solid reveal, the VKr logo ring, the hero image fade) are all
   * driven by the heroReady false→true transition; flipping it in the same
   * commit lets Motion coalesce it into the mount state so those animations
   * never run (outline sticks, solid never appears).
   */
  const completeLoading = useCallback(() => {
    if (hasCompleted.current) return;
    hasCompleted.current = true;

    markIntroSeen();

    setIsLoading(false);

    /* Small delay so hero entrance starts after loader unmounts */
    requestAnimationFrame(() => {
      setHeroReady(true);
    });
  }, []);

  /**
   * Skip the intro entirely (revisit) — no overlay, no peel, but the hero
   * entrance animations still play: `heroReady` flips one frame after
   * mount so every gated animation sees a real false→true transition,
   * exactly like the post-intro flow on a first visit.
   */
  const skipLoader = useCallback(() => {
    hasCompleted.current = true;

    setIsLoading(false);

    requestAnimationFrame(() => {
      setHeroReady(true);
    });
  }, []);

  /* ------------------------------------------------------------------
     REVISIT SKIP

     Runs before first paint: if the intro already played this session,
     reveal the page immediately so the peel surface never appears (and
     never gets stranded on an empty page).
     ------------------------------------------------------------------ */
  useIsomorphicLayoutEffect(() => {
    if (hasSeenIntro()) {
      skipLoader();
    }
  }, [skipLoader]);

  /*
   * RESET SCROLL ON ROUTE CHANGE
   *
   * When the user navigates between pages (e.g. main ↔ project detail), any
   * scroll locks left by overlays must be cleared so the new page is
   * scrollable immediately. The previous pathname is tracked in a ref (not
   * state) so the effect never triggers a re-render.
   */
  const pathname = usePathname();
  const prevPathnameRef = useRef(pathname);

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      resetScrollLocks();
    }
  }, [pathname]);

  const value = {
    isLoading,
    heroReady,
    completeLoading,
    skipLoader,
  };

  return (
    <PageLoaderContext.Provider value={value}>
      {children}
    </PageLoaderContext.Provider>
  );
}
