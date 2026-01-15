"use client";

import React from 'react'
import {motion} from 'motion/react'

const ConnectionLine = ({ index, isRight }) => {
  // Use existing gradient variables
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
      className={`absolute top-8 h-0.5 md:w-12 bg-gradient-to-r ${gradientClass} ${
        isRight ? 'left-0' : 'right-0'
      }`}
      initial={{ width: 0, opacity: 0 }}
      whileInView={{ width: 48, opacity: 1 }}
      viewport={{ once: false, margin: "-50px" }}
      transition={{ 
        duration: 0.8, 
        delay: 0.4, 
        ease: "easeOut"
      }}
    />
  );
};

export default ConnectionLine;