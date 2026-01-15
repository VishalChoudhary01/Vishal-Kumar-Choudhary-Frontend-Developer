"use client";
import React from "react";
import { motion } from "motion/react";
import DownloadButton from "@/app/components/atoms/button/aboutDownloadButton/DownloadButton";
import SocialLinks from "../../molecules/navigation/SocialLinks";

const ActionButtons = ({ isDarkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="flex flex-col sm:flex-row items-center justify-between gap-5 pt-6 border-t border-lightBorder dark:border-darkBorder"
    >
      <SocialLinks className="order-2 sm:order-1" iconSize="w-5 h-5" />

      <div className="order-1 sm:order-2">
        <DownloadButton isDarkMode={isDarkMode} />
      </div>
    </motion.div>
  );
};

export default ActionButtons;
