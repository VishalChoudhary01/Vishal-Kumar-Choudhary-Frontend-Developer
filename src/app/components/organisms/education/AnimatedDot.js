"use client";

import { motion } from "motion/react";
import useDarkMode from "@/app/hooks/useDarkMode";

const AnimatedDot = ({ index, position }) => {
  const { isDarkMode } = useDarkMode();

  // Use existing gradient variables
  const getDotColors = (idx) => {
    const gradients = isDarkMode 
      ? [
          { from: "var(--darkgrad-primary)", to: "var(--darkgrad-secondary)" },
          { from: "var(--darkgrad-secondary)", to: "var(--darkgrad-tertiary)" },
          { from: "var(--darkgrad-tertiary)", to: "var(--darkgrad-quaternary)" },
          { from: "var(--darkgrad-quaternary)", to: "var(--darkgrad-primary)" },
        ]
      : [
          { from: "var(--grad-primary)", to: "var(--grad-secondary)" },
          { from: "var(--grad-secondary)", to: "var(--grad-tertiary)" },
          { from: "var(--grad-tertiary)", to: "var(--grad-quaternary)" },
          { from: "var(--grad-quaternary)", to: "var(--grad-primary)" },
        ];
    
    return gradients[idx % gradients.length];
  };

  const colors = getDotColors(index);
  const gradient = `linear-gradient(to right, ${colors.from}, ${colors.to})`;

  return (
    <motion.div
      className="absolute top-6 z-20"
      style={{
        [position]: -8,
      }}
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay: 0.2,
        ease: "easeOut"
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* Main Dot */}
        <div
          className="w-4 h-4 rounded-full shadow-md relative z-10"
          style={{
            background: gradient,
          }}
        />

        {/* Glow Effect */}
        <motion.div
          className="absolute w-6 h-6 rounded-full opacity-30 blur-sm"
          style={{
            background: gradient,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Pulse Ring */}
        <motion.div
          className="absolute w-8 h-8 rounded-full opacity-20"
          style={{
            background: gradient,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </div>
    </motion.div>
  );
};

export default AnimatedDot;