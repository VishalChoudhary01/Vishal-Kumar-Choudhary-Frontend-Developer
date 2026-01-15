"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";
import ExperienceTabs from "./ExperienceTabs";
import useDarkMode from "@/app/hooks/useDarkMode";

export default function ExperienceCard({ experience }) {
  const [activeTab, setActiveTab] = useState("overview");
  const { isDarkMode } = useDarkMode();

  return (
    <GlowingCard
      color={experience.color}
      className="p-6 md:p-10 min-h-[360px]"
      borderRadius="0.75rem"
    >
      <motion.div
        key={experience.id}
        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full flex items-center h-full"
      >
        <div className="md:space-y-4 space-y-6">
          <div className="md:space-y-0.5 space-y-1">
            {/* Duration */}
            <p className="lg:text-[0.8rem] md:text-[0.7rem] text-[0.75rem] tracking-wide font-open-sans text-para3 dark:text-darkPara3">
              {experience.duration}
            </p>

            {/* Role */}
            <h3 className="text-lg md:text-xl lg:text-2xl font-semibold text-h1 dark:text-Head1dark font-roboto">
              {experience.role}
            </h3>

            {/* Company */}
            <p className="text-[0.85rem] md:text-md lg:text-[0.95rem] text-para2 font-open-sans dark:text-darkPara2">
              {experience.company}
            </p>
          </div>

          {/* Tabs */}
          <ExperienceTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.p
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="text-sm md:text-base leading-relaxed text-para2 font-open-sans dark:text-darkPara2 max-w-3xl md:min-h-[50px] min-h-32   "
            >
              {experience.tabs[activeTab]}
            </motion.p>
          </AnimatePresence>

          {/* Tech stack */}
          <div className="flex flex-wrap gap-2 pt-2">
            {experience.tech.map((t) => (
              <span
                key={t}
                className="px-3 py-1 text-xs md:text-sm rounded-full ring font-roboto ring-neutral-700/50 text-neutral-900 dark:ring-neutral-200/40 dark:text-neutral-100/85"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </GlowingCard>
  );
}
