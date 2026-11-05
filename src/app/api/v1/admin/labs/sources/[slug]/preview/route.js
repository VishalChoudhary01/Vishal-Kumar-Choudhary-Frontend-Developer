import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import { validateOwnerLabPreviewFiles } from "@/app/lib/labs/source-management";
import { createOwnerLabPreview } from "@/app/lib/labs/compiler-service";
import LabPreviewRun from "@/app/lib/labs/models/LabPreviewRun";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function POST(request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson({ error: { code: "INVALID_ORIGIN", message: "This request is not allowed." } }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 1_100_000) {
    return adminJson({ error: { code: "REQUEST_TOO_LARGE", message: "The source snapshot exceeds the preview request limit." } }, 413);
  }

  const { slug } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return adminJson({ error: { code: "INVALID_REQUEST", message: "A valid preview request body is required." } }, 400);
  }

  try {
    const { files } = await validateOwnerLabPreviewFiles({
      user,
      slug,
      inputFiles: body?.files,
    });
    const preview = await createOwnerLabPreview({ slug, user, inputFiles: files });

    await LabPreviewRun.createIndexes();
    await LabPreviewRun.create({
      runId: preview.runId,
      experimentSlug: slug,
      ownerUserId: user.id,
      sandboxName: preview.sandboxName,
      previewUrl: preview.previewUrl,
      sourceContentHash: preview.sourceContentHash,
      status: "ready",
      expiresAt: preview.expiresAt,
    });

    return adminJson({
      data: {
        runId: preview.runId,
        previewUrl: preview.previewUrl,
        expiresAt: preview.expiresAt.toISOString(),
        sourceContentHash: preview.sourceContentHash,
      },
    }, 201);
  } catch (error) {
    return adminError(error);
  }
}
