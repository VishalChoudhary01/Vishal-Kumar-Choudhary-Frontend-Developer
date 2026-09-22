"use client";

import { use } from "react";
import { notFound } from "next/navigation";

import PortfolioIntro from "@/app/components/sections/Intro_loader/portfolioIntro";
import ProjectDetail from "@/app/components/project-detail/ProjectDetail";
import { portfolio } from "@/app/data/portfolio";
import { usePageLoader } from "@/app/providers/PageLoaderProvider";
import Navbar from "@/app/components/layout/Navbar";

export default function ProjectPage({ params }) {
  const { slug } = use(params);

  const {
    isLoading,
    heroReady,
    completeLoading,
  } = usePageLoader();

  // ---------------------------------------------------------------------------
  // FIND PROJECT
  // ---------------------------------------------------------------------------

  const project = portfolio.projects.find(
    (item) => item.slug === slug,
  );

  if (!project) {
    notFound();
  }

  // ---------------------------------------------------------------------------
  // FIND PROJECT POSITION
  // ---------------------------------------------------------------------------

  const projectIndex = portfolio.projects.findIndex(
    (item) => item.slug === slug,
  );

  // ---------------------------------------------------------------------------
  // PREVIOUS / NEXT PROJECT
  // ---------------------------------------------------------------------------

  const previousProject =
    projectIndex > 0
      ? portfolio.projects[projectIndex - 1]
      : null;

  const followingProject =
    projectIndex < portfolio.projects.length - 1
      ? portfolio.projects[projectIndex + 1]
      : null;

  // ---------------------------------------------------------------------------
  // NORMALIZE PROJECT NAVIGATION
  // ---------------------------------------------------------------------------

  const prevProject = previousProject
    ? {
      name: previousProject.name,
      href: `/projects/${previousProject.slug}`,
    }
    : null;

  const nextProject = followingProject
    ? {
      name: followingProject.name,
      href: `/projects/${followingProject.slug}`,
    }
    : null;

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------

  return (
    <main className="min-h-screen bg-background text-text-primary">
      {isLoading && (
        <PortfolioIntro
          onComplete={completeLoading}
        />
      )}


      {heroReady && (
        <>
        
          <Navbar context="project"/>
          <ProjectDetail
            project={project}
            prevProject={prevProject}
            nextProject={nextProject}
          />
        
        </>
        
      )}
    </main>
  );
}