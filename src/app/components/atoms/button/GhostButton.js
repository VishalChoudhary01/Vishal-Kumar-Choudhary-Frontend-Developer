"use client";

import { motion } from "motion/react";

const GhostButton = ({
  buttonStyle,
  buttonText,
  leftIcon,
  rightIcon,
  leftStyle,
  rightStyle,
  onClick,
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 35, filter: "blur(120px)" ,scale:1.05}}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)",scale:1 }}
      transition={{ duration: 1.5 }} 

      onClick={onClick}
      className={` ${buttonStyle}`}
    >
      <span className="flex items-center md:gap-x-2 gap-x-1 ">
        {leftIcon && <span className={leftStyle}>{leftIcon}</span>}
        <span>{buttonText}</span>
        {rightIcon && <span className={rightStyle}>{rightIcon}</span>}
      </span>
    </motion.button>
  );
};

export default GhostButton;


