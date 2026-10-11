"use client";

import { motion } from "motion/react";
import { toTransition } from "@/app/lib/motion/projectPresets";
import { cn } from "@/app/lib/utils";

export default function ProjectMeta({
    technologies,
    mobileLimit,
    entrance,
    isInView = true,
    className = "",
}) {
    if (
        !technologies ||
        technologies.length === 0
    ) {
        return null;
    }

    /*
     * RESPONSIVE TECHNOLOGY VISIBILITY
     *
     * Mobile shows a shorter list than desktop so the card never
     * becomes a wall of text. The hidden list uses `display: none`,
     * so it is removed from the accessibility tree as well.
     */
    const mobileTechnologies = mobileLimit
        ? technologies.slice(0, mobileLimit)
        : technologies;

    const hasResponsiveSplit =
        mobileTechnologies.length < technologies.length;

    const config =
        entrance || {
            initial: {
                opacity: 0,
                y: 12,
            },
            animate: {
                opacity: 1,
                y: 0,
            },
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1],
        };

    return (
        <motion.div
            className={className}
            initial={
                isInView
                    ? config.initial
                    : false
            }
            animate={
                isInView
                    ? config.animate
                    : config.initial
            }
            transition={toTransition(config)}
        >
            {!hasResponsiveSplit ? (
                <TechnologyList technologies={technologies} />
            ) : (
                <>
                    <TechnologyList
                        technologies={mobileTechnologies}
                        className="lg:hidden"
                    />

                    <TechnologyList
                        technologies={technologies}
                        className="hidden lg:flex"
                    />
                </>
            )}
        </motion.div>
    );
}

function TechnologyList({ technologies, className = "" }) {
    return (
        <ul
            className={cn(
                "flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.68rem] leading-relaxed text-text-muted",
                className
            )}
        >
            {technologies.map(
                (technology, index) => (
                    <li
                        key={technology}
                        className="inline-flex items-center gap-x-2"
                    >
                        {index > 0 && (
                            <span
                                aria-hidden="true"
                                className="text-text-muted"
                            >
                                ·
                            </span>
                        )}

                        <span>
                            {technology}
                        </span>
                    </li>
                )
            )}
        </ul>
    );
}