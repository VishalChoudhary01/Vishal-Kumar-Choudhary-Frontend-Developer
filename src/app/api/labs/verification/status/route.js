import { NextResponse } from "next/server";

import { getVerificationFlowStatus } from "@/app/lib/auth/verification-flows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const flowId = new URL(request.url).searchParams.get("flow");
  const verified = await getVerificationFlowStatus(flowId).catch(() => false);

  return NextResponse.json(
    { data: { verified } },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
        Pragma: "no-cache",
        Vary: "Cookie",
      },
    },
  );
}
