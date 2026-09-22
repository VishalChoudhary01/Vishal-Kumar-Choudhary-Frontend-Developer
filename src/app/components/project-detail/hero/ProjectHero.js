"use client";

import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import { cn } from "@/app/lib/utils";

import ProjectHeroEyebrow from "./ProjectHeroEyebrow";
import ProjectHeroMeta from "./ProjectHeroMeta";
import ProjectHeroScrollCue from "./ProjectHeroScrollCue";
import ProjectHeroVisual from "./ProjectHeroVisual";

const EASE_EDITORIAL = [0.16, 1, 0.3, 1];

export default function ProjectHero({ project }) {
    const reduced = useReducedMotion();

    const description =
        project.heroDescription ||
        project.description ||
        project.overview ||
        "";

    const eyebrow =
        project.eyebrow ||
        `${project.type || "PROJECT"} · ${project.year || ""}`;

    return (
        <section
            aria-labelledby="project-hero-title"
            className="relative overflow-hidden bg-background"
        >
            <div className="mx-auto flex min-h-[calc(100svh-5.5rem)] w-full max-w-[1440px] flex-col justify-center px-5 pb-12 pt-28 sm:px-8 sm:pb-14 sm:pt-32 md:px-10 md:pb-16 md:pt-36 lg:px-16 lg:pb-20 lg:pt-40 xl:px-20">
                <div className="grid items-center gap-12 md:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)] md:gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(480px,1.08fr)] lg:gap-16 xl:gap-24">
                    <div className="max-w-[700px]">
                        <ProjectHeroEyebrow
                            text={eyebrow}
                            reduced={reduced}
                        />

                        <motion.h1
                            id="project-hero-title"
                            initial={
                                reduced
                                    ? false
                                    : {
                                        opacity: 0,
                                        y: 45,
                                    }
                            }
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: reduced ? 0 : 0.9,
                                delay: reduced ? 0 : 0.25,
                                ease: EASE_EDITORIAL,
                            }}
                            className="mt-6 max-w-[9ch] font-display text-[clamp(3.8rem,7.5vw,7.8rem)] font-normal leading-[0.86] tracking-[-0.055em] text-text-primary sm:mt-7 md:text-[clamp(4.3rem,6.5vw,6.8rem)] lg:text-[clamp(5rem,6.3vw,7.8rem)]"
                        >
                            {project.name}
                        </motion.h1>

                        {description && (
                            <motion.p
                                initial={
                                    reduced
                                        ? false
                                        : {
                                            opacity: 0,
                                            y: 22,
                                        }
                                }
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    duration: reduced ? 0 : 0.8,
                                    delay: reduced ? 0 : 0.42,
                                    ease: EASE_EDITORIAL,
                                }}
                                className="mt-7 max-w-[54ch] font-body text-[15px] leading-[1.75] text-text-secondary sm:mt-8 sm:text-[16px] md:max-w-[48ch] lg:text-[17px]"
                            >
                                {description}
                            </motion.p>
                        )}

                        <motion.div
                            initial={
                                reduced
                                    ? false
                                    : {
                                        opacity: 0,
                                        y: 16,
                                    }
                            }
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            transition={{
                                duration: reduced ? 0 : 0.7,
                                delay: reduced ? 0 : 0.55,
                                ease: EASE_EDITORIAL,
                            }}
                        >
                            <ProjectHeroMeta project={project} />
                        </motion.div>
                    </div>

                    <div
                        className={cn(
                            "w-full",
                            "md:self-center",
                            "lg:justify-self-end",
                            "lg:max-w-[720px]"
                        )}
                    >
                        <ProjectHeroVisual
                            project={project}
                            reduced={reduced}
                        />
                    </div>
                </div>

                <ProjectHeroScrollCue reduced={reduced} />
            </div>
        </section>
    );
}