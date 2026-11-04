"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/app/lib/auth/client";

export default function LabOwnerSourceLink() {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [ownerUserId, setOwnerUserId] = useState(null);
  const isVerifiedSession = Boolean(session?.user?.id) && session.user.emailVerified === true;

  useEffect(() => {
    let active = true;

    if (sessionPending) {
      return () => {
        active = false;
      };
    }

    if (!isVerifiedSession) {
      return () => {
        active = false;
      };
    }

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
        if (active) setOwnerUserId(payload?.data?.isOwner === true ? session.user.id : null);
      })
      .catch(() => {
        if (active) setOwnerUserId(null);
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id, isVerifiedSession, sessionPending]);

  if (!isVerifiedSession || ownerUserId !== session.user.id) return null;

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
