"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

import VKrLogo from "@/app/components/common/logo/VKrLogo";
import useReducedMotion from "@/app/hooks/useReducedMotion";

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export default function LabsAuthModal({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);
  const isOpen = Boolean(children);

  const close = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    if (!isOpen) return undefined;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const bodyOverflow = document.body.style.overflow;
    const htmlOverflow = document.documentElement.style.overflow;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      const firstInput = dialogRef.current?.querySelector("input:not([disabled])");
      const closeButton = dialogRef.current?.querySelector("[data-auth-close]");
      (firstInput || closeButton || dialogRef.current)?.focus();
    });

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }

      if (event.key !== "Tab") return;

      const items = Array.from(dialogRef.current?.querySelectorAll(FOCUSABLE) || [])
        .filter((item) => item instanceof HTMLElement && item.getClientRects().length > 0);

      if (!items.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = bodyOverflow;
      document.documentElement.style.overflow = htmlOverflow;

      window.requestAnimationFrame(() => {
        if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
      });
    };
  }, [isOpen, close]);

  const overlayTransition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] };
  const panelTransition = reducedMotion
    ? { duration: 0.01 }
    : { duration: 0.42, ease: [0.22, 1, 0.36, 1] };

  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="labs-auth-modal"
          className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto px-3 py-4 sm:px-6 sm:py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={overlayTransition}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={close}
            className="absolute inset-0 cursor-default bg-[rgba(2,8,6,0.18)] backdrop-blur-[4px]"
          />

          <motion.section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Labs account authentication"
            tabIndex={-1}
            initial={reducedMotion ? false : { opacity: 0, y: 22, scale: 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.985 }}
            transition={panelTransition}
            className="relative z-10 my-auto max-h-[calc(100svh-2rem)] w-full max-w-[392px] overflow-y-auto overscroll-contain rounded-xl border border-border/90 bg-surface-elevated/90 p-4 text-text-primary shadow-[0_28px_100px_-34px_rgba(0,0,0,0.58)] backdrop-blur-xl sm:max-h-[calc(100svh-3rem)] sm:p-5"
          >
            <header className="mb-3 flex items-center justify-between">
              <Link href="/labs" aria-label="V Kr. Labs" className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
                <VKrLogo compact />
              </Link>
              <button
                data-auth-close
                type="button"
                onClick={close}
                aria-label="Close dialog"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
              >
                <X size={16} aria-hidden="true" />
              </button>
            </header>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={panelTransition}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
