"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

export default function FooterOutlinedWord({
    text,
    hovered = false,
    reduced = false,
}) {
    const [scanActive, setScanActive] = useState(false);
    const scanTargetRef = useRef(null);
    const scanTimerRef = useRef(null);

    useEffect(() => {
        const target = scanTargetRef.current;
        if (!target) return undefined;

        const handleScanHit = () => {
            if (scanTimerRef.current) {
                window.clearTimeout(scanTimerRef.current);
            }

            setScanActive(true);

            // Let the teal fill complete and hold briefly before returning
            // to the resting outline. A hover keeps the text filled afterward.
            scanTimerRef.current = window.setTimeout(() => {
                setScanActive(false);
                scanTimerRef.current = null;
            }, reduced ? 900 : 1450);
        };

        target.addEventListener("vee-footer-scan-hit", handleScanHit);

        return () => {
            target.removeEventListener("vee-footer-scan-hit", handleScanHit);

            if (scanTimerRef.current) {
                window.clearTimeout(scanTimerRef.current);
            }
        };
    }, [reduced]);

    const fillActive = hovered || scanActive;

    return (
        <span
            ref={scanTargetRef}
            data-mascot-scan-target="footer-building"
            className="relative inline-block align-baseline"
        >
            <span
                aria-hidden="true"
                className="block whitespace-nowrap text-text-secondary [-webkit-text-fill-color:transparent] [-webkit-text-stroke:1px_currentColor]"
            >
                {text}
            </span>

            <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 block whitespace-nowrap text-brand"
                initial={false}
                animate={{
                    clipPath: fillActive
                        ? "inset(-2px 0 -2px 0)"
                        : "inset(-2px 100% -2px 0)",
                }}
                transition={{
                    duration: reduced ? 0 : 0.85,
                    ease: EASE,
                }}
            >
                <span className="block [-webkit-text-fill-color:currentColor] [-webkit-text-stroke:1px_currentColor]">
                    {text}
                </span>
            </motion.span>

            {!reduced && (
                <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 bottom-[16%] h-[0.8em] w-1 -translate-x-1/2 bg-brand"
                    initial={false}
                    animate={{
                        left: fillActive ? "100%" : "0%",
                    }}
                    transition={{
                        duration: 0.85,
                        ease: EASE,
                    }}
                />
            )}
        </span>
    );
}
