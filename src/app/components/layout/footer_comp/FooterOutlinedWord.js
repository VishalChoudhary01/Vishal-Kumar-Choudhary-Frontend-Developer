"use client";

import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1];

export default function FooterOutlinedWord({
    text,
    hovered = false,
    reduced = false,
}) {
    return (
        <span className="relative inline-block align-baseline ">
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
                    clipPath: hovered
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
                    className="pointer-events-none absolute left-0 bottom-[16%]  h-[0.8em]  w-1 -translate-x-1/2 bg-brand "
                    initial={false}
                    animate={{
                        left: hovered ? "100%" : "0%",
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