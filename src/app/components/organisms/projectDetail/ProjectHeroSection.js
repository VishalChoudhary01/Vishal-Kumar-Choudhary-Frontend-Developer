"use client";
import { motion } from "motion/react";
import { IoSparkles, IoCodeSlash } from "react-icons/io5";
import { FaGithub } from "react-icons/fa";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard.js";
import { techIcons } from "../../../lib/utils/iconMappings.js";
import DoubleShineButton from "../../atoms/button/DoubleShineButton.js";
import { FaFigma } from "react-icons/fa6";
import { IoRocketOutline, IoChevronDown } from "react-icons/io5";
import {MinimalDigitCounter} from "@/app/components/atoms/animation/index.js";
import ProjectHeader from "../../atoms/typography/Heading/ProjectHeader.js";

const ProjectHero = ({ project, isDarkMode, heroOpacity, heroScale }) => {
  return (
    <motion.section
      className="relative min-h-[100svh]  select-none  flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden"
      style={{
        opacity: heroOpacity,
        scale: heroScale,
      }}
    >
      <div className="flex-1 flex items-center justify-center w-full">
        <motion.div className="text-center max-w-6xl mx-auto relative z-10">
          {/* Project Badge */}
          <motion.div
            className="inline-flex items-center gap-2 text-neutral-600/80 dark:text-neutral-100/80 px-4 py-2 rounded-full text-sm mb-8 bg-[rgba(255,255,255,0.4)] dark:bg-[rgba(17,24,39,0.4)] backdrop-blur-xl border dark:border-[rgba(59,130,246,0.3)] border-[rgba(59,130,246,0.3)]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <IoSparkles />
            <span className="font-medium font-roboto flex items-center gap-x-2 lg:text-desktopPara3 md:text-tabletPara1 text-[0.7rem]">
              {project.projectType} <span className="text-[0.4rem] md:text-[0.8rem] animate-pulse ">●</span> {" "}
              <MinimalDigitCounter duration={2500} value={project.year} />
            </span>
          </motion.div>

          {/* Project Title */}

          <ProjectHeader title={project.name} />

          {/* Project Description */}
          <motion.p
            className={`lg:text-deskHead1 md:text-tabHead1 font-open-sans text-mobHead1 md:mb-10 mb-6 max-w-3xl mx-auto leading-relaxed dark:text-darkPara3 text-para3 `}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          >
            {project.description}
          </motion.p>

          {/* Technology Stack */}
          <motion.div
            className="flex flex-wrap md:gap-3 gap-2 justify-center md:mb-12 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {project.technologies?.slice(0, 8).map((tech, index) => {
              const TechIcon = techIcons[tech] || IoCodeSlash;
              return (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: index * 0.05,
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <GlowingCard
                    className="lg:px-5 md:px-4 md:py-2.5 px-2 py-2 border border-gray-300 dark:border-neutral-400/20  shadow"
                    color={isDarkMode ? "#ff9f1a" : "#00bbf9"}
                    borderRadius="10px"
                  >
                    <div className="flex items-center md:gap-x-2 gap-x-1 lg:text-deskPara1 md:text-tabPara1 text-mobPara1  md:text-tabPara1 dark:text-Head2dark text-h3">
                      <TechIcon />
                      <span className="font-medium font-roboto">{tech}</span>
                    </div>
                  </GlowingCard>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Call to Action Buttons */}
          <motion.div
            className="flex md:gap-10 gap-3.5 justify-center font-roboto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            <motion.a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <DoubleShineButton
                leftIcon={<IoRocketOutline />}
                buttonText="Live Demo"
                buttonStyle="md:w-24 md:h-7 w-20 h-5.5 text-nowrap justify-center text-mobPara2 md:text-tabPara2 lg:text-deskPara2"
              />
            </motion.a>

            <motion.a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="md:block hidden"
            >
              <DoubleShineButton
                leftIconStyle=""
                leftIcon={<FaGithub />}
                buttonText="Source Code"
                buttonStyle="md:w-24 md:h-7 w-16 text-nowrap justify-center h-5.5 text-mobPara2 md:text-tabPara2 lg:text-deskPara2"
              />
            </motion.a>

            {project.figmaUrl && (
              <motion.a
                href={project.figmaUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <DoubleShineButton
                  leftIconStyle=""
                  leftIcon={<FaFigma />}
                  buttonText="Figma Design"
                  buttonStyle="md:w-24 md:h-7 w-16 text-nowrap justify-center h-5.5 text-mobPara2 md:text-tabPara2 lg:text-deskPara2"
                />
              </motion.a>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Fixed at bottom of viewport */}
      <motion.div
        className="absolute md:bottom-2 bottom-0  w-full flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
          className="flex flex-col items-center gap-2 cursor-pointer group"
          onClick={() => {
            // Scroll to next section
            const nextSection = document.querySelector(".space-y-16");
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <span className="text-xs text-neutral-700 dark:text-neutral-200/80  font-open-sans font-medium tracking-wider group-hover:text-blue-400 transition-colors">
            EXPLORE
          </span>
          <div className="relative h-12 flex items-center justify-center">
            <div className="w-px h-full bg-linear-to-b dark:from-neutral-50/90  dark:via-neutral-400/50 dark:to-transparent from-neutral-700/30 via-neutral-800/50 to-transparent" />
            <motion.div
              animate={{
                y: [0, 20, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              }}
              className="absolute top-1 left-1/2 transform -translate-x-1/2"
            >
              <IoChevronDown className="w-5 h-5 text-neutral-400 group-hover:text-blue-300 transition-colors" />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default ProjectHero;
