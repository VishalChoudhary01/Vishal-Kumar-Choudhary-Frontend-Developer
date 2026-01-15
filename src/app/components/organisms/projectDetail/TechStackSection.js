"use client";
import { motion } from "motion/react";
import { FaToolbox } from "react-icons/fa";
import { IoCodeSlash } from "react-icons/io5";
import Heading from "@/app/components/atoms/typography/Heading/Heading";
import useDarkMode from "@/app/hooks/useDarkMode";
import TechStackCategory from "@/app/components/organisms/projectDetail/project-stacks/TechStackCategory";

export default function TechStackSection({ project }) {
  const { isDarkMode } = useDarkMode();

  if (!project.techStack) {
    return null;
  }

  // Get accent colors from CSS variables
  const primaryAccent = isDarkMode
    ? "var(--darkgrad-primary)"
    : "var(--grad-primary)";
  const secondaryAccent = isDarkMode
    ? "var(--darkgrad-secondary)"
    : "var(--grad-secondary)";
  const tertiaryAccent = isDarkMode
    ? "var(--darkgrad-tertiary)"
    : "var(--grad-tertiary)";

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-6xl mx-auto px-4 sm:px-6"
    >
      <Heading
        heading="Technology Stack"
        subheading="Modern tools and technologies powering this project"
        align="center"
      />

      <div className="space-y-6 sm:space-y-8">
        <TechStackCategory
          icon={FaToolbox}
          title="Frontend"
          techs={project.techStack.frontend}
          color={primaryAccent}
          delay={0}
          isDarkMode={isDarkMode}
        />

        <TechStackCategory
          icon={FaToolbox}
          title="Backend"
          techs={project.techStack.backend}
          color={secondaryAccent}
          delay={0.1}
          isDarkMode={isDarkMode}
        />

        <TechStackCategory
          icon={IoCodeSlash}
          title="Tools"
          techs={project.techStack.tools}
          color={tertiaryAccent}
          delay={0.2}
          isDarkMode={isDarkMode}
        />
      </div>
    </motion.section>
  );
}
