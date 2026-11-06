import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import { getOwnerLabSource, publishOwnerLabSource } from "@/app/lib/labs/source-management";
import { buildOwnerLabRelease } from "@/app/lib/labs/release-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
// The linked Vercel Hobby plan caps Route Handlers at 60 seconds.
// Poster capture is optional and independently bounded inside the build worker.
export const maxDuration = 60;

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
    const versionId = body?.versionId;
    const currentSource = await getOwnerLabSource({ user, slug });
    let artifact = null;

    if (currentSource.isCustom) {
      if (!versionId || versionId !== currentSource.draftVersionId) {
        return adminJson({
          error: {
            code: "CONFLICT",
            message: "Save the current working copy, then build and publish that exact saved draft.",
          },
        }, 409);
      }
      artifact = await buildOwnerLabRelease({ user, slug, versionId });
    }

    const data = await publishOwnerLabSource({
      user,
      slug,
      versionId,
      artifactId: artifact?.artifactId || null,
      expectedPublishedVersionId: body?.expectedPublishedVersionId ?? null,
      requestId: body?.requestId,
    });
    return adminJson({ data: { ...data, artifact } });
  } catch (error) {
    return adminError(error);
  }
}
