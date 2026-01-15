"use client";
import { motion } from "motion/react";
import TechStackCard from "./TechStackCard";

export default function TechStackCategory({
  icon: Icon,
  title,
  techs,
  color,
  delay = 0,
  isDarkMode,
}) {
  if (!techs || techs.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <Icon className="text-lg sm:text-xl" style={{ color }} />
        <h3 className="font-playfair-display  font-semibold text-h3 dark:text-Head3dark">
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {techs.map((tech, index) => (
          <TechStackCard
            key={index}
            tech={tech}
            color={color}
            index={index}
            isDarkMode={isDarkMode}
          />
        ))}
      </div>
    </motion.div>
  );
}
