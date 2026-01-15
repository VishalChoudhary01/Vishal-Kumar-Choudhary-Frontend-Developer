"use client";
import { motion } from "motion/react";
import { techIcons } from "@/app/lib/utils/techIcons";
import { IoCodeSlash } from "react-icons/io5";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";

export default function TechStackCard({ tech, color, index, isDarkMode }) {
  const IconComponent = techIcons[tech.name] || IoCodeSlash;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative h-full"
    >
      <GlowingCard
        color={color}
        className="border border-gray-400/15 dark:border-neutral-400/20 shadow"
        borderRadius="0.5rem"
        isDarkMode={isDarkMode}
      >
        <div className="flex items-center gap-3 md:px-3 md:py-2 px-2 py-1.5">
          <IconComponent
            className="text-lg sm:text-xl shrink-0"
            style={{ color }}
          />
          <div>
            <h4 className="text-xs sm:text-sm font-medium font-roboto text-h4 dark:text-Head4dark">
              {tech.name}
            </h4>
            {tech.version && (
              <p className="md:text-xs text-[0.7rem] flex   text-para2 dark:text-darkPara2 mt-0.5 font-open-sans">
                <span>v</span> <span className="italic"> {tech.version}</span>
              </p>
            )}
          </div>
        </div>
      </GlowingCard>
    </motion.div>
  );
}
