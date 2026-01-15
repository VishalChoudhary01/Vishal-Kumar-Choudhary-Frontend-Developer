"use client";
import React from "react";
import { motion } from "motion/react";
import { FaAngleDown } from "react-icons/fa6";
import Link from "next/link";
import { menu } from "../../../constants/index";

const DropDownMenu = ({ isScrolled }) => {
  return (
    <div className="relative group">
      {/* Button with Icon */}
      <button className={`${ isScrolled ? "dark:text-neutral-50 font-semibold" : "text-neutral-950" } flex items-center  font-open-sans  gap-x-1.5 text-[1.02rem] dark:text-DrkIcon-text font-normal text-icon-text px-4 py-2 rounded-lg hover:bg-bgHover dark:hover:bg-darkbgHover transition`}>
        Menu <FaAngleDown className="text-sm font-bold" />
      </button>

      {/* Dropdown stays open on hover over either button or dropdown */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute left-0 mt-1 w-48 bg-navbarBG  dark:bg-linear-240 to-black/85 from-gray-800/95 backdrop-blur-3xl    rounded-lg shadow-xl py-1.5 z-50   invisible opacity-0 group-hover:visible group-hover:opacity-100   transition-all duration-200 ease-in-out"
      >
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.route}
            className="block px-4 py-2 font-poppins text-sm text-gray-800 dark:text-white  dark:hover:text-icon-text-hover hover:bg-bgHover dark:hover:bg-darkbgHover hover:text-HoverTXT"
          >
            {item.name}
          </Link>
        ))}
      </motion.div>
    </div>
  );
};

export default DropDownMenu;
