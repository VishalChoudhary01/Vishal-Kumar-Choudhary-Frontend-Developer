"use client";

import { motion } from "motion/react";
import { projectItemReveal } from "@/app/lib/motion/projectPresets";

export default function ProjectEngineeringItem({
    item,
    index,
    reduced,
}) {
    const number = String(index + 1).padStart(2, "0");

    return (
        <motion.article
            {...projectItemReveal(index, reduced)}
            className="group border-b border-border py-6 md:py-7"
        >
            <div className="relative max-w-3xl">
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-1 top-[12.5px] z-0 -translate-y-1/2 font-display text-[clamp(2.25rem,4vw,4rem)] font-normal leading-none tracking-[-0.06em] text-brand opacity-[0.07] transition-opacity duration-500 ease-out group-hover:opacity-[0.12] md:top-[15px] lg:left-auto lg:right-full lg:mr-3"
                >
                    {number}
                </span>

                <div className="relative z-10">
                    <h3 className="font-display text-xl font-normal leading-tight tracking-[-0.01em] text-text-primary md:text-2xl">
                        {item.title}
                    </h3>

                    {item.body && (
                        <p className="mt-2 max-w-2xl font-body text-base leading-7 text-text-secondary sm:mt-3 md:text-lg md:leading-7">
                            {item.body}
                        </p>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
