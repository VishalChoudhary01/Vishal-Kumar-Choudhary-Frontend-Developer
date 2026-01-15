"use client";
import React from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';
import { RiGithubLine } from "react-icons/ri";
import { BsFillSendCheckFill } from "react-icons/bs";

export default function Resources({ onViewResume }) {
  return (
    <div className="group">
      <h3 className="font-semibold text-h4 dark:text-Head4dark mb-4 text-base">
        Resources
      </h3>
      <ul className="space-y-3">
        <li className='backdrop-blur-[1px] rounded-lg'>
          <button
            onClick={onViewResume}
            className="text-para3 dark:text-darkPara3 hover:text-grad-primary dark:hover:text-darkgrad-primary transition-all duration-300 inline-flex items-center gap-2 group/link text-sm"
          >
            <HiOutlineDocumentText className="w-4 h-4" />
            <span className="group-hover/link:translate-x-1 transition-transform duration-300">
              View Resume
            </span>
            <FaExternalLinkAlt className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
          </button>
        </li>
        
        <li className='md:text-left text-right backdrop-blur-[1px]'>
          <a 
            href="https://github.com/VishalChoudhary01"
            target="_blank"
            rel="noopener noreferrer"
            className="text-para3 dark:text-darkPara3 hover:text-grad-primary dark:hover:text-darkgrad-primary transition-all duration-300 inline-flex items-center gap-2 group/link text-sm"
          >
            <RiGithubLine className="w-4 h-4" />
            <span className="group-hover/link:translate-x-1 whitespace-nowrap transition-transform duration-300">
              Projects Repositories
            </span>
            <BsFillSendCheckFill className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-300" />
          </a>
        </li>
      </ul>
    </div>
  );
}