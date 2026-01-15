"use client";
import { motion } from "motion/react";
import "./NameHeading.css";

export default function NameHeading({ 
  title, 
  subtitle,
  titleCase = "uppercase",
  isDarkMode = false,
  shimmerEffect = false
}) {
  const caseClasses = {
    uppercase: "uppercase",
    capitalize: "capitalize",
    "normal-case": "normal-case"
  };

  const titleClass = caseClasses[titleCase] || "uppercase";

  return (
    <div className={`text-center font-lora`}>
      <div className="relative inline-block"
      style={{
        contain: "layout paint",
        transform: "translateZ(0)"
        }}
      >

        {/* TEXT OUTLINE (always visible) */}
        <h1
          className={`absolute md:[word-spacing:1rem] [word-spacing:0.5rem] md:[letter-spacing:0.4rem] md:leading-normal leading-11  inset-0 lg:text-deskName  md:text-tabName text-mobName font-bold text-transparent [-webkit-text-stroke:1px_rgba(120,120,120,0.5)] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.35)] pointer-events-none ${titleClass}`}>
          {title}
        </h1>

        {/* Base light text */}
        <h1
          className={`md:[word-spacing:1rem] [word-spacing:0.5rem] md:[letter-spacing:0.4rem] md:leading-normal leading-11 lg:text-deskName md:text-tabName text-mobName font-bold bg-linear-to-t from-neutral-50/55 via-neutral-100/45 to-white/45 dark:from-neutral-950/55 dark:via-neutral-900/45 dark:to-neutral-black/45 bg-clip-text text-transparent ${titleClass}`}>
          {title}
        </h1>

        {/* Gradient filling overlay - using radGrad/darkRadGrad */}
        <motion.div
          initial={{ clipPath: "inset(100% 0 0 0)" }}
          whileInView={{ clipPath: "inset(0% 0 0 0)" }}
          viewport={{ once: true }} 
          transition={{ duration: 2.5, delay: 0.8, ease: "easeOut" }}  
          className={`absolute inset-0 pointer-events-none ${titleClass} ${
            isDarkMode ? 'darkRadGradNoPadding' : 'radGradNoPadding'
          }`}
        >
          <h1 className="md:[word-spacing:1rem] [word-spacing:0.5rem] md:[letter-spacing:0.4rem] md:leading-normal leading-11 lg:text-deskName  md:text-tabName text-mobName font-bold">
            {title}
          </h1>
        </motion.div>
      </div>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 20,filter: "blur(18px)" }}
          whileInView={{ opacity: 1, y: 0,filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className={`xl:text-7xl lg:text-6xl md:text-5xl text-2xl max-w-4xl mx-auto px-4 md:[word-spacing:1rem] [word-spacing:0.5rem] ${
            shimmerEffect 
              ? `relative ${isDarkMode ? "darktext-shimmer" : "text-shimmer"}      font-open-sans md:[letter-spacing:0.3rem] [letter-spacing:0.2rem]  font-medium   pb-2 md:mt-5 mt-3 whitespace-nowrap` 
              : "text-[rgba(0,0,0,0.6)] dark:text-[rgba(255,255,255,0.85)]"   
          }`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}