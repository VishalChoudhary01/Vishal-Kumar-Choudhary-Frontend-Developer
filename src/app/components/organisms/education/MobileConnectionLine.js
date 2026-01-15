"use client";
import React from 'react';
import { motion, useTransform } from 'motion/react';

const MobileConnectionLine = ({ index, scrollProgress, totalItems }) => {
  // Calculate when this line should appear (after dot)
  const startProgress = (index + 0.3) / totalItems;
  const endProgress = (index + 0.6) / totalItems;

  // Animate line width based on scroll
  const width = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    [0, 48] // 0 to 48px (w-12)
  );

  const opacity = useTransform(
    scrollProgress,
    [startProgress, endProgress],
    [0, 1]
  );

  const getGradientClass = (idx) => {
    const gradients = [
      'from-[var(--grad-primary)] to-[var(--grad-secondary)] dark:from-[var(--darkgrad-primary)] dark:to-[var(--darkgrad-secondary)]',
      'from-[var(--grad-secondary)] to-[var(--grad-tertiary)] dark:from-[var(--darkgrad-secondary)] dark:to-[var(--darkgrad-tertiary)]',
      'from-[var(--grad-tertiary)] to-[var(--grad-quaternary)] dark:from-[var(--darkgrad-tertiary)] dark:to-[var(--darkgrad-quaternary)]',
      'from-[var(--grad-quaternary)] to-[var(--grad-primary)] dark:from-[var(--darkgrad-quaternary)] dark:to-[var(--darkgrad-primary)]'
    ];
    
    return gradients[idx % gradients.length];
  };

  const gradientClass = getGradientClass(index);

  return (
    <motion.div
      className={`absolute top-[29px]  left-4.5 h-0.5 bg-gradient-to-r ${gradientClass}`}
      style={{ 
        width, 
        opacity,
        transformOrigin: 'left'
      }}
    />
  );
};

export default MobileConnectionLine;