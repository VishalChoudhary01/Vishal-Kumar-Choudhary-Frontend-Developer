"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { FiSun, FiMoon } from "react-icons/fi";
import useDarkMode from "@/app/hooks/useDarkMode";

const CleanDarkModeToggle = () => {
  const { isDarkMode, toggleMode } = useDarkMode();
  const [isHovered, setIsHovered] = useState(false);

  // Pulse wave configurations for a more dynamic effect
  const pulseWaves = [
    // Core waves
    { scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2], duration: 2.5, delay: 0, border: 2 },
    { scale: [1, 1.25, 1], opacity: [0.1, 0.3, 0.1], duration: 3, delay: 0.5, border: 1.5 },
    { scale: [1, 1.3, 1], opacity: [0.05, 0.2, 0.05], duration: 3.5, delay: 1, border: 1 },
    
    // Outer spread waves
    { scale: [1, 1.35, 1], opacity: [0.03, 0.15, 0.03], duration: 4, delay: 1.5, border: 0.5 },
    { scale: [1, 1.4, 1], opacity: [0.02, 0.1, 0.02], duration: 4.5, delay: 2, border: 0.25 },
    
    // Subtle background waves
    { scale: [1, 1.45, 1], opacity: [0.01, 0.08, 0.01], duration: 5, delay: 2.5, border: 0 },
    { scale: [1, 1.5, 1], opacity: [0.005, 0.05, 0.005], duration: 5.5, delay: 3, border: 0 },
  ];

  // Fast flicker pulses for added realism
  const flickerPulses = [
    { scale: [1, 1.02, 1], opacity: [0.1, 0.25, 0.1], duration: 0.8, delay: 0, border: 0 },
    { scale: [1, 1.03, 1], opacity: [0.05, 0.2, 0.05], duration: 1.2, delay: 0.3, border: 0 },
  ];

  return (
    <motion.div
      className="fixed md:bottom-8 md:right-8 right-4 bottom-2 z-50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
    >
      {/* Realistic pulse waves for light mode - multiple layers */}
      {!isDarkMode && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          {/* Main spread waves */}
          {pulseWaves.map((wave, index) => (
            <motion.div
              key={`wave-${index}`}
              className={`absolute inset-0 rounded-xl bg-linear-to-br ${
                index % 2 === 0 
                  ? "from-grad-primary/10 via-grad-secondary/5 to-transparent" 
                  : "from-grad-secondary/10 via-grad-primary/5 to-transparent"
              }`}
              style={{
                border: `${wave.border}px solid rgba(var(--grad-primary-rgb), 0.1)`,
                margin: `${-index * 2}px`,
              }}
              animate={{
                scale: wave.scale,
                opacity: wave.opacity,
                rotate: index % 2 === 0 ? [0, 0.5, 0] : [0, -0.5, 0],
              }}
              transition={{
                duration: wave.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: wave.delay,
                times: [0, 0.5, 1],
              }}
            />
          ))}
          
          {/* Fast flicker pulses */}
          {flickerPulses.map((pulse, index) => (
            <motion.div
              key={`flicker-${index}`}
              className={`absolute inset-0 rounded-xl ${
                index % 2 === 0 
                  ? "bg-grad-primary/5" 
                  : "bg-grad-secondary/5"
              }`}
              style={{
                margin: `${-pulseWaves.length * 2 - index * 3}px`,
              }}
              animate={{
                scale: pulse.scale,
                opacity: pulse.opacity,
              }}
              transition={{
                duration: pulse.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: pulse.delay,
              }}
            />
          ))}
          
          {/* Radial gradient overlay for smoother transition */}
          <div className="absolute inset-0 rounded-xl bg-radial from-white/10 via-transparent to-transparent" />
          
          {/* Corner glow effects */}
          <motion.div
            className="absolute top-0 left-0 w-1/2 h-1/2 rounded-tl-xl bg-linear-to-br from-grad-primary/20 to-transparent"
            animate={{
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-br-xl bg-linear-to-tl from-grad-secondary/20 to-transparent"
            animate={{
              opacity: [0.1, 0.25, 0.1],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>
      )}

      {/* Subtle ambient glow in dark mode */}
      {isDarkMode && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-linear-to-br from-darkgrad-primary/5 via-darkgrad-secondary/3 to-transparent pointer-events-none"
          animate={{
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <motion.button
        onClick={toggleMode}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative w-12 h-12 rounded-xl backdrop-blur-md border flex items-center justify-center overflow-hidden transition-all duration-300  dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3),0_2px_4px_-1px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.5)]"
        style={{
          background: isDarkMode
            ? `linear-gradient(135deg, rgba(10, 10, 10, 0.95), rgba(15, 15, 15, 0.8))`
            : `linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 245, 245, 0.85))`,
          borderColor: isDarkMode
            ? "rgba(100, 100, 100, 0.4)"
            : "rgba(200, 200, 200, 0.3)",
        }}
        whileHover={{ scale: 1.05, rotate: isHovered ? (isDarkMode ? 2 : -2) : 0 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Gradient hover effect */}
        <motion.div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-br from-darkgrad-primary/20 via-darkgrad-secondary/10 to-transparent"
              : "bg-gradient-to-br from-grad-primary/20 via-grad-secondary/10 to-transparent"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
        
        {/* Shimmer effect on hover */}
        <motion.div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-gradient-to-r from-transparent via-darkgrad-primary/10 to-transparent"
              : "bg-gradient-to-r from-transparent via-grad-primary/10 to-transparent"
          }`}
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "100%" : "-100%" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />

        <div className="relative w-6 h-6 flex items-center justify-center">
          {/* Sun icon - removed blur overlay */}
          <motion.div
            animate={{
              scale: isDarkMode ? 0 : 1,
              opacity: isDarkMode ? 0 : 1,
              rotate: isDarkMode ? 90 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="absolute"
          >
            <FiSun className="w-5 h-5 text-grad-primary" />
          </motion.div>

          {/* Moon icon - removed blur overlay */}
          <motion.div
            animate={{
              scale: isDarkMode ? 1 : 0,
              opacity: isDarkMode ? 1 : 0,
              rotate: isDarkMode ? 0 : -90,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
            }}
            className="absolute"
          >
            <FiMoon className="w-5 h-5 text-darkgrad-secondary" />
          </motion.div>
        </div>

        {/* Animated border gradient on hover */}
        <motion.div
          className={`absolute inset-0 rounded-xl pointer-events-none ${
            isDarkMode
              ? "bg-gradient-to-r from-darkgrad-primary/0 via-darkgrad-primary/30 to-darkgrad-secondary/0"
              : "bg-gradient-to-r from-grad-primary/0 via-grad-primary/30 to-grad-secondary/0"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            padding: "1px",
          }}
        />
      </motion.button>

      {/* Enhanced tooltip with animation */}
      <motion.div
        className={`absolute md:-top-9 md:left-1/2 left-[1%]  -top-9  transform -translate-x-1/2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none shadow-xl backdrop-blur-sm border ${
          isDarkMode
            ? "bg-gray-900/95 text-darkPara2 border-gray-700/40"
            : "bg-white/95 text-para2 border-gray-200/40"
        }`}
        initial={{ opacity: 0, y: 5, scale: 0.95 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? 0 : 5,
          scale: isHovered ? 1 : 0.95,
        }}
        transition={{ 
          duration: 0.2,
          type: "spring",
          stiffness: 200,
          damping: 15,
        }}
      >
        {isDarkMode ? "Switch to Light" : "Switch to Dark"}
        <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 border-b border-r ${
          isDarkMode ? "bg-gray-900/95 border-gray-700/40" : "bg-white/95 border-gray-200/40"
        }`} />
      </motion.div>
    </motion.div>
  );
};

export default CleanDarkModeToggle;