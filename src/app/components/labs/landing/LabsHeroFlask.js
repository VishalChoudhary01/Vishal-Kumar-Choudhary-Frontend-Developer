"use client";

import { motion } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";

const flaskSway = {
  rotate: [-1.6, 1.6, -1.6],
  y: [0, -1.5, 0],
};

const flaskSwayTransition = {
  duration: 8,
  ease: "easeInOut",
  repeat: Infinity,
};

const liquidFloat = {
  y: [0, -1.25, 0],
};

const liquidFloatTransition = {
  duration: 4.4,
  ease: "easeInOut",
  repeat: Infinity,
};

const flaskBodyPath =
  "M104 26H156V126L215 282C227 314 207 336 177 336H83C53 336 33 314 45 282L104 126V26Z";

export default function LabsHeroFlask() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      data-labs-hero-flask=""
      aria-hidden="true"
      className="pointer-events-none absolute -left-4 top-4 z-0 h-[11rem] opacity-[0.09] dark:opacity-[0.12] sm:-left-6 sm:top-5 sm:h-[14rem] sm:opacity-[0.1] sm:dark:opacity-[0.14] lg:-left-8 lg:top-6 lg:h-[clamp(20rem,25vw,25rem)] lg:opacity-[0.12] lg:dark:opacity-[0.16] xl:-left-10"
    >
      <svg
        viewBox="0 0 260 360"
        fill="none"
        className="h-full w-auto overflow-visible text-[#0B746A] dark:text-[#9AF3E9]"
      >
        <defs>
          <linearGradient
            id="labs-flask-glass"
            x1="48"
            y1="70"
            x2="218"
            y2="326"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0.055" />
            <stop offset="0.38" stopColor="currentColor" stopOpacity="0.14" />
            <stop offset="0.72" stopColor="currentColor" stopOpacity="0.085" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.035" />
          </linearGradient>

          <linearGradient
            id="labs-flask-inner-glass"
            x1="78"
            y1="132"
            x2="192"
            y2="320"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0.025" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0.09" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.045" />
          </linearGradient>

          <linearGradient
            id="labs-flask-liquid"
            x1="130"
            y1="238"
            x2="130"
            y2="336"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0.16" />
            <stop offset="0.42" stopColor="currentColor" stopOpacity="0.3" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.48" />
          </linearGradient>

          <linearGradient
            id="labs-flask-rim"
            x1="94"
            y1="22"
            x2="166"
            y2="34"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="currentColor" stopOpacity="0.9" />
            <stop offset="0.52" stopColor="currentColor" stopOpacity="0.42" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.82" />
          </linearGradient>

          <clipPath id="labs-flask-body-clip">
            <path d={flaskBodyPath} />
          </clipPath>
        </defs>

        <motion.g
          animate={prefersReducedMotion ? { rotate: 0, y: 0 } : flaskSway}
          transition={prefersReducedMotion ? { duration: 0 } : flaskSwayTransition}
          style={{
            transformBox: "view-box",
            transformOrigin: "130px 332px",
          }}
        >
          {/* Transparent body with softly shaded glass depth. */}
          <path
            d={flaskBodyPath}
            fill="url(#labs-flask-glass)"
            stroke="currentColor"
            strokeOpacity="0.92"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />

          <path
            d="M104 38H156V126L207 280C218 307 202 326 176 326H84C58 326 42 307 53 280L104 126V38Z"
            fill="url(#labs-flask-inner-glass)"
            opacity="0.72"
          />

          {/* Thick glass lip and double neck edge. */}
          <path
            d="M91 24.5C111 22.5 149 22.5 169 24.5"
            stroke="url(#labs-flask-rim)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M96 30H164M104 39H156"
            stroke="currentColor"
            strokeOpacity="0.9"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M101 27.5H159"
            stroke="currentColor"
            strokeOpacity="0.28"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Neck-to-body refraction line. */}
          <path
            d="M103 128C119 132 141 132 157 128"
            stroke="currentColor"
            strokeOpacity="0.62"
            strokeWidth="1.5"
          />

          <g clipPath="url(#labs-flask-body-clip)">
            {/* Liquid and meniscus. */}
            <motion.g
              animate={prefersReducedMotion ? { y: 0 } : liquidFloat}
              transition={prefersReducedMotion ? { duration: 0 } : liquidFloatTransition}
            >
              <path
                d="M34 250C63 237 88 257 116 251C148 244 178 242 226 255L235 352H25L34 250Z"
                fill="url(#labs-flask-liquid)"
              />
              <path
                d="M38 251C67 239 91 259 119 253C150 246 180 244 222 256"
                stroke="currentColor"
                strokeOpacity="0.9"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M53 259C81 252 96 267 123 261"
                stroke="currentColor"
                strokeOpacity="0.34"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </motion.g>

            {/* Inner glass reflections. */}
            <path
              d="M74 279C85 244 95 217 106 187"
              stroke="currentColor"
              strokeOpacity="0.34"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M184 190C194 219 204 249 211 278"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="1.5"
              strokeLinecap="round"
            />

            {/* Small suspended bubbles, not a second particle system. */}
            <g stroke="currentColor" strokeLinecap="round">
              <circle cx="91" cy="226" r="3.1" fill="url(#labs-flask-inner-glass)" strokeOpacity="0.72" strokeWidth="1" />
              <circle cx="157" cy="211" r="2.4" fill="url(#labs-flask-inner-glass)" strokeOpacity="0.62" strokeWidth="0.9" />
              <circle cx="176" cy="238" r="3.6" fill="url(#labs-flask-inner-glass)" strokeOpacity="0.68" strokeWidth="1" />
              <circle cx="113" cy="190" r="1.9" fill="url(#labs-flask-inner-glass)" strokeOpacity="0.62" strokeWidth="0.8" />
              <circle cx="137" cy="244" r="1.6" fill="url(#labs-flask-inner-glass)" strokeOpacity="0.74" strokeWidth="0.8" />
              <circle cx="72" cy="286" r="2.2" fill="url(#labs-flask-inner-glass)" strokeOpacity="0.58" strokeWidth="0.8" />
              <circle cx="190" cy="296" r="2" fill="url(#labs-flask-inner-glass)" strokeOpacity="0.58" strokeWidth="0.8" />
            </g>
          </g>

          {/* Long specular edges make the vessel read as glass rather than an outline. */}
          <path
            d="M96 143C83 178 69 221 54 270C49 287 54 304 68 315"
            stroke="currentColor"
            strokeOpacity="0.84"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <path
            d="M100 145C87 181 74 222 61 267"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M164 145C178 181 193 226 207 270C212 288 206 305 192 315"
            stroke="currentColor"
            strokeOpacity="0.48"
            strokeWidth="1.7"
            strokeLinecap="round"
          />

          {/* Neck highlights and thicker glass base refraction. */}
          <path
            d="M111 48V119"
            stroke="currentColor"
            strokeOpacity="0.72"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M149 49V119"
            stroke="currentColor"
            strokeOpacity="0.34"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <path
            d="M69 318C91 329 169 329 191 318"
            stroke="currentColor"
            strokeOpacity="0.76"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M82 322C99 328 161 328 178 322"
            stroke="currentColor"
            strokeOpacity="0.3"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </motion.g>
      </svg>
    </div>
  );
}
