"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import useDarkMode from "@/app/hooks/useDarkMode";

const GlowingCard = ({
  children,
  color = "#0565ff",
  className = "",
  borderRadius = "20px",
  isDarkMode: externalDarkMode = null,
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const { isDarkMode: hookDarkMode } = useDarkMode();

  // Use external dark mode if provided, otherwise use hook
  const isDarkMode =
    externalDarkMode !== null ? externalDarkMode : hookDarkMode;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  // Card colors based on theme - similar to GlowingCornerHover
  const cardBg = isDarkMode ? "rgba(45, 45, 45, 1)" : "rgba(255, 255, 255, 1)";
  const innerCardBg = isDarkMode
    ? "rgba(45, 45, 45, 0.75)"
    : "rgba(255, 255, 255, 0.65)";

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{
        borderRadius,
        background: cardBg,
        cursor: "pointer",
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Glowing gradient effect that follows cursor - similar to GlowingCornerHover */}
      <motion.div
        className="absolute w-[640px] h-[640px] pointer-events-none"
        style={{
          left: mousePosition.x,
          top: mousePosition.y,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, ${color}, transparent 40%, transparent 70%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
      />

      {/* Inner card with slight transparency - similar to GlowingCornerHover */}
      <div
        className="absolute inset-[2px] z-10"
        style={{
          borderRadius: `calc(${borderRadius} - 2px)`,
          background: innerCardBg,
        }}
      />

      {/* Edge glow effect - similar to GlowingCornerHover */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          borderRadius,
          boxShadow: isHovered
            ? `0 0 30px ${color}, inset 0 0 20px ${color}`
            : "none",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.6 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Content wrapper */}
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
};

export default GlowingCard;
