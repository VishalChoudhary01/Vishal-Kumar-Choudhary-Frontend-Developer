"use client";

import { useEffect, useRef } from "react";
import { LogInIcon } from "@animateicons/react/lucide/log-in-icon";
import { UserRoundPlusIcon } from "@animateicons/react/lucide/user-round-plus-icon";
import { MailCheckIcon } from "@animateicons/react/lucide/mail-check-icon";
import { EyeIcon } from "@animateicons/react/lucide/eye-icon";
import { FlaskConicalIcon } from "@/app/components/common/FlaskConicalIcon";
import ProjectResumeButton from "@/app/components/common/ProjectResumeButton";
import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import LabsHeroArtwork from "./landing/LabsHeroArtwork";
import LabsHeroFlask from "./landing/LabsHeroFlask";
import { getLabsHeroActions } from "@/app/lib/labs/hero-cta.mjs";

const heroContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.04,
      staggerChildren: 0.085,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 1, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.56,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

function AnimatedLabStat({ value, label }) {
  const statRef = useRef(null);
  const isInView = useInView(statRef, { once: true, amount: 0.6 });
  const prefersReducedMotion = useReducedMotion();
  const count = useMotionValue(value);
  const displayValue = useTransform(count, (latest) =>
    String(Math.min(value, Math.max(0, Math.round(latest)))).padStart(2, "0")
  );

  useEffect(() => {
    if (!isInView) return undefined;

    if (prefersReducedMotion || value <= 0) {
      count.set(value);
      return undefined;
    }

    count.set(0);
    const controls = animate(count, value, {
      duration: 0.95,
      ease: [0.16, 1, 0.3, 1],
    });

    return () => controls.stop();
  }, [count, isInView, prefersReducedMotion, value]);

  return (
    <div ref={statRef} className="min-w-0">
      <p
        role="img"
        aria-label={`${value} ${label.toLowerCase()}`}
        className="font-display text-[clamp(2rem,3.5vw,3rem)] leading-none tracking-[-0.055em] text-text-primary tabular-nums"
      >
        <motion.span aria-hidden="true">{displayValue}</motion.span>
      </p>
      <p className="mt-2 max-w-[11rem] font-mono text-[9px] uppercase leading-4 tracking-[0.1em] text-text-muted sm:text-[10px]">
        {label}
      </p>
    </div>
  );
}

function HeroActions({ authState, featuredHref }) {
  const actions = getLabsHeroActions({ authState, featuredHref });
  const iconsByLabel = {
    "Create account": UserRoundPlusIcon,
    "Sign in": LogInIcon,
    "Verify email": MailCheckIcon,
    "Explore experiments": FlaskConicalIcon,
    "Explore featured experiment": EyeIcon,
  };

  return actions.map((action) => (
    <ProjectResumeButton
      key={action.label}
      href={action.href}
      label={action.label}
      icon={iconsByLabel[action.label] || EyeIcon}
      animateIconOnHover
      size="sm"
      surface={action.variant === "primary" ? "brand" : "glass"}
      className="pointer-events-auto"
    />
  ));
}

