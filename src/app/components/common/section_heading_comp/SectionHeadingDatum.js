"use client";

import { motion } from "motion/react";

import { EASE_STANDARD } from "./sectionHeading.constants";

export default function SectionHeadingDatum({
    mask,
    show,
    align = "left",
    delayBase = 0.1,
}) {
    const segments =
        align === "center"
            ? [
                {
                    className: "h-px flex-1 bg-border",
                    origin: "right",
                    delay: delayBase + 0.08,
                },
                {
                    className: "h-px flex-1 bg-border",
                    origin: "left",
                    delay: delayBase + 0.14,
                },
            ]
            : align === "right"
                ? [
                    {
                        className: "h-px flex-1 bg-border",
                        origin: "right",
                        delay: delayBase + 0.08,
                    },
                    {
                        className: "h-px w-14 bg-brand",
                        origin: "right",
                        delay: delayBase + 0.14,
                    },
                ]
                : [
                    {
                        className: "h-px w-14 bg-brand",
                        origin: "left",
                        delay: delayBase + 0.08,
                    },
                    {
                        className: "h-px flex-1 bg-border",
                        origin: "left",
                        delay: delayBase + 0.14,
                    },
                ];

    return (
        <div
            className={`mt-5 flex items-center overflow-hidden md:mt-7 ${align === "right" ? "justify-end" : ""}`}
            aria-hidden="true"
        >
            {segments.map((segment, index) => (
                <motion.div
                    key={index}
                    className={segment.className}
                    initial={mask ? { scaleX: 0 } : false}
                    animate={
                        show
                            ? { scaleX: 1 }
                            : { scaleX: 0 }
                    }
                    transition={{
                        duration: 0.7,
                        delay: mask && show ? segment.delay : 0,
                        ease: EASE_STANDARD,
                    }}
                    style={{
                        transformOrigin: segment.origin,
                    }}
                />
            ))}
        </div>
    );
}