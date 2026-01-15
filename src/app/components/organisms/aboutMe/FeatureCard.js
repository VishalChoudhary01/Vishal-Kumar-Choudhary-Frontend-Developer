import React from "react";
import { motion } from "motion/react";
import { LuSparkles, LuTarget } from "react-icons/lu";
import { SiRefinedgithub } from "react-icons/si";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";
import { DigitSlideCounter } from "@/app/components/atoms/animation/index";

const FeatureCard = ({ type, isDarkMode, repoCount, delay }) => {
  const cardConfig = {
    passion: {
      color: isDarkMode ? "var(--color-btn-modern-to)" : "var(--color-accent)",
      icon: (
        <LuSparkles
          className={`w-4 h-4 sm:w-5 sm:h-5 ${
            isDarkMode ? "text-btn-modern-to" : "text-accent"
          }`}
        />
      ),
      title: "Passion",
      content:
        "Exploring new technologies to build innovative web experiences that captivate users and enhance digital interactions.",
    },
    goals: {
      color: isDarkMode
        ? "var(--color-dark-btn-modern-via)"
        : "var(--color-btn-modern-via)",
      icon: (
        <LuTarget className="w-4 h-4 sm:w-5 sm:h-5 text-btn-modern-via dark:text-dark-btn-modern-via" />
      ),
      title: "Future Goals",
      content:
        "Mastering <strong class='text-highlightText dark:text-darkHighlightText'>Three.js</strong>, <strong class='text-highlightText dark:text-darkHighlightText'>GSAP</strong>, and <strong class='text-highlightText dark:text-darkHighlightText'>Babylon.js</strong> to create dynamic, immersive web applications.",
    },
    github: {
      color: isDarkMode
        ? "var(--color-github-repo-count-dark)"
        : "var(--color-github-repo-count)",
      icon: (
        <SiRefinedgithub className="w-4 h-4 sm:w-5 sm:h-5 text-github-repo-count dark:text-github-repo-count-dark" />
      ),
      title: "GitHub",
      content: "Public repositories",
      showCounter: true,
    },
  };

  const config = cardConfig[type];

  return (
    <GlowingCard
      color={config.color}
      className="p-3 sm:p-4 md:p-5 h-full rounded-[18px]"
      borderRadius="14px"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay }}
        className="text-center"
      >
        <div
          className={`inline-flex p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${
            type === "github"
              ? "bg-github-repo-bg dark:bg-github-repo-bg-dark"
              : "bg-highlightBG dark:bg-darkHighlightBG"
          } mb-2 sm:mb-3`}
        >
          {config.icon}
        </div>

        <h3
          className={`text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2 font-roboto ${
            type === "passion"
              ? isDarkMode
                ? "text-btn-modern-to"
                : "text-accent"
              : type === "goals"
              ? "text-btn-modern-via dark:text-dark-btn-modern-via"
              : "text-github-repo-count dark:text-github-repo-count-dark"
          }`}
        >
          {config.title}
        </h3>

        {config.showCounter ? (
          <>
            <div className="text-lg sm:text-xl md:text-2xl   font-bold mb-1 text-github-repo-count dark:text-github-repo-count-dark">
              <DigitSlideCounter
                textColorClass="text-h1 dark:text-Head2dark"
                value={repoCount}
                duration={2000}
              />
            </div>
            <p className="text-xs sm:text-sm text-para3 dark:text-darkPara3">
              {config.content}
            </p>
          </>
        ) : (
          <p
            className="text-xs sm:text-sm leading-relaxed text-para2 dark:text-darkPara2 font-open-sans"
            dangerouslySetInnerHTML={{ __html: config.content }}
          />
        )}
      </motion.div>
    </GlowingCard>
  );
};

export default FeatureCard;
