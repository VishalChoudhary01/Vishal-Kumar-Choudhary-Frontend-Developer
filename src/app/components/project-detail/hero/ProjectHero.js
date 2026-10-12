/* ------------------------------------------------------------------
   PROJECT DETAIL HERO ENTRY.
   Mounts ProjectDetailHero, the controlled layered hero root.
------------------------------------------------------------------ */
"use client";

import ProjectDetailHero from "./ProjectDetailHero";

export default function ProjectHero({ project }) {
    return <ProjectDetailHero project={project} />;
}
