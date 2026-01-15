"use client";

import { motion } from "motion/react";

const TABS = ["overview", "build", "challenges", "impact"];

export default function ExperienceTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex gap-5 md:gap-8 border-b border-lightBorder dark:border-darkBorder md:pb-1.5  pb-1 ">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`relative ${
            activeTab === tab
              ? "dark:text-Head1dark  text-black  font-[400]"
              : "dark:text-Head2dark  text-gray-950 dark:hover:text-gray-100 hover:text-black transition-all duration-300 font-[300] "
          }  pb-2 text-xs md:text-sm font-roboto uppercase tracking-wider  transition `}
        >
          {tab}
          {activeTab === tab && (
            <motion.span
              layoutId="tab-underline"
              className=" absolute left-0 right-0 md:-bottom-2   -bottom-1 md:h-1 h-0.5     bg-linear-to-r from-gray-500/50       to-gray-800/40     dark:from-gray-200/20 dark:to-gray-50/40 "
            />
          )}
        </button>
      ))}
    </div>
  );
}
