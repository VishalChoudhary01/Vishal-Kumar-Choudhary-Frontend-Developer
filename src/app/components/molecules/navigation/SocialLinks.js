"use client"
import React from "react";
import Link from "next/link";
import { socialMenu } from "@/app/lib/data/menu"; 

const SocialLinks = ({ className = "", iconSize = "md:w-5 md:h-5 h-2 w-2" }) => {
  return (
    <div className={`flex md:gap-4 gap-2 ${className}`}>
      {socialMenu.map(({brandColor, icon: Icon, url, target}, index) => (
        <Link 
          key={index} 
          href={url}
          target={target}
          rel="noopener noreferrer"
          className={`md:w-12 md:h-12 h-9 w-9 rounded-full bg-orange-200/30 text-orange-700 hover:text-orange-800 dark:hover:text-neutral-100 hover:bg-linear-120 hover:from-amber-400/10 hover:to-orange-400/40 dark:bg-neutral-200/20 dark:text-DrkIcon-text flex items-center justify-center bg-linear-120 dark:hover:from-teal-800/10 dark:hover:to-teal-100/30 transition-all duration-300 group`}
        >
          <Icon className={`${iconSize} group-hover:scale-110 transition-transform`}/>
        </Link>
      ))}
    </div>
  );
};

export default SocialLinks;