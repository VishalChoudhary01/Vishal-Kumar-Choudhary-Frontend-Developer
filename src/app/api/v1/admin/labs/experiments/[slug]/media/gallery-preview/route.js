import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import { saveOwnerLabGalleryPreview } from "@/app/lib/labs/media-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 30;

export async function PUT(request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson(
      { error: { code: "INVALID_ORIGIN", message: "This request is not allowed." } },
      403,
    );
  }

  const { slug } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return adminJson(
      { error: { code: "INVALID_REQUEST", message: "A valid request body is required." } },
      400,
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    !Object.prototype.hasOwnProperty.call(body, "assetId") ||
    (body.assetId !== null && typeof body.assetId !== "string")
  ) {
    return adminJson(
      { error: { code: "INVALID_REQUEST", message: "Choose an image or explicitly remove the current gallery poster." } },
      400,
    );
  }

  try {
    const data = await saveOwnerLabGalleryPreview({
      user,
      slug,
      assetId: body.assetId,
      altText: body?.altText ?? "",
      fit: body?.fit ?? "cover",
    });
    return adminJson({ data });
  } catch (error) {
    return adminError(error);
  }
}
