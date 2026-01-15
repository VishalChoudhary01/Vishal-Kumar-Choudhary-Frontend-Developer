// IntroductionText.jsx - Updated
import React from "react";
import { motion } from "motion/react";

const IntroductionText = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-10 px-2 sm:px-0"
    >
      <p className="text-sm sm:text-base md:text-lg font-open-sans font-normal leading-relaxed sm:leading-loose text-para1 dark:text-darkPara1">
        I&apos;m{" "}
        <strong className="font-semibold sm:font-bold text-accent dark:text-darkAccent">
          Vishal Kumar Choudhary
        </strong>
        , a frontend developer passionate about crafting stunning digital
        experiences that blend design and functionality. I transform creative
        ideas into clean, scalable code with sleek animations and immersive UIs.
      </p>
    </motion.div>
  );
};

export default IntroductionText;
