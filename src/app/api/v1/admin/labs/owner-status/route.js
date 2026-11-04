import { NextResponse } from "next/server";

import { getCurrentAuthSession } from "@/app/lib/auth/server-session";
import { isLabsOwner } from "@/app/lib/labs/owner-access";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getCurrentAuthSession();
    return NextResponse.json(
      { data: { isOwner: isLabsOwner(session?.user) } },
      {
        headers: {
          "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Vary: "Cookie, Authorization",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { data: { isOwner: false } },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Vary: "Cookie, Authorization",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }
}
