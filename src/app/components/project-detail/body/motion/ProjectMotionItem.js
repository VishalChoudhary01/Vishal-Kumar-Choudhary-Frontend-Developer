"use client";

import { motion } from "motion/react";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectMotionItem({
    item,
    index,
    visible,
    reduced,
}) {
    return (
        <motion.article
            initial={
                reduced
                    ? false
                    : { opacity: 0, y: 20 }
            }
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
                        delay: index * 0.09,
                        ease: EASE_EDITORIAL,
                    }
            }
            className="group border-b border-border py-7 sm:py-8 md:py-9 lg:py-10"
        >
            <div className="relative max-w-3xl">
                <div className="flex items-start gap-5 sm:gap-7">
                    <span
                        aria-hidden="true"
                        className="mt-[0.15em] h-px w-8 shrink-0 bg-brand opacity-40 transition-all duration-500 ease-out group-hover:w-12 group-hover:opacity-70 sm:w-10"
                    />

                    <div>
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
            </div>
        </motion.article>
    );
}