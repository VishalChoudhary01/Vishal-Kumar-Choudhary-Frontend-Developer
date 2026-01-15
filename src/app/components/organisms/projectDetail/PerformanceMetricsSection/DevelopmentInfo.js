"use client";
import { motion } from "motion/react";
import { FaCog } from "react-icons/fa";

export default function DevelopmentInfo({ developmentInfo, accentColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-200 dark:border-gray-800"
    >
      <div className="flex items-center gap-2 mb-3">
        <FaCog className="text-base text-grad-primary dark:text-darkgrad-primary"  />
        <h4 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white font-open-sans">
          Development Details
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {developmentInfo.type && (
             <div className="flex flex-col gap-1 p-3 sm:p-4 rounded-lg border border-grad-primary/15 dark:border-darkgrad-primary/15 bg-linear-to-r from-grad-primary/10 to-grad-primary/5">
                <p className="text-xs text-para3 font-open-sans dark:text-darkPara3">
                    Type  </p>
                 <p className="text-sm font-medium text-para2 font-roboto dark:text-darkPara2">
                  {developmentInfo.type}</p>
                </div>
        )}
        {developmentInfo.focus && (
          <div className="flex flex-col gap-1 p-3 sm:p-4 rounded-lg border border-grad-primary/15 dark:border-darkgrad-primary/15 bg-linear-to-r from-grad-primary/10 to-grad-primary/5">
                <p className="text-xs text-para3 font-open-sans dark:text-darkPara3">
                    Focus  </p>
                 <p className="text-sm font-medium text-para2 font-roboto dark:text-darkPara2">
                  {developmentInfo.focus}</p>
                </div>
        )}
      </div>
    </motion.div>
  );
}