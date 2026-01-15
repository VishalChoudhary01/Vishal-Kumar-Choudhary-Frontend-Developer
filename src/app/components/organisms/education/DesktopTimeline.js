"use client";

import React from "react";
import { motion } from "motion/react";
import { AnimatedDot, ConnectionLine, TimelineCard } from "./index";
import {educationData} from '@/app/lib/data/index'

const DesktopTimeline = ({ hoveredCard, setHoveredCard, smoothProgress }) => (
  <div className="hidden lg:block relative max-w-6xl mx-auto font-poppins">
    {/* Background Line */}
    <div className="absolute left-1/2 transform -translate-x-1/2 top-0 w-0.5 h-full bg-lightBorder/80 dark:bg-darkBorder/80 rounded-full" />

    {/* Animated Vertical Line */}
    <motion.div
      className="absolute left-1/2 transform -translate-x-1/2 top-0 w-0.5 bg-linear-90 from-grad-primary via-grad-secondary to-grad-tertiary dark:from-darkgrad-primary dark:via-darkgrad-secondary dark:to-darkgrad-tertiary rounded-full origin-top"
      style={{
        scaleY: smoothProgress,
        height: "100%",
      }}
    />

    {educationData.map((item, index) => {
      const isRight = index % 2 !== 0;

      return (
        <div
          key={index}
          className={`relative mb-24 ${isRight ? "pl-12 text-left" : "pr-12 text-right"} w-1/2 ${isRight ? "left-1/2" : "left-0"}`}
        >
          <ConnectionLine index={index} isRight={isRight} />
          
          <AnimatedDot
            index={index}
            item={item}
            position={isRight ? "left" : "right"}
          />

          <TimelineCard
            item={item}
            index={index}
            isHovered={hoveredCard}
            onHoverStart={() => setHoveredCard(index)}
            onHoverEnd={() => setHoveredCard(null)}
            custom={index}
            layout="desktop"
            isRight={isRight}
          />
        </div>
      );
    })}
  </div>
);

export default DesktopTimeline;