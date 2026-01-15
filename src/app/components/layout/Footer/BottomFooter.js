"use client";

import React from 'react';
import { motion } from 'motion/react';

export default function BottomFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="pt-8 border-t border-gray-400/40 dark:border-gray-700/30">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <motion.p 
          initial={{x:-100,opacity:0}}
          whileInView={{x:0,opacity:1}}
          transition={{duration:0.5,delay:2}}
          className="md:text-sm text-[0.75rem] text-h3 dark:text-Head5dark text-center md:text-left"
        >
          © {currentYear} Vishal Kumar Choudhary. Crafted with precision & passion.
        </motion.p>
        <motion.div 
          initial={{x:100,opacity:0}}
          whileInView={{x:0,opacity:1}}
          transition={{duration:0.5,delay:2}} 
          className="flex items-center gap-4 text-xs text-h3 dark:text-Head5dark"
        >
          <span className="hover:text-grad-primary dark:hover:text-darkgrad-primary transition-colors duration-300 cursor-pointer">
            Frontend Developer
          </span>
          <span>•</span>
          <span className="hover:text-grad-primary dark:hover:text-darkgrad-primary transition-colors duration-300 cursor-pointer">
            React Specialist
          </span>
        </motion.div>
      </div>
    </div>
  );
}