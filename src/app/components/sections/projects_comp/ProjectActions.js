"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { toTransition } from "@/app/lib/motion/projectPresets";

export default function ProjectActions({
    href,
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

    /*
     * DISCOVERY CARD ACTIONS
     *
     * Primary CTA: View Project → /projects/[slug]
     * Optional:     Source ↗ (desktop only, only when a GitHub URL exists)
     *
     * The live site belongs to the project detail page, so the card keeps
     * a clear navigation hierarchy: Projects → Detail → Live Site / Source.
     */
    const hasGithub = Boolean(links?.github);

    if (!href && !hasGithub) {
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
            {href && (
                <Link
                    href={href}
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

            {hasGithub && (
                <a
                    href={links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    /*
                     * SOURCE IS DESKTOP-ONLY.
                     *
                     * `hidden` uses display:none, so the link is neither
                     * visible nor keyboard-focusable on mobile.
                     */
                    className="group/link hidden items-center gap-1.5 font-mono text-[0.72rem] text-text-secondary transition-[color,transform] duration-200 hover:-translate-y-px hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand lg:inline-flex sm:text-[0.76rem]"
                >
                    <span>Source</span>

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