"use client";

import Navbar from "@/app/components/layout/Navbar";
import PortfolioIntro from "@/app/components/sections/Intro_loader/portfolioIntro";
import { usePageLoader } from "@/app/providers/PageLoaderProvider";

export default function LabsPageShell({
  children,
  initialAuthUser = null,
  initialSessionResolved = false,
}) {
  const { isLoading, heroReady, completeLoading } = usePageLoader();

  return (
    <>
      {isLoading ? <PortfolioIntro onComplete={completeLoading} /> : null}
      <div
        className="min-h-screen bg-background text-text-primary"
        style={{ visibility: heroReady ? "visible" : "hidden" }}
      >
        <Navbar
          context="project"
          showLabsAccount
          initialAuthUser={initialAuthUser}
          initialSessionResolved={initialSessionResolved}
        />
        {children}
      </div>
    </>
  );
}
