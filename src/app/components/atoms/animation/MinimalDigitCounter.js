"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

const MinimalDigitCounter = ({
  value,
  duration = 1200,
  className = "",
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    let rafId;
    
    if (isInView) {
      const startTime = Date.now();
      const startValue = 0;
      const endValue = value;

      const animate = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.floor(startValue + (endValue - startValue) * easeOutExpo);

        setDisplayValue(current);

        if (progress < 1) {
          rafId = requestAnimationFrame(animate);
        }
      };

      rafId = requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isInView, value, duration]);

  const digits = displayValue.toString().split("");

  return (
    <div ref={ref} className={`inline-flex ${className}`}>
      {digits.map((digit, index) => (
        <motion.span
          key={`${digit}-${index}`}
          className="inline-block"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {digit}
        </motion.span>
      ))}
    </div>
  );
};

export default MinimalDigitCounter;