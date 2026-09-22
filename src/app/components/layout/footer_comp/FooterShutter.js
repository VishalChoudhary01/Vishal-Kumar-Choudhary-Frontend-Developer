"use client";

import { motion } from "motion/react";

const STRIP_COUNT = 24;

const STRIP_TRANSITION = {
    duration: 0.85,
    ease: [0.76, 0, 0.24, 1],
};

const STRIPS = Array.from({ length: STRIP_COUNT }, (_, index) => ({
    id: index,

    // Alternating movement:
    // 0  → left
    // 1  → right
    // 2  → left
    // 3  → right
    direction: index % 2 === 0 ? "left" : "right",
}));

export default function FooterShutter({
    active = false,
    reduced = false,
}) {
    if (reduced) return null;

    return (
        <div
            className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
            aria-hidden="true"
        >
            {STRIPS.map((strip, index) => {
                const isLeft = strip.direction === "left";

                return (
                    <motion.div
                        key={strip.id}
                        initial={{
                            x: "0%",
                        }}
                        animate={{
                            x: active
                                ? isLeft
                                    ? "-101%"
                                    : "101%"
                                : "0%",
                        }}
                        transition={{
                            ...STRIP_TRANSITION,

                            /*
                             * Small progressive delay creates
                             * the alternating shutter rhythm.
                             */
                            delay: index * 0.035,
                        }}
                        className="absolute inset-x-0 bg-linear-to-b dark:from-black from-80% dark:to-background from-white to-surface-1"
                        style={{
                            /*
                             * Each strip gets exactly its share
                             * of the viewport height.
                             *
                             * The tiny overlap prevents sub-pixel
                             * gaps on different screen sizes.
                             */
                            top: `calc(${index} * ${100 / STRIP_COUNT}%)`,
                            height: `calc(${100 / STRIP_COUNT}% + 1px)`,
                        }}
                    />
                );
            })}
        </div>
    );
}