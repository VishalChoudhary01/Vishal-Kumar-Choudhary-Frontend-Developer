// AboutMe.jsx - Updated
"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import useDarkMode from "@/app/hooks/useDarkMode";
import { Heading } from "../../atoms/typography";
import GlowingCard from "@/app/components/molecules/cards/GlowingCard";
import IntroductionText from "./IntroductionText";
import FeatureCardsGrid from "./FeatureCardsGrid";
import ActionButtons from "./ActionButtons";
import BackgroundDecoration from "./BackgroundDecoration";
import { getCachedRepoCount } from "@/app/lib/services/githubService";

const AboutMe = () => {
  const { isDarkMode } = useDarkMode();
  const [repoCount, setRepoCount] = useState(null);

  useEffect(() => {
    const fetchRepoCount = async () => {
      const count = await getCachedRepoCount();
      setRepoCount(count);
    };

    fetchRepoCount();
  }, []);

  return (
    <section className="min-h-[90vh] flex items-center justify-center mt-[200px] md:mt-[400px] py-8 md:py-12 px-1.5 sm:px-8">
      <div className="w-full md:max-w-6xl mx-auto relative z-10">
        <GlowingCard
          color={
            isDarkMode
              ? "var(--color-dark-btn-modern-from)"
              : "var(--color-btn-modern-from)"
          }
          className="p-4 sm:p-5 md:rounded-[28px] rounded-xl md:p-6 lg:p-8 relative overflow-hidden"
          borderRadius="20px "
        >
          <BackgroundDecoration />

          <div className="relative z-20">
            <div className="mb-4 sm:mb-6 md:mb-8">
              <Heading heading="About Me" align="center" />
            </div>

            <IntroductionText />
            <FeatureCardsGrid repoCount={repoCount} isDarkMode={isDarkMode} />
            <ActionButtons isDarkMode={isDarkMode} />
          </div>
        </GlowingCard>
      </div>
    </section>
  );
};

export default AboutMe;
