"use client";

import { motion } from "motion/react";
import { useEffect, useRef } from "react";

export default function ExperienceList({ items, activeId, onChange }) {
  const containerRef = useRef(null);
  const itemRefs = useRef({});

  // Auto-scroll to center active item on mobile
  useEffect(() => {
    if (!containerRef.current || window.innerWidth >= 768) return;

    const activeItemRef = itemRefs.current[activeId];
    if (!activeItemRef) return;

    const container = containerRef.current;
    const containerWidth = container.clientWidth;
    const itemWidth = activeItemRef.clientWidth;
    const itemLeft = activeItemRef.offsetLeft;

    const scrollTo = itemLeft - containerWidth / 2 + itemWidth / 2;

    container.scrollTo({
      left: scrollTo,
      behavior: "smooth",
    });
  }, [activeId]);

  return (
    <div
      ref={containerRef}
      className="flex md:flex-col gap-3 md:gap-4 pb-3 md:pb-0   -mx-6 px-6 md:mx-0 md:px-0 overflow-x-auto md:overflow-visible snap-x snap-mandatory"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {items.map((exp) => {
        const isActive = exp.id === activeId;

        return (
          <motion.div
            key={exp.id}
            ref={(el) => (itemRefs.current[exp.id] = el)}
            whileHover={{ x: isActive ? 0 : 4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="shrink-0 snap-center"
          >
            <button
              onClick={() => onChange(exp.id)}
              className={`text-left px-4 py-3 space-y-0.5 transition-all duration-300 backdrop-blur-md rounded-lg min-w-[212px] md:min-h-auto  border w-[210px] md:w-full ${
                isActive
                  ? "border-gray-300/40 dark:border-gray-800/25    md:translate-x-1.5 backdrop-blur-md bg-white dark:bg-gray-100/10 shadow-sm shadow-neutral-200/50 dark:shadow-neutral-700/60 "
                  : "border-gray-300/25 dark:border-gray-600/30  hover:border-gray-300/40 dark:hover:border-gray-700/40 bg-gray-50/90      dark:bg-gray-900/25"
              } hover:shadow-sm active:scale-[0.98] md:active:scale-100`}
            >

              {/* ROLE */}
              <p
                className={`font-roboto tracking-tight text-sm md:text-base lg:text-[1.1rem] ${
                  isActive
                    ? "text-h1 dark:text-Head1dark font-medium"
                    : "text-h4 dark:text-Head4dark font-normal"
                }`}
              >
                {exp.role}
              </p>

              {/* COMPANY */}
              <p
                className={`font-open-sans tracking-wide transition-all duration-300 text-xs md:text-sm lg:text-[0.75rem] ${
                  isActive
                    ? "text-para1 dark:text-darkPara1"
                    : "text-para3 dark:text-darkPara3"
                }`}
              >
                {exp.company}
              </p>

              {/* Duration (hidden on mobile) */}
              <div
                className={`font-open-sans mt-1 hidden md:block transition-all duration-300 text-xs md:text-sm lg:text-[0.75rem] ${
                  isActive
                    ? "text-h3 dark:text-Head3dark"
                    : "text-h3/85 dark:text-Head3dark/80"
                }`}
              >
                {exp.duration}
              </div>
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
