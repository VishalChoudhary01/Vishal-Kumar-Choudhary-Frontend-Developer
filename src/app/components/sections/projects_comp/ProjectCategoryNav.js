"use client";

import { useRef, useState, useCallback, useLayoutEffect } from "react";
import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

export default function ProjectCategoryNav({
  categories,
  categoryLabels,
  formatKey,
  activeCategory,
  onSelect,
  className = "",
}) {
  const listRef = useRef(null);
  const buttonRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const isInitialMount = useRef(true);

  const measure = useCallback(() => {
    const list = listRef.current;
    const index = categories.indexOf(activeCategory);
    const button = buttonRefs.current[index];

    if (!list || !button) return;

    setIndicator({
      left: button.offsetLeft,
      width: button.offsetWidth,
    });
  }, [activeCategory, categories]);

  const updateScrollState = useCallback(() => {
    const element = listRef.current;

    if (!element) return;

    const threshold = 1;
    const maxScrollLeft =
      element.scrollWidth - element.clientWidth;

    setScrollState({
      canScrollLeft: element.scrollLeft > threshold,
      canScrollRight:
        element.scrollLeft < maxScrollLeft - threshold,
    });
  }, []);

  const ensureActiveTabVisible = useCallback(() => {
    const list = listRef.current;

    if (!list) return;

    const index = categories.indexOf(activeCategory);
    const button = buttonRefs.current[index];

    if (!button) return;

    const listRect = list.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    const isMobile =
      typeof window !== "undefined" &&
      window.innerWidth < 768;

    const edgeBuffer = isMobile ? 16 : 28;

    const tabLeft = buttonRect.left - listRect.left;
    const tabRight = buttonRect.right - listRect.left;

    if (tabLeft < edgeBuffer) {
      const scrollTarget =
        list.scrollLeft +
        tabLeft -
        edgeBuffer;

      list.scrollTo({
        left: Math.max(0, scrollTarget),
        behavior: "smooth",
      });

      return;
    }

    if (tabRight > listRect.width - edgeBuffer) {
      const scrollTarget =
        list.scrollLeft +
        tabRight -
        listRect.width +
        edgeBuffer;

      list.scrollTo({
        left: scrollTarget,
        behavior: "smooth",
      });
    }
  }, [activeCategory, categories]);

  useLayoutEffect(() => {
    measure();
    updateScrollState();

    const container = listRef.current;

    let resizeObserver;

    if (
      container &&
      typeof ResizeObserver !== "undefined"
    ) {
      resizeObserver = new ResizeObserver(() => {
        measure();
        updateScrollState();
      });

      resizeObserver.observe(container);
    }

    const handleScroll = () => {
      updateScrollState();
    };

    container?.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      measure
    );

    return () => {
      resizeObserver?.disconnect();

      container?.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        measure
      );
    };
  }, [measure, updateScrollState]);

  useLayoutEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    ensureActiveTabVisible();

    const container = listRef.current;

    if (!container) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      requestAnimationFrame(() => {
        measure();
        updateScrollState();
        ticking = false;
      });
    };

    container.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    const timer = setTimeout(() => {
      measure();
      updateScrollState();
    }, 400);

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );

      clearTimeout(timer);
    };
  }, [
    activeCategory,
    ensureActiveTabVisible,
    measure,
    updateScrollState,
  ]);

  const onKeyDown = useCallback(
    (event) => {
      const index =
        categories.indexOf(activeCategory);

      let nextIndex = null;

      if (event.key === "ArrowRight") {
        nextIndex =
          (index + 1) % categories.length;
      }

      if (event.key === "ArrowLeft") {
        nextIndex =
          (index - 1 + categories.length) %
          categories.length;
      }

      if (nextIndex === null) return;

      event.preventDefault();

      onSelect(categories[nextIndex]);

      buttonRefs.current[nextIndex]?.focus();
    },
    [
      activeCategory,
      categories,
      onSelect,
    ]
  );

  return (
    <nav
      aria-label="Project categories"
      onKeyDown={onKeyDown}
      className={`relative ${className}`}
    >
      {scrollState.canScrollLeft && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-20 w-7 bg-gradient-to-r from-background to-transparent sm:w-9"
        />
      )}

      {scrollState.canScrollRight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-20 w-7 bg-gradient-to-l from-background to-transparent sm:w-9"
        />
      )}

      <div
        ref={listRef}
        role="tablist"
        aria-label="Filter projects by category"
        className="relative flex items-center gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory py-1 pr-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:gap-2 sm:pr-8"
      >
        {categories.map((category, index) => {
          const isActive =
            category === activeCategory;

          const label =
            categoryLabels?.[category] ||
            (formatKey
              ? formatKey(category)
              : category.toUpperCase());

          return (
            <button
              key={category}
              ref={(element) => {
                buttonRefs.current[index] =
                  element;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="projects-list"
              tabIndex={isActive ? 0 : -1}
              onClick={() =>
                onSelect(category)
              }
              className={`relative shrink-0 snap-start px-1.5 py-2 font-mono text-[0.64rem] font-medium uppercase tracking-[0.13em] transition-colors duration-200 ease-out select-none sm:px-2 sm:py-2.5 sm:text-[0.68rem] sm:tracking-[0.14em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isActive ? "text-brand" : "text-text-muted hover:text-text-secondary"}`}
            >
              <span className="relative z-10 whitespace-nowrap">
                {label}
              </span>
            </button>
          );
        })}

        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{
            left: indicator.left,
            width: indicator.width,
          }}
          transition={{
            duration: 0.35,
            ease: EASE,
          }}
          className="pointer-events-none absolute bottom-0 h-px rounded-full bg-brand sm:h-[1.5px]"
        />
      </div>
    </nav>
  );
}