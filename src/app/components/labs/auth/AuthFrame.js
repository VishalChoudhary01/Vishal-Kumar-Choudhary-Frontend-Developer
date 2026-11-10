"use client";

import Link from "next/link";
import { motion } from "motion/react";

import VKrLogo from "@/app/components/common/logo/VKrLogo";
import { ThemeToggle } from "@/app/components/ui/ThemeToggle";
import useReducedMotion from "@/app/hooks/useReducedMotion";

export default function AuthFrame({ children }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden bg-background px-4 text-text-primary sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-brand/7 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand/5 blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between py-4 sm:py-5">
        <Link
          href="/labs"
          aria-label="V Kr. Portfolio home"
          className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <VKrLogo compact />
        </Link>
        <div className="flex h-10 w-10 items-center justify-center">
          <ThemeToggle />
        </div>
      </header>

      <main className="relative z-10 flex w-full flex-1 items-center justify-center py-5 sm:py-8">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={
            reducedMotion
              ? { duration: 0.01 }
              : { duration: 0.56, ease: [0.22, 1, 0.36, 1] }
          }
          className="w-full max-w-[460px] rounded-2xl border border-border bg-surface-elevated/95 p-5 shadow-[0_24px_90px_-44px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:p-7"
        >
          {children}
        </motion.div>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 py-4 text-[10px] text-text-tertiary sm:py-5 sm:text-xs">
        <span className="tracking-[0.16em]">LABS AUTHENTICATION</span>
        <Link
          href="/labs"
          className="rounded-sm px-2 py-1 text-text-secondary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Back to Labs
        </Link>
      </footer>
    </div>
  );
}
