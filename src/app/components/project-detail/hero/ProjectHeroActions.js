/* ------------------------------------------------------------------
   LAYER 20 — HERO ACTIONS (CTA / interactive controls).
   Only the project's real actions: View Live, View Source and
   Figma when the project provides one.
   Data-driven — nothing renders when a link does not exist.

   The shared ProjectResumeButton owns link / hover / focus / arrow.
   This layer owns grouping and entrance only.
------------------------------------------------------------------ */
"use client";

import { motion } from "motion/react";

import ProjectResumeButton from "@/app/components/common/ProjectResumeButton";

import { EASE, DELAY } from "./projectHeroMotion";

export default function ProjectHeroActions({ project, prefersReduced }) {
    const hasLive = Boolean(project.links?.live);
    const hasGithub = Boolean(project.links?.github);
    const hasFigma = Boolean(project.links?.figma);

    if (!hasLive && !hasGithub && !hasFigma) {
        return null;
    }

    return (
        <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.6, delay: prefersReduced ? 0 : DELAY.actions, ease: EASE }}
            className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4"
        >
            {hasLive && (
                <ProjectResumeButton
                    href={project.links.live}
                    label="View Live"
                    external
                />
            )}

            {hasGithub && (
                <ProjectResumeButton
                    href={project.links.github}
                    label="View Source"
                    external
                    /*
                     * SOURCE IS DESKTOP-ONLY.
                     *
                     * `hidden` uses display:none, so on mobile the link
                     * is neither visible nor keyboard-focusable
                     * (PROJECT-DETAIL-V2.md §25 — mandatory responsive
                     * rule).
                     */
                    className="hidden lg:inline-flex"
                />
            )}

            {hasFigma && (
                <ProjectResumeButton
                    href={project.links.figma}
                    label="Figma"
                    external
                />
            )}
        </motion.div>
    );
}
