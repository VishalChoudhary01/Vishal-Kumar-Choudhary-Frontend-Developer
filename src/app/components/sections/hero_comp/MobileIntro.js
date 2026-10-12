"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import ProjectResumeButton from "@/app/components/common/ProjectResumeButton";
import { DESCRIPTION, CTA_TEXT, MOTION, } from "./heroMotionConfig";
import SectionEyebrow from "../../common/SectionEyebrow";

/* ==========================================================================
   MOBILE INTRO
   ========================================================================== */

export function MobileIntro() {
  return (
    <section className="bg-background px-[5vw] pb-16 pt-6">
      <MobileIntroItem
        {...MOTION.mobileIntroEntrance.heading}
      >
        <p className="text-center">
          <SectionEyebrow align="center" />
        </p>
      </MobileIntroItem>

      <MobileIntroItem
        {...MOTION.mobileIntroEntrance.description}
      >
        {/*
          mx-auto — the section is wider than the 320px measure, so
          without it the text box hangs off the left padding and the
          (already centered) lines sit left of the viewport center,
          while the eyebrow and CTA center on full width.
        */}
        <p className="type-body mx-auto mt-6 max-w-[320px] text-center text-text-tertiary">
          {DESCRIPTION}
        </p>
      </MobileIntroItem>

      <MobileIntroItem
        {...MOTION.mobileIntroEntrance.cta}
      >
        <div className="mt-6 flex justify-center">
          <ProjectResumeButton
            href="#projects"
            label={CTA_TEXT}
          />
        </div>
      </MobileIntroItem>
    </section>
  );
}

/* ==========================================================================
   MOBILE INTRO ITEM
   ========================================================================== */

function MobileIntroItem({
  children,
  delay,
  duration,
  y,
}) {
  const ref = useRef(null);

  const isInView = useInView(ref, {
    once: true,
    margin: "-60px 0px",
  });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        y,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              y: 0,
            }
          : {
              opacity: 0,
              y,
            }
      }
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
