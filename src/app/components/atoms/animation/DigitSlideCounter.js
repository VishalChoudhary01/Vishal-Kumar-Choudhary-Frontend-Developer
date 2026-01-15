"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const DigitSlideCounter = ({
  value,
  duration = 1800,
  triggerAnimation = true,
  textColorClass = "text-gray-900 dark:text-neutral-100/75", 
  className = "",
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousValue, setPreviousValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, threshold: 0.1 });

  useEffect(() => {
    let rafId;
    let timeoutId;
    if (isInView && triggerAnimation && value !== null) {
      // Defer state updates to avoid synchronous setState-in-effect lint rule
      timeoutId = setTimeout(() => {
        setIsAnimating(true);
        // Use functional updater to avoid referencing displayValue in the effect
        setPreviousValue((pv) => pv);
        setDisplayValue(0);

        const startTime = Date.now();
        const startValue = 0;
        const endValue = value;

        const animate = () => {
          const currentTime = Date.now();
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Smooth easing function
          const easeOutExpo =
            progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
          const current = Math.floor(
            startValue + (endValue - startValue) * easeOutExpo
          );

          setDisplayValue(current);

          if (progress < 1) {
            rafId = requestAnimationFrame(animate);
          } else {
            setIsAnimating(false);
          }
        };

        rafId = requestAnimationFrame(animate);
      }, 0);
    } else if (value !== null) {
      // Defer synchronous state updates to avoid lint errors.
      timeoutId = setTimeout(() => {
        setPreviousValue(value);
        setDisplayValue(value);
      }, 0);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isInView, value, duration, triggerAnimation]);

  const digits = displayValue.toString().split("");
  const prevDigits = previousValue.toString().split("");

  return (
    <div
      ref={ref}
      className={`flex items-center justify-center gap-0 ${textColorClass} ${className}`}
      
    >
      {digits.map((digit, index) => {
        const direction = index % 2 === 0 ? "up" : "down";
        const initialY = direction === "up" ? 25 : -25;

        return (
          <motion.span
            key={`${digit}-${index}-${displayValue}`}
            className="inline-block min-w-[0.5em] text-center font-medium  text-base sm:text-lg font-roboto"
            initial={{ y: initialY, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 25,
              delay: index * 0.05,
            }}
            style={{
              lineHeight: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {digit}
          </motion.span>
        );
      })}
    </div>
  );
};

export default DigitSlideCounter;