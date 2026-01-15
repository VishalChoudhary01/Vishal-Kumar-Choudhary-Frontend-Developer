"use client";
import { motion } from "motion/react";

export default function StatItem({ icon: Icon, label, value, primaryAccent }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="flex flex-col items-center group"
    >
      <div className="mb-2 p-2 rounded-full backdrop-blur-xs bg-gray-200/40 dark:bg-black/20 group-hover:bg-white/40 dark:group-hover:bg-black/40 transition-colors md:w-11 md:h-11 w-9 h-9 flex items-center justify-center">
        <Icon className="md:text-[1.1rem] text-[0.8rem] text-grad-primary dark:text-darkgrad-primary" />
      </div>
      <div className="text-center w-full">
        <p className="uppercase tracking-wide dark:text-darkPara3 text-para3 lg:text-deskPara3 md:text-tabPara3 text-[0.7rem] mb-1">
          {label}
        </p>
        <p className="text-grad-primary/90 dark:text-darkgrad-primary dark:bg-darkgrad-primary/10 bg-grad-primary/10 border border-grad-primary/30 dark:border-darkgrad-primary/30 md:px-4 px-3 rounded-full lg:text-deskHead4 md:text-tabHead4 text-mobHead4  font-normal">
          {value}
        </p>
      </div>
    </motion.div>
  );
}