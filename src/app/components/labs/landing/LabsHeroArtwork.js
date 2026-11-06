"use client";

import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

const connections = [
  "M91 252 C166 116 288 88 386 160",
  "M112 338 C195 438 345 438 468 314",
  "M170 144 C250 226 356 266 490 214",
  "M145 374 C204 278 302 222 418 118",
];

const nodes = [
  [91, 252, 7],
  [112, 338, 5],
  [145, 374, 6],
  [170, 144, 5],
  [250, 226, 8],
  [288, 88, 5],
  [386, 160, 7],
  [418, 118, 5],
  [468, 314, 7],
  [490, 214, 5],
  [345, 438, 5],
  [204, 278, 5],
];

export default function LabsHeroArtwork() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.figure
      aria-hidden="true"
      initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reducedMotion
          ? { duration: 0 }
          : { duration: 0.85, delay: 0.28, ease: [0.16, 1, 0.3, 1] }
      }
      className="relative mx-auto w-full max-w-[42rem]"
    >
      <div className="relative aspect-[1.12/1] overflow-hidden border border-border-subtle bg-surface-1">
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,var(--brand-soft),transparent_66%)] opacity-70" />
        <div className="absolute left-1/2 top-1/2 h-[76%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/15" />
        <div className="absolute left-1/2 top-1/2 h-[58%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-brand/30" />
        <div className="absolute left-1/2 top-1/2 h-[38%] aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand/20" />

        <svg
          viewBox="0 0 580 520"
          fill="none"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {connections.map((path, index) => (
            <motion.path
              key={path}
              d={path}
              stroke="var(--brand)"
              strokeWidth="1.2"
              strokeOpacity="0.58"
              strokeDasharray="5 8"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.58 }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.9,
                      delay: 0.48 + index * 0.1,
                      ease: [0.16, 1, 0.3, 1],
                    }
              }
            />
          ))}
          {nodes.map(([cx, cy, radius], index) => (
            <motion.circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={radius}
              fill="var(--brand)"
              initial={reducedMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: index % 3 === 0 ? 0.95 : 0.62 }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : {
                      type: "spring",
                      stiffness: 240,
                      damping: 20,
                      delay: 0.6 + index * 0.035,
                    }
              }
            />
          ))}
          <circle cx="290" cy="258" r="58" fill="var(--background)" fillOpacity="0.9" stroke="var(--brand)" strokeOpacity="0.42" />
          <path d="M274 242L258 258L274 274" stroke="var(--brand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M306 242L322 258L306 274" stroke="var(--brand)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M297 236L283 280" stroke="var(--text-primary)" strokeOpacity="0.8" strokeWidth="2.2" strokeLinecap="round" />
        </svg>

        <span className="absolute left-5 top-5 font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted sm:left-7 sm:top-7">
          Interaction field / 01
        </span>
        <span className="absolute bottom-5 left-5 font-mono text-[8px] uppercase tracking-[0.18em] text-text-muted sm:bottom-7 sm:left-7">
          Explore · Build · Refine
        </span>
        <span className="absolute right-5 top-5 font-mono text-[8px] uppercase tracking-[0.18em] text-brand sm:right-7 sm:top-7">
          VKr / Labs
        </span>
        <span className="absolute bottom-5 right-5 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted sm:bottom-7 sm:right-7">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" />
          Creative systems
        </span>
      </div>
      <div className="absolute -bottom-3 -right-2 h-16 w-16 border-b border-r border-brand/40 sm:-bottom-4 sm:-right-4 sm:h-20 sm:w-20" />
    </motion.figure>
  );
}
