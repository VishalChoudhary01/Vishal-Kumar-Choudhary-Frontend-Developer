"use client";
import React from "react";
import { motion } from "motion/react";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";
import TechSkillItem from "./TechSkillItem";
import { HeadingTwo } from "@/app/components/atoms/typography/index";

const TechCategoryCard = ({
  category,
  index,
  hoveredSkill,
  setHoveredSkill,
  isDarkMode,
  isMobile,
}) => {
  const handleHover = (skill) => {
    if (!isMobile) {
      setHoveredSkill({
        skill,
        categoryIndex: index,
        gradientColor: category.gradientColor,
        darkGradientColor: category.darkGradientColor,
        colorIndex: category.colorIndex,
      });
    }
  };

  const handleLeave = () => {
    if (!isMobile) {
      setHoveredSkill(null);
    }
  };

  // Get the appropriate color based on mode
  const getIconColor = () => {
    return isDarkMode ? category.darkGradientColor : category.gradientColor;
  };

  const iconColor = getIconColor();

  return (
    <GlowingCard
      color={iconColor}
      className="rounded-xl md:rounded-2xl h-full w-full mx-auto max-w-[380px] min-h-[400px]   sm:max-w-none sm:w-full"
      isDarkMode={isDarkMode}
      glowIntensity={0.4}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative h-full md:w-[350px] w-[280px]   flex flex-col"
      >
        <div className="relative z-10 p-4 md:p-6 flex flex-col items-center text-center space-y-4 md:space-y-6 h-full font-poppins">
          {/* Icon Container */}
          <motion.div
            className="p-2 md:p-4 rounded-lg md:rounded-xl bg-icon-bg dark:bg-icon-darkBg w-12 h-12 md:w-14 md:h-14 flex items-center justify-center group-hover:bg-opacity-20 transition-all duration-300"
            whileHover={
              !isMobile ? { rotate: [0, -3, 3, -3, 0], scale: 1.05 } : {}
            }
            transition={{ duration: 0.4 }}
            style={{
              backgroundColor: isDarkMode
                ? `${category.darkGradientColor}15`
                : `${category.gradientColor}10`,
            }}
          >
            <motion.div
              className={`lg:text-3xl  text-2xl    transition-colors duration-300`}
              style={{
                color: iconColor,
              }}
              whileHover={!isMobile ? { scale: 1.1 } : {}}
            >
              {category.icon}
            </motion.div>
          </motion.div>

          {/* Title */}
          <HeadingTwo className=" mb-6 md:text-lg lg:text-[1.2rem] text-[1.15rem]   select-none font-roboto  font-bold text-h2 dark:text-Head2dark leading-tight transition-colors duration-300 tracking-wider">
            {category.title}
          </HeadingTwo>

          {/* Skills List */}
          <ul className="space-y-1 md:space-y-2 text-para2 dark:text-darkPara2  w-full flex-1">
            {category.skills.map((skill, skillIndex) => {
              const isHovered =
                hoveredSkill?.skill === skill &&
                hoveredSkill?.categoryIndex === index;
              return (
                <TechSkillItem
                  key={skillIndex}
                  skill={skill}
                  isHovered={isHovered}
                  onHover={handleHover}
                  onLeave={handleLeave}
                  isDarkMode={isDarkMode}
                  isMobile={isMobile}
                  category={category}
                  gradientColor={iconColor}
                />
              );
            })}
          </ul>
        </div>
      </motion.div>
    </GlowingCard>
  );
};

export default TechCategoryCard;
