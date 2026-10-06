"use client";
import { useEffect } from "react";
import Lenis from "lenis";


const SmoothScroll = ({ children }) => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.3,
            smoothWheel: true, 
            wheelMultiplier: 0.9,
            touchMultiplier: 1,
            syncTouch: false,
        })

        /*
         * Expose the instance so route changes can reset the scroll
         * through Lenis itself. Resetting only `window.scrollY` leaves
         * Lenis animating back toward its previous target, so a newly
         * opened page could keep the previous page's scroll position.
         */
        window.lenis = lenis

        let rafId
        function raf(time) {
            lenis.raf(time)
            rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(rafId)
            if (window.lenis === lenis) {
                window.lenis = undefined
            }
            lenis.destroy()
        }

    }, [])
    return children
}

export default SmoothScroll