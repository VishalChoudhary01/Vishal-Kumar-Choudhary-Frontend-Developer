"use client";

import React from "react";
import { motion } from "motion/react";
import GlowingCard from "../../molecules/cards/GlowingCard";
import useDarkMode from "@/app/hooks/useDarkMode";

const TimelineCard = ({
  item,
  index,
  custom = 0,
  layout = "desktop",
  isRight = false,
}) => {
  const Icon = item.icon;
  const isMobile = layout === "mobile";
  const { isDarkMode } = useDarkMode();

  // Use existing gradient variables
  const glowColors = isDarkMode
    ? [
        "var(--darkgrad-primary)",
        "var(--darkgrad-secondary)",
        "var(--darkgrad-tertiary)",
        "var(--darkgrad-quaternary)",
      ]
    : [
        "var(--grad-primary)",
        "var(--grad-secondary)",
        "var(--grad-tertiary)",
        "var(--grad-quaternary)",
      ];

  const getGlowColor = () => glowColors[index % glowColors.length];

  // Get gradient pair for blob and icon
  const getGradientColors = (idx) => {
    const gradients = isDarkMode
      ? [
          { from: "var(--darkgrad-primary)", to: "var(--darkgrad-secondary)" },
          { from: "var(--darkgrad-secondary)", to: "var(--darkgrad-tertiary)" },
          {
            from: "var(--darkgrad-tertiary)",
            to: "var(--darkgrad-quaternary)",
          },
          { from: "var(--darkgrad-quaternary)", to: "var(--darkgrad-primary)" },
        ]
      : [
          { from: "var(--grad-primary)", to: "var(--grad-secondary)" },
          { from: "var(--grad-secondary)", to: "var(--grad-tertiary)" },
          { from: "var(--grad-tertiary)", to: "var(--grad-quaternary)" },
          { from: "var(--grad-quaternary)", to: "var(--grad-primary)" },
        ];

    return gradients[idx % gradients.length];
  };

  const colors = getGradientColors(index);
  const iconVariants = {
    hover: {
      rotate: [0, -10, 10, -10, 0],
      scale: [1, 1.1, 1.1, 1.1, 1],
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      custom={custom}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: isMobile ? "-30px" : "-100px" }}
      className="w-full"
    >
      <GlowingCard
        color={getGlowColor()}
        isDarkMode={isDarkMode}
        className="rounded-xl h-full"
        borderRadius="12px"
      >
        <div className={`relative h-full ${isMobile ? "p-4" : "p-8"}`}>
          <div className="relative z-10 h-full flex flex-col">
            {/* Header */}
            <div
              className={`flex items-start justify-between mb-3 ${
                isRight ? "flex-row-reverse" : ""
              }`}
            >
              {/* Icon with gradient background */}
              <motion.div
                className={`
                  ${isMobile ? "p-2" : "p-4"} 
                  rounded-lg
                  backdrop-blur-md 
                  bg-icon-bg dark:bg-icon-darkBg
                  border border-slate-400/15 dark:border-slate-50/10 
                  shadow-md relative overflow-hidden
                `}
                variants={iconVariants}
                whileHover="hover"
              >
                {/* Gradient background for icon */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `linear-gradient(45deg, ${colors.from}, ${colors.to})`,
                  }}
                />
                <Icon
                  className={`${
                    isMobile ? "text-base" : "text-2xl"
                  } relative z-10`}
                  style={{
                    color: colors.from,
                  }}
                />
              </motion.div>

              {/* Year */}
              <span
                className={`text-para2 select-none dark:text-darkPara3 font-roboto font-medium ${
                  isMobile ? "text-xs" : "text-base"
                } font-semibold rounded-full  ${isRight ? "mr-1" : "ml-1"}`}
              >
                {item.year}
              </span>
            </div>

            {/* Degree */}
            <h3
              className={`font-bold text-h1 select-none dark:text-Head1dark font-roboto  ${
                isMobile ? "text-lg mb-1" : "text-2xl mb-2"
              }`}
            >
              {item.degree}
            </h3>

            {/* Institution */}
            <p
              className={`font-medium text-h2 dark:text-Head2dark font-open-sans   ${
                isMobile ? "text-xs mb-2 leading-tight" : "mb-3"
              }`}
            >
              {item.institution}
            </p>

            {/* Description */}
            <p
              className={`text-h3 select-none dark:text-Head3dark font-open-sans leading-relaxed ${
                isMobile ? "text-xs leading-snug" : "text-sm"
              } grow`}
            >
              {item.description}
            </p>
          </div>
        </div>
      </GlowingCard>
    </motion.div>
  );
};

export default TimelineCard;
