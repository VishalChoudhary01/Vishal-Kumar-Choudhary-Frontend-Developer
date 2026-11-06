import Link from "next/link";

const DESTINATIONS = [
  { href: "/admin/labs/analytics", id: "analytics", label: "Analytics" },
  { href: "/admin/labs/sources", id: "sources", label: "Source Library" },
];

export default function LabsOwnerNavigation({ active }) {
  return (
    <nav
      aria-label="Labs owner navigation"
      className="mt-7 flex flex-wrap items-center gap-1 border-b border-border"
    >
      {DESTINATIONS.map((destination) => {
        const isActive = active === destination.id;

        return (
          <Link
            key={destination.id}
            href={destination.href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex min-h-10 items-center border-b-2 px-3 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              isActive
                ? "border-brand text-brand"
                : "border-transparent text-text-tertiary hover:border-border-strong hover:text-text-primary",
            ].join(" ")}
          >
            {destination.label}
          </Link>
        );
      })}
    </nav>
  );
}
