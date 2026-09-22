"use client";

import { motion } from "motion/react";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectEngineeringItem({
    item,
    index,
    visible,
    reduced,
}) {
    const number = String(index + 1).padStart(2, "0");

    return (
        <motion.article
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={
                visible
                    ? { opacity: 1, y: 0 }
                    : { opacity: 0, y: 20 }
            }
            transition={
                reduced
                    ? { duration: 0 }
                    : {
                        duration: 0.7,
                        delay: index * 0.08,
                        ease: EASE_EDITORIAL,
                    }
            }
            className="group border-b border-border py-7 sm:py-8 md:py-9 lg:py-10"
        >
            <div className="relative max-w-3xl">
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-2  md:top-[15%] top-[10%] z-0 -translate-x-[8%] -translate-y-1/2 font-display text-[clamp(2.25rem,4vw,4rem)] font-normal leading-none tracking-[-0.06em] text-brand opacity-[0.07] transition-opacity duration-500 ease-out group-hover:opacity-[0.12]"
                >
                    {number}
                </span>

                <div className="relative z-10">
                    <h3 className="font-display text-[clamp(1.45rem,2.2vw,2.15rem)] font-normal leading-[1.08] tracking-[-0.015em] text-text-primary">
                        {item.title}
                    </h3>

                    {item.body && (
                        <p className="mt-3 max-w-2xl font-body text-[0.95rem] leading-6 text-text-secondary sm:mt-4 sm:text-base sm:leading-7 lg:text-[1.05rem] lg:leading-8">
                            {item.body}
                        </p>
                    )}
                </div>
            </div>
        </motion.article>
    );
}