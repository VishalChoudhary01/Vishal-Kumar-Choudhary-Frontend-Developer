"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

/* Shared editorial easing conventions (matches the showcase section). */
const EASE_ENTER = [0.16, 1, 0.3, 1];
const EASE_EXIT = [0.4, 0, 1, 1];

/* Subtle horizontal travel for slider navigation, as % of slide width. */
const SLIDE_TRAVEL = "6%";

/**
 * Variant definitions.
 *
 * - Backdrop: plain opacity fade in/out.
 * - Dialog: opacity in; on exit it also settles down 1 → 0.985 so the whole
 *   viewer feels like it recedes instead of just vanishing.
 * - Slides (one per showcase image): direction-aware. Entering slides come
 *   from the right when navigating next and from the left when going
 *   previous; exiting slides travel the opposite way. The very first slide
 *   after opening (direction 0) does a centered fade + gentle scale-up.
 * - Reduced motion strips all translation/scale and shortens fades.
 */
const makeBackdropVariants = (reduced) => ({
    initial: reduced ? { opacity: 1 } : { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: reduced ? 0.12 : 0.26, ease: EASE_ENTER },
    },
    exit: {
        opacity: 0,
        transition: { duration: reduced ? 0.08 : 0.2, ease: EASE_EXIT },
    },
});

const makeDialogVariants = (reduced) => ({
    initial: reduced
        ? { opacity: 1, scale: 1 }
        : { opacity: 0, scale: 1 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: reduced ? 0.12 : 0.22, ease: EASE_ENTER },
    },
    exit: {
        opacity: 0,
        scale: reduced ? 1 : 0.985,
        transition: { duration: reduced ? 0.08 : 0.2, ease: EASE_EXIT },
    },
});

const makeSlideVariants = (reduced) =>
    reduced
        ? {
              enter: { opacity: 0 },
              center: {
                  opacity: 1,
                  transition: { duration: 0.12, ease: "linear" },
              },
              exit: {
                  opacity: 0,
                  transition: { duration: 0.1, ease: "linear" },
              },
          }
        : {
              /* direction 0 = viewer just opened: no horizontal travel.
                 All three variants are functions so they can receive the
                 `custom` direction value (also used by exiting slides). */
              enter: (direction) => ({
                  opacity: 0,
                  x: direction === 0 ? 0 : direction > 0 ? SLIDE_TRAVEL : `-${SLIDE_TRAVEL}`,
                  scale: direction === 0 ? 0.96 : 1,
              }),
              center: (direction) => ({
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: {
                      duration: direction === 0 ? 0.34 : 0.3,
                      ease: EASE_ENTER,
                  },
              }),
              exit: (direction) => ({
                  opacity: 0,
                  x:
                      direction === 0
                          ? 0
                          : direction > 0
                            ? `-${SLIDE_TRAVEL}`
                            : SLIDE_TRAVEL,
                  scale: direction === 0 ? 0.985 : 1,
                  transition: {
                      duration: direction === 0 ? 0.2 : 0.26,
                      ease: EASE_EXIT,
                  },
              }),
          };

const captionVariants = {
    initial: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.2, ease: EASE_ENTER },
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.12, ease: EASE_EXIT },
    },
};

/**
 * Full-screen, accessible image viewer for the project showcase.
 *
 * Motion architecture:
 * - The outer AnimatePresence (viewer level) owns open/close: it keeps the
 *   exiting backdrop/dialog mounted until their exit animations complete.
 * - An inner AnimatePresence (slide level, keyed by image src) owns
 *   next/previous crossfades. Navigation direction is explicit state, and
 *   the presence-level `custom` prop forwards the *latest* direction to
 *   slides that are already exiting, so direction flips mid-animation stay
 *   consistent during rapid navigation.
 * - Closing only clears the selected index; the outer AnimatePresence keeps
 *   rendering the viewer while it fades, so exit animations are never cut.
 * - Images use object-contain inside percentage-inset slides: aspect ratio
 *   is preserved and nothing is stretched during transitions.
 */
