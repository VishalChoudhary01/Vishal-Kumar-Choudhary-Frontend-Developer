"use client";
import { motion } from "motion/react";
import { FaTachometerAlt, FaCog } from "react-icons/fa";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";
import StatItem from "./StatItem";
import DevelopmentInfo from "./DevelopmentInfo";

export default function DevelopmentStatsCard({ project, secondaryAccent }) {
  return (
    <GlowingCard
      color={secondaryAccent}
      className="h-full border border-gray-400/15 dark:border-neutral-400/20 shadow-lg"
      borderRadius="16px"
    >
      <div className="h-full md:p-5 sm:p-7 px-3 py-5">
        {/* Header */} 
        <div className="flex items-center gap-3 mb-6 font-open-sans">
          <div
            className="md:p-3 p-2 rounded-md bg-linear-120 border border-grad-primary/15 dark:border-darkgrad-primary/15    from-grad-primary/15 to-grad-secondary/5 dark:from-darkgrad-primary/15 dark:to-darkgrad-secondary/5 "
          >
            <FaTachometerAlt
              className="md:text-xl sm:text-2xl text-[1.1rem] text-grad-primary dark:text-darkgrad-primary"
            />
          </div>
          <div>
            <h3 className="md:text-lg sm:text-xl text-[0.95rem] font-semibold text-h1 dark:text-Head1dark">
              Development Stats
            </h3>
            <p className="text-xs sm:text-sm text-h3 dark:text-Head3dark mt-1">
              Project metrics and development details
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 grid-cols-1 gap-3 sm:gap-4">
          {Object.entries(project.stats)
            .filter(
              ([key]) =>
                !key.includes("lighthouse") &&
                key !== "loadTime" &&
                key !== "coreWebVitals"
            )
            .map(([key, value]) => (
              <StatItem
                key={key}
                statKey={key}
                value={value}
              />
            ))}
        </div>

        {/* Development Info */}
        {project.developmentInfo && (
          <DevelopmentInfo
            developmentInfo={project.developmentInfo}
            accentColor={secondaryAccent}
          />
        )}
      </div>
    </GlowingCard>
  );
}