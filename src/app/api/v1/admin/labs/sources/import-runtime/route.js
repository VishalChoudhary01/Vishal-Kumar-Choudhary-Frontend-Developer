import {
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import {
  LAB_RUNTIME_SOURCE_SLUGS,
  getLabRuntimeSourceFiles,
} from "@/app/lib/labs/runtime-source-manifest";
import {
  createOwnerLabSource,
  getOwnerLabSource,
  saveOwnerLabDraft,
} from "@/app/lib/labs/source-management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson(
      { error: { code: "INVALID_ORIGIN", message: "This request is not allowed." } },
      403,
    );
  }

  const imported = [];
  const skipped = [];
  const failed = [];

  for (const slug of LAB_RUNTIME_SOURCE_SLUGS) {
    try {
      let source;
      try {
        source = await getOwnerLabSource({ user, slug });
      } catch (error) {
        if (error?.code !== "NOT_FOUND") throw error;
        await createOwnerLabSource({ user, slug });
        source = await getOwnerLabSource({ user, slug });
      }

      if (source.draftVersionId) {
        skipped.push({ slug, reason: "A draft already exists; existing work was preserved." });
        continue;
      }

      const files = await getLabRuntimeSourceFiles(slug);
      const version = await saveOwnerLabDraft({
        user,
        slug,
        files,
        expectedDraftVersionId: null,
        ¶»§q«^