"use client";

import { lazy, Suspense } from "react";

import ProjectHero from "./hero/ProjectHero";
import ProjectSnapshot from "./snapshot/ProjectSnapshot";

import ProjectContext from "./body/context/ProjectContext";
import ProjectApproach from "./body/approach/ProjectApproach";
import ProjectDesign from "./body/design/ProjectDesign";
import ProjectEngineering from "./body/engineering/ProjectEngineering";
import ProjectMotion from "./body/motion/ProjectMotion";
import ProjectResponsive from "./body/responsive/ProjectResponsive";

import Skeleton from "@/app/components/ui/Skeleton";

/* lazy-loaded heavy sections */
const ProjectShowcase = lazy(() => import("./showcase/ProjectShowcase"));
const ProjectReflection = lazy(() => import("./body/reflection/ProjectReflection"));
const ProjectNavigation = lazy(() => import("./navigation/ProjectNavigation"));

function SectionSkeleton() {
    return (
        <div className="px-5 py-16 sm:px-8 sm:py-24 md:px-10 lg:px-12 lg:py-28">
            <div className="mx-auto max-w-5xl space-y-6">
                <Skeleton className="h-8 w-32" rounded="rounded-md" />
                <Skeleton className="h-4 w-64" rounded="rounded-md" />
                <div className="grid gap-5 sm:grid-cols-2">
                    <Skeleton className="aspect-[16/9]" rounded="rounded-[14px]" />
                    <Skeleton className="aspect-[16/9]" rounded="rounded-[14px]" />
                </div>
            </div>
        </div>
    );
}

export default function ProjectDetail({
    project,
    prevProject,
    nextProject,
}) {
    const content = project.content || {};

    return (
        <main className="relative bg-background">
            <ProjectHero project={project} />

            <ProjectSnapshot project={project} />

            {content.context && (
                <ProjectContext project={project} />
            )}

            {content.approach && (
                <ProjectApproach project={project} />
            )}

            {content.design && (
                <ProjectDesign project={project} />
            )}

            {content.engineering && (
                <ProjectEngineering project={project} />
            )}

            {content.motion && (
                <ProjectMotion project={project} />
            )}

            {content.responsive && (
                <ProjectResponsive project={project} />
            )}

            {content.showcase && (
                <Suspense fallback={<SectionSkeleton />}>
                    <ProjectShowcase project={project} />
                </Suspense>
            )}

            {content.reflection && (
                <Suspense fallback={<SectionSkeleton />}>
                    <ProjectReflection project={project} />
                </Suspense>
            )}

            <Suspense fallback={<SectionSkeleton />}>
                <ProjectNavigation
                    prevProject={prevProject}
                    nextProject={nextProject}
                />
            </Suspense>
        </main>
    );
}