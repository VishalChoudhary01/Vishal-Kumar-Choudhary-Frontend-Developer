"use client";
import React, { useState, useRef } from "react";
import { useScroll, useSpring } from "motion/react";
import {  DesktopTimeline, MobileTimeline } from "./index";
import { Heading } from "../../atoms/typography/index";


const Education = () => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const desktopContainerRef = useRef(null);
  const mobileContainerRef = useRef(null);

  // Desktop scroll progress
  const { scrollYProgress: desktopProgress } = useScroll({
    target: desktopContainerRef,
    offset: ["start center", "end center"],
  });

  // Mobile scroll progress - tracks the actual timeline content
  const { scrollYProgress: mobileProgress } = useScroll({
    target: mobileContainerRef,
    offset: ["start 90%", "end 50%"], // Start when container enters, end earlier
  });

  const smoothDesktopProgress = useSpring(desktopProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const smoothMobileProgress = useSpring(mobileProgress, {
    stiffness: 60, // Softer for mobile
    damping: 20,
    restDelta: 0.001,
  });

  return (
    <section id="education" className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <Heading
          heading="Education"
          subheading="Academic background, certifications, and key learning milestones."
        />

        {/* Desktop Timeline */}
        <div ref={desktopContainerRef}>
          <DesktopTimeline
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
            smoothProgress={smoothDesktopProgress}
          />
        </div>

        {/* Mobile Timeline */}
        <div ref={mobileContainerRef}>
          <MobileTimeline
            hoveredCard={hoveredCard}
            setHoveredCard={setHoveredCard}
            smoothProgress={smoothMobileProgress}
          />
        </div>
      </div>
    </section>
  );
};

export default Education;
