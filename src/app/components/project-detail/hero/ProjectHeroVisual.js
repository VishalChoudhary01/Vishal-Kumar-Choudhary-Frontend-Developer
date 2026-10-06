"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { EASE, DURATION } from "./projectHeroMotion";

export default function ProjectHeroVisual({
    project,
    reduced = false,
    parallaxStyle,
}) {
    /* `media` is canonical; `hero.media` stays available as an explicit override. */
    const image =
        project?.media?.src ||
        project?.hero?.media?.src ||
        null;

    const imageAlt =
        project?.media?.alt ||
        project?.hero?.media?.alt ||
        `${project?.name || "Project"} product interface`;

    if (!image) {
        return null;
    }

    return (
        <motion.div
            style={parallaxStyle}
            initial={
                reduced
                    ? false
                    : {
                          opacity: 0,
                          scale: 1.025,
                      }
            }
            animate={{
                opacity: 1,
                scale: 1,
            }}
            transition={{
                duration: reduced
                    ? 0
                    : DURATION.atmosphere,
                delay: 0,
                ease: EASE,
            }}
            className="
                absolute
                inset-x-0
                -top-8
                bottom-[-40px]
                z-0
                overflow-hidden
            "
        >
            <Image
                src={image}
                alt={imageAlt}
                fill
                priority
                quality={90}
                sizes="100vw"
                className="
                    object-cover

                    /*
                     * =================================================
                     * MOBILE
                     * =================================================
                     *
                     * Keep the product interface toward the right.
                     *
                     * The background component now handles all
                     * readability gradients, so we don't stack
                     * additional white gradients here.
                     */
                    max-md:object-[84%_center]
                    max-md:opacity-[0.70]

                    /*
                     * =================================================
                     * TABLET
                     * =================================================
                     */
                    md:object-[64%_center]
                    md:opacity-[0.82]

                    /*
                     * =================================================
                     * DESKTOP
                     * =================================================
                     */
                    lg:object-[62%_center]
                    lg:opacity-[0.90]

                    xl:object-[60%_center]
                "
            />
        </motion.div>
    );
}