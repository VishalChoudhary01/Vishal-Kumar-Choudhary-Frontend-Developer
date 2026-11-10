import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import {
  listOwnerLabVersions,
  saveOwnerLabDraft,
} from "@/app/lib/labs/source-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  const { slug } = await params;
  try {
    return adminJson({ data: await listOwnerLabVersions({ user, slug }) });
  } catch (error) {
    return adminError(error);
  }
}

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
    const data = await saveOwnerLabDraft({
      user,
      slug,
      files: body?.files,
      expectedDraftVersionId: body?.expectedDraftVersionId ?? null,
      changeSummary: body?.changeSummary,
      requestId: body?.requestId,
    });
    return adminJson({ data }, 201);
  } catch (error) {
    return adminError(error);
  }
}
