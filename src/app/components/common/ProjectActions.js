"use client";

/* ------------------------------------------------------------------
   PROJECT ACTIONS — the single mapping from project data to CTAs.

   Architecture:

       project data
           ↓
       project.links (live / github / figma)
           ↓
       ProjectActions (this file — card | detail)
           ↓
       ProjectResumeButton

   The one rule:

       URL exists   → render the action.
       URL missing  → render nothing.

   No hard-coded project names, no disabled placeholders, no
   invented URLs, no duplicated URL logic in pages.
------------------------------------------------------------------ */

import { motion } from "motion/react";

import ProjectResumeButton from "./ProjectResumeButton";
import { getProjectDetailHref } from "@/app/lib/projectHelpers";
import { toTransition } from "@/app/lib/motion/projectPresets";
import { cn } from "@/app/lib/utils";

/*
 * show:
 *   "always"  — every breakpoint
 *   "desktop" — >= 1024px only (hidden below lg, out of tab order)
 */
export function getProjectActions(project, context = "card") {
    const links = project?.links ?? {};
    const name = project?.name ?? "project";

    const wrap = (entry) => ({
        ...entry,
        ariaLabel: `${entry.label} — ${name}`,
    });

    if (context === "detail") {
        /*
         * The current project is already being viewed — no
         * "View Project" self-link here.
         *
         *   Live    → mobile / tablet / desktop
         *   Source  → desktop only
         *   Figma   → desktop only
         */
        const actions = [];

        if (links.live) {
            actions.push(
                wrap({
                    key: "live",
                    href: links.live,
                    label: "Live",
                    external: true,
                    show: "always",
                })
            );
        }

        if (links.github) {
            actions.push(
                wrap({
                    key: "source",
                    href: links.github,
                    label: "Source",
                    external: true,
                    show: "desktop",
                })
            );
        }

        if (links.figma) {
            actions.push(
                wrap({
                    key: "figma",
                    href: links.figma,
                    label: "Figma",
                    external: true,
                    show: "desktop",
                })
            );
        }

        return actions;
    }    /* ----------------------------------------------------------------
     * CARD — the permanent primary action below the project image.
     *
     *   View Project → internal route to the detail page
     *
     * `Live` is NOT part of this row. It is a contextual action
     * revealed over the image on desktop hover (see ProjectMedia),
     * so the card keeps one clear primary CTA:
     *
     *     IMAGE → TECH → VIEW PROJECT
     * ----------------------------------------------------------------
     */

    const actions = [];

    const detailHref = getProjectDetailHref(project);

    if (detailHref) {
        actions.push(
            wrap({
                key: "view",
                href: detailHref,
                label: "View Project",
                external: false,
                show: "always",
            })
        );
    }

    return actions;
}

export default function ProjectActions({
    project,
    context = "card",
    entrance,
    isInView = true,
    className,
}) {
    const actions = getProjectActions(project, context);

    /* No actions → no wrapper, no spacing, no empty gap. */
    if (!actions.length) {
        return null;
    }

    const isCard = context === "card";

    const group = (
        <div
            className={cn(
                "flex flex-wrap items-center",
                "gap-3 sm:gap-4"
            )}
        >
            {actions.map((action) => (
                <div
                    key={action.key}
                    /*
                     * display:none keeps desktop-only actions out of
                     * the mobile layout AND out of the tab order.
                     */
                    className={
                        action.show === "desktop"
                            ? "hidden lg:block"
                            : undefined
                    }
                >
                    <ProjectResumeButton
                        href={action.href}
                        label={action.label}
                        ariaLabel={action.ariaLabel}
                        external={action.external}
                        size={isCard ? "sm" : "default"}
                    />
                </div>
            ))}
        </div>
    );

    /*
     * Card listing carries its own scroll-entrance preset.
     * Detail is animated by its hero wrapper — pass `entrance`
     * there too to keep one rendering path.
     */
    if (!entrance) {
        return (
            <div className={className}>
                {group}
            </div>
        );
    }

    return (
        <motion.div
            className={className}
            initial={isInView ? entrance.initial : false}
            animate={isInView ? entrance.animate : entrance.initial}
            transition={toTransition(entrance)}
        >
            {group}
        </motion.div>
    );
}
