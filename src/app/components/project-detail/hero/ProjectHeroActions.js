"use client";

import { motion } from "motion/react";
import { EASE_EDITORIAL } from "../projectDetail.constants";

export default function ProjectHeroActions({
    project,
    prefersReduced,
}) {
    const hasLive = Boolean(project.links?.live);
    const hasGithub = Boolean(project.links?.github);

    if (!hasLive && !hasGithub) {
        return null;
    }

    return (
        <motion.div
            className="mt-8 flex flex-wrap items-center gap-6"
            initial={prefersReduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.5,
                delay: 0.4,
                ease: EASE_EDITORIAL,
            }}
        >
            {hasLive && (
                <a
                    href={project.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/live inline-flex items-center gap-2 font-mono text-[0.68rem] text-brand transition-colors duration-200 hover:text-brand-hover"
                >
                    <span>View Live</span>

                    <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover/live:translate-x-0.5"
                    >
                        ↗
                    </span>
                </a>
            )}

            {hasGithub && (
                <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/gh inline-flex items-center gap-2 font-mono text-[0.68rem] text-text-secondary transition-colors duration-200 hover:text-text-primary"
                >
                    <span>View Source</span>

                    <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover/gh:translate-x-0.5"
                    >
                        ↗
                    </span>
                </a>
            )}
        </motion.div>
    );
}