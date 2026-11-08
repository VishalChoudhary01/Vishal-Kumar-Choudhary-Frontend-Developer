import {
  adminError,
  adminJson,
  getLabsOwnerUser,
} from "@/app/lib/labs/admin-http";
import { listOwnerLabAuditEvents } from "@/app/lib/labs/source-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request, { params }) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  const { slug } = await params;
  const limit = Number(request.nextUrl.searchParams.get("limit") || 20);

  try {
    return adminJson({
      data: await listOwnerLabAuditEvents({ user, slug, limit }),
    });
  } catch (error) {
    return adminError(error);
  }
}
