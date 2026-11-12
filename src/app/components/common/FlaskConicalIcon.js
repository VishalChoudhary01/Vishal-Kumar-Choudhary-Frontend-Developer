"use client";

import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";
import {
  LazyMotion,
  domMin,
  m,
  useAnimation,
  useReducedMotion,
} from "motion/react";

import { cn } from "@/app/lib/utils";

const FlaskConicalIcon = forwardRef(function FlaskConicalIcon(
  {
    onMouseEnter,
    onMouseLeave,
    className,
    size = 24,
    duration = 1,
    isAnimated = true,
    color,
    ...props
  },
  ref,
) {
  const controls = useAnimation();
  const reduced = useReducedMotion();
  const isControlled = useRef(false);

  useImperativeHandle(
    ref,
    () => {
      isControlled.current = true;

      return {
        startAnimation: () =>
          !isAnimated || reduced
            ? controls.start("normal")
            : controls.start("animate"),
        stopAnimation: () => controls.start("normal"),
      };
    },
    [controls, isAnimated, reduced],
  );

  const handleEnter = useCallback(
    (event) => {
      if (!isAnimated || reduced) return;

      if (!isControlled.current) {
        controls.start("animate");
      } else {
        onMouseEnter?.(event);
      }
    },
    [controls, isAnimated, onMouseEnter, reduced],
  );

  const handleLeave = useCallback(
    (event) => {
      if (!isControlled.current) {
        controls.start("normal");
      } else {
        onMouseLeave?.(event);
      }
    },
    [controls, onMouseLeave],
  );

  const flaskVariants = {
    normal: { rotate: 0 },
    animate: {
      rotate: [0, -10, 8, -5, 0],
      transition: { duration: 0.9 * duration, ease: "easeInOut" },
    },
  };

  const liquidVariants = {
    normal: { rotate: 0 },
    animate: {
      rotate: [0, 9, -7, 4, 0],
      transition: {
        duration: 0.9 * duration,
        ease: "easeInOut",
        delay: 0.05 * duration,
      },
    },
  };

  return (
    <LazyMotion features={domMin} strict>
      <m.div
        className={cn("inline-flex items-center justify-center", className)}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        {...props}
        style={{ color, ...props.style }}
      >
        <m.svg
          xmlns="http://www.w3.org/2000/svg"
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={controls}
          initial="normal"
          aria-hidden="true"
        >
          <m.g
            variants={flaskVariants}
            style={{
              transformBox: "view-box",
              originX: "12px",
              originY: "22px",
            }}
          >
            <path d="M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2" />
            <m.path
              d="M6.453 15h11.094"
              variants={liquidVariants}
              style={{
                transformBox: "view-box",
                originX: "12px",
                originY: "15px",
              }}
            />
            <path d="M8.5 2h7" />
          </m.g>
        </m.svg>
      </m.div>
    </LazyMotion>
  );
});

FlaskConicalIcon.displayName = "FlaskConicalIcon";

export { FlaskConicalIcon };
