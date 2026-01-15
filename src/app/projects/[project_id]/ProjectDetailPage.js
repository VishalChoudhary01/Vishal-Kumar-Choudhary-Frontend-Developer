"use client";

import { useState, useRef, useMemo, Suspense, lazy } from "react";
import { useRouter } from "next/navigation";
import { motion, useTransform, useScroll } from "framer-motion";

import { slideData } from "@/app/lib/data/index";
import ProjectFloatingNav from "@/app/components/organisms/projectDetail/ProjectNavigation";
import DarkModeToggle from "@/app/components/atoms/theme-toggle/DarkModeToggle";
import useDarkMode from "@/app/hooks/useDarkMode";

import {
  getProjectColors,
  handleShare,
} from "@/app/components/organisms/projectDetail/utils";

// Lazy load heavy components
const GridBackground = lazy(() => import("@/app/components/molecules/animation-background/ShaderBackground"));
const ParticleOverlayBackground = lazy(() => import("@/app/components/molecules/animation-background/ParticleOverlayBackground"));
const VisualShowcaseSection = lazy(() => import("@/app/components/organisms/projectDetail/VisualShowcaseSection"));
const PerformanceMetricsSection = lazy(() => import("@/app/components/organisms/projectDetail/PerformanceMetricsSection"));
const LearningOutcomesSection = lazy(() => import("@/app/components/organisms/projectDetail/LearningOutcomesSection"));
const PagesStructureSection = lazy(() => import("@/app/components/organisms/projectDetail/PagesStructureSection"));

// Import only essential components for initial render
import {
  ProjectHeroSection,
  ProjectOverviewSection,
  KeyFeaturesSection,
  TechStackSection,
  ChallengesSolutionsSection,
  FinalCTASection,
  ProjectNotFoundState,
} from "@/app/components/organisms/projectDetail";

// Loading fallback components
const LoadingBackground = () => (
  <div className="absolute inset-0 bg-contextBG dark:bg-contextDarkBG" />
);

const LoadingSection = () => (
  <div className="h-96 w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
);

const LoadingShimmer = () => (
  <div className="h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
);

export default function ProjectDetailPage({ projectId }) {
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState(null);
  const { isDarkMode } = useDarkMode();
  const contentRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end start"],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.97]);

  // Project data with proper memoization
  const project = useMemo(
    () => slideData.find((p) => p.id === projectId),
    [projectId]
  );

  // Colors with memoization
  const colors = useMemo(
    () => (project ? getProjectColors(project, isDarkMode) : null),
    [project, isDarkMode]
  );

  if (!project) return <ProjectNotFoundState />;

  // Optimize initial content loading
  const initialSections = (
    <>
      {/* Project Overview */}
      <ProjectOverviewSection
        project={project}
        colors={colors}
        isDarkMode={isDarkMode}
      />

      {/* Key Features */}
      <KeyFeaturesSection project={project} colors={colors} />

      {/* Tech Stack */}
      <TechStackSection project={project} colors={colors} />

      {/* Challenges & Solutions */}
      <ChallengesSolutionsSection project={project} colors={colors} />
    </>
  );

  // Lazy-loaded sections
  const lazySections = (
    <Suspense fallback={<LoadingSection />}>
      {/* Performance Metrics - Load after initial render */}
      <PerformanceMetricsSection project={project} />

      {/* Pages Structure */}
      <PagesStructureSection project={project} />

      {/* Visual Showcase */}
      <VisualShowcaseSection
        project={project}
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />

      {/* Learning Outcomes */}
      <LearningOutcomesSection
        project={project}
        colors={colors}
        isDarkMode={isDarkMode}
      />
      {/* Final CTA */}
      <FinalCTASection
        project={project}
        colors={colors}
        isDarkMode={isDarkMode}
      />
    </Suspense>
  );

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ================= DARK MODE TOGGLE ================= */}
      <motion.div
        initial={{ opacity: 0, x: 12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35, duration: 0.3 }}
        className="fixed top-6 right-6 z-50"
      >
        <DarkModeToggle />
      </motion.div>

      {/* ================= BACKGROUND ================= */}
      <div className="fixed inset-0 -z-20">
        <div className="absolute inset-0 bg-contextBG dark:bg-contextDarkBG" />
        
        <Suspense fallback={<LoadingBackground />}>
          {/* Grid Background */}
          <div className="absolute inset-0 z-10">
            <GridBackground />
          </div>

          {/* Particle Background */}
          <div className="absolute inset-0 z-20">
            <ParticleOverlayBackground />
          </div>
        </Suspense>
      </div>

      {!isDarkMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 -z-5 bg-gradient-to-br from-transparent to-orange-50/30"
        />
      )}

      {/* ================= FLOATING NAV ================= */}
      <ProjectFloatingNav
        router={router}
        isDarkMode={isDarkMode}
        handleShare={() => handleShare(project)}
      />

      {/* ================= HERO ================= */}
      <ProjectHeroSection
        project={project}
        isDarkMode={isDarkMode}
        heroOpacity={heroOpacity}
        heroScale={heroScale}
      />

      {/* ================= CONTENT ================= */}
      <motion.div
        ref={contentRef}
        className="space-y-12 sm:space-y-16 md:space-y-24 sm:px-3 pb-16 sm:pb-24 md:mt-10 mt-12"
      >
        {/* Header - Simplified animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center px-4"
        >
          <h3 className="font-bold md:mb-6 mb-2 lg:text-5xl md:text-4xl text-2xl font-lora text-gray-900 dark:text-white">
            Project Overview
          </h3>
          <p className="lg:text-xl md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A comprehensive look at the project objectives, challenges, and outcomes
          </p>
        </motion.div>

        {/* ================= INITIAL SECTIONS ================= */}
        {initialSections}

        {/* ================= LAZY LOADED SECTIONS ================= */}
        {lazySections}
      </motion.div>
    </div>
  );
}