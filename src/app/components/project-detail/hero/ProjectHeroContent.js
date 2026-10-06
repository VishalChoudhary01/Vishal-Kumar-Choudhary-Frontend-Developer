"use client";

import { motion } from "motion/react";

import SectionEyebrow from "@/app/components/common/SectionEyebrow";
import useReducedMotion from "@/app/hooks/useReducedMotion";

import ProjectHeroMeta from "./ProjectHeroMeta";
import ProjectHeroActions from "./ProjectHeroActions";
import { heroEntrance, DELAY } from "./projectHeroMotion";

export default function ProjectHeroContent({ project }) {
    const reduced = useReducedMotion();

    const eyebrow = project.hero?.eyebrow ?? null;
    const title = project.name ?? null;

    const description =
        project.hero?.description ??
        project.description ??
        null;

    return (
        <div
            className="
    relative
    min-w-0
    w-full

    max-w-[350px]
    sm:max-w-[560px]
    md:max-w-[650px]
    lg:max-w-[780px]

    /*
     * SUBTLE GLASS GRADIENT
     *
     * Light:
     * slightly brighter behind typography,
     * fades into the screenshot toward the right.
     *
     * Dark:
     * very subtle black/white glass,
     * preserving the green atmosphere underneath.
     */

    bg-linear-to-br
    from-white/[0.075]
    via-white/[0.035]
    to-white/[0.008]

    dark:from-white/[0.055]
    dark:via-white/[0.018]
    dark:to-transparent

    backdrop-blur-md

    /*
     * Very restrained glass edge.
     */
    ring-1
    ring-white/[0.08]
    dark:ring-white/[0.07]

    /*
     * Small editorial radius.
     */
    rounded-sm

    /*
     * Content breathing room.
     */
    px-4
    py-5

    sm:px-5
    sm:py-5

    md:px-6
    md:py-5

    lg:px-7
    lg:py-6
"
        >
            {/* =========================================================
                EYEBROW
            ========================================================= */}

            {eyebrow && (
                <motion.div
                    {...heroEntrance(reduced, {
                        delay: DELAY.eyebrow,
                        y: 14,
                    })}
                >
                    <SectionEyebrow
                        label={eyebrow}
                        number={project.number ?? "01"}
                    />
                </motion.div>
            )}

            {/* =========================================================
                TITLE
            ========================================================= */}

            {title && (
                <motion.h1
                    id="project-hero-title"
                    {...heroEntrance(reduced, {
                        delay: DELAY.title,
                        y: 22,
                        blur: 7,
                    })}
                    className="
        mt-2
        max-w-full

        font-display
        font-normal
        leading-[0.92]
        tracking-[-0.035em]
        text-text-primary

        /*
         * MOBILE
         *
         * Keep project names compact.
         *
         * Especially important for:
         * - System Canvas
         * - Next.js Master
         * - longer future project names
         */
        text-[clamp(2.15rem,9.5vw,2.65rem)]

        /*
         * TABLET
         */
        sm:mt-4
        sm:text-[clamp(2.75rem,6vw,4rem)]

        /*
         * DESKTOP
         */
        md:text-[clamp(3rem,4.8vw,4.75rem)]

        lg:text-[clamp(3.4rem,4.2vw,5.25rem)]

        xl:text-[clamp(3.75rem,3.9vw,5.75rem)]
    "
                >
                    {title}
                </motion.h1>
            )}

            {/* =========================================================
                DESCRIPTION
            ========================================================= */}

            {description && (
                <motion.p
                    {...heroEntrance(reduced, {
                        delay: DELAY.description,
                        y: 16,
                    })}
                    className="
                        mt-4

                        max-w-[620px]

                        text-[0.94rem]
                        leading-[1.5]
                        text-text-secondary

                        /*
                         * =================================================
                         * MOBILE
                         * =================================================
                         */

                        max-md:max-w-[335px]
                        max-md:text-[0.9rem]
                        max-md:leading-[1.5]

                        /*
                         * =================================================
                         * TABLET
                         * =================================================
                         */

                        sm:mt-5
                        sm:text-[1.05rem]
                        sm:leading-[1.5]

                        /*
                         * =================================================
                         * DESKTOP
                         * =================================================
                         */

                        md:text-[1.08rem]

                        lg:mt-6
                        lg:text-[1.16rem]
                        lg:leading-[1.52]

                        xl:text-[1.22rem]
                    "
                >
                    {description}
                </motion.p>
            )}

            {/* =========================================================
                METADATA
            ========================================================= */}

            <motion.div
                {...heroEntrance(reduced, {
                    delay: DELAY.meta,
                    y: 14,
                })}
                className="
                    mt-5
                    sm:mt-6
                "
            >
                <ProjectHeroMeta project={project} />
            </motion.div>

            {/* =========================================================
                ACTIONS
            ========================================================= */}

            <ProjectHeroActions
                project={project}
                prefersReduced={reduced}
            />
        </div>
    );
}