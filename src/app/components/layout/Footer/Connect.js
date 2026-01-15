"use client";
import React from 'react';
import { FaLinkedinIn } from 'react-icons/fa';
import { BiLogoGmail } from "react-icons/bi";
import { SiRefinedgithub } from "react-icons/si";
import { GoTriangleRight } from "react-icons/go";

const socialLinks = [
  {
    name: 'LinkedIn',
    icon: FaLinkedinIn,
    href: 'https://www.linkedin.com/in/vishal-kumar-choudhary-664921229/',
    hoverColor: 'hover:text-grad-primary dark:hover:text-darkgrad-primary'
  },
  {
    name: 'GitHub',
    icon: SiRefinedgithub,
    href: 'https://github.com/VishalChoudhary01',
    hoverColor: 'hover:text-grad-primary dark:hover:text-darkgrad-primary'
  },
  {
    name: 'Gmail',
    icon: BiLogoGmail,
    href: 'https://mail.google.com/mail/u/0/#inbox?compose=GTvVlcSGLdbRHqRFgLCBMCfdWmBSgSrmxGRxtFjSdnGMLLSngNCpHkbvRPlcZgwPRPpLvZhxpxJWV',
    hoverColor: 'hover:text-grad-primary dark:hover:text-darkgrad-primary'
  },
];

export default function Connect() {
  return (
    <div className="group flex flex-col items-center md:items-start text-center md:text-left">
      <h3 className="font-semibold text-h4 dark:text-Head4dark md:mb-4 mb-2 text-base backdrop-blur-[1px] rounded-lg px-1">
        Connect
      </h3>
      <div className="space-y-4 w-full max-w-xs">
        <div className="flex gap-3 justify-center md:justify-start">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 md:w-11 md:h-11 rounded-full bg-highlightBG dark:bg-darkHighlightBG backdrop-blur-[2px] ${social.hoverColor} text-para1 dark:text-darkPara1 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-bgHover dark:hover:bg-darkbgHover`}
              aria-label={social.name}
            >
              <social.icon className="size-4 md:size-5" />
            </a>
          ))}
        </div>
        <div className="pt-2 flex md:flex-col md:justify-start justify-center">
          <p className="text-sm text-h4 dark:text-Head4dark mb-1 font-medium">Email<GoTriangleRight className="inline-block md:hidden" /> </p>
          <a 
            href="mailto:vishal.bhumca21@gmail.com"
            className="text-sm text-para1 dark:text-darkPara1 hover:text-grad-primary dark:hover:text-darkgrad-primary transition-colors duration-300 break-all"
          >
            vishal.bhumca21@gmail.com
          </a>
        </div>
        <div className='flex text-h4 dark:text-Head4dark md:flex-col md:justify-start justify-center md:items-start items-center'>
          <p className="text-sm font-medium mb-1">Location</p>
          <GoTriangleRight className="inline-block md:hidden text-sm" />
          <p className="text-sm text-para1 dark:text-darkPara1">
            Patna, Bihar, India
          </p>
        </div>
      </div>
    </div>
  );
}