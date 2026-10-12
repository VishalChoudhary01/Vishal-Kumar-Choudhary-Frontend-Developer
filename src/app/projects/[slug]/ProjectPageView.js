"use client";

import PortfolioIntro from "@/app/components/sections/Intro_loader/portfolioIntro";
import ProjectDetail from "@/app/components/project-detail/ProjectDetail";
import Navbar from "@/app/components/layout/Navbar";
import { usePageLoader } from "@/app/providers/PageLoaderProvider";

/*
 * Project detail client shell.
 *
 * Spec §19: content must exist before animation. Everything stays mounted
 * (and therefore server-rendered); the intro loader only toggles
 * visibility. Hero entrance animations are gated on heroReady inside the
 * hero components, so they still play once the loader completes.
 */
export default function ProjectPageView({
  project,
  prevProject,
  nextProject,
}) {
  const { isLoading, heroReady, completeLoading } = usePageLoader();

  return (
    <>
      {isLoading && (
        <PortfolioIntro onComplete={completeLoading} />
      )}

      <div
        className="min-h-screen bg-background text-text-primary"
        style={{
          /* Gated on heroReady, which flips in the SAME commit that
             unmounts the intro above — the peel reveals real content. */
          visibility: heroReady ? "visible" : "hidden",
        }}
      >
        <Navbar context="project" />
        <ProjectDetail
          project={project}
          prevProject={prevProject}
          nextProject={nextProject}
        />
      </div>
    </>
  );
}
