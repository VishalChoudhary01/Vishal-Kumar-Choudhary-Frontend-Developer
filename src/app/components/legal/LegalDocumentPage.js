import Link from "next/link";

export default function LegalDocumentPage({
  eyebrow,
  title,
  description,
  version,
  effectiveDate = "4 November 2026",
  children,
}) {
  return (
    <main className="min-h-screen bg-background text-text-primary">
      <div className="mx-auto w-full max-w-[1120px] px-5 pb-20 pt-8 sm:px-8 sm:pb-24 sm:pt-10 lg:px-12">
        <header className="flex items-center justify-between gap-4 border-b border-border-subtle pb-5">
          <Link
            href="/"
            aria-label="V Kr. home"
            className="font-display text-xl font-semibold tracking-[-0.08em] text-text-primary transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
          >
            V Kr.
          </Link>
          <nav aria-label="Legal navigation" className="flex items-center gap-4 text-xs text-text-secondary sm:gap-6 sm:text-sm">
            <Link href="/labs" className="transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
              Labs
            </Link>
            <Link href="/#contact" className="transition-colors hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand">
              Contact
            </Link>
          </nav>
        </header>

        <div className="mx-auto max-w-[820px] pt-14 sm:pt-20">
          <p className="font-mono text-[10px] font-medium tracking-[0.2em] text-brand sm:text-xs">
            {eyebrow}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5.25rem)] font-normal leading-[0.98] tracking-[-0.055em]">
            {title}
          </h1>
          <p className="mt-5 max-w-[66ch] text-sm leading-7 text-text-secondary sm:text-base sm:leading-8">
            {description}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-border-subtle py-4 text-[11px] text-text-tertiary sm:text-xs">
            <span>Effective: {effectiveDate}</span>
            <span>Version {version}</span>
          </div>

          <article className="legal-document-content mt-10 space-y-10 sm:mt-14 sm:space-y-12">
            {children}
          </article>

          <div className="mt-16 border-t border-border-subtle pt-6">
            <p className="max-w-[70ch] text-xs leading-6 text-text-tertiary">
              These documents describe the current website and Labs service. They are practical policy drafts, not legal advice or a certification of regulatory compliance. The operator should review them with a qualified lawyer and update them when the service, providers, or legal requirements change.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs">
              <Link href="/terms" className="text-brand underline-offset-4 hover:underline">Terms of Service</Link>
              <Link href="/privacy" className="text-brand underline-offset-4 hover:underline">Privacy Policy</Link>
              <Link href="/#contact" className="text-brand underline-offset-4 hover:underline">Contact</Link>
              <Link href="/" className="text-text-secondary underline-offset-4 hover:text-brand hover:underline">Back to portfolio</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
