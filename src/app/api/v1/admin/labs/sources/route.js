import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import {
  createOwnerLabSource,
  listOwnerLabSources,
} from "@/app/lib/labs/source-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  try {
    return adminJson({ data: await listOwnerLabSources({ user }) });
  } catch (error) {
    return adminError(error);
  }
}

export async function POST(request) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson({ error: { code: "INVALID_ORIGIN", message: "This request is not allowed." } }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return adminJson({ error: { code: "INVALID_REQUEST", message: "A valid request body is required." } }, 400);
  }

  try {
    return adminJson({ data: await createOwnerLabSource({ user, slug: body?.slug }) }, 201);
  } catch (error) {
    return adminError(error);
  }
}