export default function LabsIntroduction({
  experimentCount = 0,
  categoryCount = 0,
  authState = "unknown",
  featuredHref = null,
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div data-labs-hero-root="" className="relative isolate w-full overflow-hidden bg-[radial-gradient(ellipse_120%_85%_at_100%_82%,rgba(214,222,219,0.34)_0%,rgba(226,232,229,0.18)_40%,rgba(240,243,241,0.05)_72%,transparent_100%)] dark:bg-[radial-gradient(ellipse_125%_90%_at_100%_82%,rgba(0,1,1,0.99)_0%,rgba(0,2,2,0.82)_34%,rgba(0,2,2,0.42)_60%,rgba(0,2,2,0.10)_82%,transparent_100%)] lg:bg-[radial-gradient(ellipse_105%_140%_at_100%_50%,rgba(214,222,219,0.32)_0%,rgba(226,232,229,0.17)_42%,rgba(240,243,241,0.05)_72%,transparent_100%)] lg:dark:bg-[radial-gradient(ellipse_105%_140%_at_100%_50%,rgba(0,1,1,0.995)_0%,rgba(0,2,2,0.84)_38%,rgba(0,2,2,0.42)_68%,rgba(0,2,2,0.10)_88%,transparent_100%)]">
      <motion.section
      aria-labelledby="labs-heading"
      initial={prefersReducedMotion ? false : "hidden"}
      animate="visible"
      variants={heroContainerVariants}
      className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-center px-4 pb-9 pt-[calc(60px+1.75rem)] sm:px-8 sm:pb-12 sm:pt-[calc(60px+2.5rem)] lg:min-h-[calc(100svh-78px)] lg:px-16 lg:pb-8 lg:pt-[calc(78px+2.25rem)] xl:px-20"
    >
      <div className="relative z-10 grid grid-cols-1 items-center gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-8 xl:gap-12">
        <div
          data-labs-hero-glass-panel=""
          className="relative isolate z-10 flex min-w-0 flex-col items-start overflow-hidden rounded-[1.75rem] border border-[#0B746A]/20 bg-[linear-gradient(135deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.48)_58%,rgba(11,116,106,0.10)_100%)] px-4 py-5 shadow-[0_18px_70px_rgba(22,52,47,0.10)] backdrop-blur-2xl backdrop-saturate-150 ring-1 ring-white/35 sm:rounded-[2rem] sm:px-6 sm:py-7 lg:px-7 lg:py-8 dark:border-[#9AF3E9]/20 dark:bg-[linear-gradient(135deg,rgba(16,29,27,0.92)_0%,rgba(8,17,16,0.82)_58%,rgba(117,220,209,0.10)_100%)] dark:shadow-[0_24px_90px_rgba(0,0,0,0.36)] dark:ring-white/[0.05]"
        >
          <LabsHeroFlask />
          <div className="relative z-10 flex min-w-0 w-full flex-col items-start">
          <motion.p
            variants={heroItemVariants}
            className="mb-4 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-brand sm:mb-5 sm:text-[10px]"
          >
            Frontend experiments / Open collection
          </motion.p>

          <motion.h1
            id="labs-heading"
            variants={heroItemVariants}
            className="max-w-[11ch] font-display text-[clamp(2.55rem,8vw,3.25rem)] font-normal leading-[0.92] tracking-[-0.06em] text-text-primary sm:text-[clamp(3.2rem,6.2vw,6.35rem)] sm:leading-[0.89] sm:tracking-[-0.065em]"
          >
            A space for
            <span className="block text-brand">experiments.</span>
          </motion.h1>

          <motion.p
            variants={heroItemVariants}
            className="mt-4 max-w-[31rem] text-[13px] leading-6 text-text-secondary sm:mt-6 sm:text-[15px] sm:leading-7"
          >
            Published frontend experiments by Vishal Kumar Choudhary, a
            Frontend Developer, exploring motion and animation, CSS,
            interface interactions, and creative coding. Each detail page
            explains the experiment and lists its category and technologies;
            preview media appears when available.
          </motion.p>

          <motion.div
            variants={heroItemVariants}
            className="mt-6 flex flex-wrap items-center gap-3"
          >
            <HeroActions authState={authState} featuredHref={featuredHref} />
          </motion.div>

          <motion.div
            variants={heroItemVariants}
            className="mt-7 grid w-full max-w-[25rem] grid-cols-2 gap-4 border-t border-border-subtle pt-4 sm:mt-9 sm:gap-8"
          >
            <AnimatedLabStat value={experimentCount} label="Published experiments" />
            <AnimatedLabStat value={categoryCount} label="Active disciplines" />
          </motion.div>
          </div>
        </div>

        <div className="relative min-w-0 w-full lg:justify-self-stretch">
          <LabsHeroArtwork />
        </div>
      </div>

      </motion.section>
    </div>
  );
}
