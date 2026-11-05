"use client";

import LabLikeButton from "@/app/components/labs/LabLikeButton";

export default function LabEngagement({ slug, initialData = null }) {
  return (
    <section
      aria-label="Experiment appreciation"
      className="mx-auto mt-10 w-full max-w-[1440px] px-6 sm:px-8 lg:px-20"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-4">
        <div>
          <p className="text-sm font-medium text-text-primary">Found this experiment useful?</p>
          <p className="mt-1 text-xs text-text-tertiary">
            Your like helps highlight experiments worth exploring.
          </p>
        </div>

        <LabLikeButton slug={slug} initialData={initialData} />
      </div>
    </section>
  );
}
