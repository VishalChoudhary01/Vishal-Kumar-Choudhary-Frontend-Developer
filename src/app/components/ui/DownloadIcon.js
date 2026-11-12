"use client";

import { cn } from "@/app/lib/utils";
import {
  LazyMotion,
  domMin,
  m,
  useAnimation,
  useReducedMotion,
} from "motion/react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";

const DownloadIcon = forwardRef(function DownloadIcon(
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
          reduced || !isAnimated
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
    [controls, isAnimated, reduced, onMouseEnter],
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

  const arrowVariants = {
    normal: { y: 0, opacity: 1 },
    animate: {
      y: [0, 4, -4, 0],
      opacity: [1, 0, 0, 1],
      transition: {
        duration: 0.8 * duration,
        ease: "easeInOut",
        times: [0, 0.4, 0.5, 1],
      },
    },
  };

  const trayVariants = {
    normal: { y: 0 },
    animate: {
      y: [0, 0, 1, 0],
      transition: {
        duration: 0.8 * duration,
        ease: "easeInOut",
        times: [0, 0.75, 0.9, 1],
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
        >
          <m.g variants={arrowVariants}>
            <path d="M12 15V3" />
            <path d="m7 10 5 5 5-5" />
          </m.g>
          <m.path
            d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
            variants={trayVariants}
          />
        </m.svg>
      </m.div>
    </LazyMotion>
  );
});

DownloadIcon.displayName = "DownloadIcon";

export { DownloadIcon };
export default DownloadIcon;
