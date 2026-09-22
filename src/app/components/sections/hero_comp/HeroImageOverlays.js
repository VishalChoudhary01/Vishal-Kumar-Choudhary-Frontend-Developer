"use client";

import { motion } from "motion/react";

/* ==========================================================================
   TAKEOVER OVERLAY
   ========================================================================== */

export function TakeoverOverlay({ opacity }) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 bg-black"
      style={{
        opacity,
      }}
      aria-hidden="true"
    />
  );
}

/* ==========================================================================
   IMAGE META
   ========================================================================== */

export function ImageMeta({ opacity, y }) {
  return (
    <motion.figcaption
      className="absolute bottom-6 left-6 right-6 z-10 flex items-end justify-between"
      style={{
        opacity,
        y,
      }}
    >
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
    </motion.figcaption>
  );
}
