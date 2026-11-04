"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LabOwnerSourceLink() {
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    let active = true;

    fetch("/api/v1/admin/labs/owner-status", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json().catch(() => null);
      })
      .then((payload) => {
        if (active) setIsOwner(payload?.data?.isOwner === true);
      })
      .catch(() => {
        if (active) setIsOwner(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (!isOwner) return null;

  return (
    <div className="mx-auto mt-8 flex w-full max-w-[1440px] justify-end px-6 sm:px-8 lg:px-20">
      <Link
        href="/admin/labs/sources"
        className="inline-flex h-9 items-center border border-border px-3 text-xs font-semibold text-text-secondary transition-colors hover:border-brand hover:text-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Manage Labs sources
      </Link>
    </div>
  );
}
