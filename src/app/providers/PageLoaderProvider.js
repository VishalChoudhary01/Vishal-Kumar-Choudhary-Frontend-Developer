"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/* ==========================================================================
   PAGE LOADER CONTEXT
   ==========================================================================

   Manages a global page loader that:
   - Shows on initial page load
   - Shows on client-side navigation (e.g. to project detail pages)
   - Blocks hero/section animations until loader completes
   - Waits for critical assets before dismissing
   - Resets scroll lock on route changes

   Usage:
     const { isLoading, isInitialLoad, startLoading, completeLoading } = usePageLoader();

   Flow:
     1. App mounts → isInitialLoad=true, isLoading=true (loader visible)
     2. Loader runs its CRAFTING animation → calls onComplete
     3. completeLoading() → isLoading=false, isInitialLoad=false (hero animations start)
     4. On navigation: startLoading() → isLoading=true → completeLoading()
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
 * by PortfolioIntro, MobileMenu, SuccessModal, or any other overlay.
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

export function PageLoaderProvider({ children }) {
  /* Initial load — loader is visible on first mount */
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  /* Track whether hero should animate (false during/after loader) */
  const [heroReady, setHeroReady] = useState(false);

  /* Ref to prevent duplicate completions */
  const hasCompleted = useRef(false);

  /* ------------------------------------------------------------------
     RESET SCROLL ON ROUTE CHANGE

     When the user navigates between pages (e.g. main ↔ project detail),
     any scroll locks left by overlays (PortfolioIntro, MobileMenu, etc.)
     must be cleared so the new page is scrollable immediately.
     ------------------------------------------------------------------ */
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      resetScrollLocks();
    }
  }, [pathname]);

  /**
   * Called when the loader animation finishes.
   * Unblocks the page content and hero animations.
   */
  const completeLoading = useCallback(() => {
    if (hasCompleted.current) return;

    hasCompleted.current = true;
    setIsLoading(false);
    setIsInitialLoad(false);

    /* Small delay so hero entrance starts after loader unmounts */
    requestAnimationFrame(() => {
      setHeroReady(true);
    });
  }, []);

  /**
   * Start loading (for client-side navigation).
   * Resets state so loader reappears.
   */
  const startLoading = useCallback(() => {
    hasCompleted.current = false;
    setHeroReady(false);
    setIsLoading(true);
  }, []);

  /**
   * Skip loader entirely (e.g. for reduced motion or fast navigations).
   */
  const skipLoader = useCallback(() => {
    hasCompleted.current = true;
    setIsLoading(false);
    setIsInitialLoad(false);
    setHeroReady(true);
  }, []);

  const value = {
    isLoading,
    isInitialLoad,
    heroReady,
    completeLoading,
    startLoading,
    skipLoader,
  };

  return (
    <PageLoaderContext.Provider value={value}>
      {children}
    </PageLoaderContext.Provider>
  );
}
