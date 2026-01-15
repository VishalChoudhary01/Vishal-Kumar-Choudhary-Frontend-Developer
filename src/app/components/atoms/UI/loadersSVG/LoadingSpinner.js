"use client";

import { motion } from "motion/react";

const LoadingSpinner = ({
  size = 24,
  stroke = 3,
}) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        ease: "linear",
        duration: 1.6,
      }}
      className="text-neutral-800 dark:text-neutral-200"
    >
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        initial={{
          strokeDasharray: "1 200",
          strokeDashoffset: 0,
          scale: 1,
          opacity: 0.8,
        }}
        animate={{
          strokeDasharray: ["1 200", "90 200", "1 200"],
          strokeDashoffset: [0, -35, -125],
          scale: [1, 1.08, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.4,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />
    </motion.svg>
  );
};

export default LoadingSpinner;
