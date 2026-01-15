"use client";
import { useSelector, useDispatch } from "react-redux";
import {
  toggleSidebar,
  closeSidebar,
} from "../../../redux/featuresSlice/UISlice";
import { motion, AnimatePresence } from "motion/react";
import { IoClose } from "react-icons/io5";
import useDarkMode from "../../../hooks/useDarkMode";
import { HiSun } from "react-icons/hi";
import { FaMoon } from "react-icons/fa6";
import { menu, socialMenu } from "../../../constants/index";
import Link from "next/link";
import { useEffect } from "react";

const SideMenu = () => {
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);
  const dispatch = useDispatch();
  const { isDarkMode, toggleMode } = useDarkMode();

  // Close sidebar when route changes
  const handleLinkClick = () => {
    dispatch(closeSidebar());
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isSidebarOpen) {
        dispatch(closeSidebar());
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isSidebarOpen, dispatch]);

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop Overlay with Blur - Original MobileSidebarMenu UI */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => dispatch(closeSidebar())}
            className="fixed md:hidden inset-0 z-[999] bg-black/40 backdrop-blur-sm"
          />

          {/* Sidebar Menu - Original MobileSidebarMenu UI */}
          <motion.div
            key="mobile-sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed md:hidden top-0 right-0 w-[62vw] h-full z-[1000]  py-3.5 px-5 backdrop-blur-xl bg-white/45 dark:bg-gray-800/20 border-l border-white/20 dark:border-gray-600/20 shadow-2xl rounded-l-md flex flex-col gap-6 text-white"
          >
            {/* Close Button */}
            <div className="flex justify-end">
              <button
                onClick={() => dispatch(closeSidebar())}
                className="text-2xl text-icon-text dark:text-DrkIcon-text mt-1.5 hover:text-gray-300 transition"
              >
                <IoClose />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col gap-4  relative">
              <div className="flex justify-between items-center">
                <h2
                  className="relative text-[1.15rem] font-semibold mb-3.5 mt-2 text-neutral-700 dark:text-neutral-200 
  after:absolute after:left-0 after:bottom-[-4px]  after:h-0.5 after:w-[60px] after:dark:bg-slate-50/20 after:bg-neutral-500/50 content-['']"
                >
                  Menu
                </h2>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleMode}
                  className="hover:scale-105 transition-all flex items-center gap-x-1 text-neutral-700 dark:text-slate-100/60"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isDarkMode ? "sun" : "moon"}
                      initial={{ opacity: 0, scale: 0.8, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-x-1"
                    >
                      {isDarkMode ? <HiSun /> : <FaMoon />}
                      <span className="text-[0.7rem]">
                        {isDarkMode ? "Day" : "Night"}
                      </span>
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>

              {menu.map((item) => (
                <Link
                  key={item.name}
                  href={item.route}
                  onClick={handleLinkClick}
                  className="hover:scale-105 text-[0.92rem] transition-all text-h1 dark:text-Head1dark"
                >
                  {item.name}
                </Link>
              ))}
              <div className=" flex flex-col  gap-x-5">
                <hr className="dark:border-gray-50/20 border-neutral-500/50" />
                <div className="mt-2.5 flex items-center  gap-x-5">
                  {socialMenu.map(({ url, icon: Icon, activeColor }, index) => (
                    <Link
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleLinkClick}
                      className="hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <Icon
                        className={`${activeColor} text-[1.2rem] active:scale-105 text-neutral-600 dark:text-gray-400`}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;
