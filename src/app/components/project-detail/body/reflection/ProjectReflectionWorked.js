"use client";

import { motion } from "motion/react";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectReflectionWorked({ items, visible, reduced }) {
    return (
        <div className="border-t border-border">
            {items.map((item, index) => {
                const number = String(index + 1).padStart(2, "0");

                const title = typeof item === "string" ? item : item?.title;
                const body = typeof item === "string" ? null : item?.body;

                if (!title) return null;

                return (
                    <motion.article
                        key={`${title}-${index}`}
                        initial={reduced ? false : { opacity: 0, y: 20 }}
                        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={reduced ? { duration: 0 } : { duration: 0.7, delay: index * 0.08, ease: EASE_EDITORIAL }}
                        className="group relative border-b border-border py-6 md:py-7"
                    >
                        <div className="relative max-w-3xl">
                            <span
                                aria-hidden="true"
                                className="pointer-events-none absolute left-0 top-[0.35em] z-0 -translate-x-[8%] font-display text-[clamp(2.25rem,4vw,4rem)] font-normal leading-none tracking-[-0.06em] text-brand opacity-[0.07] transition-opacity duration-500 ease-out group-hover:opacity-[0.12]"
                            >
                                {number}
                            </span>

                            <div className="relative z-10">
                                <h3 className="font-display text-xl font-normal leading-tight tracking-[-0.01em] text-text-primary md:text-2xl">
                                    {title}
                                </h3>

                                {body && (
                                    <p className="mt-2 max-w-2xl font-body text-base leading-7 text-text-secondary sm:mt-3 md:text-lg md:leading-7">
                                        {body}
                                    </p>
                                )}
                            </div>
                        </div>
                    </motion.article>
                );
            })}
        </div>
    );
}