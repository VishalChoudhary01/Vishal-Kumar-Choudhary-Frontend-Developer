"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { hideToast } from "@/app/redux/featuresSlice/toastSlice";
import { PiEyesFill } from "react-icons/pi";
import { useEffect } from "react";
import useDarkMode from "@/app/hooks/useDarkMode";
import { GiMoon } from "react-icons/gi";
import { IoClose } from "react-icons/io5";
import { WiStars } from "react-icons/wi";
import './toast.css';

export default function Toast() {
  const dispatch = useDispatch();
  const { visible, message, iconType } = useSelector((state) => state.toast);
  const { isDarkMode } = useDarkMode();

  // Map icon type string to React component
  const getIconComponent = (type) => {
    switch (type) {
      case 'moon':
        return <GiMoon className="inline mr-2 " />;
      case 'star':
        return <WiStars className="inline mr-2" />;
      case 'eye':
        return <PiEyesFill className="inline mr-2" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        dispatch(hideToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visible, dispatch]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: -40,
            scale: 0.9
          }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 30,
              mass: 1
            }
          }}
          exit={{ 
            opacity: 0, 
            y: -20,
            scale: 0.95,
            transition: {
              duration: 0.15
            }
          }}
          className="fixed md:top-[11%] md:right-4 top-[10%] right-0 z-9999"
        >
          <div className="relative">
            {/* Main toast with conditional shine */}
            <motion.div 
              className={`relative rounded-md bg-linear-120 from-grad-primary/15 to-grad-secondary/10 dark:from-darkgrad-primary/10 dark:to-darkgrad-secondary/5 backdrop-blur-xl shadow-xl px-4 py-3 md:min-w-[420px] md:max-w-[520px]    overflow-hidden ${
                isDarkMode ? 'toast-shine-dark' : 'toast-shine'
              }`}
              whileHover={{ scale: 1.02 }}
            >
              {/* Content */}
              <div className="relative z-10 flex items-center justify-between gap-3">
                <p className=" tracking-wide capitalize text-grad-primary dark:text-darkgrad-primary flex-1  flex items-center">
                  <span className="text-grad-primary/65 md:inline-block hidden dark:text-darkgrad-primary/75 md:text-lg">{getIconComponent(iconType)}</span>
                  <span className="md:text-sm text-[0.85rem] font-medium  font-roboto text-shadow-md sm:text-shadow-2xs md:tracking-widest">{message}</span>
                </p>
                
                {/* Simple close button */}
                <motion.button
                  initial={{rotate:0,}}
                  whileHover={{rotate:90,}}
                  onClick={() => dispatch(hideToast())}
                  className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white  hover:text-grad-primary dark:hover:bg-gray-500/40  transition-all"
                >
                  <IoClose className="md:text-[1.2rem] text-[1.1rem]       text-h1 dark:text-Head1dark" />
                </motion.button>
              </div>
              
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-md p-px pointer-events-none overflow-hidden">
                <div className="absolute inset-0 rounded-md border-flow" />
                <div className="absolute inset-px rounded-md bg-white/5 dark:bg-black/10 backdrop-blur-xl" />
              </div>

              {/* Progress Bar with Shine */}
              <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-full">
                <div className="relative w-full h-0.5 overflow-hidden rounded-full bg-gray-800/20 dark:bg-gray-900/30">
                  {/* Expanding progress bar */}
                  <motion.div 
                    className="absolute bottom-0 left-0 h-full w-full bg-linear-to-r from-grad-primary to-grad-secondary dark:from-darkgrad-primary dark:to-darkgrad-secondary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                  />
                  
                  {/* Progress bar shine */}
                  <div className="progress-shine" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}