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

                /*
                 * MOBILE
                 *
                 * Keep the reading column controlled without
                 * making the title unnecessarily wide.
                 */
                max-md:w-full
                max-md:max-w-[350px]

                sm:max-w-none
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
                        y: 30,
                        blur: 8,
                    })}
                    className="
                        mt-2

                        font-display
                        font-normal
                        leading-[0.9]
                        tracking-[-0.035em]
                        text-text-primary

                        /*
                         * -------------------------------------------------
                         * MOBILE
                         * -------------------------------------------------
                         *
                         * Previous:
                         * 3.25rem → 4rem
                         *
                         * Now:
                         * 2.75rem → 3.45rem
                         *
                         * This keeps names such as:
                         *
                         * System Canvas
                         * ClassFuse
                         *
                         * visually strong without dominating the
                         * entire mobile hero.
                         */
                        text-[clamp(2.75rem,13vw,3.45rem)]

                        /*
                         * -------------------------------------------------
                         * TABLET
                         * -------------------------------------------------
                         */
                        sm:mt-4
                        sm:text-[clamp(3.25rem,8vw,5rem)]

                        /*
                         * -------------------------------------------------
                         * DESKTOP
                         * -------------------------------------------------
                         *
                         * Reduced from the previous 9.375rem maximum.
                         * The title remains the dominant element but
                         * no longer overwhelms the hero visual.
                         */
                        md:text-[clamp(3.25rem,7.5vw,5.75rem)]
                        lg:text-[clamp(4rem,6.5vw,7.5rem)]
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
                         * MOBILE
                         *
                         * Keep the paragraph readable but quieter
                         * than the title.
                         */
                        max-md:max-w-[335px]
                        max-md:text-[0.91rem]
                        max-md:leading-[1.5]

                        /*
                         * TABLET
                         */
                        sm:mt-5
                        sm:text-lg

                        /*
                         * DESKTOP
                         */
                        md:text-lg
                        lg:mt-6
                        lg:text-[1.18rem]
                        xl:text-[1.28rem]
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