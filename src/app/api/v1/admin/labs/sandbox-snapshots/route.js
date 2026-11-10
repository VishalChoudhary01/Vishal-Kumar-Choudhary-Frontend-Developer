import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import {
  deleteUnusedSnapshot,
  getSnapshotStorageReport,
} from "@/app/lib/labs/snapshot-storage-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 30;

export async function GET() {
  const { response } = await getLabsOwnerUser();
  if (response) return response;

  try {
    return adminJson({ data: await getSnapshotStorageReport() });
  } catch (error) {
    return adminError(error);
  }
}

export async function DELETE(request) {
  const { response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson({
      error: { code: "INVALID_ORIGIN", message: "This request is not allowed." },
    }, 403);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 2_048) {
    return adminJson({
      error: { code: "REQUEST_TOO_LARGE", message: "The delete request is too large." },
    }, 413);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return adminJson({
      error: { code: "INVALID_REQUEST", message: "A valid JSON request is required." },
    }, 400);
  }

  try {
    const result = await deleteUnusedSnapshot({
      snapshotId: body?.snapshotId,
      confirmation: body?.confirmation,
    });
    return adminJson({ data: result });
  } catch (error) {
    if (error?.code === "SNAPSHOT_CONFIRMATION_REQUIRED") {
      return adminJson({ error: { code: error.code, message: error.message } }, 400);
    }
    if (error?.code === "SNAPSHOT_NOT_SAFE_TO_DELETE") {
      return adminJson({ error: { code: error.code, message: error.message } }, 409);
    }
    return adminError(error);
  }
}
