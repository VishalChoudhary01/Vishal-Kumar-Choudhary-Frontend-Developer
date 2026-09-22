"use client";

import { lazy, Suspense } from "react";
import PortfolioIntro from "./components/sections/Intro_loader/portfolioIntro";
import { usePageLoader } from "./providers/PageLoaderProvider";
import Navbar from "./components/layout/Navbar";

/* ── Eager: visible above the fold ── */
import { HeroSection } from "./components/sections";

/* ── Lazy: below-the-fold sections ── */
const AboutSection = lazy(() =>
    import("./components/sections").then((m) => ({ default: m.AboutSection }))
);
const EducationSection = lazy(() =>
    import("./components/sections").then((m) => ({ default: m.EducationSection }))
);
const SkillsSection = lazy(() =>
    import("./components/sections").then((m) => ({ default: m.SkillsSection }))
);
const ExperienceSection = lazy(() =>
    import("./components/sections").then((m) => ({ default: m.ExperienceSection }))
);
const ProjectsSection = lazy(() =>
    import("./components/sections").then((m) => ({ default: m.ProjectsSection }))
);
const ContactSection = lazy(() =>
    import("./components/sections").then((m) => ({ default: m.ContactSection }))
);

function SectionFallback() {
    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-brand" />
        </div>
    );
}

export default function Home() {
    const { isLoading, heroReady, completeLoading } = usePageLoader();

    return (
        <main className="min-h-screen bg-background text-background">
            {/* Page Loader */}
            {isLoading && (
                <PortfolioIntro
                    onComplete={() => {
                        completeLoading();
                    }}
                />
            )}

            {/* Portfolio content */}
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
