"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSelector } from "react-redux";
import useDarkMode from "@/app/hooks/useDarkMode";
import SideMenu from "../../molecules/menu/SideMenu";
import { MobileHamburger, DesktopNav } from "./index";
import VKR from "../../atoms/images/logo/VKR";


// Main Navbar Component
const Navbar = () => {
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);
  const { isDarkMode, toggleMode } = useDarkMode();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll detection - only on client
  // useEffect(() => {
  //   if (!mounted) return;

  //   const handleScroll = () => setIsScrolled(window.scrollY > 400);
  //   window.addEventListener("scroll", handleScroll);
  //   handleScroll();

  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [mounted]);


  useEffect(() => {
  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        setIsScrolled(window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);


  // Prevent background scroll when menu is open
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = isSidebarOpen ? "hidden" : "auto";
  }, [isSidebarOpen, mounted]);

  

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={false}
        animate={{
          width: isScrolled ? "95%" : "100%",
          height: isScrolled ? "55px" : "64px",
          top: isScrolled ? "2%" : "0",
          left: "50%",
          translateX: "-50%",
          borderRadius: isScrolled ? "999px" : "0px",
        }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={`fixed z-999 flex items-center justify-between  transition-all duration-300 text-neutral-950 px-1.5 py-1.5 md:py-9.5 md:px-2 dark:text-neutral-50 bg-navbarBG dark:bg-navbarDarkBG ${ isScrolled  ? "backdrop-blur-md backdrop-saturate-150 shadow-md bg-scrolledNavbarBG dark:bg-scrolledNavbarDarkBG"  : "backdrop-blur-xl"  } `} >
        <VKR />
        <DesktopNav
          isScrolled={isScrolled}
          isDarkMode={isDarkMode}
          toggleMode={toggleMode}
        />
        <MobileHamburger />
      </motion.nav>

      {/* Mobile Side Menu */}
      <SideMenu />
    </>
  );
};

export default Navbar;