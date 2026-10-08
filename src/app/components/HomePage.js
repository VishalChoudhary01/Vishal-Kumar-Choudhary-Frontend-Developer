"use client";

import { lazy, Suspense } from "react";
import PortfolioIntro from "./sections/Intro_loader/portfolioIntro";
import { usePageLoader } from "../providers/PageLoaderProvider";
import Navbar from "./layout/Navbar";
import { HeroSection } from "./sections";

const AboutSection = lazy(() =>
  import("./sections").then((m) => ({ default: m.AboutSection }))
);
const EducationSection = lazy(() =>
  import("./sections").then((m) => ({ default: m.EducationSection }))
);
const SkillsSection = lazy(() =>
  import("./sections").then((m) => ({ default: m.SkillsSection }))
);
const ExperienceSection = lazy(() =>
  import("./sections").then((m) => ({ default: m.ExperienceSection }))
);
const ProjectsSection = lazy(() =>
  import("./sections").then((m) => ({ default: m.ProjectsSection }))
);
const ContactSection = lazy(() =>
  import("./sections").then((m) => ({ default: m.ContactSection }))
);

function SectionFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
    </div>
  );
}

/*
 * Homepage client shell.
 *
 * All section content stays mounted and server-rendered; the loader only
 * toggles visibility (never mount-gating), so meaningful content is always
 * present in the HTML (spec §19). SEO head + JSON-LD live in ../page.js.
 */
export default function HomePage() {
  const { isLoading, heroReady, completeLoading } = usePageLoader();

  return (
    <main className="min-h-screen bg-background text-background">
      {isLoading && (
        <PortfolioIntro
          onComplete={() => {
            completeLoading();
          }}
        />
      )}

      <div
        style={{
          visibility: heroReady ? "visible" : "hidden",
        }}
      >
        <Navbar />
        <HeroSection />

        <Suspense fallback={<SectionFallback />}>
          <AboutSection />
          <EducationSection />
          <SkillsSection />
          <ExperienceSection />
          <ProjectsSection />
          <ContactSection />
        </Suspense>
      </div>
    </main>
  );
}
