import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import { getLabRuntimeSourceFiles } from "@/app/lib/labs/runtime-source-manifest";
import { saveOwnerLabDraft } from "@/app/lib/labs/source-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request, { params }) {
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

  try {
    const files = await getLabRuntimeSourceFiles(slug);
    const data = await saveOwnerLabDraft({
      user,
      slug,
      files,
      expectedDraftVersionId: body?.expectedDraftVersionId ?? null,
      changeSummary: "Imported reviewed code-owned runtime snapshot",
      requestId: body?.requestId,
    });

    return adminJson(
      {
        data: {
          ...data,
          importedFileCount: files.length,
          importedPaths: files.map((file) => file.path),
        },
      },
      201,
    );
  } catch (error) {
    return adminError(error);
  }
¶»§q«^