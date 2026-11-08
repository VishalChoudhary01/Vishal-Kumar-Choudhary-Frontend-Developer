"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { shouldUseLenis } from "./scroll-policy.mjs";

export default function SmoothScroll({ children }) {
  const pathname = usePathname();
  const useLenis = shouldUseLenis(pathname);

  useEffect(() => {
    /*
     * Public portfolio and project details retain Lenis. Labs and private
     * owner/admin pages use native document scrolling so wheel events remain
     * with the page and naturally hand off from editors and controls.
     */
    if (!useLenis) {
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
  }, [useLenis]);

  return children;
}
