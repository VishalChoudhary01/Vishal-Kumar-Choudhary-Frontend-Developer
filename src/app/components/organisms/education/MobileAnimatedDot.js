"use client";
import { motion, useTransform } from "motion/react";
import useDarkMode from "@/app/hooks/useDarkMode";

const MobileAnimatedDot = ({ index, scrollProgress, totalItems }) => {
  const { isDarkMode } = useDarkMode();

  // Calculate when this dot should appear based on scroll progress
  const startProgress = index / totalItems;
  const endProgress = (index + 0.3) / totalItems;

  // Animate dot appearance based on scroll
  const opacity = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    [0, 1]
  );

  const scale = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    [0, 1]
  );

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
      className="absolute left-6 top-6 z-20 transform -translate-x-1/2"
      style={{ opacity, scale }}
    >
      <div className="relative flex items-center justify-center">
        {/* Main Dot */}
        <div
          className="w-3 h-3 rounded-full shadow-md relative z-10"
          style={{ background: gradient }}
        />

        {/* Glow */}
        <motion.div
          className="absolute w-4 h-4 rounded-full opacity-30 blur-sm"
          style={{ background: gradient }}
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

        {/* Pulse */}
        <motion.div
          className="absolute w-5 h-5 rounded-full opacity-20"
          style={{ background: gradient }}
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

export default MobileAnimatedDot;
