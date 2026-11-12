"use client";

import { cn } from "@/app/lib/utils";
import {
  LazyMotion,
  domMin,
  m,
  useAnimation,
  useReducedMotion,
} from "motion/react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

const DatabaseArrowDownIcon = forwardRef(function DatabaseArrowDownIcon(
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

  useImperativeHandle(ref, () => {
    isControlled.current = true;
    return {
      startAnimation: () =>
        !isAnimated || reduced
          ? controls.start("normal")
          : controls.start("animate"),
      stopAnimation: () => controls.start("normal"),
    };
  }, [controls, isAnimated, reduced]);

  const handleEnter = useCallback((event) => {
    if (!isControlled.current && isAnimated && !reduced) {
      controls.start("animate");
    }
    onMouseEnter?.(event);
  }, [controls, isAnimated, reduced, onMouseEnter]);

  const handleLeave = useCallback((event) => {
    if (!isControlled.current) controls.start("normal");
    onMouseLeave?.(event);
  }, [controls, onMouseLeave]);

  const recordVariants = {
    normal: { y: 0, opacity: 0 },
    animate: {
      y: [-11, 0, 0.6, 0],
      opacity: [0, 1, 1, 0, 0],
      transition: {
        y: {
          duration: 0.8 * duration,
          times: [0, 0.4, 0.5, 1],
          ease: ["easeIn", "easeOut", "easeInOut"],
        },
        opacity: {
          duration: 0.8 * duration,
          times: [0, 0.1, 0.4, 0.5, 1],
          ease: "easeInOut",
        },
      },
    },
  };

  const lidVariants = {
    normal: { y: 0 },
    animate: {
      y: [0, 0, 1, -0.3, 0],
      transition: { duration: 0.8 * duration, ease: "easeInOut", times: [0, 0.4, 0.58, 0.8, 1] },
    },
  };

  const ringVariants = {
    normal: { y: 0 },
    animate: {
      y: [0, 0, 1.4, -0.35, 0],
      transition: { duration: 0.8 * duration, ease: "easeInOut", times: [0, 0.45, 0.63, 0.84, 1] },
    },
  };

  const bodyVariants = {
    normal: { scaleY: 1 },
    animate: {
      scaleY: [1, 1, 0.96, 1.01, 1],
      transition: { duration: 0.8 * duration, ease: "easeInOut", times: [0, 0.4, 0.6, 0.82, 1] },
    },
  };

  const arrowVariants = {
    normal: { y: 0 },
    animate: {
      y: [0, 1, -0.3, 0],
      transition: { duration: 0.6 * duration, ease: "easeInOut", times: [0, 0.35, 0.7, 1] },
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
        >
          <m.ellipse cx="12" cy="5" rx="4" ry="1.3" variants={recordVariants} />
          <m.ellipse cx="12" cy="5" rx="9" ry="3" variants={lidVariants} />
          <m.g
            variants={bodyVariants}
            style={{ transformBox: "view-box", originX: "12px", originY: "22px" }}
          >
            <path d="M21 12.536V5" />
            <path d="M3 5V19A9 3 0 0 0 13.318 21.968" />
          </m.g>
          <m.path d="M3 12A9 3 0 0 0 15.182 14.806" variants={ringVariants} />
          <m.g variants={arrowVariants}>
            <path d="m16 19 3 3 3-3" />
            <path d="M19 16v6" />
          </m.g>
        </m.svg>
      </m.div>
    </LazyMotion>
  );
});

DatabaseArrowDownIcon.displayName = "DatabaseArrowDownIcon";

export default DatabaseArrowDownIcon;
