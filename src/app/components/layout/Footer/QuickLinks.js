"use client";
import React from 'react';

const quickLinks = [
  { name: 'Home', href: '#home' },
  { name: 'About', href: '#about' },
  { name: 'Projects', href: '#projects' },
];

export default function QuickLinks() {
  return (
    <div className="group">
      <h3 className="font-semibold text-h4 dark:text-Head4dark mb-4 text-base">
        Quick Links
      </h3>
      <ul className="space-y-3">
        {quickLinks.map((link, index) => (
          <li key={index}>
            <a 
              href={link.href} 
              className="text-para3 dark:text-darkPara3 hover:text-grad-primary dark:hover:text-darkgrad-primary transition-all duration-300 inline-flex items-center group/link text-sm"
            >
              <span className="group-hover/link:translate-x-1 transition-transform duration-300 backdrop-blur-[1px] px-1">
                {link.name}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}