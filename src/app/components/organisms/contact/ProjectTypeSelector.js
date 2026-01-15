import React from "react";
import { motion } from "motion/react";
import { FaBriefcase } from "react-icons/fa6";

import { RiTeamFill } from "react-icons/ri";
import { MdWorkHistory } from "react-icons/md";

const projectTypes = [
  { value: "freelance", label: "Freelance Project", icon: FaBriefcase },
  { value: "fulltime", label: "Full-time Role", icon: MdWorkHistory },
  { value: "collaboration", label: "Collaboration", icon: RiTeamFill },
];

export default function ProjectTypeSelector({
  selectedValue,
  onChange,
}) {
  return (
    <div className="mb-6">
      <label className="block md:text-sm text-[0.8rem] pl-4 md:pl-0 font-medium md:mb-3 mb-4  font-open-sans  text-para1 dark:text-darkPara1">
        What type of project are you looking for?
      </label>
      <div className="flex gap-x-2 w-full justify-center">
        {projectTypes.map((type) => {
          const Icon = type.icon;
          return (
            <motion.label
              key={type.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative cursor-pointer p-2.5  md:p-4 md:w-full rounded-xl border transition-all duration-300 flex flex-col items-center justify-center ${
                selectedValue === type.value
                  ? 'border-accent bg-accent/10 dark:border-darkAccent dark:bg-darkAccent/10 shadow-sm'
                  : 'border-lightBorder bg-white dark:border-darkBorder/30 dark:bg-white/5 hover:border-accent/50 dark:hover:border-darkAccent/50 hover:shadow-sm'
              }`}
            >
              <input
                type="radio"
                name="category"
                value={type.value}
                checked={selectedValue === type.value}
                onChange={onChange}
                className="sr-only"
              />
              <div className="flex flex-col items-center gap-2 md:gap-3">
                <Icon className="text-lg md:text-xl text-para1 dark:text-darkPara1" />
                <span className="text-xs font-medium text-center text-para1 font-roboto dark:text-darkPara1 leading-tight">
                  {type.label}
                </span>
              </div>
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}