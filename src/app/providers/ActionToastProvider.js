"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ActionToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success: "border-brand/40 bg-surface-1 text-text-primary",
  error: "border-warning/50 bg-surface-1 text-text-primary",
  info: "border-border bg-surface-1 text-text-primary",
};

const MAX_VISIBLE_TOASTS = 3;
const MAX_PENDING_TOASTS = 20;
const DEFAULT_DURATION = 4200;
const MAX_DURATION = 10_000;
const DEDUPE_WINDOW = 1600;

function normalizeToast(type, message, options) {
  const safeType = Object.prototype.hasOwnProperty.call(ICONS, type) ? type : "info";
  const safeMessage = typeof message === "string" ? message.trim().slice(0, 320) : "";
  if (!safeMessage) return null;

  const duration = Number(options?.duration);
  return {
    type: safeType,
    message: safeMessage,
    duration: Math.min(
      MAX_DURATION,
      Math.max(2500, Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_DURATION),
    ),
  };
}

function ToastItem({ toast, onDismiss, reducedMotion }) {
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const remainingRef = useRef(toast.duration);
  const Icon = ICONS[toast.type];

  useEffect(() => {
    if (paused) return undefined;

    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(onDismiss, remainingRef.current);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
        remainingRef.current = Math.max(
          0,
          remainingRef.current - (Date.now() - startedAtRef.current),
        );
      }
    };
  }, [paused, onDismiss]);

  const pauseTimer = () => setPaused(true);
  const resumeTimer = () => setPaused(false);

  return (
    <motion.li
      layout
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 26, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={reducedMotion
        ? { opacity: 0, transition: { duration: 0.08 } }
        : {
            opacity: 0,
            x: 22,
            scale: 0.97,
            transition: { duration: 0.19, ease: [0.4, 0, 1, 1] },
          }}
      transition={reducedMotion
        ? { duration: 0.08 }
        : { layout: { type: "spring", stiffness: 420, damping: 34 }, duration: 0.22 }}
      onMouseEnter={pauseTimer}
      onMouseLeave={resumeTimer}
      onFocusCapture={pauseTimer}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) resumeTimer();
      }}
      className={
        "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden border px-3 py-3 shadow-xl shadow-black/15 " +
        STYLES[toast.type]
      }
    >
      <Icon
        size={16}
        className={
          toast.type === "error"
            ? "mt-0.5 shrink-0 text-warning"
            : toast.type === "success"
              ? "mt-0.5 shrink-0 text-brand"
              : "mt-0.5 shrink-0 text-text-tertiary"
        }
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 text-xs leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
      >
        <X size={14} aria-hidden="true" />
      </button>
      <motion.span
        aria-hidden="true"
        className={[
          "absolute inset-x-0 bottom-0 h-px origin-left",
          toast.type === "error" ? "bg-warning" : toast.type === "success" ? "bg-brand" : "bg-text-tertiary",
        ].join(" ")}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: paused ? undefined : 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: remainingRef.current / 1000, ease: "linear" }}
      />
    </motion.li>
  );
}

export function ActionToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const sequence = useRef(0);
  const recentMessages = useRef(new Map());
  const reducedMotion = useReducedMotion();

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type, message, options = {}) => {
    const normalized = normalizeToast(type, message, options);
    if (!normalized) return null;

    const dedupeKey = normalized.type + ":" + normalized.message;
    const now = Date.now();
    const previousAt = recentMessages.current.get(dedupeKey);
    if (previousAt && now - previousAt < DEDUPE_WINDOW) return null;
    recentMessages.current.set(dedupeKey, now);

    if (recentMessages.current.size > 80) {
      for (const [key, timestamp] of recentMessages.current) {
        if (now - timestamp > DEDUPE_WINDOW) recentMessages.current.delete(key);
      }
    }

    sequence.current += 1;
    const id = "lab-action-" + sequence.current;
    const toast = { ...normalized, id };

    setToasts((current) => {
      const maxTotal = MAX_VISIBLE_TOASTS + MAX_PENDING_TOASTS;
      if (current.length < maxTotal) return [...current, toast];

      // Preserve every visible notification. At capacity, discard only the
      // oldest pending item so a new message can enter the FIFO queue.
      const pendingIndex = current.findIndex((item, index) => index >= MAX_VISIBLE_TOASTS);
      if (pendingIndex < 0) return current;

      return [
        ...current.slice(0, pendingIndex),
        ...current.slice(pendingIndex + 1),
        toast,
      ];
    });

    return id;
  }, []);

  useEffect(() => () => {
    recentMessages.current.clear();
  }, []);

  const visibleToasts = toasts.slice(0, MAX_VISIBLE_TOASTS);
  const queuedCount = Math.max(0, toasts.length - visibleToasts.length);

  return (
    <ActionToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[120] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[min(26rem,calc(100vw-2.5rem))]"
        aria-label="Notifications"
      >
        <ol
          className="flex flex-col items-stretch gap-2"
          aria-live="polite"
          aria-relevant="additions"
          aria-atomic="false"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {visibleToasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onDismiss={() => dismissToast(toast.id)}
                reducedMotion={reducedMotion}
              />
            ))}
          </AnimatePresence>
        </ol>
        {queuedCount > 0 ? (
          <p className="sr-only" role="status">
            {queuedCount} additional notifications waiting.
          </p>
        ) : null}
      </div>
    </ActionToastContext.Provider>
  );
}

export function useActionToast() {
  const context = useContext(ActionToastContext);
  if (!context) {
    throw new Error("useActionToast must be used inside ActionToastProvider.");
  }
  return context;
}
