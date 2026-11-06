import "server-only";

import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import LabExperiment from "./models/LabExperiment";
import LabSource from "./models/LabSource";
import LabBuildArtifact from "./models/LabBuildArtifact";
import { PUBLISHED_LAB_SOURCE_PROJECTION, selectEligiblePublishedCustomExperiments } from "./owner-analytics-utils.mjs";
import { resolveGalleryPreviewSelection } from "./gallery-preview-policy.mjs";
import {
  buildPublicExperimentCursorMatch,
  decodePublicExperimentCursor,
  encodePublicExperimentCursor,
} from "./public-experiment-cursor.mjs";

function isPublicBlobUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname.endsWith(".public.blob.vercel-storage.com") &&
      !url.username && !url.password && !url.port && !url.search && !url.hash;
  } catch {
    return false;
  }
}

function toPublicExperiment(experiment, artifact) {
  const storedPreview = experiment.galleryPreview;
  let galleryPreview = null;

  if (
    storedPreview?.artifactId === artifact.artifactId &&
    storedPreview?.sourceVersionId === artifact.sourceVersionId &&
    isPublicBlobUrl(storedPreview.src)
  ) {
    const mediaKind = storedPreview.mediaKind === "video" ? "video" : "image";
    const contentType = typeof storedPreview.contentType === "string"
      ? storedPreview.contentType
      : "image/jpeg";
    const allowedContentTypes = mediaKind === "video"
      ? new Set(["video/mp4", "video/webm"])
      : new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
    if (allowedContentTypes.has(contentType)) {
      galleryPreview = {
        src: storedPreview.src,
        alt: typeof storedPreview.alt === "string" ? storedPreview.alt : "",
        mediaKind,
        contentType,
        format: contentType === "image/gif" ? "gif" : "",
        fit: "contain",
        width: Number.isSafeInteger(storedPreview.width) && storedPreview.width > 0 ? storedPreview.width : null,
        height: Number.isSafeInteger(storedPreview.height) && storedPreview.height > 0 ? storedPreview.height : null,
      };
    }
  }

  const generatedPosterReady = artifact.previewPoster?.status === "ready" &&
    artifact.previewPoster?.captureVersion === "playwright-chromium-v1" &&
    artifact.previewPoster?.playwrightVersion === "1.65.0" &&
    artifact.previewPoster?.browserVersion === "158.0.8127.18" &&
    artifact.previewPoster?.path === "__preview/gallery-poster.png" &&
    artifact.previewPoster?.contentType === "image/png" &&
    artifact.previewPoster?.width === 1200 &&
    artifact.previewPoster?.height === 900 &&
    Number.isSafeInteger(artifact.previewPoster?.byteSize) &&
    artifact.previewPoster.byteSize > 0 &&
    artifact.previewPoster.byteSize <= 8 * 1024 * 1024 &&
    typeof artifact.previewPoster?.contentHash === "string" &&
    /^[a-f0-9]{64}$/.test(artifact.previewPoster.contentHash);

  const generatedPoster = generatedPosterReady
    ? {
        src:
          "/api/v1/labs/" +
          encodeURIComponent(experiment.slug) +
          "/runtime/" +
          encodeURIComponent(artifact.artifactId) +
          "/__preview/gallery-poster.png",
        alt: "Screenshot preview of " + experiment.title,
        fit: "contain",
        width: 1200,
        height: 900,
        mediaKind: "image",
        contentType: "image/png",
        generated: true,
      }
    : null;

  const { galleryVisual, thumbnail } = resolveGalleryPreviewSelection({
    uploadedPreview: galleryPreview,
    generatedPoster,
  });

  return {
    slug: experiment.slug,
    title: experiment.title,
    description: experiment.description,
    explanation: experiment.explanation || "",
    category: experiment.category,
    technologies: Array.isArray(experiment.technologies) ? experiment.technologies : [],
    galleryPreview: galleryVisual,
    generatedPoster,
    thumbnail,
    seo: {
      title: experiment.title + " — Labs",
      description: experiment.description,
    },
    demo: {
      runtimeKey: "published-artifact",
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
    .select(PUBLISHED_LAB_SOURCE_PROJECTION)
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


function buildPublishedEligibilityStages({ category, cursorMatch = null } = {}) {
  const experimentMatch = {
    kind: "custom",
    status: "published",
  };

  if (typeof category === "string" && category.trim()) {
    experimentMatch.category = category;
  }

  return [
    { $match: experimentMatch },
    ...(cursorMatch ? [{ $match: cursorMatch }] : []),
    {
      $project: {
        _id: 1,
        slug: 1,
        title: 1,
        description: 1,
        explanation: 1,
        category: 1,
        technologies: 1,
        galleryPreview: 1,
        publishedAt: 1,
        updatedAt: 1,
      },
    },
    {
      $lookup: {
        from: LabSource.collection.name,
        localField: "slug",
        foreignField: "slug",
        pipeline: [
          {
            $match: {
              published: true,
              publishedVersionId: { $type: "string", $ne: "" },
              publishedArtifactId: { $type: "string", $ne: "" },
            },
          },
          {
            $project: {
              _id: 0,
              publishedVersionId: 1,
              publishedArtifactId: 1,
            },
          },
        ],
        as: "publishedSource",
      },
    },
    { $unwind: "$publishedSource" },
    {
      $lookup: {
        from: LabBuildArtifact.collection.name,
        localField: "publishedSource.publishedArtifactId",
        foreignField: "artifactId",
        pipeline: [
          { $match: { status: "ready" } },
          {
            $project: {
              _id: 0,
              artifactId: 1,
              experimentSlug: 1,
              sourceVersionId: 1,
              previewPoster: 1,
            },
          },
        ],
        as: "readyArtifact",
      },
    },
    { $unwind: "$readyArtifact" },
    {
      $match: {
        $expr: {
          $and: [
            { $eq: ["$readyArtifact.experimentSlug", "$slug"] },
            {
              $eq: [
                "$readyArtifact.sourceVersionId",
                "$publishedSource.publishedVersionId",
              ],
            },
          ],
        },
      },
    },
  ];
}

/**
 * Return a bounded page of eligible public custom experiments. Eligibility is
 * enforced in MongoDB by joining the published source and its exact ready
 * artifact/version before applying the page limit.
 */
export async function getPublishedCustomLabExperimentPage({
  cursor = null,
  category = null,
  limit = 18,
  includeCategoryCounts = false,
} = {}) {
  const pageSize = Number.isInteger(limit) ? Math.min(24, Math.max(1, limit)) : 18;
  await connectToDatabase();

  const decodedCursor = cursor === null || cursor === undefined
    ? null
    : decodePublicExperimentCursor(cursor);
  const cursorMatch = decodedCursor
    ? buildPublicExperimentCursorMatch(decodedCursor, mongoose.Types.ObjectId)
    : null;

  const pagePipeline = [
    ...buildPublishedEligibilityStages({ category, cursorMatch }),
    { $sort: { publishedAt: -1, _id: -1 } },
    { $limit: pageSize + 1 },
    {
      $project: {
        _id: 1,
        slug: 1,
        title: 1,
        description: 1,
        explanation: 1,
        category: 1,
        technologies: 1,
        galleryPreview: 1,
        publishedAt: 1,
        updatedAt: 1,
        readyArtifact: 1,
      },
    },
  ];

  const pagePromise = LabExperiment.aggregate(pagePipeline).exec();
  const categoryCountsPromise = includeCategoryCounts
    ? LabExperiment.aggregate([
        ...buildPublishedEligibilityStages(),
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]).exec()
    : Promise.resolve(null);

  const [records, categoryGroups] = await Promise.all([
    pagePromise,
    categoryCountsPromise,
  ]);

  const hasMore = records.length > pageSize;
  const pageRecords = hasMore ? records.slice(0, pageSize) : records;
  const experiments = pageRecords.map((record) =>
    toPublicExperiment(record, record.readyArtifact),
  );
  const lastRecord = pageRecords.at(-1);
  const nextCursor = hasMore && lastRecord
    ? encodePublicExperimentCursor({
        publishedAt: lastRecord.publishedAt,
        id: String(lastRecord._id),
      })
    : null;

  if (!includeCategoryCounts) {
    return { experiments, nextCursor };
  }

  const categoryCounts = Object.fromEntries(
    (categoryGroups || [])
      .filter((group) => typeof group?._id === "string" && Number(group.count) > 0)
      .map((group) => [group._id, Number(group.count)]),
  );
  const totalCount = Object.values(categoryCounts).reduce(
    (total, count) => total + count,
    0,
  );

  return {
    experiments,
    nextCursor,
    totalCount,
    categoryCounts,
  };
}

export async function isPublishedCustomLabSlug(slug) {
  return Boolean(await getPublishedCustomLabExperimentBySlug(slug));
}
