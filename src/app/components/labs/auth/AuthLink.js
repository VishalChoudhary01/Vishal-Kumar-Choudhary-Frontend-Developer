import Link from "next/link";

export default function AuthLink({ href, children, className = "" }) {
  return (
    <Link
      href={href}
      className={[
        "rounded-sm text-sm text-brand transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        className,
      ].join(" ")}
    >
      {children}
    </Link>
  );
}
