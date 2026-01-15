"use client";

import React from "react";
import useDarkMode from "@/app/hooks/useDarkMode";

const DoubleShineButton = ({buttonText,buttonStyle,leftIcon,leftIconStyle,rightIcon,rightIconStyle,buttonClick,buttonType="button"}) => {
  const { isDarkMode } = useDarkMode();

  return (
    <button type={buttonType} className={`relative group px-8 py-3 bg-neutral-800   rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] `} onClick={buttonClick}>
      <span className={`relative z-10 text-white flex items-center ${buttonStyle}`}>
        {leftIcon && <span className={`mr-2 ${leftIconStyle}`}>{leftIcon}</span>}
        <span>{buttonText}</span>
        {rightIcon && <span className={`ml-2 ${rightIconStyle}`}>{rightIcon}</span>}
      </span>

      {/* Enhanced shine border with proper sizing */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div 
          className={`absolute inset-[-50%] ${
            isDarkMode ? 'shine-double-dark' : 'shine-double-light'
          } animate-rotate-shine-slowest  opacity-80  blur-[2px] dark:blur-md`} 
        />
      </div>
      
      {/* Inner overlay - adjusted for better shine visibility */}
      <div className="absolute inset-0.5 bg-black dark:bg-zinc-950 hover:dark:bg-neutral-950 transition-all rounded-xl z-0" />
    </button>
  );
};

export default DoubleShineButton;