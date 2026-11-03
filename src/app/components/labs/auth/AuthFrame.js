"use client";

import Link from "next/link";

import { ThemeToggle } from "@/app/components/ui/ThemeToggle";

export default function AuthFrame({ children }) {
  return (
    <div className="flex min-h-[100svh] flex-col bg-background px-4 text-text-primary sm:px-6">
      <header className="mx-auto flex w-full max-w-[1280px] items-center justify-between py-5 sm:py-6">
        <Link
          href="/labs"
          aria-label="V Kr. Portfolio home"
          className="font-body text-[1.3rem] font-semibold tracking-[-0.08em] text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          V Kr.
        </Link>
        <div className="flex h-10 w-10 items-center justify-center">
          <ThemeToggle />
        </div>
      </header>

      <main className="flex w-full flex-1 items-center justify-center py-8 sm:py-10">
        <div className="w-full max-w-[420px] rounded-[var(--radius-md)] border border-border bg-surface-elevated p-4 sm:p-6">
          {children}
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 py-5 text-xs text-text-tertiary sm:py-6">
        <span className="tracking-[0.12em]">LABS AUTHENTICATION</span>
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
