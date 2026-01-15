"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { LuArrowDownToLine, LuCheck } from "react-icons/lu";
import './ShineButton.css';

const DownloadButton = ({ isDarkMode = false }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);

          const link = document.createElement("a");
          link.href = "/documents/Vishal_Kumar_Resume_frontend.pdf";
          link.download = "Vishal_Kumar_Choudhary_Resume.pdf";
          link.click();

          setTimeout(() => {
            setIsDownloading(false);
            setProgress(0);
          }, 1200);

          return 100;
        }
        return prev + 4;
      });
    }, 80);
  };

  return (
    <div className="w-fit font-roboto relative group">
      <motion.button
        onClick={handleDownload}
        disabled={isDownloading}
        whileTap={{ scale: 0.97 }}
        className={`
          relative overflow-hidden
          flex items-center gap-3
          px-6 sm:px-8 py-3 sm:py-4
          rounded-xl
          text-sm sm:text-base font-medium tracking-wide
          transition-all duration-300
          ${
            progress === 100
              ? "bg-emerald-500 text-white"
              : isDownloading
              ? "bg-transparent text-neutral-800 dark:text-neutral-100 border border-neutral-300 dark:border-neutral-700"
              : `${isDarkMode ? "dark:bg-neutral-50/85 dark:text-gray-900" : "bg-neutral-950 text-white"} border-none`
          }
        `}
      >
        {/* Continuous Shine + Curtain Layers - Only in idle state */}
        {!isDownloading && progress !== 100 && (
          <div className="absolute inset-0 overflow-hidden">
            {/* Continuous shine layer - Subtle for dark mode */}
            <div 
              className={`
                absolute inset-0
                ${
                  isDarkMode 
                    ? 'bg-gradient-to-r from-transparent via-gray-900/25 via-25% to-transparent animate-subtle-dark-shine'
                    : 'bg-gradient-to-r from-transparent via-white/35 via-45% to-transparent animate-sleek-light-shine'
                }
              `}
              style={{
                transformOrigin: 'left',
              }}
            />
            
            {/* Curtain layer (hover) */}
            <div 
              className={`
                absolute inset-0
                ${isDarkMode 
                  ? 'bg-gradient-to-r from-darkgrad-primary via-darkgrad-secondary to-darkgrad-tertiary' 
                  : 'bg-gradient-to-r from-[var(--grad-primary)] via-[var(--grad-secondary)] to-[var(--grad-tertiary)]'
                }
                -translate-x-full
                transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
                group-hover:translate-x-0
              `} 
            />
          </div>
        )}

        {/* Progress Bar */}
        {isDownloading && progress < 100 && (
          <motion.div
            className="
              absolute left-0 bottom-0 h-[2px]
              bg-gradient-to-r from-[var(--grad-primary)] to-[var(--grad-secondary)]
              dark:bg-gradient-to-r from-[var(--darkgrad-primary)] to-[var(--darkgrad-secondary)]
            "
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.08 }}
          />
        )}

        {/* Icon */}
        <span className="relative z-10">
          {progress === 100 ? (
            <LuCheck className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : isDownloading ? (
            <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <LuArrowDownToLine className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 animate-downloadingFlow   group-hover:translate-y-[-1px]" />
          )}
        </span>

        {/* Text */}
        <span className="relative z-10 whitespace-nowrap">
          {progress === 100
            ? "Downloaded"
            : isDownloading
            ? `Downloading ${progress}%`
            : "Download Resume"}
        </span>
      </motion.button>
    </div>
  );
};

export default DownloadButton;