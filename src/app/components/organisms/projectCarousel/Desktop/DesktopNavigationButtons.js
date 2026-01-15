import {motion} from 'motion/react';
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa6";

const DesktopNavigationButtons = ({ onPrev, onNext }) => (
  <div className="absolute -bottom-[50px]    left-1/2 -translate-x-1/2 flex gap-4 z-40 ">

    <motion.button
      onClick={onPrev}
      whileTap={{ scale: 0.9 }}
      className="size-14 bg-white/20 group active:scale-200 dark:bg-black/20 text-shadow-lg text-shadow-gray-700 dark:text-slate-50 hover:text-shadow-lg backdrop-blur-3xl  text-slate-900  hover:scale-110 transition-all rounded-full flex items-center justify-center cursor-pointer duration-300  "
    >

      <FaChevronLeft className='text-xl group-active:text-white  group-hover:scale-110 transition-all text-shadow-lg text-shadow-gray-700' />
    </motion.button>
    <motion.button
      onClick={onNext}
      whileTap={{ scale: 0.9 }}
      className="size-14 bg-white/20 group active:scale-200 backdrop-blur-3xl dark:text-slate-50 dark:bg-black/20 hover:text-shadow-lg text-slate-900 hover:scale-110 transition-all rounded-full flex items-center justify-center cursor-pointer duration-300"
    >
      <FaChevronRight className='text-xl group-active:text-white  group-hover:scale-110 transition-all text-shadow-lg text-shadow-gray-700' />
    </motion.button>
  </div>
);

export default DesktopNavigationButtons