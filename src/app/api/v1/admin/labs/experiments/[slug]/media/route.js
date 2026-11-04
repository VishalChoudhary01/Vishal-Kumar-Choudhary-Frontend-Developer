import {
  adminError,
  adminJson,
  getLabsOwnerUser,
} from "@/app/lib/labs/admin-http";
import { listOwnerLabMediaAssets } from "@/app/lib/labs/media-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  const { slug } = await params;
  try {
    return adminJson({ data: await listOwnerLabMediaAssets({ user, slug }) });
  } catch (error) {
    return adminError(error);
  }
}
