"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeftIcon as AnimatedArrowLeft } from "@animateicons/react/lucide/arrow-left-icon";
import { ChevronRightIcon as AnimatedChevronRight } from "@animateicons/react/lucide/chevron-right-icon";
import useReducedMotion from "@/app/hooks/useReducedMotion";

function BreadcrumbLink({ item, index, prefersReducedMotion }) {
  const iconRef = useRef(null);
  const Icon = index === 0 ? AnimatedArrowLeft : AnimatedChevronRight;
  const startIcon = () => iconRef.current?.startAnimation?.();
  const stopIcon = () => iconRef.current?.stopAnimation?.();

  return (
    <Link
      href={item.href}
      onMouseEnter={startIcon}
      onMouseLeave={stopIcon}
      onFocus={startIcon}
      onBlur={stopIcon}
      className="group inline-flex min-h-7 items-center gap-2 rounded-[2px] text-xs font-medium text-text-secondary transition-colors duration-200 hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand motion-reduce:transition-none"
    >
      <Icon
        ref={iconRef}
        size={14}
        duration={0.68}
        isAnimated={!prefersReducedMotion}
        aria-hidden="true"
        className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transform-none motion-reduce:transition-none"
      />
      {item.label}
    </Link>
  );
}

export default function AdminBreadcrumbs({ items = [], className = "" }) {
  const prefersReducedMotion = useReducedMotion();
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={["flex min-w-0 flex-wrap items-center gap-2 text-xs font-medium", className].filter(Boolean).join(" ")}
    >
      {items.map((item, index) => (
        <span key={item.href || item.label || index} className="inline-flex min-w-0 items-center gap-2">
          {index > 0 ? (
            <AnimatedChevronRight
              size={13}
              duration={0.62}
              isAnimated={!prefersReducedMotion}
              aria-hidden="true"
              className="shrink-0 text-text-tertiary"
            />
          ) : null}
          {item.href ? (
            <BreadcrumbLink item={item} index={index} prefersReducedMotion={prefersReducedMotion} />
          ) : (
            <span aria-current="page" className="max-w-[min(64vw,36rem)] truncate text-text-primary">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
