"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, MessageCircle, Sparkles, X } from "lucide-react";

const SECTION_MESSAGES = {
  hero: {
    eyebrow: "YOUR PORTFOLIO COMPANION",
    title: "Hey, welcome!",
    message: "I'm your little guide. Want to explore what Vishal builds?",
    action: "Explore projects",
    href: "#projects",
  },
  about: {
    eyebrow: "A LITTLE ABOUT VISHAL",
    title: "Curious by nature.",
    message: "Vishal enjoys turning thoughtful ideas into polished, interactive interfaces.",
    action: "See the projects",
    href: "#projects",
  },
  education: {
    eyebrow: "THE FOUNDATIONS",
    title: "Always learning.",
    message: "Good products come from strong fundamentals and a willingness to keep growing.",
    action: "Explore his skills",
    href: "#skills",
  },
  skills: {
    eyebrow: "TOOLS OF THE TRADE",
    title: "Built with intent.",
    message: "React, Next.js, JavaScript, Tailwind CSS, and motion—chosen to solve real UI problems.",
    action: "See the experience",
    href: "#experience",
  },
  experience: {
    eyebrow: "REAL-WORLD WORK",
    title: "Ideas in action.",
    message: "Take a look at the teams, products, and interface work that shaped his journey.",
    action: "View projects",
    href: "#projects",
  },
  projects: {
    eyebrow: "MADE TO BE EXPLORED",
    title: "The fun part!",
    message: "Explore the projects, interactions, and details. Each one has a story behind it.",
    action: "Let's connect",
    href: "#contact",
  },
  contact: {
    eyebrow: "YOUR TURN",
    title: "Have an idea?",
    message: "If you have a project or opportunity in mind, Vishal would love to hear from you.",
    action: "Go to contact",
    href: "#contact",
  },
};

const SECTION_IDS = Object.keys(SECTION_MESSAGES).filter((id) => id !== "hero");

function MascotAvatar({ reducedMotion, isOpen }) {
  return (
    <motion.span
      className="relative flex h-[58px] w-[58px] shrink-0 items-center justify-center"
      animate={reducedMotion || isOpen ? undefined : { y: [0, -3, 0] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 72 72" className="h-full w-full" fill="none">
        <defs>
          <linearGradient id="mascot-shell" x1="12" y1="8" x2="59" y2="66" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFCF5" />
            <stop offset="1" stopColor="#D7D2C8" />
          </linearGradient>
          <linearGradient id="mascot-visor" x1="18" y1="18" x2="56" y2="53" gradientUnits="userSpaceOnUse">
            <stop stopColor="#172521" />
            <stop offset="1" stopColor="#080D0C" />
          </linearGradient>
        </defs>
        <path d="M34 7 44 3 47 17 37 19Z" fill="#176B68" stroke="#E6A45D" strokeWidth="2" strokeLinejoin="round" />
        <path d="M22 15C22 10 27 7 32 8L45 11C56 13 63 22 63 33V45C63 56 54 64 43 64H28C17 64 9 56 9 45V34C9 25 14 18 22 15Z" fill="url(#mascot-shell)" stroke="#A8A79E" strokeWidth="1.4" />
        <path d="M18 26C18 20 23 16 30 16H43C52 16 57 22 57 31V43C57 50 51 55 43 55H30C22 55 17 50 17 43V31Z" fill="url(#mascot-visor)" stroke="#2A4843" strokeWidth="1.5" />
        <path d="M24 34C26 29 32 29 34 34" stroke="#72D9D0" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M41 34C43 29 49 29 51 34" stroke="#72D9D0" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M33 43C36 46 40 46 43 43" stroke="#E6A45D" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M10 30C4 30 4 40 10 41" stroke="#176B68" strokeWidth="4" strokeLinecap="round" />
        <path d="M62 30C68 30 68 40 62 41" stroke="#176B68" strokeWidth="4" strokeLinecap="round" />
        <path d="M24 59 21 65M47 59 50 65" stroke="#176B68" strokeWidth="4" strokeLinecap="round" />
        <circle cx="13" cy="46" r="2" fill="#E6A45D" />
        <circle cx="59" cy="46" r="2" fill="#E6A45D" />
      </svg>
      {!reducedMotion && (
        <motion.span
          className="absolute -right-0.5 top-1 h-3 w-3 rounded-full border-2 border-[var(--surface-elevated)] bg-[var(--brand)]"
          animate={{ scale: [1, 1.18, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </motion.span>
  );
}

export default function PortfolioMascot() {
  const reducedMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState("hero");
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const sections = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActiveSection(visible.target.id);
      },
      {
        root: null,
        rootMargin: "-24% 0px -52% 0px",
        threshold: [0, 0.1, 0.25, 0.5],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const content = SECTION_MESSAGES[activeSection] ?? SECTION_MESSAGES.hero;
  const motionProps = reducedMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 10, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 6, scale: 0.98 }, transition: { duration: 0.18, ease: "easeOut" } };

  const handleToggle = () => {
    setHasInteracted(true);
    setIsOpen((open) => !open);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-end px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
      <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] flex-col items-end gap-3 sm:max-w-[360px]">
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.section
              key="mascot-panel"
              {...motionProps}
              id="portfolio-mascot-panel"
              aria-label="Portfolio companion"
              className="w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--foreground)] shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-start gap-3 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-2)]">
                  <MascotAvatar reducedMotion={reducedMotion} isOpen={isOpen} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-mono text-[9px] tracking-[0.16em] text-[var(--brand)]">{content.eyebrow}</p>
                  <h2 className="mt-1 text-base font-semibold tracking-tight">{content.title}</h2>
                  <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)]">{content.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                  aria-label="Close portfolio companion"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[var(--border-subtle)] px-4 py-3">
                <span className="flex items-center gap-1.5 text-[10px] text-[var(--text-tertiary)]">
                  <Sparkles size={12} aria-hidden="true" />
                  Changes as you explore
                </span>
                <a
                  href={content.href}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-[var(--brand-contrast)] transition-colors hover:bg-[var(--brand-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus-ring)]"
                >
                  {content.action}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {!isOpen && !hasInteracted && (
            <motion.span
              initial={false}
              animate={{ opacity: 1, x: 0 }}
              className="hidden rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-2 text-xs text-[var(--text-secondary)] shadow-[var(--shadow-md)] sm:block"
            >
              Need a guide?
            </motion.span>
          )}
          <button
            type="button"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-controls="portfolio-mascot-panel"
            aria-label={isOpen ? "Close portfolio companion" : "Open portfolio companion"}
            className="group flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-lg)] transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-[var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--focus-ring)] active:translate-y-0 sm:h-[76px] sm:w-[76px]"
          >
            <span className="relative flex h-full w-full items-center justify-center">
              <MascotAvatar reducedMotion={reducedMotion} isOpen={isOpen} />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--surface-elevated)] bg-[var(--brand)] text-[var(--brand-contrast)]">
                {isOpen ? <X size={12} aria-hidden="true" /> : <MessageCircle size={12} aria-hidden="true" />}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
