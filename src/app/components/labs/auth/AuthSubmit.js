"use client";

import { LoaderCircle } from "lucide-react";

export default function AuthSubmit({ children, loading, disabled }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-sm bg-brand px-4 text-sm font-semibold text-brand-contrast transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand active:bg-brand-pressed disabled:cursor-not-allowed disabled:opacity-55 sm:h-[42px]"
    >
      {loading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span>{loading}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