export default function ProjectShowcaseLightbox({
    items = [],
    index,
    onClose,
    onIndexChange,
    reduced = false,
}) {
    const item = items[index];
    const containerRef = useRef(null);
    const closeBtnRef = useRef(null);
    const previousFocusRef = useRef(null);
    const [direction, setDirection] = useState(0);

    // Resolve the portal target lazily so this can prerender on the server
    // (where `document` does not exist). The portal renders no markup while
    // closed, so there is no hydration mismatch.
    const [portalTarget] = useState(() =>
        typeof document === "undefined" ? null : document.body
    );

    const open = Boolean(item?.src && item?.type !== "video");
    const hasNavigation = items.length > 1;

    const goPrev = useCallback(() => {
        if (!hasNavigation) return;
        requestAnimationFrame(() => {
            setDirection(-1);
            onIndexChange?.((index - 1 + items.length) % items.length);
        });
    }, [hasNavigation, index, items.length, onIndexChange]);

    const goNext = useCallback(() => {
        if (!hasNavigation) return;
        requestAnimationFrame(() => {
            setDirection(1);
            onIndexChange?.((index + 1) % items.length);
        });
    }, [hasNavigation, index, items.length, onIndexChange]);

    // Opening fresh always starts with a centered entrance (direction 0).
    // Escape and backdrop clicks also reset direction here instead of in an
    // effect, so the next open never inherits a stale slider direction.

    // On open: remember the trigger and move focus to the close button.
    // On close: restore focus to the trigger.
    useEffect(() => {
        if (!open) return;

        previousFocusRef.current =
            document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;

        const raf = window.requestAnimationFrame(() => {
            closeBtnRef.current?.focus();
        });

        return () => {
            window.cancelAnimationFrame(raf);
            const trigger = previousFocusRef.current;
            if (trigger && typeof trigger.focus === "function") {
                trigger.focus();
            }
            previousFocusRef.current = null;
        };
    }, [open]);

    // Scroll lock while open; cleanup removes the class on close/unmount.
    useEffect(() => {
        if (!open) return;

        document.body.classList.add("overflow-hidden");
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, [open]);

    const handleKeyDown = useCallback(
        (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                setDirection(0);
                onClose?.();
                return;
            }

            if (event.key === "ArrowLeft" && hasNavigation) {
                event.preventDefault();
                goPrev();
                return;
            }

            if (event.key === "ArrowRight" && hasNavigation) {
                event.preventDefault();
                goNext();
            }
        },
        [onClose, hasNavigation, goPrev, goNext]
    );

    // Keep keyboard focus inside the open dialog.
    const handleTabKey = useCallback(
        (event) => {
            const container = containerRef.current;
            if (!container) return;

            const focusable = Array.from(
                container.querySelectorAll(
                    'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
                )
            ).filter(
                (el) =>
                    el.offsetParent !== null ||
                    el === document.activeElement
            );
            if (!focusable.length) return;

            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            const active = document.activeElement;

            if (event.shiftKey && (active === first || !container.contains(active))) {
                event.preventDefault();
                last.focus({ preventScroll: true });
            } else if (!event.shiftKey && (active === last || !container.contains(active))) {
                event.preventDefault();
                first.focus({ preventScroll: true });
            }
        },
        []
    );

    const onKeydown = useCallback(
        (event) => {
            if (event.key === "Tab") {
                handleTabKey(event);
            } else {
                handleKeyDown(event);
            }
        },
        [handleTabKey, handleKeyDown]
    );

    useEffect(() => {
        if (!open) {
            return;
        }

        // Capture phase: guaranteed to run before any page-level handlers
        // (Lenis, editor shortcuts, intro animation) that might stopPropagation,
        // so Escape/arrows always reach the dialog.
        document.addEventListener("keydown", onKeydown, true);
        return () => {
            document.removeEventListener("keydown", onKeydown, true);
        };
    }, [open, onKeydown]);

    if (!portalTarget) {
        return null;
    }

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            setDirection(0);
            onClose?.();
        }
    };

    const controlClasses =
        "inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70";

    const backdropVariants = makeBackdropVariants(reduced);
    const dialogVariants = makeDialogVariants(reduced);
    const slideVariants = makeSlideVariants(reduced);

    return createPortal(
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        aria-hidden="true"
                        className="fixed inset-0 z-[300] bg-black/85"
                        variants={backdropVariants}
                        initial="initial"
                        animate="visible"
                        exit="exit"
                    />

                    <motion.div
                        ref={containerRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label={
                            item.caption
                                ? `Viewing: ${item.caption}`
                                : item.alt || "Image viewer"
                        }
                        tabIndex={-1}
                        className="fixed inset-0 z-[301] outline-none"
                        variants={dialogVariants}
                        initial="initial"
                        animate="visible"
                        exit="exit"
                        onClick={handleBackdropClick}
                    >
                        {/*
                          Slide layer: one absolutely-positioned slide per
                          image, inset from the viewport edges. Nested
                          AnimatePresence crossfades outgoing/incoming
                          slides; `custom` forwards the current direction to
                          exiting slides so rapid direction flips stay
                          coherent.
                        */}
                        <AnimatePresence custom={direction} initial>
                            <motion.div
                                key={item.src}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                aria-hidden="true"
                                data-lightbox-slide={item.src}
                                className="pointer-events-auto absolute inset-14 flex items-center justify-center sm:inset-20"
                            >
                                <div className="relative h-full w-full">
                                    <Image
                                        src={item.src}
                                        alt={item.alt || ""}
                                        fill
                                        sizes="100vw"
                                        className="object-contain"
                                        draggable={false}
                                    />
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/*
                          Caption crossfades between images; anchored to the
                          bottom edge so caps of any length cannot shift the
                          image or the controls. AnimatePresence holds the
                          outgoing caption until its fade completes.
                        */}
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-6 pb-5 sm:pb-8">
                            <AnimatePresence mode="wait" initial>
                                {item.caption && (
                                    <motion.p
                                        key={item.src}
                                        variants={captionVariants}
                                        initial="initial"
                                        animate="visible"
                                        exit="exit"
                                        className="max-w-3xl text-center text-sm text-white/85 sm:text-[0.9rem]"
                                    >
                                        {item.caption}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Close control (upper-right, reachable on small screens). */}
                        <button
                            type="button"
                            ref={closeBtnRef}
                            onClick={() => {
                                setDirection(0);
                                onClose?.();
                            }}
                            aria-label="Close image viewer"
                            className={`fixed right-4 top-4 z-[310] sm:right-6 sm:top-6 ${controlClasses}`}
                        >
                            <X className="size-5" aria-hidden="true" />
                        </button>

                        {/* Previous / next (only for multi-image showcases). */}
                        {hasNavigation && (
                            <>
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    aria-label="Previous image"
                                    className={`fixed left-3 top-1/2 z-[310] -translate-y-1/2 sm:left-5 ${controlClasses}`}
                                >
                                    <ChevronLeft className="size-5" aria-hidden="true" />
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    aria-label="Next image"
                                    className={`fixed right-3 top-1/2 z-[310] -translate-y-1/2 sm:right-5 ${controlClasses}`}
                                >
                                    <ChevronRight className="size-5" aria-hidden="true" />
                                </button>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        portalTarget
    );
}
