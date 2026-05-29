"use client";
import React from "react";
import EngravedBackground from "./EngravedBackground";
import QuickLinks from "./QuickLinks";
import Resources from "./Resources";
import Connect from "./Connect";
import BottomFooter from "./BottomFooter";
import { motion } from "motion/react";
import { RESUME_PDF_PATH } from "@/app/constants/resume";

export default function Footer() {
  const handleViewResume = () => {
    window.open(RESUME_PDF_PATH, "_blank");
  };

  return (
    <footer className="relative w-full overflow-hidden bg-navbarBG dark:bg-navbarDarkBG">
      <EngravedBackground />
      <div className="relative z-10 px-4 sm:px-6 md:py-16 pb-7 pt-8">
        <div className="max-w-6xl mx-auto pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 md:py-2 md:mb-10">
            {/* Mobile: Quick Links & Resources in same row */}
            <div className="md:hidden grid grid-cols-2 gap-6">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="font-semibold text-h4 dark:text-Head4dark mb-4 md:text-lg text-[0.9rem]">
                  Quick Links
                </h3>
                <ul className="space-y-3">
                  {["Home", "About", "Projects"].map((item) => (
                    <li key={item}>
                      <a
                        href={`#${item.toLowerCase()}`}
                        className="text-para3 dark:text-darkPara3 hover:text-grad-primary dark:hover:text-darkgrad-primary transition-all duration-300 inline-flex items-center group/link md:text-sm text-[0.8rem]"
                      >
                        <span className="group-hover/link:translate-x-1 transition-transform duration-300 backdrop-blur-[1px] dark:bg-neutral-700/5 bg-neutral-400/5 rounded-lg px-1">
                          {item}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Resources onViewResume={handleViewResume} />
              </motion.div>
            </div>

            {/* Desktop: 3-column layout */}
            <motion.div
              initial={{ x: -120, opacity: 0, filter: "blur(40px)" }}
              whileInView={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.8 }}
              className="hidden md:block"
            >
              <QuickLinks />
            </motion.div>

            <motion.div
              initial={{ x: 220, opacity: 0, filter: "blur(40px)" }}
              whileInView={{ x: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.1 }}
              className="hidden md:block"
            >
              <Resources onViewResume={handleViewResume} />
            </motion.div>

            <motion.div
              initial={{ y: 220, opacity: 0, filter: "blur(80px)",scale:5 }}
              whileInView={{ y: 0, opacity: 1, filter: "blur(0px)",scale:1 }}
              transition={{ duration: 1.1, delay: 0.5 }}    
              className="md:col-span-1"
            >
              <Connect />
            </motion.div>
          </div>
        </div>
        <BottomFooter />
      </div>
    </footer>
  );
}