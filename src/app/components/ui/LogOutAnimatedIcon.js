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

const LogOutAnimatedIcon = forwardRef(function LogOutAnimatedIcon(
  {
    onMouseEnter,
    onMouseLeave,
    className,
    size = 16,
    duration = 0.72,
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

  const arrowVariants = {
    normal: { x: 0 },
    animate: {
      x: [-0.5, -2.2, -0.5, 0],
      transition: { duration, ease: "easeInOut", times: [0, 0.42, 0.76, 1] },
    },
  };

  const doorVariants = {
    normal: { x: 0 },
    animate: {
      x: [0, -0.4, 0],
      transition: { duration, ease: "easeInOut", times: [0, 0.45, 1] },
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
          <m.g variants={doorVariants}>
            <path d="M13 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
            <path d="M13 4v16" />
          </m.g>
          <m.g variants={arrowVariants}>
            <path d="M3 12h11" />
            <path d="m9 6-6 6 6 6" />
          </m.g>
        </m.svg>
      </m.div>
    </LazyMotion>
  );
});

LogOutAnimatedIcon.displayName = "LogOutAnimatedIcon";

export default LogOutAnimatedIcon;
