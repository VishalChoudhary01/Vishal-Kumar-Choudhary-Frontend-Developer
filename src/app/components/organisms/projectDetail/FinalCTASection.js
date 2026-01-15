"use client";
import { FaRocket, FaGithub, FaArrowRight } from "react-icons/fa";
import { motion } from "motion/react";
import GlowingCard from "../../molecules/cards/GlowingCard";
import useDarkMode from "@/app/hooks/useDarkMode";
import ShineHoverCurtainButton from "../../atoms/button/ShineHoverCurtainButton/ShineHoverCurtainButton";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

export default function FinalCTASection({ project }) {
  const { isDarkMode } = useDarkMode();

  // Get accent colors from CSS variables
  const primaryAccent = isDarkMode
    ? "var(--darkgrad-primary)"
    : "var(--grad-primary)";
  const secondaryAccent = isDarkMode
    ? "var(--darkgrad-secondary)"
    : "var(--grad-secondary)";

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-4xl mx-auto px-4 sm:px-6"
    >
      <motion.div variants={fadeInUp}>
        <GlowingCard
          color={primaryAccent}
          className="w-full border border-gray-400/15 dark:border-neutral-400/20 shadow-lg"
          borderRadius="16px"
          isDarkMode={isDarkMode}
        >
          <div className="relative z-20 text-center p-6 sm:p-8 lg:p-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 font-lora text-h2 dark:text-Head2dark">
              Ready to Explore?
            </h2>
            <p className="mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base font-open-sans lg:text-lg text-para2 dark:text-darkPara2">
              Experience the project live or dive into the source code to see
              the implementation details.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-4 justify-center">

              {project.liveUrl &&(
                <ShineHoverCurtainButton
                variant="default"
              leftIcon={<FaRocket className="text-sm sm:text-base" />}    
              onClick={() => window.open(project.liveUrl, '_blank')}
              className="flex md:w-[40%] items-center transition-all "
              rightIcon={<FaArrowRight className="text-sm sm:text-base font-roboto group-hover:translate-x-1 transition-all group-hover:translate-y-0.5   duration-300" />}
              >
              <span className="text-sm sm:text-base">View Live Project</span>

              </ShineHoverCurtainButton>
              )}


              {project.githubUrl &&(
                <ShineHoverCurtainButton
                variant="outline"
              leftIcon={<FaGithub className="text-sm sm:text-base" />}
              onClick={() => window.open(project.githubUrl, '_blank')}
              className="shadow-lg md:w-[40%]  backdrop-blur-sm border border-gray-400/80 font-roboto dark:border-neutral-100/40     ">
              <span className="text-sm sm:text-base">Source Code</span>
              </ShineHoverCurtainButton>
              )}
               
            </div>
          </div>
        </GlowingCard>
      </motion.div>
    </motion.section>
  );
}
