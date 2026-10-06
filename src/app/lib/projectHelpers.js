/**
 * PROJECT HELPERS — pure selectors derived from the canonical project object.
 *
 * The project object in `@/app/data/projectsData` is the single source of truth.
 * These helpers never store duplicated values; they only derive presentation
 * values from canonical fields:
 *
 *   category      → machine-readable category (filtering / grouping / logic)
 *   categoryLabel → human-readable display label (UI)
 *   year          → canonical year
 *   role          → canonical role
 *   description   → canonical short description
 *   technologies  → canonical complete technology list
 *   media         → canonical primary media
 *   links         → canonical link source (live / github)
 */

import { PROJECT_TYPE_LABELS } from "@/app/components/sections/projects_comp/project.constants";

/** Canonical short description. `hero.description` stays available as an explicit override. */
export function getProjectDescription(project) {
    return project?.hero?.description ?? project?.description ?? null;
}

/** Display label for a project: `categoryLabel`, with `category` as the fallback map key. */
export function getProjectCategoryLabel(project) {
    if (!project) return null;

    return (
        project.categoryLabel ??
        PROJECT_TYPE_LABELS[project.category] ??
        null
    );
}

/** Hero eyebrow: presentation-only override, otherwise derived from category + year. */
export function getProjectEyebrow(project) {
    if (project?.hero?.eyebrow) {
        return project.hero.eyebrow;
    }

    const parts = [getProjectCategoryLabel(project), project?.year].filter(
        Boolean
    );

    return parts.length ? parts.join(" · ") : null;
}

/** Single metadata line for listing cards: "2026 · Developer Tool". */
export function getProjectCardMeta(project) {
    const parts = [project?.year, getProjectCategoryLabel(project)].filter(
        Boolean
    );

    return parts.length ? parts.join(" · ") : null;
}

/**
 * Short technology list for listing cards.
 * `technologies` remains the canonical complete list; the detail page renders all of it.
 */
export function getProjectCardTechnologies(project, limit = 6) {
    const technologies = project?.technologies;

    if (!Array.isArray(technologies)) {
        return [];
    }

    return technologies.slice(0, limit);
}

/** True when the project has a real source repository URL. */
export function hasProjectSource(project) {
    return Boolean(project?.links?.github);
}

/** Canonical detail-page href for a project. */
export function getProjectDetailHref(project) {
    const key = project?.slug ?? project?.id;

    return key ? `/projects/${key}` : null;
}
