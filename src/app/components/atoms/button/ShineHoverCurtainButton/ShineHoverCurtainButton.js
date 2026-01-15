"use client";
import React from "react";
import { motion } from "framer-motion";
import './ShineHoverCurtainButton.css';
import LoadingSpinner from "../../UI/loadersSVG/LoadingSpinner";
import useDarkMode from "@/app/hooks/useDarkMode";

const ShineHoverCurtainButton = ({
  children,
  onClick,
  className = "",
  disabled = false,
  type = "button",
  leftIcon,
  rightIcon,
  variant = "default",
  size = "md",
  fullWidth = false,
  loading = false,
}) => {
  
  const {isDarkMode} = useDarkMode();
  
  // Base styles
  const baseStyles = "relative overflow-hidden flex items-center justify-center font-medium tracking-wide transition-all duration-300 group";
  
  // Responsive size variants - removed fixed padding, rely on parent control
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs rounded-lg gap-2",
    md: "px-4 py-2.5 text-sm md:px-6 md:py-3 md:text-base rounded-xl gap-3",
    lg: "px-6 py-3.5 text-base md:px-8 md:py-4 md:text-lg rounded-2xl gap-4",
  };
  
  // Width - use parent width control
  const widthStyles = fullWidth ? "w-full" : "";
  
  // Variant styles with dark: classes
  const variantStyles = {
    default: "bg-neutral-950 text-white dark:bg-neutral-50/85 dark:text-gray-900 border-none",
    primary: "bg-blue-600 text-white dark:bg-blue-500/90 dark:text-white border-none",
    secondary: "bg-emerald-600 text-white dark:bg-emerald-500/90 dark:text-white border-none",
    outline: "bg-transparent text-gray-800 border border-gray-300 dark:bg-transparent dark:text-gray-100 dark:border dark:border-gray-600",
  };
  
  // Determine curtain class based on variant
  const getCurtainClass = () => {
    if (variant === "outline") {
      return "button-curtain-outline";
    }
    return `${isDarkMode ? 'dark-button-curtain-shine' : 'button-curtain-shine'}`;
  };
  
  // Disabled styles
  const disabledStyles = disabled || loading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer";

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${widthStyles}
        ${getCurtainClass()}
        ${disabledStyles}
        ${className}
      `}
    >
      {/* Continuous shine layer */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute inset-0 animate-sleek-light-shine dark:animate-subtle-dark-shine bg-gradient-to-r from-transparent via-white/35 via-45% to-transparent dark:from-transparent dark:via-gray-900/25 dark:via-25% dark:to-transparent"
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <>
          <span className="relative z-20">
            <LoadingSpinner />
          </span>
          <span className="relative z-20 whitespace-nowrap">
            Loading...
          </span>
        </>
      ) : (
        <>
          {/* Left Icon */}
          {leftIcon && (
            <span className="relative z-20 button-icon transition-transform duration-300">
              {leftIcon}
            </span>
          )}
          
          {/* Content - allow text to wrap on mobile if needed */}
          <span className="relative z-20 whitespace-nowrap md:whitespace-normal">
            {children}
          </span>
          
          {/* Right Icon */}
          {rightIcon && (
            <span className="relative z-20 button-icon transition-transform duration-300">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </motion.button>
  );
};

export default ShineHoverCurtainButton;