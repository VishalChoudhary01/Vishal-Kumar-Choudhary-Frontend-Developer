import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import { deleteOwnerLabExperiment } from "@/app/lib/labs/experiment-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

export async function DELETE(request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson({
      error: { code: "INVALID_ORIGIN", message: "This request is not allowed." },
    }, 403);
  }

  const { slug } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return adminJson({
      error: { code: "INVALID_REQUEST", message: "A valid deletion confirmation is required." },
    }, 400);
  }

  try {
    const data = await deleteOwnerLabExperiment({
      user,
      slug,
      confirmSlug: body?.confirmSlug,
    });
    return adminJson({ data });
  } catch (error) {
    return adminError(error);
  }
}
