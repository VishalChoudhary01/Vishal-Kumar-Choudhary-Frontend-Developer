import { NextResponse } from "next/server";

import { LAB_CATEGORIES } from "@/app/data/labsExperiments";
import { getPublishedCustomLabExperimentPage } from "@/app/lib/labs/public-experiments";
import { decodePublicExperimentCursor } from "@/app/lib/labs/public-experiment-cursor.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 18;

function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, no-cache, max-age=0, must-revalidate",
      Pragma: "no-cache",
      Vary: "Cookie, Authorization",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const category = params.get("category");
  const cursor = params.get("cursor");

  if (
    category !== null &&
    !LAB_CATEGORIES.some((item) => item.name === category)
  ) {
    return json(
      { error: { code: "INVALID_CATEGORY", message: "This Labs category is not supported." } },
      400,
    );
  }

  if (params.has("limit")) {
    return json(
      { error: { code: "INVALID_LIMIT", message: "The public Labs page size is fixed." } },
      400,
    );
  }

  if (params.has("cursor")) {
    try {
      decodePublicExperimentCursor(cursor);
    } catch {
      return json(
        { error: { code: "INVALID_CURSOR", message: "The experiment page cursor is invalid." } },
        400,
      );
    }
  }

  try {
    const page = await getPublishedCustomLabExperimentPage({
      category,
      cursor,
      limit: PAGE_SIZE,
    });

    return json({
      data: {
        experiments: page.experiments,
        nextCursor: page.nextCursor,
      },
    });
  } catch (error) {
    console.error("[labs-public-list] page failed:", error?.code || "PUBLIC_LABS_LIST_ERROR");
    return json(
      { error: { code: "PUBLIC_LABS_UNAVAILABLE", message: "The experiment collection is temporarily unavailable." } },
      503,
    );
  }
}
