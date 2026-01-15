"use client";
import { motion } from "motion/react";
import Heading from "../../atoms/typography/Heading/Heading";
import useDarkMode from "@/app/hooks/useDarkMode";
import LighthouseScoresCard from "./PerformanceMetricsSection/LighthouseScoresCard";
import DevelopmentStatsCard from "./PerformanceMetricsSection/DevelopmentStatsCard";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

export default function PerformanceMetricsSection({ project }) {
  const { isDarkMode } = useDarkMode();

  if (!project.stats) {
    return null;
  }

  const primaryAccent = isDarkMode
    ? "var(--darkgrad-primary)"
    : "var(--grad-primary)";
  const secondaryAccent = isDarkMode
    ? "var(--darkgrad-secondary)"
    : "var(--grad-secondary)";

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-6xl mx-auto px-4 sm:px-6"
    >
      <Heading
        heading="Performance Metrics"
        subheading="Detailed analysis of performance, accessibility, and best practices"
        align="center"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
        {/* Lighthouse Scores Card */}
        {project.stats.lighthousePerformance !== undefined && (
          <motion.div variants={fadeInUp}>
            <LighthouseScoresCard
              project={project}
              primaryAccent={primaryAccent}
            />
          </motion.div>
        )}

        {/* Development Stats Card */}
        <motion.div variants={fadeInUp}>
          <DevelopmentStatsCard
            project={project}
            secondaryAccent={secondaryAccent}
          />
        </motion.div>
      </div>
    </motion.section>
  );
}