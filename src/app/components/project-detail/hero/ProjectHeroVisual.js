"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { EASE, DURATION } from "./projectHeroMotion";

export default function ProjectHeroVisual({
    project,
    reduced = false,
    parallaxStyle,
}) {
    const image =
        project?.hero?.media?.src ||
        project?.media?.src ||
        null;

    const imageAlt =
        project?.hero?.media?.alt ||
        project?.media?.alt ||
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
                duration: reduced ? 0 : DURATION.atmosphere,
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
            {/* =====================================================
                PRODUCT SCREENSHOT
            ===================================================== */}

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
                     * -------------------------------------------------
                     * MOBILE
                     * -------------------------------------------------
                     *
                     * Keep the product interface toward the right,
                     * but make the screenshot more atmospheric.
                     */
                    max-md:object-[84%_center]
                    max-md:opacity-[0.72]

                    /*
                     * -------------------------------------------------
                     * TABLET
                     * -------------------------------------------------
                     */
                    md:object-[64%_center]

                    /*
                     * -------------------------------------------------
                     * DESKTOP — LOCKED
                     * -------------------------------------------------
                     */
                    lg:object-[62%_center]
                    xl:object-[60%_center]
                "
            />

            {/* =====================================================
                MOBILE ATMOSPHERIC SOFTENING

                Reduces the heavy dark/grey area coming from:
                  - top-right
                  - right edge
                  - upper-middle

                The lower-left remains mostly untouched because
                the hero content already has its own readability
                treatment there.

                Desktop: completely disabled.
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    hidden
                    max-md:block

                    bg-[radial-gradient(
                        ellipse_85%_70%_at_100%_8%,
                        rgba(255,255,255,0.24)_0%,
                        rgba(255,255,255,0.15)_28%,
                        rgba(255,255,255,0.07)_52%,
                        rgba(255,255,255,0)_78%
                    )]
                "
            />

            {/* =====================================================
                MOBILE RIGHT-EDGE SOFTENING

                Very subtle horizontal fade.

                Right side becomes lighter without creating a visible
                rectangular boundary.

                This is intentionally weaker than the content-side
                readability gradient.
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-0
                    hidden
                    max-md:block

                    bg-[linear-gradient(
                        to_left,
                        rgba(255,255,255,0.12)_0%,
                        rgba(255,255,255,0.07)_18%,
                        rgba(255,255,255,0.025)_38%,
                        rgba(255,255,255,0)_62%
                    )]
                "
            />

            {/* =====================================================
                MOBILE TOP SOFTENING

                Removes some of the heavy contrast at the very top
                while preserving the technical screenshot texture.
            ===================================================== */}

            <div
                aria-hidden="true"
                className="
                    pointer-events-none
                    absolute
                    inset-x-0
                    top-0
                    hidden
                    max-md:block
                    h-[32%]

                    bg-linear-to-b
                    from-white/[0.08]
                    via-white/[0.035]
                    to-transparent
                "
            />
        </motion.div>
    );
}