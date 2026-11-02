"use client";

function ControlField({ control, value, onChange }) {
  const inputId = `lab-control-${control.id}`;
  const commonClass =
    "mt-2 w-full text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 disabled:cursor-not-allowed disabled:opacity-50";

  if (control.type === "toggle") {
    return (
      <label className="flex min-h-10 items-center justify-between gap-4">
        <span id={inputId} className="text-sm text-text-secondary">
          {control.label}
        </span>
        <input
          type="checkbox"
          checked={Boolean(value)}
          aria-labelledby={inputId}
          onChange={(event) => onChange(event.target.checked)}
          className="h-4 w-4 accent-brand"
        />
      </label>
    );
  }

  if (control.type === "select") {
    return (
      <label className="block" htmlFor={inputId}>
        <span className="text-sm text-text-secondary">{control.label}</span>
        <select
          id={inputId}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          className={`${commonClass} min-h-10 rounded-[var(--radius-sm)] border border-border bg-background px-3`}
        >
          {(control.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (control.type === "range") {
    return (
      <label className="block" htmlFor={inputId}>
        <span className="flex items-center justify-between gap-3 text-sm text-text-secondary">
          <span>{control.label}</span>
          <output className="font-mono text-[11px] text-text-muted">
            {value}
          </output>
        </span>
        <input
          id={inputId}
          type="range"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className={`${commonClass} accent-brand`}
        />
      </label>
    );
  }

  if (control.type === "number") {
    return (
      <label className="block" htmlFor={inputId}>
        <span className="text-sm text-text-secondary">{control.label}</span>
        <input
          id={inputId}
          type="number"
          min={control.min}
          max={control.max}
          step={control.step ?? 1}
          value={value}
          onChange={(event) =>
            onChange(event.target.value === "" ? "" : Number(event.target.value))
          }
          className={`${commonClass} min-h-10 rounded-[var(--radius-sm)] border border-border bg-background px-3`}
        />
      </label>
    );
  }

  if (control.type === "color") {
    return (
      <label className="flex min-h-10 items-center justify-between gap-4">
        <span className="text-sm text-text-secondary">{control.label}</span>
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-12 cursor-pointer rounded-[var(--radius-sm)] border border-border bg-transparent p-1"
        />
      </label>
    );
  }

  return null;
}

export default function LabControlsPanel({
  controls = [],
  values,
  onChange,
  onReset,
  isDirty,
}) {
  if (!controls.length) return null;

  return (
    <aside
      aria-labelledby="lab-controls-heading"
      className="h-fit w-full max-w-none rounded-[var(--radius-md)] border border-border bg-surface-2 p-4 sm:p-5 lg:max-w-[320px]"
    >
      <div>
        <h2
          id="lab-controls-heading"
          className="font-display text-xl font-normal tracking-[-0.02em] text-text-primary"
        >
          Controls
        </h2>
        <p className="mt-1 text-xs leading-5 text-text-muted">
          Adjust the experiment in real time.
        </p>
      </div>

      <div className="mt-5 space-y-5">
        {controls.map((control) => (
          <ControlField
            key={control.id}
            control={control}
            value={values[control.id]}
            onChange={(value) => onChange(control.id, value)}
          />
        ))}
      </div>

      <div className="mt-6 border-t border-border-subtle pt-4">
        <button
          type="button"
          onClick={onReset}
          disabled={!isDirty}
          className="text-xs font-semibold text-text-secondary underline decoration-border-strong underline-offset-4 transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-2 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
        >
          Reset settings
        </button>
      </div>
    </aside>
  );
}
