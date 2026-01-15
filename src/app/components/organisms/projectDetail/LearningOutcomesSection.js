"use client";
import { motion } from "motion/react";
import { FaGraduationCap, FaLightbulb, FaCode, FaUsers } from "react-icons/fa";
import Heading from "../../atoms/typography/Heading/Heading";
import GlowingCard from "../../molecules/cards/GlowingCard";
import useDarkMode from "@/app/hooks/useDarkMode";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const glassGradbackgroundBadge = `border font-roboto border-grad-primary/5  border-darkgrad-primary/25     capitalize  bg-linear-to-r text-grad-primary dark:text-darkgrad-primary from-grad-primary/10 to-grad-secondary/5 dark:from-darkgrad-primary/10 dark:to-darkgrad-secondary/5 md:text-xs sm:text-sm text-[0.8rem]`;


export default function LearningOutcomesSection({ project }) {
  const { isDarkMode } = useDarkMode();

  const hasLearningOutcomes =
    project.learningOutcomes && project.learningOutcomes.length > 0;
  const hasFutureEnhancements =
    project.futureEnhancements && project.futureEnhancements.length > 0;

  // If neither exists, return null
  if (!hasLearningOutcomes && !hasFutureEnhancements) {
    return null;
  }

  const primaryAccent = isDarkMode
    ? "var(--darkgrad-primary)"
    : "var(--grad-primary)";
  const secondaryAccent = isDarkMode
    ? "var(--darkgrad-secondary)"
    : "var(--grad-secondary)";

  const learningIcons = [FaCode, FaUsers, FaGraduationCap, FaLightbulb];

  // Check if we should use centered layout (only one section)
  const useCenteredLayout = !(hasLearningOutcomes && hasFutureEnhancements);

  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-50px" }}
      className="max-w-6xl mx-auto px-4 sm:px-6"
    >
      <Heading
        heading={
          hasLearningOutcomes && hasFutureEnhancements
            ? "Key Learnings & Future Plans"
            : hasLearningOutcomes
            ? "Key Learnings"
            : "Future Plans"
        }
        subheading={
          hasLearningOutcomes && hasFutureEnhancements
            ? "Insights gained during development and potential improvements"
            : hasLearningOutcomes
            ? "Insights gained during development"
            : "Potential improvements and future enhancements"
        }
        align="center"
      />

      {/* Conditional layout */}
      {useCenteredLayout ? (
        // Centered single column layout
        <div className="flex justify-center mt-6 sm:mt-8">
          <motion.div
            variants={fadeInUp}
            className={`w-full ${
              hasLearningOutcomes ? "max-w-2xl" : "max-w-2xl"
            }`}
          >
            {hasLearningOutcomes && (
              <GlowingCard
                color={primaryAccent}
                className="h-full border border-gray-400/15 dark:border-neutral-400/20 shadow"
              >
                <div className="h-full p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FaGraduationCap
                    className="text-lg sm:text-xl text-grad-primary dark:text-darkgrad-primary"
                  />
                    <h3 className="md:text-lg text-[0.95rem]  sm:text-xl font-semibold text-h3 dark:text-Head3dark font-open-sans">
                      Learning Outcomes
                    </h3>
                  </div>

                  <motion.div
                    className="space-y-3 sm:space-y-4"
                    variants={staggerContainer}
                  >
                    {project.learningOutcomes.map((outcome, index) => {
                      const Icon = learningIcons[index % learningIcons.length];
                      return (
                        <motion.div
                          key={index}
                          variants={fadeInUp}
                          className="flex items-start gap-3 p-3 rounded-lg bg-lightBg dark:bg-darkBg group hover:scale-[1.02] transition-transform"
                        >
                          <div className="md:p-2 p-1.5 rounded-lg shrink-0">
                            <Icon
                              className="text-sm text-grad-primary dark:text-darkgrad-primary"
                            />
                          </div>
                          <div>
                            <p className="md:text-sm text-[0.8rem] text-para2 dark:text-darkPara2 leading-relaxed">
                              {outcome}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </div>
              </GlowingCard>
            )}

            {hasFutureEnhancements && (
              <GlowingCard
                color={secondaryAccent}
                className="h-full border border-gray-400/15 dark:border-neutral-400/20 shadow"
              >
                <div className="h-full p-4 sm:p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FaLightbulb
                    className="text-lg sm:text-xl text-grad-primary dark:text-darkgrad-primary"
                  />
                    <h3 className="text-lg sm:text-xl font-semibold text-h3 dark:text-Head3dark">
                      Future Enhancements
                    </h3>
                  </div>

                  <motion.div
                    className="space-y-3 sm:space-y-4"
                    variants={staggerContainer}
                  >
                    {project.futureEnhancements.map((enhancement, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        className="flex items-start gap-3 md:p-3 p-2 rounded-lg border border-grad-secondary/30 dark:border-darkgrad-secondary/5 group hover:border-opacity-50 transition-all"
                      >
                        <div className="shrink-0">
                          <div
                            className="w-6 h-6 rounded-full text-grad-primary  dark:text-darkgrad-primary dark:bg-darkgrad-secondary/10 bg-grad-secondary/5 flex items-center justify-center text-xs font-bold"
                            
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <p className="md:text-sm text-[0.8rem] text-para2 dark:text-darkPara2 leading-relaxed">
                            {enhancement}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </GlowingCard>
            )}
          </motion.div>
        </div>
      ) : (
        // Two column layout (when both sections exist)
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {/* Learning Outcomes */}
          <motion.div variants={fadeInUp}>
            <GlowingCard
              color={primaryAccent}
              className="h-full border border-gray-400/15 dark:border-neutral-400/20 shadow"
            >
              <div className="h-full p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaGraduationCap
                    className="text-lg sm:text-xl text-grad-primary dark:text-darkgrad-primary"
                  />
                  <h3 className="md:text-lg text-[0.95rem]  sm:text-xl font-open-sans font-semibold text-h3 dark:text-Head3dark">
                    Learning Outcomes
                  </h3>
                </div>

                <motion.div
                  className="space-y-3 sm:space-y-4"
                  variants={staggerContainer}
                >
                  {project.learningOutcomes.map((outcome, index) => {
                    const Icon = learningIcons[index % learningIcons.length];
                    return (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        className="flex items-start gap-3 p-3  rounded-lg bg-neutral-200/30 dark:bg-neutral-950/15 border dark:border-neutral-800/20 border-neutral-300/20    group hover:scale-[1.02] transition-transform"
                      >
                        <div className="md:p-2 p-1.5  rounded-lg shrink-0">
                          <Icon
                            className="md:text-sm text-grad-primary dark:text-darkgrad-primary"
                          />
                        </div>
                        <div>
                          <p className="md:text-sm text-[0.8rem] text-para2 dark:text-darkPara2 leading-relaxed font-roboto">
                            {outcome}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </GlowingCard>
          </motion.div>

          {/* Future Enhancements */}
          <motion.div variants={fadeInUp}>
            <GlowingCard
              color={secondaryAccent}
              className="h-full border border-gray-400/15 dark:border-neutral-400/20 shadow"
            >
              <div className="h-full p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FaLightbulb
                    className="text-lg sm:text-xl text-grad-primary dark:text-darkgrad-primary"
                  />
                  <h3 className="md:text-lg text-[0.95rem] sm:text-xl font-semibold text-h3 dark:text-Head3dark font-open-sans">
                    Future Enhancements
                  </h3>
                </div>

                <motion.div
                  className="space-y-3 sm:space-y-4"
                  variants={staggerContainer}
                >
                  {project.futureEnhancements.map((enhancement, index) => (
                    <motion.div
                      key={index}
                      variants={fadeInUp}
                      className="flex items-start gap-3 md:p-3 p-2  rounded-lg border border-neutral-30 border-grad-primary/20  dark:border-darkgrad-primary/20    group hover:border-opacity-50 transition-all"
                    >
                      <div className="shrink-0">
                        <div
                          className="w-6 h-6 rounded-full text-grad-primary  dark:text-darkgrad-primary dark:bg-darkgrad-secondary/10 bg-grad-secondary/5      flex items-center justify-center text-xs font-bold"
                        >
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="md:text-sm text-[0.8rem] text-para2 dark:text-darkPara2 leading-relaxed font-roboto">
                          {enhancement}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </GlowingCard>
          </motion.div>
        </div>
      )}

      {/* Summary if both sections exist */}
      {hasLearningOutcomes && hasFutureEnhancements && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 sm:mt-12 text-center"
        >
          <div
           className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${glassGradbackgroundBadge}`}
          >
            <FaLightbulb className="text-sm text-grad-primary dark:text-darkgrad-primary"  />
            <span className="text-[0.78rem]  md:text-[0.9rem] flex  gap-x-1.5 text-para2 dark:text-darkPara2">
              <span className="font-medium text-para1 dark:text-darkPara1 ">
                {project.learningOutcomes.length}
              </span>
              <span className=" capitalize tracking-wider text-h3 dark:text-Head3dark  ">
              learnings 
              </span>
              <span>
              •
              </span>
              <span
               className="font-medium text-para1 dark:text-darkPara1 "
              >
                {project.futureEnhancements.length}
              </span>
              <span className=" capitalize tracking-wider text-h3 dark:text-Head3dark  ">
              future plans
              </span>
            </span>
          </div>
        </motion.div>
      )}
    </motion.section>
  );
}
