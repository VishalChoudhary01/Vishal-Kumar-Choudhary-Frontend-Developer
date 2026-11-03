"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

export default function SmoothScroll({ children }) {
  const pathname = usePathname();
  const isLabsRoute =
    pathname === "/labs" || pathname.startsWith("/labs/");

  useEffect(() => {
    /*
     * Labs uses native browser scrolling.
     *
     * Scroll-linked experiments observe the document's natural scroll
     * position. Running the global Lenis wheel/touch interpolation on these
     * routes makes the page feel like it is taking control of user input.
     * Leave native scrolling untouched throughout /labs and its detail pages.
     */
    if (isLabsRoute) {
      const activeLenis = window.lenis;

      if (activeLenis) {
        activeLenis.destroy();
        window.lenis = undefined;
      }

      return undefined;
    }

    const lenis = new Lenis({
      duration: 1.3,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      syncTouch: false,
    });

    /*
     * Keep the existing global reference for route-reset and in-page
     * navigation helpers on the portfolio routes that use Lenis.
     */
    window.lenis = lenis;

    let rafId = 0;

    function raf(time) {
      lenis.raf(time);
      rafId = window.requestAnimationFrame(raf);
    }

    rafId = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(rafId);

      if (window.lenis === lenis) {
        window.lenis = undefined;
      }

      lenis.destroy();
    };
  }, [isLabsRoute]);

  return children;
}
