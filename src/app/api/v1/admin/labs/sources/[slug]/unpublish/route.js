import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import { unpublishOwnerLabSource } from "@/app/lib/labs/source-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson({ error: { code: "INVALID_ORIGIN", message: "This request is not allowed." } }, 403);
  }

  const { slug } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return adminJson({ error: { code: "INVALID_REQUEST", message: "A valid request body is required." } }, 400);
  }

  try {
    const data = await unpublishOwnerLabSource({
      user,
      slug,
      expectedPublishedVersionId: body?.expectedPublishedVersionId ?? null,
      requestId: body?.requestId,
    });
    return adminJson({ data });
  } catch (error) {
    return adminError(error);
  }
}
