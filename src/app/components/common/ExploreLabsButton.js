"use client";

import Link from "next/link";
import { ArrowUpRight, FlaskConical } from "lucide-react";

export default function ExploreLabsButton() {
  return (
    <Link
      href="/labs"
      aria-label="Explore Labs"
      className={[
        "group/labs-cta relative inline-flex min-h-12 sm:min-h-11 lg:min-h-12 w-fit max-w-full",
        "items-center gap-3 rounded-full border px-3.5 pr-4",
        "border-brand/35 bg-brand-soft/35",
        "text-text-primary transition-[background-color,border-color,box-shadow]",
        "duration-300 ease-out",
        "hover:border-brand/65 hover:bg-brand-soft/65",
        "hover:shadow-[0_3px_16px_rgba(23,107,104,0.10)]",
        "dark:border-brand/45 dark:bg-brand-soft/35",
        "dark:hover:border-brand/70 dark:hover:bg-brand-soft/65",
        "dark:hover:shadow-[0_3px_18px_rgba(105,189,185,0.14)]",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-brand focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        "motion-reduce:transition-none",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "flex size-8 sm:size-9 lg:size-10 shrink-0 items-center justify-center rounded-full",
          "bg-brand/10 text-brand",
          "transition-transform duration-200 ease-out",
          "group-hover/labs-cta:scale-105",
          "motion-reduce:transition-none motion-reduce:transform-none",
        ].join(" ")}
      >
        <FlaskConical size={15} strokeWidth={1.8} />
      </span>

      <span className="whitespace-nowrap text-[0.76rem] font-medium leading-none">
        Explore Labs
      </span>

      <ArrowUpRight
        aria-hidden="true"
        size={15}
        strokeWidth={1.8}
        className={[
          "shrink-0 text-brand transition-transform duration-200 ease-out",
          "group-hover/labs-cta:translate-x-0.5 group-hover/labs-cta:-translate-y-0.5",
          "motion-reduce:transition-none motion-reduce:transform-none",
        ].join(" ")}
      />
    </Link>
  );
}
