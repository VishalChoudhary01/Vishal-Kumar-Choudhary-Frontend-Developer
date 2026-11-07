import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Activity, Database, ShieldCheck } from "lucide-react";

import { ThemeToggle } from "@/app/components/ui/ThemeToggle";
import LabsOwnerNavigation from "@/app/components/labs/admin/LabsOwnerNavigation";
import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { isLabsOwner } from "@/app/lib/labs/owner-access";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Portfolio Analytics — Private Owner Area",
  robots: { index: false, follow: false },
};

export default async function PortfolioAnalyticsPage() {
  let session = null;

  try {
    session = await getCurrentAuthSession();
  } catch {
    notFound();
  }

  if (!isLabsOwner(session?.user)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-text-primary sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-[1280px]">
        <Link
          href="/admin/labs/analytics"
          className="inline-flex items-center gap-2 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Back to Labs analytics
        </Link>

        <LabsOwnerNavigation active="portfolio-analytics" />

        <header className="mt-8 flex flex-wrap items-start justify-between gap-5 border-b border-border pb-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              PRIVATE OWNER AREA
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Portfolio analytics
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
              Understand visits across your homepage, projects and Labs. This workspace is private to the configured portfolio owner.
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Analytics system status">
          <article className="border border-border bg-surface-1 p-5">
            <div className="flex items-center gap-2 text-text-tertiary">
              <ShieldCheck size={16} aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Access</p>
            </div>
            <p className="mt-4 text-base font-semibold">Owner only</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Server-verified against the configured Labs owner account.
            </p>
          </article>

          <article className="border border-border bg-surface-1 p-5">
            <div className="flex items-center gap-2 text-text-tertiary">
              <Database size={16} aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Storage</p>
            </div>
            <p className="mt-4 text-base font-semibold">MongoDB · 65 days</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Visit records expire automatically after the retention window once TTL indexes are provisioned.
            </p>
          </article>

          <article className="border border-border bg-surface-1 p-5">
            <div className="flex items-center gap-2 text-text-tertiary">
              <Activity size={16} aria-hidden="true" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em]">Collection</p>
            </div>
            <p className="mt-4 text-base font-semibold">Not connected yet</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              The visit API is being connected to the public pages in the next phase. No live visit totals are available yet.
            </p>
          </article>
        </section>

        <section className="mt-6 border border-border bg-surface-1 p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-tertiary">
            Implementation status
          </p>
          <h2 className="mt-2 text-lg font-semibold">Visit storage and ingestion API</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
            The database schema, privacy-safe visit lifecycle and ingestion endpoint are implemented. Public page tracking, aggregated reporting, live refresh and deletion controls will appear here as those phases are completed.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex min-h-8 items-center border border-brand/30 bg-brand-soft/30 px-3 text-[11px] font-semibold text-brand">
              Phase 1 · Data foundation
            </span>
            <span className="inline-flex min-h-8 items-center border border-brand/30 bg-brand-soft/30 px-3 text-[11px] font-semibold text-brand">
              Phase 2 · Ingestion API
            </span>
            <span className="inline-flex min-h-8 items-center border border-border px-3 text-[11px] font-medium text-text-tertiary">
              Phase 3 · Page tracking pending
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
