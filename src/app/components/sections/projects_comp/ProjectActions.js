"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { toTransition } from "@/app/lib/motion/projectPresets";

export default function ProjectActions({
    slug,
    links,
    entrance,
    isInView = true,
    className = "",
}) {
    const config =
        entrance || {
            initial: {
                opacity: 0,
                y: 10,
            },
            animate: {
                opacity: 1,
                y: 0,
            },
            duration: 0.4,
            ease: [0.22, 1, 0.36, 1],
        };

    const hasLive = Boolean(links?.live);
    const hasGithub = Boolean(links?.github);

    if (!slug && !hasLive && !hasGithub) {
        return null;
    }

    return (
        <motion.div
            className={[
                "flex flex-wrap items-center gap-x-6 gap-y-3",
                className,
            ].join(" ")}
            initial={isInView ? config.initial : false}
            animate={isInView ? config.animate : config.initial}
            transition={toTransition(config)}
        >
            {slug && (
                <Link
                    href={`/projects/${slug}`}
                    className="group/view inline-flex items-center gap-1.5 font-mono text-[0.78rem] font-medium tracking-[0.01em] text-brand transition-[gap,color] duration-200 hover:gap-2.5 hover:text-brand-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand sm:text-[0.82rem]"
                >
                    <span>View Project</span>

                    <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover/view:translate-x-1"
                    >
                        →
                    </span>
                </Link>
            )}

            {hasLive && (
                <a
                    href={links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-1.5 font-mono text-[0.72rem] text-text-secondary transition-[color,transform] duration-200 hover:-translate-y-px hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand sm:text-[0.76rem]"
                >
                    <span>Live Site</span>

                    <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                    >
                        ↗
                    </span>
                </a>
            )}

            {hasGithub && (
                <a
                    href={links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link inline-flex items-center gap-1.5 font-mono text-[0.72rem] text-text-secondary transition-[color,transform] duration-200 hover:-translate-y-px hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand sm:text-[0.76rem]"
                >
                    <span>GitHub</span>

                    <span
                        aria-hidden="true"
                        className="transition-transform duration-200 group-hover/link:translate-x-0.5"
                    >
                        ↗
                    </span>
                </a>
            )}
        </motion.div>
    );
}