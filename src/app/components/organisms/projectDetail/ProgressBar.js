"use client";
import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef, useState, useEffect } from "react";
import { DigitSlideCounter } from "@/app/components/atoms/animation";

const ProgressBar = ({ score, label, colorClass, showScore = true }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [showCounter, setShowCounter] = useState(false);

  // Delay showing the counter until progress bar animation starts
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setShowCounter(true);
      }, 200); // Delay of 200ms after progress bar starts
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  const getScoreColorClasses = (scoreValue) => {
    if (scoreValue >= 90)
      return {
        bar: "bg-linear-to-r from-emerald-500 to-emerald-600 dark:from-emerald-700/70 dark:to-emerald-300/85",
        glow: "dark:bg-emerald-200/75 bg-emerald-400",
        text: "text-emerald-600 dark:text-emerald-300",
      };
    if (scoreValue >= 50)
      return {
        bar: "dark:from-amber-600/70 dark:to-yellow-300/95 bg-linear-to-r from-amber-500 to-yellow-600",
        glow: "dark:bg-amber-400/75 bg-amber-400",
        text: "text-yellow-600 dark:text-yellow-300/95",
      };
    return {
      bar: "bg-linear-to-r from-red-500 to-red-600 dark:from-red-600/70 dark:to-red-400/85",
      glow: "bg-red-900",
      text: "text-red-500 dark:text-red-400",
    };
  };

  const colorClasses = colorClass
    ? {
        bar: colorClass.bar || colorClass,
        glow: colorClass.glow || colorClass,
        text: colorClass.text || colorClass,
      }
    : getScoreColorClasses(score);

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-para1 font-roboto dark:text-darkPara1">
          {label}
        </span>
        {showScore && showCounter && (
          <div className={colorClasses.text}>
            <DigitSlideCounter
              value={score}
              duration={1200}
              className="text-xs sm:text-sm font-medium tabular-nums "
              textColorClass=""
            />
          </div>
        )}
        {showScore && !showCounter && (
          <div
            className={`text-xs sm:text-sm font-medium tabular-nums ${colorClasses.text} opacity-0`}
          >
            0
          </div>
        )}
      </div>

      <div className="relative md:h-1 h-[3px] bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full absolute left-0 top-0 ${colorClasses.bar}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ amount: 0.5 }}
          transition={{
            duration: 1.2,
            ease: "easeOut",
            delay: 0.2,
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
