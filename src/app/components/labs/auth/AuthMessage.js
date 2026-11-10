export default function AuthMessage({ title, children, tone = "error" }) {
  const styles =
    tone === "success"
      ? "border-success/40 bg-success-soft text-text-primary"
      : "border-error/40 bg-error-soft text-text-primary";

  return (
    <div
      role={tone === "success" ? "status" : "alert"}
      aria-live={tone === "success" ? "polite" : "assertive"}
      className={"mb-5 rounded-sm border px-3 py-3 " + styles}
    >
      {title ? <p className="mb-1 text-sm font-semibold">{title}</p> : null}
      <div className="text-sm leading-6">{children}</div>
    </div>
  );
}
