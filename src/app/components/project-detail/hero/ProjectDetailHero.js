"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import ProjectHeroVisual from "./ProjectHeroVisual";
import ProjectHeroBackground from "./ProjectHeroBackground";
import ProjectHeroContent from "./ProjectHeroContent";
import ProjectHeroScrollCue from "./ProjectHeroScrollCue";

export default function ProjectDetailHero({ project }) { 
    const reduced = useReducedMotion();
    const sectionRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    /*
     * Background-only parallax.
     *
     * Typography never participates in the parallax transform.
     */
    const visualY = useTransform(
        scrollYProgress,
        [0, 1],
        [0, reduced ? 0 : -18]
    );

    return (
        <section
            ref={sectionRef}
            aria-labelledby="project-hero-title"
            className="
                relative
                min-h-[100svh]
                overflow-clip
                bg-background
            "
        >
            {/* =========================================================
                LAYER 1 — FULL-BLEED PRODUCT VISUAL
            ========================================================= */}

            <ProjectHeroVisual
                project={project}
                reduced={reduced}
                parallaxStyle={
                    reduced
                        ? undefined
                        : {
                            y: visualY,
                        }
                }
            />

            {/* =========================================================
                LAYERS 2–4 — ATMOSPHERE
            ========================================================= */}

            <ProjectHeroBackground reduced={reduced} />

            {/* =========================================================
                LAYERS 5–6 — CONTENT
            ========================================================= */}

            <div
                className="
                    relative
                    z-10
                    flex
                    min-h-[100svh]
                    flex-col
                "
            >
                <div
                    className="
                        flex
                        w-full
                        flex-1
                        flex-col

                        /*
                         * MOBILE
                         *
                         * Give the content a deliberate vertical zone
                         * instead of pushing everything to the bottom.
                         */
                        justify-end
                        px-5
                        pt-28
                        pb-24

                        /*
                         * TABLET — existing behavior
                         */
                        sm:justify-center
                        sm:px-8
                        sm:pt-28
                        sm:pb-16

                        md:px-10

                        /*
                         * DESKTOP — LOCKED
                         */
                        lg:justify-center
                        lg:px-0
                        lg:pr-[44vw]
                        lg:pl-[7vw]
                        lg:pt-28
                        lg:pb-0
                    "
                >
                    <ProjectHeroContent project={project} />
                </div>

                <ProjectHeroScrollCue reduced={reduced} />
            </div>
        </section>
    );
}