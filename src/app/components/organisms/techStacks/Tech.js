"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import TechCategoryCard from "./TechCategoryCard";
import { categories } from "@/app/lib/data/index";

const Tech = () => {
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    const checkDarkMode = () =>
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkDarkMode();
    checkMobile();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener('resize', checkMobile);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Get the gradient color for the hovered skill
  const getHoveredSkillColor = () => {
    if (!hoveredSkill) return null;
    return isDarkMode 
      ? hoveredSkill.darkGradientColor 
      : hoveredSkill.gradientColor;
  };

  const skillColor = getHoveredSkillColor();

  if (!isMounted) {
    return (
      <section className="min-h-screen py-8 md:py-20 px-4 md:px-6 overflow-hidden bg-contextBG dark:bg-contextDarkBG">
        <div className="max-w-7xl mx-auto relative">
          <div className="flex justify-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 lg:gap-8 relative z-10 max-w-5xl">
              {categories.map((category, index) => (
                <div key={index} className="rounded-xl md:rounded-2xl h-full w-full mx-auto max-w-[280px] sm:max-w-none sm:w-full bg-white dark:bg-gray-800 p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-3 md:p-4  rounded-lg md:rounded-xl bg-gray-100 dark:bg-gray-700 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
                      {category.icon}
                    </div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200">
                      {category.title}
                    </h3>
                    <ul className="space-y-2 text-gray-600 dark:text-gray-400 w-full">
                      {category.skills.map((skill, skillIndex) => (
                        <li key={skillIndex} className="text-xs md:text-sm text-left">
                          {skill}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-8 md:py-20 px-4 md:px-6 overflow-hidden bg-contextBG dark:bg-contextDarkBG">
      <div className="max-w-7xl mx-auto relative">

        {/* Enhanced Blurred Background with Color Tint */}
        <AnimatePresence>
          {hoveredSkill && !isMobile && skillColor && (
            <motion.div
              key="blur-backdrop"
              className="fixed inset-0 z-40 pointer-events-none"
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(3px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                background: isDarkMode
                  ? `linear-gradient(135deg, ${skillColor}05 0%, rgba(0, 0, 0, 0.3) 100%)`
                  : `linear-gradient(135deg, ${skillColor}08 0%, rgba(255, 255, 255, 0.3) 100%)`,
              }}
            />
          )}
        </AnimatePresence>

        {/* Enhanced Floating 3D Text */}
        <AnimatePresence>
          {hoveredSkill && !isMobile && skillColor && (
            <motion.div
              key="floating-text"
              className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="absolute text-center"
                initial={{
                  scale: 0.5,
                  opacity: 0,
                  x: -150,
                  y: -80,
                  rotateY: -45,
                }}
                animate={{
                  scale: 1.2,
                  opacity: 1,
                  x: 200,
                  y: -50,
                  rotateY: 0,
                }}
                exit={{
                  scale: 0.5,
                  opacity: 0,
                  x: -150,
                  y: -80,
                  rotateY: 45,
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  duration: 0.5,
                }}
              >
                <motion.span
                  className="text-4xl md:text-6xl font-extrabold tracking-wider wrap-break-word whitespace-nowrap block font-michroma"
                  style={{
                    color: skillColor,
                    textShadow: `
                      0 0 20px ${skillColor}80,
                      0 0 40px ${skillColor}60,
                      0 0 60px ${skillColor}40,
                      0 0 80px ${skillColor}20,
                      0 4px 8px rgba(0, 0, 0, 0.3)
                    `,
                  }}
                  animate={{
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {hoveredSkill.skill}
                </motion.span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skills Grid - Centered with 3 columns */}
        <div className="flex justify-center  ">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6 lg:gap-8 relative z-10 max-w-5xl">
            {categories.map((category, index) => (
              <TechCategoryCard
                key={index}
                category={category}
                index={index}
                hoveredSkill={hoveredSkill}
                setHoveredSkill={setHoveredSkill}
                isDarkMode={isDarkMode}
                isMobile={isMobile}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tech;