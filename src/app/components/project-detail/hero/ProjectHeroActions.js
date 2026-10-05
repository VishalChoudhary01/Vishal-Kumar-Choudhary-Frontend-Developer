/* ------------------------------------------------------------------
   LAYER 20 — HERO ACTIONS (CTA / interactive controls).
   Only the project's real actions: View Live ↗ and View Source ↗.
   Data-driven — nothing renders when a link does not exist.
------------------------------------------------------------------ */
"use client";

import { motion } from "motion/react";

import { EASE, DELAY } from "./projectHeroMotion";

export default function ProjectHeroActions({ project, prefersReduced }) {
    const hasLive = Boolean(project.links?.live);
    const hasGithub = Boolean(project.links?.github);

    if (!hasLive && !hasGithub) {
        return null;
    }

    return (
        <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.6, delay: prefersReduced ? 0 : DELAY.actions, ease: EASE }}
            className="mt-6 flex flex-wrap items-center gap-6 sm:mt-8 sm:gap-7"
        >
            {hasLive && (
                <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/live inline-flex items-center gap-2 font-mono text-[0.75rem] font-medium uppercase tracking-[0.16em] text-brand transition-colors duration-200 hover:text-brand-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:text-[0.8rem]"
                >
                    <span>View Live</span>

                    <span aria-hidden="true" className="transition-transform duration-200 group-hover/live:translate-x-0.5">
                        ↗
                    </span>
                </a>
            )}

            {hasGithub && (
                <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/gh inline-flex items-center gap-2 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-text-secondary transition-colors duration-200 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:text-[0.8rem]"
                >
                    <span>View Source</span>

                    <span aria-hidden="true" className="transition-transform duration-200 group-hover/gh:translate-x-0.5">
                        ↗
                    </span>
                </a>
            )}
        </motion.div>
    );
}
