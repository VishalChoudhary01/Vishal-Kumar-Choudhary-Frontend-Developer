import React from "react";
import { motion } from "framer-motion";
import { FiCopy, FiCheck } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { FiMail, FiPhone } from "react-icons/fi";
import OptionContent from "./OptionContent";

export default function ContactOption({ option, index, copied, onCopyEmail }) {
  const getIcon = () => {
    switch (option.icon) {
      case 'whatsapp':
        return <FaWhatsapp className="dark:text-[#25d366] text-[#128c7e]" />;
      case 'email':
        return <FiMail className="text-[#d90429] dark:text-[#fa5a1af7]" />; 
      case 'phone':
        return <FiPhone className="text-[#1d588d] dark:text-[#19a7a4]" />;
      default:
        return null;
    }
  };

  if (option.link) {
    return (
      <motion.a
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        href={option.link}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="flex  md:flex-row flex-col md:items-center justify-between md:p-4 p-3 rounded-xl bg-white/10   dark:bg-white/5 border border-lightBorder dark:border-darkBorder/30 hover:border-accent dark:hover:border-darkAccent transition-all duration-300"
      >
        <OptionContent option={option} getIcon={getIcon} />
        <div className="text-xs font-medium text-accent dark:text-darkAccent whitespace-nowrap mt-2.5 md:mt-0 text-right ">
          {option.value}
        </div>
      </motion.a>
    );
  }

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      onClick={onCopyEmail}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="flex md:flex-row flex-col md:items-center justify-between w-full md:p-4 p-3 rounded-xl bg-white/20 dark:bg-white/5 border border-lightBorder dark:border-darkBorder/30 hover:border-accent dark:hover:border-darkAccent transition-all duration-300 relative"
    >
      <OptionContent option={option} getIcon={getIcon} />
      <div className="flex items-center md:gap-2 mt-2 md:mt-0 relative md:pr-6">
        <span className="text-xs font-medium text-accent md:text-left   dark:text-darkAccent whitespace-nowrap mt-2.5 md:mt-0  w-full text-right ">
          {option.value}
        </span>
        <div className="absolute right-0 md:top-1/2 md:-translate-y-1/2 -top-11 ">
          {copied ? (
            <FiCheck className="text-accent  cursor-pointer   text-sm" />
          ) : (
            <FiCopy className="opacity-50 text-sm text-amber-900 dark:text-neutral-50 dark:hover:text-white cursor-pointer " />
          )}
        </div>
      </div>
    </motion.button>
  );
}

