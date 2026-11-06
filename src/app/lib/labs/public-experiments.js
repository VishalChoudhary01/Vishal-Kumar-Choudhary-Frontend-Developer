import "server-only";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import LabExperiment from "./models/LabExperiment";
import LabSource from "./models/LabSource";
import LabBuildArtifact from "./models/LabBuildArtifact";
import { selectEligiblePublishedCustomExperiments } from "./owner-analytics-utils.mjs";

function toPublicExperiment(experiment, artifact) {
  const storedPreview = experiment.galleryPreview;
  let galleryPreview = null;

  if (
    storedPreview?.artifactId === artifact.artifactId &&
    storedPreview?.sourceVersionId === artifact.sourceVersionId &&
    typeof storedPreview.src === "string"
  ) {
    try {
      const previewUrl = new URL(storedPreview.src);
      if (
        previewUrl.protocol === "https:" &&
        previewUrl.hostname.endsWith(".public.blob.vercel-storage.com")
      ) {
        galleryPreview = {
          src: previewUrl.toString(),
          alt: typeof storedPreview.alt === "string" ? storedPreview.alt : "",
          fit: storedPreview.fit === "contain" ? "contain" : "cover",
        };
      }
    } catch {
      galleryPreview = null;
    }
  }

  return {
    slug: experiment.slug,
    title: experiment.title,
    description: experiment.description,
    explanation: experiment.explanation || "",
    category: experiment.category,
    technologies: Array.isArray(experiment.technologies) ? experiment.technologies : [],
    galleryPreview,
    thumbnail: galleryPreview,
    seo: {
      title: experiment.title + " — Labs",
      description: experiment.description,
    },
    demo: {
      runtimeKey: "published-artifact",
      // Vercel Blob serves HTML as an attachment. Route all published files
      // through the Labs runtime handler so the isolated iframe gets inline
      // content, strict CSP and an artifact-scoped readiness bridge.
      runtimeUrl:
        "/api/v1/labs/" +
        encodeURIComponent(experiment.slug) +
        "/runtime/" +
        encodeURIComponent(artifact.artifactId) +
        "/",
      artifactId: artifact.artifactId,
      aspectRatio: { mobile: "4:3", desktop: "16:9" },
      capabilities: { restart: false, fullscreen: true },
      controls: [],
    },
  };
}

export async function getPublishedCustomLabExperimentBySlug(slug) {
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;

  await connectToDatabase();
  const experiment = await LabExperiment.findOne({
    slug,
    kind: "custom",
    status: "published",
  }).lean();
  if (!experiment) return null;

  const source = await LabSource.findOne({
    slug,
    published: true,
    publishedVersionId: { $ne: null },
    publishedArtifactId: { $ne: null },
  })
    .select("publishedVersionId publishedArtifactId")
    .lean();
  if (!source) return null;

  const artifact = await LabBuildArtifact.findOne({
    artifactId: source.publishedArtifactId,
    experimentSlug: slug,
    sourceVersionId: source.publishedVersionId,
    status: "ready",
  }).lean();
  if (!artifact) return null;

  return toPublicExperiment(experiment, artifact);
}

export async function getPublishedCustomLabExperiments() {
  await connectToDatabase();
  const experiments = await LabExperiment.find({
    kind: "custom",
    status: "published",
  })
    .select("slug title description explanation category technologies galleryPreview")
    .sort({ publishedAt: -1, updatedAt: -1 })
    .lean();

  if (!experiments.length) return [];

  const slugs = experiments.map((item) => item.slug);
  const sources = await LabSource.find({
    slug: { $in: slugs },
    published: true,
    publishedVersionId: { $ne: null },
    publishedArtifactId: { $ne: null },
  })
    .select("slug publishedVersionId publishedArtifactId")
    .lean();

  if (!sources.length) return [];
  const artifactIds = sources.map((item) => item.publishedArtifactId);
  const artifacts = await LabBuildArtifact.find({
    artifactId: { $in: artifactIds },
    status: "ready",
  }).lean();

  return selectEligiblePublishedCustomExperiments({
    experiments,
    sources,
    artifacts,
  }).map(({ experiment, artifact }) => toPublicExperiment(experiment, artifact));
}

export async function isPublishedCustomLabSlug(slug) {
  return Boolean(await getPublishedCustomLabExperimentBySlug(slug));
}
