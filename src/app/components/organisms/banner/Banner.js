"use client";
import React, { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import "./Banner.css";
import useDarkMode from "@/app/hooks/useDarkMode";
import CardSlideUpLoop from "../banner/CardSlideUpLoop";
import AboutMe from "../aboutMe/aboutMe";
import { CgScrollV } from "react-icons/cg";
import NameHeading from "../../atoms/typography/Heading/NameHeading/NameHeading";

const Banner = () => {
  const ref = useRef(null);
  const aboutRef = useRef(null);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const nameScale = useTransform(scrollYProgress, [0, 0.6], [1, 4]);
  const nameOpacity = useTransform(scrollYProgress, [0.45, 0.6], [1, 0]);
  const aboutOpacity = useTransform(scrollYProgress, [0.78, 0.85], [0, 1]);
  const aboutY = useTransform(scrollYProgress, [0.78, 0.85], [100, 0]);
  const indicatorOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <motion.section 
    id="home"
      ref={ref}
      className="md:h-[435vh] h-[350vh] w-full select-none relative transition-colors text-center duration-1000"
    >
      {/* Name Center */}
      <motion.div
        style={{ scale: nameScale, opacity: nameOpacity }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2  -translate-y-1/2 z-30 pointer-events-none md:whitespace-nowrap w-full px-4"
      >
        <NameHeading
          title={"Vishal Kumar Choudhary"}
          subtitle={"Frontend Developer"}
          shimmerEffect={true}
          isDarkMode={isDarkMode}
        />
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity: indicatorOpacity }}
        className="fixed md:top-[85vh] top-[78vh]  left-1/2 transform -translate-x-1/2 z-40 w-full max-w-sm mx-auto px-4"
      >
        <div className="flex flex-col items-center justify-center gap-x-4 w-full ">
          {/* Text with sliding menu - Horizontally centered */}
          <div className="flex items-center  relative left-9 justify-center gap-x-2 text-[rgba(0,0,0,0.6)] dark:text-[rgba(255,255,255,0.6)] font-open-sans xl:text-[1.1rem]  lg:text-[1.15rem] md:text-[1.1rem] text-sm w-full text-center">
            <span className=" text-nowrap ">Scroll Down</span>
            <span className=" italic normal-case">for</span>
            <div className="flex justify-center min-w-[140px]">
              <CardSlideUpLoop />
            </div>
          </div>

          {/* Desktop: Mouse Animation */}
          <div className="hidden md:block">
            <motion.div
              className="flex flex-col items-center"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <motion.div
                className={`w-6 h-10 border-2 rounded-full flex justify-center ${
                  isDarkMode ? "border-gray-300/50 " : "border-gray-600"
                }`}
              >
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={`w-1 h-3 rounded-full mt-2 ${
                    isDarkMode ? "bg-linear-to-b from-gray-400/60 to-gray-700/50" : "bg-gray-500"
                  }`}
                />
              </motion.div>
            </motion.div>
          </div>

          <div className="md:hidden block">
            <motion.div
              className="flex flex-col items-center"
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className={`text-2xl ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <CgScrollV />
              </motion.div>
              <motion.p
                className={`text-xs mt-1 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
                initial={{ opacity: 0.7 }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                scroll
              </motion.p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* About Section */}
      <motion.div
        id="about"
        ref={aboutRef}
        style={{ opacity: aboutOpacity, y: aboutY }}
        className="absolute md:top-[350vh] top-[290vh]  left-0 w-full h-screen flex justify-center items-center md:px-3 px-2.5 z-50"
      >
        <AboutMe />
      </motion.div>
    </motion.section>
  );
};

export default Banner;
