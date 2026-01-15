"use client";
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa6";
import {motion} from 'motion/react'

const MobileNavigationButtons = ({ onPrev, onNext }) => (
  <div className="flex items-center  justify-between bottom-72 relative    w-full px-1.5 ">
    <motion.button
      onClick={onPrev}
      whileTap={{ scale: 0.9 }}
      className="size-11 hover:scale-105 bg-black/5 hover:backdrop-blur-3xl hover:opacity-25 text-slate-50 dark:bg-black/5 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#4f7577] hover:text-white transition"
    >
      <FaChevronLeft className="text-lg" />
    </motion.button>
    <motion.button
      onClick={onNext}
      whileTap={{ scale: 0.9 }}
      className="size-11 hover:scale-105 hover:backdrop-blur-3xl bg-black/5 text-slate-50 dark:bg-black/5 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-[#4f7577] hover:text-white transition"
    >
      <FaChevronRight className="text-lg" />
    </motion.button>
  </div>
);

export default MobileNavigationButtons