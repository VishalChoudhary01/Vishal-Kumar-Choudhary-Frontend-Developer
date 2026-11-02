"use client";

import Navbar from "@/app/components/layout/Navbar";
import PortfolioIntro from "@/app/components/sections/Intro_loader/portfolioIntro";
import { usePageLoader } from "@/app/providers/PageLoaderProvider";

export default function LabsPageShell({ children }) {
  const { isLoading, heroReady, completeLoading } = usePageLoader();

  return (
    <>
      {isLoading ? <PortfolioIntro onComplete={completeLoading} /> : null}
      <div
        className="min-h-screen bg-background text-text-primary"
        style={{ visibility: heroReady ? "visible" : "hidden" }}
      >
        <Navbar context="project" />
        {children}
      </div>
    </>
  );
}
