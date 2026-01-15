"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, scale } from "motion/react";

const menu = [
  "About Me",
  "Education",
  "Work Experience",
  "Projects",
  "Skills",
  "Contact",
];

const slideVariants = {
  initial: { y: -80, opacity: 0, scale: 0.6 }, // Enter from top
  animate: { y: 0, opacity: 1, scale: 1 }, // Settle in center
  exit: { y: 50, opacity: 0, scale: 0.6 }, // Exit to top again
};

const CardSlideUpLoop = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % menu.length);
    }, 2000); // change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative md:w-[168px] w-[142px] h-14 overflow-hidden ">
        <AnimatePresence mode="wait">
          <motion.div
            key={menu[index]}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute w-full h-full flex items-center font-medium text-nowrap [letter-spacing:0.12em]  tracking-wider font-open-sans text-[rgba(0,0,0,0.6)] dark:text-[rgba(255,255,255,0.6)]"
          >
            {menu[index]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CardSlideUpLoop;
