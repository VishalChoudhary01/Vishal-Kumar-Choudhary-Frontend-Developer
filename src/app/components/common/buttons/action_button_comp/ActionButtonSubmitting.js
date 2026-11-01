"use client";

import { motion } from "motion/react";

const DOTS = [
    {
        key: "one",
        delay: 0,
    },
    {
        key: "two",
        delay: 0.18,
    },
    {
        key: "three",
        delay: 0.36,
    },
];

export default function ActionButtonSubmitting({
    reduced = false,
}) {
    return (
        <span
            className="inline-flex shrink-0 items-center gap-[3px]"
            aria-hidden="true"
        >
            {DOTS.map((dot) => (
                <motion.span
                    key={dot.key}
                    className="size-[3px] rounded-full bg-current"
                    animate={
                        reduced
                            ? {
                                scale: 0.6,
                                opacity: 0.3,
                            }
                            : {
                                scale: [0.6, 1, 0.6],
                                opacity: [0.3, 1, 0.3],
                            }
                    }
                    transition={{
                        duration: 1.1,
                        delay: dot.delay,
                        repeat: reduced ? 0 : Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </span>
    );
}
