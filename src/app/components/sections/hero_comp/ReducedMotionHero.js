"use client";

import Image from "next/image";

import ProjectResumeButton from "@/app/components/common/ProjectResumeButton";
import SectionEyebrow from "../../common/SectionEyebrow";

import { NAME, DESCRIPTION, CTA_TEXT, } from "./heroMotionConfig";

/* ==========================================================================
   REDUCED MOTION
   ========================================================================== */

export function ReducedMotionHero() {
  return (
    <section
      id="hero"
      className="min-h-screen bg-background px-5 py-28 sm:px-8 lg:px-12"
      aria-labelledby="hero-title"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
        <p className="type-metadata mb-2 text-[clamp(0.95rem,0.6vw+0.8rem,1.1rem)] tracking-[0.12em] text-text-secondary">
          {NAME}
        </p>

        <h1
          id="hero-title"
          className="max-w-full text-[clamp(2.2rem,7vw,7rem)] font-display leading-[0.94] tracking-[-0.045em] text-text-secondary"
        >
          <span className="block">
            FRONTEND
          </span>

          <span className="block">
            DEVELOPER
          </span>
        </h1>

        <p
          className="mt-4"
          aria-hidden="true"
        >
          <SectionEyebrow align="center" />
        </p>

        <p className="type-body mt-4 max-w-2xl text-text-tertiary">
          {DESCRIPTION}
        </p>

        <div className="mt-5 flex justify-center">
          <ProjectResumeButton
            href="#projects"
            label={CTA_TEXT}
          />
        </div>

        <figure
          className="relative mt-16 aspect-[4/5] w-full max-w-[500px] overflow-hidden bg-surface-2"
          aria-label="Vishal working at a laptop"
        >
          <Image
            src="/images/vishal-kumar-choudhary-work.webp"
            alt="Vishal working at a laptop — frontend developer focused on interactive interfaces"
            width={500}
            height={625}
            priority
            sizes="(max-width: 640px) 100vw, 500px"
            className="h-full w-full object-cover"
          />

          <figcaption className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <p className="type-metadata text-white">
                Working / Building
              </p>

              <p className="mt-1 type-caption text-white/70">
                Design · Interaction · Frontend
              </p>
            </div>

            <span
              className="type-caption text-white/70"
              aria-hidden="true"
            >
              02
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}