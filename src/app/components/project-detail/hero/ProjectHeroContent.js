/* ------------------------------------------------------------------
   LAYER 10 — HERO CONTENT (the primary readable layer).
   SectionEyebrow → h1 project title → description → metadata → CTA.
   The title is the page's only h1 and the dominant visual object;
   its final state is completely crisp (no residual blur/transform).
------------------------------------------------------------------ */
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
    const description = project.hero?.description ?? project.description ?? null;

    return (
        <div className="relative z-10 min-w-0">
            {/* 1. EYEBROW — existing SectionEyebrow system, real project data */}
            {eyebrow && (
                <motion.div {...heroEntrance(reduced, { delay: DELAY.eyebrow, y: 14 })}>
                    <SectionEyebrow label={eyebrow} number={project.number ?? "01"} />
                </motion.div>
            )}

            {/* 2. TITLE — hero-scale h1, tight editorial leading, crisp final state */}
            {title && (
                <motion.h1
                    id="project-hero-title"
                    {...heroEntrance(reduced, { delay: DELAY.title, y: 32, blur: 9 })}
                    className="mt-4 max-w-[680px] font-display text-[clamp(2.85rem,10.5vw,8rem)] font-normal leading-[0.94] tracking-[-0.035em] text-text-primary sm:mt-5 md:max-w-[780px]"
                >
                    {title}
                </motion.h1>
            )}

            {/* 3. DESCRIPTION — concise, controlled measure */}
            {description && (
                <motion.p
                    {...heroEntrance(reduced, { delay: DELAY.description, y: 16 })}
                    className="mt-5 max-w-[560px] text-[1.05rem] leading-[1.65] text-text-secondary sm:mt-6 sm:text-lg md:text-[1.2rem]"
                >
                    {description}
                </motion.p>
            )}

            {/* 4. METADATA — compact editorial line */}
            <motion.div {...heroEntrance(reduced, { delay: DELAY.meta, y: 14 })} className="mt-7 sm:mt-8">
                <ProjectHeroMeta project={project} />
            </motion.div>

            {/* 5. PRIMARY ACTION — only real project links */}
            <ProjectHeroActions project={project} prefersReduced={reduced} />
        </div>
    );
}
