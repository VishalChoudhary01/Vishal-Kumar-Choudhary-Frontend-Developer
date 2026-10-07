/* ------------------------------------------------------------------
   LAYER 20 — HERO ACTIONS (CTA / interactive controls).

   The mapping from project data to buttons lives in ONE place:

       ProjectActions (context="detail")

       project.links.live   → [ Live ]     all breakpoints
       project.links.github → [ Source ]   desktop only
       project.links.figma  → [ Figma ]    desktop only

   This layer owns only grouping and entrance. Nothing renders when
   no link exists — no empty action container, no spacing gap.
------------------------------------------------------------------ */
"use client";

import ProjectActions, {
    getProjectActions,
} from "@/app/components/common/ProjectActions";

import { EASE, DELAY } from "./projectHeroMotion";

export default function ProjectHeroActions({ project, prefersReduced }) {
    if (!getProjectActions(project, "detail").length) {
        return null;
    }

    return (
        <ProjectActions
            project={project}
            context="detail"
            entrance={{
                initial: { opacity: 0, y: 12 },
                animate: { opacity: 1, y: 0 },
                duration: prefersReduced ? 0 : 0.6,
                delay: prefersReduced ? 0 : DELAY.actions,
                ease: EASE,
            }}
            className="mt-6 sm:mt-8"
        />
    );
}
