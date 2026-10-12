"use client";

import { AnimatePresence, motion } from "motion/react";

import { EASE } from "./downloadButton.constants";

export default function DownloadButtonPercentage({
    visible = false,
    progress = 0,
}) {
    return (
        <AnimatePresence>
            {visible && progress > 0 && (
                <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-[5px] left-1/2 z-30 -translate-x-1/2 text-[9px] font-medium tabular-nums text-brand-contrast opacity-70"
                    initial={{
                        opacity: 0,
                        y: 3,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        y: 3,
                    }}
                    transition={{
                        duration: 0.2,
                        ease: EASE,
                    }}
                >
                    {progress}%
                </motion.span>
            )}
        </AnimatePresence>
    );
}