"use client";
import { motion } from "motion/react";
import GlowingCornerHover from "../../molecules/cards/GlowingCard";
import useDarkMode from "@/app/hooks/useDarkMode";
import ProjectNarrative from "./Overview/ProjectNarrative";
import ProjectStatusBadge from "./Overview/ProjectStatusBadge";

const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: "easeOut" },
};

export default function ProjectOverviewSection({ project }) {
  const { isDarkMode } = useDarkMode();

  const primaryAccent = isDarkMode
    ? "var(--darkgrad-primary)"
    : "var(--grad-primary)";

  if (!project?.about?.short) return null;

  return (
    <motion.div variants={slideInLeft} className="flex justify-center md:my-40 my-20 ">
  <div className="relative w-[94%]   md:max-w-6xl">
    <GlowingCornerHover
      borderRadius="1rem"
      color={primaryAccent}
      className="relative overflow-hidden border border-gray-400/15 dark:border-neutral-400/20 shadow"
    >
      <div className="absolute top-0 right-0 z-20 ">
  <ProjectStatusBadge status={project.developmentInfo?.status} />
</div>


      <div className="md:py-14 py-10 md:px-8 px-3 flex justify-center">
        <ProjectNarrative project={project} />
      </div>
    </GlowingCornerHover>
  </div>
</motion.div>


  );
}
