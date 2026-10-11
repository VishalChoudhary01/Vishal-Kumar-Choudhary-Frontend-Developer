"use client";

import { motion } from "motion/react";
import { projectItemReveal } from "@/app/lib/motion/projectPresets";

export default function ProjectApproachItem({ item, index, reduced }) {
    const number = String(index + 1).padStart(2, "0");

    return (
        <motion.article
            {...projectItemReveal(index, reduced)}
            className="group relative border-b border-border py-6 md:py-7"
        >
            <div className="relative max-w-3xl">
                {/* Watermark numeral.
                    - Vertical anchor is the h3's first line box
                      (text-xl leading-tight ≈ 25px line → center 12.5px;
                      md:text-2xl ≈ 30px line → center 15px), NOT a % of the
                      whole block, which drifted with body-text length.
                    - From lg the 180px label column + lg:gap-16 gutter gives
                      room, so the numeral moves fully into the gutter
                      (right-full + mr-3) where it is fully visible instead of
                      half-hidden behind the title. */}
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-1 top-[12.5px] z-0 -translate-y-1/2 font-display text-[clamp(2.5rem,4vw,4rem)] font-normal leading-none tracking-[-0.06em] text-brand opacity-[0.07] transition-opacity duration-500 ease-out group-hover:opacity-[0.12] md:top-[15px] lg:left-auto lg:right-full lg:mr-3"
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
