"use client";
import { motion } from "motion/react";

export default function ProjectHeader({
  title,
  subtitle,
  titleCase = "uppercase",
  level = 1,
}) {
  const caseClasses = {
    uppercase: "uppercase",
    capitalize: "capitalize",
    "normal-case": "normal-case",
  };

  const titleClass = caseClasses[titleCase] || "uppercase";
  const HeadingTag = `h${level}`;

  return (
    <div className={`text-center font-lora`}>
      <div className="relative inline-block">
        {/* TEXT OUTLINE (always visible) */}
        <HeadingTag
          className={`absolute inset-0 lg:text-deskProjectHead [word-spacing:1rem] md:text-tabProjectHead text-mobProjectHead font-bold text-transparent [-webkit-text-stroke:1px_rgba(120,120,120,0.5)] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.35)] pointer-events-none ${titleClass}`}
        >
          {title}
        </HeadingTag>

        {/* Base light text */}
        <HeadingTag
          className={`lg:text-deskProjectHead md:text-tabProjectHead [word-spacing:1rem] text-mobProjectHead font-bold bg-linear-to-t from-neutral-300 via-neutral-200 to-neutral-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-950 bg-clip-text text-transparent ${titleClass}`}
        >
          {title}
        </HeadingTag>

        {/* Dark filling overlay */}
        <motion.div
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          whileInView={{ clipPath: "inset(0% 0 0 0)" }}
          viewport={{ once: true }}
          transition={{ duration: 2.5, delay: 0.8, ease: "easeOut" }}
          className={`absolute inset-0 bg-linear-to-t from-neutral-900 via-neutral-800 to-neutral-700 dark:from-white dark:via-white dark:to-white bg-clip-text text-transparent pointer-events-none ${titleClass}`}
        >
          <HeadingTag className="lg:text-deskProjectHead md:text-tabProjectHead [word-spacing:1rem] text-mobProjectHead font-bold">
            {title}
          </HeadingTag>
        </motion.div>
      </div>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto px-4 mt-6"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
