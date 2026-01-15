"use client";
import { motion } from "motion/react";

const ProjectNotFound = ({ router }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
          Project Not Found
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-400">
          The project you're looking for doesn't exist.
        </p>
        <motion.button
          onClick={() => router.push("/")}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ProjectNotFound;
