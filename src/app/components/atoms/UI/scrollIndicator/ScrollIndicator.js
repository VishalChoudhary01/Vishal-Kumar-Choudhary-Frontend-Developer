"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useState, useEffect } from "react";

export default function ScrollIndicator() {
  const { scrollYProgress } = useScroll();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 55,
    mass: 0.05,
  });

  if (!isMounted) return null;

  return (
    <div className="fixed top-0 left-0 right-0 md:h-1 h-0.5 z-9999 overflow-visible pointer-events-none">
      <div className="absolute inset-0 bg-grad-primary/10 dark:bg-darkgrad-primary/10 " />

      {/* Progress bar container */}
      <div className="absolute top-0 left-0 h-full w-full overflow-visible">
        <motion.div
          style={{
            scaleX: smoothProgress,
            transformOrigin: "left",
          }}
          className="h-full w-full relative bg-linear-to-r from-grad-primary/40 via-grad-secondary/80 to-grad-tertiary dark:from-darkgrad-primary/50 dark:via-darkgrad-secondary/80 dark:to-darkgrad-tertiary dark:shadow-[0_0_12px_rgba(255,120,180,0.55)] after:content-[''] after:absolute after:right-0 after:-top-1  md:after:h-4   md:after:w-4 after:w-2.5 after:h-2.5   after:bg-amber-950  dark:after:bg-neutral-100  after:rounded-full after:transform after:translate-x-1/2 after:-translate-y-1/2"
        />
      </div>
    </div>
  );
}
