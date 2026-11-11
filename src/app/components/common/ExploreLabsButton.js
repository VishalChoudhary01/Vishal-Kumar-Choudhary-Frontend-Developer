"use client";

import Link from "next/link";
import { ArrowUpRight, FlaskConical } from "lucide-react";

export default function ExploreLabsButton() {
  return (
    <Link
      href="/labs"
      aria-label="Explore Labs"
      className={[
        "group/labs-cta relative inline-flex min-h-12 w-fit max-w-full",
        "items-center gap-3 rounded-full border px-3.5 pr-4",
        "border-[#0C8277]/45 bg-[#0C8277]/[0.035]",
        "text-text-primary transition-[background-color,border-color,box-shadow]",
        "duration-250 ease-out",
        "hover:border-[#0C8277]/75 hover:bg-[#0C8277]/[0.08]",
        "hover:shadow-[0_3px_16px_rgba(12,130,119,0.10)]",
        "dark:border-[#3CBBAA]/50 dark:bg-[#65DCC7]/[0.035]",
        "dark:hover:border-[#65DCC7]/75 dark:hover:bg-[#65DCC7]/[0.09]",
        "dark:hover:shadow-[0_3px_18px_rgba(101,220,199,0.11)]",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-[#0C8277] focus-visible:ring-offset-2",
        "focus-visible:ring-offset-background",
        "motion-reduce:transition-none",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className={[
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          "bg-[#0C8277]/10 text-[#0C8277]",
          "transition-transform duration-200 ease-out",
          "group-hover/labs-cta:scale-105",
          "dark:bg-[#65DCC7]/[0.12] dark:text-[#65DCC7]",
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
          "shrink-0 text-[#0C8277] transition-transform duration-200 ease-out",
          "group-hover/labs-cta:translate-x-0.5 group-hover/labs-cta:-translate-y-0.5",
          "dark:text-[#65DCC7]",
          "motion-reduce:transition-none motion-reduce:transform-none",
        ].join(" ")}
      />
    </Link>
  );
}
