import {
  adminError,
  adminJson,
  getLabsOwnerUser,
} from "@/app/lib/labs/admin-http";
import { getOwnerLabVersion } from "@/app/lib/labs/source-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  const { slug, versionId } = await params;
  try {
    return adminJson({
      data: await getOwnerLabVersion({ user, slug, versionId }),
    });
  } catch (error) {
    return adminError(error);
  }
}
