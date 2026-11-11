"use client";

import Link from "next/link";
import { motion } from "motion/react";

import VKrLogo from "@/app/components/common/logo/VKrLogo";
import { ThemeToggle } from "@/app/components/ui/ThemeToggle";
import useReducedMotion from "@/app/hooks/useReducedMotion";

export default function AuthFrame({ children }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-background px-3 text-text-primary sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-brand/7 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-brand/5 blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between py-1 sm:py-2">
        <Link href="/labs" aria-label="V Kr. Portfolio home" className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
          <VKrLogo compact />
        </Link>
        <ThemeToggle />
      </header>

      <main className="relative z-10 flex min-h-0 w-full flex-1 items-center justify-center overflow-y-auto auth-scrollbar-hidden py-1 sm:py-4">
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={reducedMotion ? { duration: 0.01 } : { duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[360px] rounded-xl border border-border bg-surface-elevated/92 p-2.5 shadow-[0_24px_90px_-44px_rgba(0,0,0,0.5)] backdrop-blur-xl sm:max-w-[408px] sm:p-4"
        >
          {children}
        </motion.div>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 py-1 text-[10px] text-text-tertiary sm:gap-4 sm:py-2 sm:text-xs">
        <span className="tracking-[0.16em]">LABS AUTHENTICATION</span>
        <Link href="/labs" className="rounded-sm px-2 py-1 text-text-secondary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          Back to Labs
        </Link>
      </footer>
    </div>
  );
}
