"use client";
import React from "react";
import { motion } from "motion/react";

const TechSkillItem = ({
  skill,
  isHovered,
  isDarkMode,
  onHover,
  onLeave,
  category,
  isMobile,
  gradientColor,
}) => {
  return (
    <motion.li
      className="relative py-1.5 px-2 md:px-3 rounded-lg cursor-pointer group"
      onMouseEnter={() => onHover(skill)}
      onMouseLeave={onLeave}
      animate={{
        backgroundColor:
          isHovered && !isMobile
            ? isDarkMode
              ? `${gradientColor}15`
              : `${gradientColor}08`
            : "rgba(0, 0, 0, 0)",
        y: isHovered && !isMobile ? -1 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.2,
      }}
    >
      <div className="flex items-center">
        <motion.span
          className="mr-2 md:mr-3 text-[10px] shrink-0"
          animate={{
            scale: isHovered && !isMobile ? 1.3 : 1,
            color:
              isHovered && !isMobile
                ? gradientColor
                : isDarkMode
                ? "var(--darkPara2)"
                : "var(--para2)",
          }}
          transition={{ duration: 0.2 }}
        >
          •
        </motion.span>

        <motion.span
          className="text-[0.85rem] md:text-md  lg:text-[0.9rem]  font-open-sans text-left select-none flex-1 font-light leading-tight md:leading-normal wrap-break-word hyphens-auto transition-all duration-200"
          animate={{
            fontWeight: isHovered && !isMobile ? 600 : 400,
            color:
              isHovered && !isMobile
                ? gradientColor
                : isDarkMode
                ? "var(--darkPara1)"
                : "var(--para1)",
            x: isHovered && !isMobile ? 2 : 0,
            textShadow:
              isHovered && !isMobile
                ? `0 0 8px ${gradientColor}40, 0 0 16px ${gradientColor}20`
                : "none",
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
          }}
        >
          {skill}
        </motion.span>
      </div>

      {/* Enhanced Border glow - Hide on mobile */}
      {!isMobile && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 -z-5"
          animate={{
            opacity: isHovered ? 1 : 0,
            borderColor: gradientColor,
            boxShadow: isHovered
              ? `0 0 15px ${gradientColor}30, 0 0 30px ${gradientColor}15`
              : "none",
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.li>
  );
};

export default TechSkillItem;
