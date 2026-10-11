"use client";

import { AnimatePresence, motion } from "motion/react";
import { DEFAULT_PROGRESS_ANIMATION } from "./downloadButton.constants"

export default function DownloadButtonProgress({
    visible = false,
    progress = 0,
    animation = DEFAULT_PROGRESS_ANIMATION,
}) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[3px] origin-left bg-brand-contrast/35"
                    initial={{
                        scaleX: 0,
                    }}
                    animate={{
                        scaleX:
                            progress > 0
                                ? progress / 100
                                : 0.08,
                    }}
                    exit={{
                        scaleX: 0,
                    }}
                    transition={{
                        duration: animation.duration,
                        ease: animation.ease,
                    }}
                />
            )}
        </AnimatePresence>
    );
}