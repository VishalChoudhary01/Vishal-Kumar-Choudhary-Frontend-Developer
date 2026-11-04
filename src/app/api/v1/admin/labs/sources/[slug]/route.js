import {
  adminError,
  adminJson,
  getLabsOwnerUser,
} from "@/app/lib/labs/admin-http";
import { getOwnerLabSource } from "@/app/lib/labs/source-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  const { slug } = await params;
  try {
    return adminJson({ data: await getOwnerLabSource({ user, slug }) });
  } catch (error) {
    return adminError(error);
  }
}
