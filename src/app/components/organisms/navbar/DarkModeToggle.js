import { FaMoon } from "react-icons/fa6";
import { HiSun } from "react-icons/hi";
import {motion} from 'motion/react';
import { getIconColor } from "@/app/lib/utils/index";

const DarkModeToggle = ({ isDarkMode, toggleMode, isScrolled }) => (
  <motion.button
    onClick={toggleMode}
    className="p-2 rounded-full cursor-pointer transition-colors hover:bg-bgHover hover:dark:bg-darkbgHover"
    whileTap={{ scale: 0.95, rotate: -60 }}
    aria-label="Toggle dark mode"
  >
    {isDarkMode ? (
      <HiSun className={`w-5 h-5 ${getIconColor(isScrolled, isDarkMode)}`} />
    ) : (
      <FaMoon className={`w-5 h-5 ${getIconColor(isScrolled, isDarkMode)}`} />
    )}
  </motion.button>
);


export default DarkModeToggle