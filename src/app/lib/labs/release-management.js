import "server-only";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import { getOwnerLabVersion } from "./source-management";
import LabBuildArtifact from "./models/LabBuildArtifact";
import { buildAndStoreOwnerLabRelease } from "./compiler-service";

export async function buildOwnerLabRelease({ user, slug, versionId }) {
  const version = await getOwnerLabVersion({ user, slug, versionId });
  const artifact = await buildAndStoreOwnerLabRelease({ slug, user, version });

  await connectToDatabase();
  await LabBuildArtifact.create(artifact);

  return {
    artifactId: artifact.artifactId,
    buildHash: artifact.buildHash,
    sourceVersionId: artifact.sourceVersionId,
    entryUrl: artifact.entryUrl,
    outputFileCount: artifact.outputFiles.length,
    compiler: artifact.compiler,
  };
}
