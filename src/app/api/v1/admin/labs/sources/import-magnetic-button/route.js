import {
  adminError,
  adminJson,
  getLabsOwnerUser,
  isSameOriginMutation,
} from "@/app/lib/labs/admin-http";
import { createOwnerLabExperiment } from "@/app/lib/labs/experiment-management";
import {
  createOwnerLabSource,
  listOwnerLabSources,
  saveOwnerLabDraft,
} from "@/app/lib/labs/source-management";
import { getMagneticButtonSourceProjectFiles } from "@/app/lib/labs/magnetic-button-source-project";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const COMPONENT_SLUG = "magnetic-button-component";

export async function POST(request) {
  const { user, response } = await getLabsOwnerUser();
  if (response) return response;

  if (!isSameOriginMutation(request)) {
    return adminJson(
      { error: { code: "INVALID_ORIGIN", message: "This request is not allowed." } },
      403,
    );
  }

  try {
    let inventory = await listOwnerLabSources({ user });
    let source = inventory.find((item) => item.slug === COMPONENT_SLUG);

    if (source && source.isCustom !== true) {
      return adminJson(
        { error: { code: "SLUG_RESERVED", message: "The component workspace slug is reserved." } },
        409,
      );
    }

    if (!source) {
      await createOwnerLabExperiment({
        user,
        input: {
          title: "MagneticButton Component",
          slug: COMPONENT_SLUG,
          description: "A reusable Motion-powered magnetic button with configurable strength, radius and pointer-field behavior.",
          explanation: "This private source workspace contains the reusable MagneticButton component, its pure pointer-physics helper and a runnable React demonstration. The component props are designed to map to future source-managed controls.",
          category: "Interface Interactions",
          technologies: ["React", "Motion", "Tailwind CSS v4", "Pointer Events"],
        },
      });

      inventory = await listOwnerLabSources({ user });
      source = inventory.find((item) => item.slug === COMPONENT_SLUG);
    } else if (!source.hasSource) {
      await createOwnerLabSource({ user, slug: COMPONENT_SLUG });
      inventory = await listOwnerLabSources({ user });
      source = inventory.find((item) => item.slug === COMPONENT_SLUG);
    }

    if (!source?.hasSource) {
      throw new Error("The MagneticButton source workspace could not be initialized.");
    }

    if (source.draftVersionId) {
      return adminJson({
        data: {
          slug: COMPONENT_SLUG,
          title: "MagneticButton Component",
          workspaceUrl: "/admin/labs/sources/" + COMPONENT_SLUG,
          alreadyExists: true,
          imported: false,
          draftVersionId: source.draftVersionId,
          message: "An existing draft was preserved. Open the workspace to review it.",
        },
      });
    }

    const files = await getMagneticButtonSourceProjectFiles();
    const saved = await saveOwnerLabDraft({
      user,
      slug: COMPONENT_SLUG,
      files,
      expectedDraftVersionId: null,
      changeSummary: "Import reusable MagneticButton component and runnable React demo",
    });

    return adminJson({
      data: {
        slug: COMPONENT_SLUG,
        title: "MagneticButton Component",
        workspaceUrl: "/admin/labs/sources/" + COMPONENT_SLUG,
        alreadyExists: false,
        imported: true,
        versionId: saved.versionId,
        version: saved.version,
        fileCount: saved.fileCount,
        message: "MagneticButton source files were added as a private draft. Nothing was published.",
      },
    }, 201);
  } catch (error) {
    return adminError(error);
  }
}
