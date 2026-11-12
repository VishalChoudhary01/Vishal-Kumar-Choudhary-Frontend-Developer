export default function LabExplanation({ explanation }) {
  if (!explanation || typeof explanation !== "string") {
    return null;
  }

  return (
    <section
      aria-labelledby="lab-explanation-heading"
      className="mx-auto mt-8 w-full max-w-[1440px] px-4 sm:mt-16 sm:px-8 lg:px-20"
    >
      <div className="max-w-3xl border-t border-border-subtle pt-5 sm:pt-7">
        <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-brand">
          About the experiment
        </p>
        <h2
          id="lab-explanation-heading"
          className="mt-3 font-display text-2xl font-normal tracking-[-0.025em] text-text-primary sm:text-3xl"
        >
          How it works
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:mt-4 sm:text-base sm:leading-8">
          {explanation}
        </p>
      </div>
    </section>
  );
}
