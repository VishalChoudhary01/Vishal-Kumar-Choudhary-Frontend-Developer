/* ------------------------------------------------------------------
   PROJECT DETAIL HERO — full-bleed, layered, cinematic opening.
   Deterministic layers (spec §7):
     LAYER 0   base background (inherited bg-background)
     LAYER 1/2 atmosphere + grid (ProjectHeroBackground)
     LAYER 5   readability gradient (inside background)
     LAYER 10  content (eyebrow · h1 · description · meta)
     LAYER 20  actions
     LAYER 3/4 product visual
     LAYER 30  scroll cue
   The fixed header stays above everything; the hero accounts for
   its real height with intentional top spacing, not giant padding.
   Desktop is asymmetric (content ≈ 42% / visual ≈ 58%); tablet and
   mobile recompose into a single column, content first.
------------------------------------------------------------------ */
"use client";

import { useRef } from "react";
import { useScroll, useTransform } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

import ProjectHeroBackground from "./ProjectHeroBackground";
import ProjectHeroContent from "./ProjectHeroContent";
import ProjectHeroVisual from "./ProjectHeroVisual";
import ProjectHeroScrollCue from "./ProjectHeroScrollCue";

export default function ProjectDetailHero({ project }) {
    const reduced = useReducedMotion();
    const sectionRef = useRef(null);

    /* Subtle depth: product y 0 → -24, background y 0 → -8 (spec §28). */
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });

    const visualY = useTransform(scrollYProgress, [0, 1], [0, -24]);
    const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -8]);

    return (
        <section
            ref={sectionRef}
            aria-labelledby="project-hero-title"
            className="relative min-h-[100svh] overflow-clip bg-background"
        >
            {/* LAYERS 0–2 + 5 — background, atmosphere, grid, readability */}
            <ProjectHeroBackground parallaxStyle={reduced ? undefined : { y: backgroundY }} reduced={reduced} />

            {/* LAYERS 10–30 — content, visual, cue */}
            <div className="relative z-10 flex min-h-[100svh] flex-col">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-10 pt-24 sm:px-8 sm:pt-28 md:px-10 lg:px-12 lg:pb-14 lg:pt-32">
                    <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6.5fr)] lg:gap-10 xl:gap-14">
                        <ProjectHeroContent project={project} />

                        <ProjectHeroVisual
                            project={project}
                            reduced={reduced}
                            parallaxStyle={reduced ? undefined : { y: visualY }}
                        />
                    </div>
                </div>

                <ProjectHeroScrollCue reduced={reduced} />
            </div>
        </section>
    );
}
