"use client";

import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

const orbitTransition = { duration: 76, ease: "linear", repeat: Infinity };
const driftTransition = { duration: 92, ease: "linear", repeat: Infinity };
const dashTransition = { duration: 68, ease: "linear", repeat: Infinity };

export default function LabsHeroArtwork() {
  const reducedMotion = useReducedMotion();

  return (
    <motion.figure
      aria-hidden="true"
      initial={false}
      className="relative isolate mx-auto aspect-[1.08/1] min-h-[280px] w-full max-w-[39rem] overflow-visible"
    >
      <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(ellipse_at_50%_48%,var(--brand-soft),transparent_70%)] opacity-80" />
      <div className="pointer-events-none absolute left-[22%] top-[20%] h-[18%] w-[18%] rounded-full bg-brand/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[16%] right-[14%] h-[23%] w-[23%] rounded-full bg-brand/10 blur-3xl" />

      <svg viewBox="0 0 720 620" fill="none" className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="labs-flow-core" cx="50%" cy="48%" r="58%">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.18" />
            <stop offset="62%" stopColor="var(--brand-soft)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--brand-soft)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="labs-flow-line" x1="115" y1="150" x2="610" y2="470" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--brand)" stopOpacity="0.08" />
            <stop offset="0.48" stopColor="var(--brand)" stopOpacity="0.52" />
            <stop offset="1" stopColor="var(--brand)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="labs-flow-crystal" x1="290" y1="155" x2="455" y2="420" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--brand)" stopOpacity="0.24" />
            <stop offset="1" stopColor="var(--brand-soft)" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        <ellipse cx="360" cy="310" rx="268" ry="214" stroke="var(--brand)" strokeOpacity="0.10" strokeWidth="1" />
        <ellipse cx="360" cy="310" rx="214" ry="162" transform="rotate(-24 360 310)" stroke="var(--brand)" strokeOpacity="0.14" strokeWidth="1" />
        <ellipse cx="360" cy="310" rx="160" ry="112" transform="rotate(26 360 310)" stroke="var(--brand)" strokeOpacity="0.12" strokeWidth="1" />

        <path d="M86 362C140 190 259 116 374 154C486 190 575 327 639 244" stroke="var(--brand)" strokeOpacity="0.22" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M96 285C181 431 302 493 426 436C537 386 564 234 650 294" stroke="var(--brand)" strokeOpacity="0.18" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M142 462C218 362 247 232 362 218C463 205 514 306 580 368" stroke="var(--brand)" strokeOpacity="0.12" strokeWidth="1.1" strokeLinecap="round" />

        <motion.path d="M86 362C140 190 259 116 374 154C486 190 575 327 639 244" stroke="url(#labs-flow-line)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2 15" animate={reducedMotion ? { strokeDashoffset: 0 } : { strokeDashoffset: -520 }} transition={reducedMotion ? { duration: 0 } : dashTransition} />
        <motion.path d="M96 285C181 431 302 493 426 436C537 386 564 234 650 294" stroke="var(--brand)" strokeOpacity="0.38" strokeWidth="1.7" strokeLinecap="round" strokeDasharray="1 20" animate={reducedMotion ? { strokeDashoffset: 0 } : { strokeDashoffset: 460 }} transition={reducedMotion ? { duration: 0 } : driftTransition} />

        <circle cx="360" cy="310" r="136" fill="url(#labs-flow-core)" />
        <path d="M360 186C411 222 450 272 438 331C427 386 378 428 325 407C276 388 251 331 273 276C290 232 323 205 360 186Z" fill="url(#labs-flow-crystal)" stroke="var(--brand)" strokeOpacity="0.32" strokeWidth="1.2" />
        <path d="M360 222C394 249 414 280 407 319C400 355 372 384 339 371C307 359 291 324 302 292C311 265 334 239 360 222Z" stroke="var(--brand)" strokeOpacity="0.42" strokeWidth="1.2" />
        <path d="M320 310C341 286 379 286 400 310C379 333 341 333 320 310Z" fill="var(--brand)" fillOpacity="0.12" stroke="var(--brand)" strokeOpacity="0.48" strokeWidth="1.2" />

        <circle cx="150" cy="230" r="4" fill="var(--brand)" fillOpacity="0.56" />
        <circle cx="560" cy="184" r="5" fill="var(--brand)" fillOpacity="0.54" />
        <circle cx="585" cy="438" r="4" fill="var(--brand)" fillOpacity="0.5" />
        <circle cx="207" cy="474" r="3.5" fill="var(--brand)" fillOpacity="0.42" />

        <motion.circle
          cx="104" cy="350" r="7" fill="var(--brand)" fillOpacity="0.9"
          animate={reducedMotion ? { cx: 104, cy: 350 } : { cx: [104, 228, 478, 610, 510, 260, 104], cy: [350, 182, 160, 302, 448, 492, 350] }}
          transition={reducedMotion ? { duration: 0 } : orbitTransition}
        />
        <motion.circle
          cx="530" cy="180" r="3.5" fill="var(--text-primary)" fillOpacity="0.72"
          animate={reducedMotion ? { cx: 530, cy: 180 } : { cx: [530, 446, 250, 128, 282, 530], cy: [180, 110, 202, 408, 520, 180] }}
          transition={reducedMotion ? { duration: 0 } : driftTransition}
        />
      </svg>
    </motion.figure>
  );
}
