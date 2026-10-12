"use client";

import ProjectPresentation from "./ProjectPresentation";

const SUPPORTED_MODES = new Set([
    "editorial",
    "product",
    "interactive",
    "visual",
]);

export default function ProjectRenderer({
    project,
    index,
}) {
    const mode = SUPPORTED_MODES.has(
        project.presentation?.mode
    )
        ? project.presentation.mode
        : "editorial";

    return (
        <ProjectPresentation
            project={project}
            index={index}
            mode={mode}
        />
    );
}