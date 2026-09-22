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

        function raf(time) {
            lenis.raf(time)
            requestAnimationFrame(raf)
        }


        const animationFrame = requestAnimationFrame(raf)

        return () => {
            cancelAnimationFrame(animationFrame)
            lenis.destroy()
        }

    }, [])
    return children
}

export default SmoothScroll