"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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

export function ActionToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const sequence = useRef(0);

  const dismissToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type, message, options = {}) => {
    const safeType = Object.prototype.hasOwnProperty.call(ICONS, type) ? type : "info";
    const text = typeof message === "string" ? message.trim().slice(0, 320) : "";
    if (!text) return;

    sequence.current += 1;
    const id = "lab-action-" + sequence.current;
    const duration = Math.min(8000, Math.max(2500, Number(options.duration) || 4200));

    setToasts((current) => [
      ...current.slice(-2),
      { id, type: safeType, message: text },
    ]);

    const timer = window.setTimeout(() => dismissToast(id), duration);
    timers.current.set(id, timer);
  }, [dismissToast]);

  useEffect(() => () => {
    for (const timer of timers.current.values()) window.clearTimeout(timer);
    timers.current.clear();
  }, []);

  return (
    <ActionToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[120] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:w-[min(26rem,calc(100vw-2.5rem))]"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type];
          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className={"pointer-events-auto flex w-full items-start gap-3 border px-3 py-3 shadow-xl shadow-black/15 " + STYLES[toast.type]}
            >
              <Icon
                size={16}
                className={toast.type === "error" ? "mt-0.5 shrink-0 text-warning" : toast.type === "success" ? "mt-0.5 shrink-0 text-brand" : "mt-0.5 shrink-0 text-text-tertiary"}
                aria-hidden="true"
              />
              <p className="min-w-0 flex-1 text-xs leading-5">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center text-text-tertiary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          );
        })}
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
