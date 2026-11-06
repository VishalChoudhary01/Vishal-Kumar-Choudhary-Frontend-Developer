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
  success: "border-success/40 bg-surface-1 text-text-primary",
  error: "border-error/50 bg-surface-1 text-text-primary",
  info: "border-info/40 bg-surface-1 text-text-primary",
};

const MAX_VISIBLE_TOASTS = 3;
const MAX_PENDING_TOASTS = 20;
const DEFAULT_DURATION = 4200;
const MAX_DURATION = 10_000;
const MIN_DURATION = 2500;
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
      Math.max(
        MIN_DURATION,
        Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_DURATION,
      ),
    ),
  };
}

function ToastItem({ toast, onDismiss, reducedMotion }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const remainingRef = useRef(toast.duration);
  const onDismissRef = useRef(onDismiss);
  const Icon = ICONS[toast.type];
  const paused = hovered || focused;

  // Keep the timer callback fresh without restarting the timeout whenever the
  // parent renders (for example, when another toast is added to the queue).
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (paused) return undefined;

    startedAtRef.current = Date.now();
    timerRef.current = window.setTimeout(() => {
      onDismissRef.current?.();
    }, remainingRef.current);

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
  }, [paused, toast.id]);

  return (
    <motion.li
      layout={!reducedMotion}
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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      role="group"
      aria-label={toast.type + " notification"}
      className={
        "pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden border px-3 py-3 shadow-xl shadow-black/15 " +
        STYLES[toast.type]
      }
    >
      <Icon
        size={16}
        className={
          toast.type === "error"
            ? "mt-0.5 shrink-0 text-error"
            : toast.type === "success"
              ? "mt-0.5 shrink-0 text-success"
              : "mt-0.5 shrink-0 text-info"
        }
        aria-hidden="true"
      />
      <p className="min-w-0 flex-1 text-xs leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand motion-reduce:transition-none"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </motion.li>
  );
}

export function ActionToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [announcement, setAnnouncement] = useState({ polite: "", assertive: "" });
  const sequence = useRef(0);
  const announcementSequence = useRef(0);
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

    if (recentMessages.current.size > 100) {
      for (const [key, timestamp] of recentMessages.current) {
        if (now - timestamp > DEDUPE_WINDOW || recentMessages.current.size > 100) {
          recentMessages.current.delete(key);
        }
      }
    }

    sequence.current += 1;
    announcementSequence.current += 1;
    const id = "lab-action-" + sequence.current;
    const toast = { ...normalized, id };
    const messageForAnnouncement =
      normalized.message + " Notification " + announcementSequence.current + ".";

    setAnnouncement(normalized.type === "error"
      ? { polite: "", assertive: messageForAnnouncement }
      : { polite: messageForAnnouncement, assertive: "" });

    setToasts((current) => {
      const maxTotal = MAX_VISIBLE_TOASTS + MAX_PENDING_TOASTS;
      if (current.length < maxTotal) return [...current, toast];

      // Keep currently visible messages; drop only the oldest queued message
      // when the bounded FIFO queue reaches capacity.
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
        role="region"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-3 bottom-3 z-[120] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[min(26rem,calc(100vw-2.5rem))]"
      >
        <ol className="flex flex-col items-stretch gap-2" aria-live="off">
          <AnimatePresence initial={false}>
            {visibleToasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onDismiss={() => dismissToast(toast.id)}
                reducedMotion={Boolean(reducedMotion)}
              />
            ))}
          </AnimatePresence>
        </ol>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement.polite}
        </p>
        <p className="sr-only" aria-live="assertive" aria-atomic="true">
          {announcement.assertive}
        </p>
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
