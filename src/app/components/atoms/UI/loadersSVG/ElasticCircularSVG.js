"use client";

import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useEffect } from "react";

const ElasticCircularSVG = ({ size = 24, stroke = 3 }) => {
  // numeric stroke length
  const dash = useMotionValue(1);

  // convert number → svg dash string
  const dashArray = useTransform(dash, (v) => `${v} 200`);

  useEffect(() => {
    let isMounted = true;

    const loop = async () => {
      while (isMounted) {
        await animate(dash, 90, {
          type: "spring",
          stiffness: 180,
          damping: 22,
          mass: 0.6,
        });
        await animate(dash, 1, {
          type: "spring",
          stiffness: 140,
          damping: 24,
          mass: 0.6,
        });
      }
    };

    loop();

    return () => {
      isMounted = false;
    };
  }, [dash]);

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 50 50"
      className="text-current"
      animate={{ rotate: 360 }}
      transition={{
        repeat: Infinity,
        duration: 1.6,
        ease: "linear",
      }}
    >
      <motion.circle
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        style={{
          strokeDasharray: dashArray,
          strokeDashoffset: -40,
        }}
      />
    </motion.svg>
  );
};

export default ElasticCircularSVG;
