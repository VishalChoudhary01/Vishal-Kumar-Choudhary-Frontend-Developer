"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import SectionHeading from "@/app/components/common/SectionHeading";
import useReducedMotion from "@/app/hooks/useReducedMotion";
import { portfolio } from "@/app/data/portfolio";

import ProjectCategoryNav from "./projects_comp/ProjectCategoryNav";
import ProjectRenderer from "./projects_comp/ProjectRenderer";

import { EASE_EDITORIAL } from "./projects_comp/project.constants";

const INITIAL_PROJECT_COUNT = 3;

const PROJECT_CATEGORY_LABELS = {
    all: "All",
    "web-experience": "Web Experiences",
    "production-platform": "Production Platforms",
    product: "Products",
    "web-app": "Web Apps",
    tool: "Tools",
    interactive: "Interactive",
    experiment: "Experiments",
    game: "Games",
    website: "Websites",
    editorial: "Editorial",
};

function formatCategoryKey(key) {
    return key
        .split("-")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ");
}

export default function Projects() {
    const prefersReducedMotion = useReducedMotion();

    const [activeCategory, setActiveCategory] =
        useState("all");

    const [showAllProjects, setShowAllProjects] =
        useState(false);

    const projects = portfolio.projects || [];

    /* --------------------------------------------------------------------------
       AVAILABLE CATEGORIES

       Categories are generated directly from the project data.
       "all" is always first.
    -------------------------------------------------------------------------- */

    const availableCategories = useMemo(() => {
        const categories = new Set(
            projects
                .map((project) => project.category)
                .filter(Boolean)
        );

        return ["all", ...categories];
    }, [projects]);

    /* --------------------------------------------------------------------------
       FILTER PROJECTS

       "all" returns the complete project collection.
       Otherwise only projects matching the selected category are returned.
    -------------------------------------------------------------------------- */

    const filteredProjects = useMemo(() => {
        if (activeCategory === "all") {
            return projects;
        }

        return projects.filter(
            (project) =>
                project.category === activeCategory
        );
    }, [activeCategory, projects]);

    /* --------------------------------------------------------------------------
       DISPLAY LIMIT

       Every category starts with a maximum of 3 projects.

       Example:
         2 projects → show 2, no button
         3 projects → show 3, no button
         4 projects → show 3 + "View more projects"
         8 projects → show 3 + "View more projects"

       Once showAllProjects becomes true, the complete filtered collection
       is rendered.
    -------------------------------------------------------------------------- */

    const hasHiddenProjects =
        filteredProjects.length > INITIAL_PROJECT_COUNT;

    const visibleProjects = showAllProjects
        ? filteredProjects
        : filteredProjects.slice(
            0,
            INITIAL_PROJECT_COUNT
        );

    /* --------------------------------------------------------------------------
       CATEGORY CHANGE

       Switching categories always returns the user to the first 3 projects
       of the newly selected category.
    -------------------------------------------------------------------------- */

    const handleCategorySelect = (category) => {
        setActiveCategory(category);
        setShowAllProjects(false);
    };

    /* --------------------------------------------------------------------------
       SHOW ALL

       Only affects the currently selected category.
    -------------------------------------------------------------------------- */

    const handleShowMore = () => {
        setShowAllProjects(true);
    };

    const activeCategoryLabel =
        activeCategory === "all"
            ? "all projects"
            : PROJECT_CATEGORY_LABELS[activeCategory] ||
            formatCategoryKey(activeCategory);

    return (
        <section
            id="projects"
            aria-labelledby="projects-heading"
            className="relative bg-background px-5 py-28 sm:px-8 sm:py-36 md:px-10 lg:py-44"
        >
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 md:gap-14 lg:grid-cols-[180px_1fr] lg:gap-16">
                    {/* ----------------------------------------------------------------
                       SECTION LABEL
                    ----------------------------------------------------------------- */}

                    <div className="min-w-0">
                        <SectionHeading
                            heading="PROJECTS"
                            align="left"
                            number={"06"}
                        />
                    </div>

                    {/* ----------------------------------------------------------------
                       PROJECT COLLECTION
                    ----------------------------------------------------------------- */}

                    <div className="min-w-0">
                        <SectionHeading
                            supporting="What I actually built."
                            align="left"
                            supportingId="projects-heading"
                        />

                        {/* ------------------------------------------------------------
                           CATEGORY NAVIGATION
                        ------------------------------------------------------------- */}

                        <div className="mt-10 sm:mt-12">
                            <ProjectCategoryNav
                                categories={availableCategories}
                                categoryLabels={
                                    PROJECT_CATEGORY_LABELS
                                }
                                formatKey={formatCategoryKey}
                                activeCategory={
                                    activeCategory
                                }
                                onSelect={
                                    handleCategorySelect
                                }
                            />
                        </div>

                        {/* ------------------------------------------------------------
                           PROJECT LIST
                        ------------------------------------------------------------- */}

                        <div
                            id="projects-list"
                            role="tabpanel"
                            aria-label={`Showing ${activeCategoryLabel}`}
                            className="mt-10 sm:mt-12"
                        >
                            {prefersReducedMotion ? (
                                <ProjectList
                                    projects={
                                        visibleProjects
                                    }
                                    hasHidden={
                                        hasHiddenProjects
                                    }
                                    onShowMore={
                                        handleShowMore
                                    }
                                />
                            ) : (
                                <AnimatePresence
                                    mode="wait"
                                    initial={false}
                                >
                                    <motion.div
                                        key={activeCategory}
                                        initial={{
                                            opacity: 0,
                                            y: 12,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -8,
                                        }}
                                        transition={{
                                            duration: 0.4,
                                            ease: EASE_EDITORIAL,
                                        }}
                                    >
                                        <ProjectList
                                            projects={
                                                visibleProjects
                                            }
                                            hasHidden={
                                                hasHiddenProjects
                                            }
                                            onShowMore={
                                                handleShowMore
                                            }
                                        />
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ============================================================================
   PROJECT LIST

   Responsible only for rendering:
     - project items
     - separators
     - empty state
     - centered "View more projects" action
============================================================================ */

function ProjectList({
    projects,
    hasHidden,
    onShowMore,
}) {
    if (projects.length === 0) {
        return (
            <div className="py-16 text-center">
                <p className="font-body text-sm text-text-muted">
                    No projects in this category yet.
                </p>
            </div>
        );
    }

    return (
        <>
            {projects.map((project, index) => (
                <div key={project.id}>
                    <ProjectRenderer
                        project={project}
                        index={index}
                    />

                    {index < projects.length - 1 && (
                        <div
                            className="mt-20 h-px w-full bg-border-subtle sm:mt-24 lg:mt-28"
                            aria-hidden="true"
                        />
                    )}
                </div>
            ))}

            {/* ----------------------------------------------------------------------
               VIEW MORE PROJECTS

               This is intentionally centered because it belongs to the entire
               project collection rather than to an individual project.
            ----------------------------------------------------------------------- */}

            {hasHidden && (
                <div className="mt-16 border-t border-border-subtle pt-10 sm:mt-20 sm:pt-12">
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={onShowMore}
                            className="group/more inline-flex cursor-pointer items-center gap-2 font-mono text-[0.74rem] font-medium uppercase tracking-[0.12em] text-text-secondary transition-[color,gap] duration-200 hover:gap-3 hover:text-brand focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            <span>
                                View more projects
                            </span>

                            <span
                                aria-hidden="true"
                                className="transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:translate-y-1"
                            >
                                ↓
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}