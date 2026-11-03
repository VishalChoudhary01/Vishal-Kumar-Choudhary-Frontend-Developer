"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
} from "motion/react";
import useReducedMotion from "@/app/hooks/useReducedMotion";

const LINES = [
  ["Motion", "gives"],
  ["interfaces", "a"],
  ["sense", "of", "life."],
];

function RevealWord({
  word,
  index,
  total,
  progress,
  spanFactor,
  prefersReducedMotion,
}) {
  const start = (index / total) * 0.68 * spanFactor;
  const end = Math.min(start + 0.25 * spanFactor, 1);

  const opacity = useTransform(progress, [start, end], [0.2, 1]);
  const y = useTransform(progress, [start, end], [18, 0]);

  if (prefersReducedMotion) {
    return <span className="inline-block text-text-primary">{word}</span>;
  }

  return (
    <motion.span className="inline-block" style={{ opacity, y }}>
      {word}
    </motion.span>
  );
}

export default function ScrollDrivenTextReveal({ settings = {} }) {
  const sceneRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const revealSpan = Math.min(
    100,
    Math.max(55, Number(settings.pace) || 80)
  );
  const spanFactor = revealSpan / 100;
  const showProgress = settings.showProgress !== false;

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start end", "end start"],
  });

  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const totalWords = LINES.reduce(
    (count, line) => count + line.length,
    0
  );

  let wordIndex = 0;

  return (
    <section
      ref={sceneRef}
      aria-label="Scroll-driven typography experiment"
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-background px-5 py-8 sm:px-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,var(--brand-soft),transparent_66%)] opacity-60"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 top-8 h-px bg-border-subtle sm:inset-x-12 sm:top-10"
      />

      <div className="pointer-events-none absolute left-7 top-7 z-10 font-mono text-[9px] uppercase tracking-[0.2em] text-text-muted sm:left-12 sm:top-12">
        Motion study / 02
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        <p className="mb-6 text-center font-mono text-[9px] uppercase tracking-[0.22em] text-brand sm:mb-8">
          A study in scroll and type
        </p>

        <div
          aria-label="Motion gives interfaces a sense of life"
          className="flex max-w-4xl flex-col items-center gap-y-1 text-center font-display text-[clamp(2.75rem,7.5vw,6.5rem)] font-normal leading-[0.94] tracking-[-0.055em] text-text-muted sm:gap-y-2"
        >
          {LINES.map((line, lineIndex) => (
            <div
              key={lineIndex}
              className="flex flex-wrap justify-center gap-x-[0.22em]"
            >
              {line.map((word) => {
                const index = wordIndex;
                wordIndex += 1;

                return (
                  <RevealWord
                    key={word}
                    word={word}
                    index={index}
                    total={totalWords}
                    progress={scrollYProgress}
                    spanFactor={spanFactor}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {showProgress && !prefersReducedMotion ? (
        <div className="absolute inset-x-7 bottom-8 z-10 sm:inset-x-12 sm:bottom-12">
          <div className="mb-2 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted">
            <span>Scroll progress</span>
            <span>01 / 03</span>
          </div>
          <div className="h-px w-full overflow-hidden bg-border">
            <motion.div
              aria-hidden="true"
              className="h-full w-full origin-left bg-brand"
              style={{ scaleX: progressScale }}
            />
          </div>
        </div>
      ) : (
        <p className="absolute bottom-8 z-10 px-6 text-center font-mono text-[8px] uppercase tracking-[0.16em] text-text-muted">
          {prefersReducedMotion
            ? "Reduced motion — full text shown"
            : "Scroll to reveal"}
        </p>
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-24 w-px -translate-x-1/2 bg-gradient-to-t from-transparent to-brand/20"
      />
    </section>
  );
}
