"use client";
import { motion } from "motion/react";
import { FaChevronLeft, FaShare } from "react-icons/fa";

const ProjectFloatingNav = ({ router, handleShare }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div
        className={`flex items-center md:gap-2 gap-x-1  md:py-2 px-2 py-1 rounded-full bg-white/60 border-gray-300/50 shadow-gray-400/20 dark:bg-gray-900/50 dark:border-gray-800/60 dark:shadow-black/40 backdrop-blur-xl border shadow-lg  transition-all`}
      >
        {/* Back Button */}
        <motion.button
          onClick={() => router.back()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center cursor-pointer md:gap-x-2 gap-x-1 uppercase md:px-2 md:py-1.5 px-2 py-1 text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/60 rounded-full md:text-xs  text-[0.6rem]  font-medium transition `}
        >
          <FaChevronLeft  />
          Back
        </motion.button>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10 dark:bg-gray-600/40" />

        {/* Share Button */}
        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.15, rotate: 6 }}
          whileTap={{ scale: 0.9 }}
          className={`p-2 rounded-full md:text-xs  text-[0.8rem]    transition text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/60 `}
        >
          <FaShare />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProjectFloatingNav;
