export default function LabsIntroduction() {
  return (
    <section
      aria-labelledby="labs-heading"
      className="mx-auto w-full max-w-[1440px] px-6 pb-16 pt-[clamp(9rem,15vw,13rem)] sm:px-8 sm:pb-20 lg:px-20 lg:pb-24"
    >
      <div className="max-w-5xl">
        <p className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.24em] text-brand sm:text-[11px]">
          Frontend experiments
        </p>
        <h1
          id="labs-heading"
          className="max-w-4xl font-display text-[clamp(3.5rem,8vw,7.5rem)] font-normal leading-[0.92] tracking-[-0.055em] text-text-primary"
        >
          A space for
          <span className="block text-brand">experiments.</span>
        </h1>
        <p className="mt-7 max-w-2xl text-[15px] leading-7 text-text-secondary sm:mt-8 sm:text-base sm:leading-8">
          A growing collection of frontend explorations in motion, interface
          interactions, CSS, and creative coding.
        </p>
      </div>
      <div aria-hidden="true" className="mt-14 h-px w-full bg-border-subtle sm:mt-16" />
    </section>
  );
}
