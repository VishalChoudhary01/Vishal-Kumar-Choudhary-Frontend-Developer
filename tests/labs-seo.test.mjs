import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

import {
  buildLabExperimentJsonLd,
  buildLabExperimentMetadata,
  buildLabPreviewImageUrl,
  buildLabsCollectionJsonLd,
  buildLabsCollectionMetadata,
} from "../src/app/lib/seo/labs.mjs";

const SITE_URL = "https://portfolio.example";
const labsCollectionRoute = await readFile(
  new URL("../src/app/labs/page.js", import.meta.url),
  "utf8",
);
const labsDetailRoute = await readFile(
  new URL("../src/app/labs/[slug]/page.js", import.meta.url),
  "utf8",
);
const labsHeroSource = await readFile(
  new URL("../src/app/components/labs/LabsIntroduction.js", import.meta.url),
  "utf8",
);
const labsDetailHeader = await readFile(
  new URL("../src/app/components/labs/detail/LabDetailHeader.js", import.meta.url),
  "utf8",
);
const labsExplanation = await readFile(
  new URL("../src/app/components/labs/detail/LabExplanation.js", import.meta.url),
  "utf8",
);
const sitemapSource = await readFile(
  new URL("../src/app/sitemap.js", import.meta.url),
  "utf8",
);
const robotsSource = await readFile(
  new URL("../src/app/robots.js", import.meta.url),
  "utf8",
);
const experiment = {
  slug: "magnetic-interaction",
  title: "Magnetic Interaction",
  description: "A frontend experiment exploring pointer-responsive interface motion.",
  explanation: "The interface responds to pointer position using a restrained magnetic offset.",
  category: "Interface Interactions",
  technologies: ["React", "Motion", "Tailwind CSS"],
  thumbnail: {
    src: "https://cdn.example/preview.webp",
    alt: "Magnetic Interaction experiment preview",
  },
  seo: {
    title: "Magnetic Interaction — Frontend Experiment | Vishal Kumar Choudhary",
    description: "A frontend experiment exploring pointer-responsive interface motion.",
  },
};

test("Labs collection metadata is indexable, canonical and explicitly describes the real collection", () => {
  const metadata = buildLabsCollectionMetadata({ siteUrl: SITE_URL, featuredExperiment: experiment });
  assert.equal(metadata.title, "Frontend Experiments — Portfolio Labs | Vishal Kumar Choudhary");
  assert.equal(metadata.alternates.canonical, "https://portfolio.example/labs");
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.equal(metadata.openGraph.type, "website");
  assert.equal(metadata.openGraph.images[0].url, experiment.thumbnail.src);
  assert.equal(metadata.twitter.card, "summary_large_image");
});

test("Labs collection metadata works without an experiment preview asset", () => {
  const metadata = buildLabsCollectionMetadata({ siteUrl: SITE_URL });
  assert.equal(metadata.alternates.canonical, "https://portfolio.example/labs");
  assert.equal(metadata.openGraph.images, undefined);
  assert.equal(metadata.twitter.images, undefined);
  assert.equal(metadata.twitter.card, "summary");
});

test("published experiment metadata is unique, canonical and includes available social image", () => {
  const metadata = buildLabExperimentMetadata({ siteUrl: SITE_URL, experiment });
  assert.equal(metadata.title, "Magnetic Interaction — Frontend Experiment | Vishal Kumar Choudhary");
  assert.equal(metadata.alternates.canonical, "https://portfolio.example/labs/magnetic-interaction");
  assert.deepEqual(metadata.robots, { index: true, follow: true });
  assert.equal(metadata.openGraph.type, "article");
  assert.equal(metadata.openGraph.images[0].url, experiment.thumbnail.src);
  assert.equal(metadata.twitter.card, "summary_large_image");
});

test("missing and invalid experiment records are not made indexable by metadata helpers", () => {
  assert.deepEqual(buildLabExperimentMetadata({ siteUrl: SITE_URL, experiment: null }), {
    title: "Experiment not found — Labs",
    robots: { index: false, follow: false },
  });
  assert.equal(
    buildLabExperimentJsonLd({ siteUrl: SITE_URL, experiment: { ...experiment, slug: "../private" } }),
    null,
  );
});

test("preview image resolver never serializes a video asset as an Open Graph or structured-data image", () => {
  assert.equal(
    buildLabPreviewImageUrl({
      galleryPreview: {
        src: "https://cdn.example/preview.mp4",
        mediaKind: "video",
        contentType: "video/mp4",
      },
    }, SITE_URL),
    null,
  );
  assert.equal(
    buildLabPreviewImageUrl({
      galleryPreview: {
        src: "https://cdn.example/preview.mp4",
        mediaKind: "video",
        contentType: "video/mp4",
      },
      generatedPoster: {
        src: "https://cdn.example/preview.webp",
        mediaKind: "image",
        contentType: "image/webp",
      },
    }, SITE_URL),
    "https://cdn.example/preview.webp",
  );
});

test("preview image resolver accepts public HTTPS and root-relative assets only", () => {
  assert.equal(buildLabPreviewImageUrl(experiment, SITE_URL), experiment.thumbnail.src);
  assert.equal(
    buildLabPreviewImageUrl({ thumbnail: { src: "/api/v1/labs/demo/poster.png" } }, SITE_URL),
    "https://portfolio.example/api/v1/labs/demo/poster.png",
  );
  assert.equal(buildLabPreviewImageUrl({ thumbnail: { src: "javascript:alert(1)" } }, SITE_URL), null);
  assert.equal(buildLabPreviewImageUrl({ thumbnail: { src: "//evil.example/image.png" } }, SITE_URL), null);
  assert.equal(buildLabPreviewImageUrl({ thumbnail: { src: "http://cdn.example/image.png" } }, SITE_URL), null);
});

test("collection structured data lists only eligible current-page records and reports the total published count", () => {
  const jsonLd = buildLabsCollectionJsonLd({
    siteUrl: SITE_URL,
    experiments: [
      experiment,
      { slug: "../private", title: "Private draft", description: "Never include this." },
      { slug: "missing-description", title: "Missing description" },
    ],
    totalCount: 31,
  });
  assert.equal(jsonLd["@type"], "CollectionPage");
  assert.equal(jsonLd.url, "https://portfolio.example/labs");
  assert.equal(jsonLd.mainEntity.numberOfItems, 31);
  assert.equal(jsonLd.mainEntity.itemListElement.length, 1);
  assert.equal(jsonLd.mainEntity.itemListElement[0].item.url, "https://portfolio.example/labs/magnetic-interaction");
});

test("detail structured data describes visible experiment facts and real internal breadcrumbs", () => {
  const jsonLd = buildLabExperimentJsonLd({ siteUrl: SITE_URL, experiment });
  const [webPage, creativeWork, breadcrumb] = jsonLd["@graph"];
  assert.equal(webPage["@type"], "WebPage");
  assert.equal(webPage.mainEntity["@id"], "https://portfolio.example/labs/magnetic-interaction/#experiment");
  assert.equal(creativeWork["@type"], "CreativeWork");
  assert.equal(creativeWork.name, experiment.title);
  assert.equal(creativeWork.description, experiment.description);
  assert.equal(creativeWork.genre, experiment.category);
  assert.deepEqual(creativeWork.keywords, ["Interface Interactions", "React", "Motion", "Tailwind CSS"]);
  assert.equal(creativeWork.image, experiment.thumbnail.src);
  assert.equal(creativeWork.creator.name, "Vishal Kumar Choudhary");
  assert.equal(
    creativeWork.datePublished,
    undefined,
  );
  assert.equal(
    creativeWork.dateModified,
    undefined,
  );
  assert.deepEqual(
    breadcrumb.itemListElement.map((item) => item.item),
    ["https://portfolio.example/", "https://portfolio.example/labs", "https://portfolio.example/labs/magnetic-interaction"],
  );
});

test("detail structured data includes only valid published and modified timestamps", () => {
  const withDates = buildLabExperimentJsonLd({
    siteUrl: SITE_URL,
    experiment: {
      ...experiment,
      publishedAt: "2026-10-01T10:00:00.000Z",
      updatedAt: "2026-11-07T10:00:00.000Z",
    },
  })["@graph"][1];
  assert.equal(withDates.datePublished, "2026-10-01T10:00:00.000Z");
  assert.equal(withDates.dateModified, "2026-11-07T10:00:00.000Z");

  const invalidDates = buildLabExperimentJsonLd({
    siteUrl: SITE_URL,
    experiment: { ...experiment, publishedAt: "not-a-date", updatedAt: null },
  })["@graph"][1];
  assert.equal(invalidDates.datePublished, undefined);
  assert.equal(invalidDates.dateModified, undefined);

  const creativeWork = buildLabExperimentJsonLd({ siteUrl: SITE_URL, experiment })["@graph"][1];
  assert.equal(creativeWork.aggregateRating, undefined);
  assert.equal(creativeWork.review, undefined);
  assert.equal(creativeWork.interactionStatistic, undefined);
});


test("Labs collection route wires dynamic metadata and server-rendered CollectionPage JSON-LD", () => {
  assert.match(labsCollectionRoute, /export async function generateMetadata\(\)/);
  assert.match(labsCollectionRoute, /buildLabsCollectionMetadata/);
  assert.match(labsCollectionRoute, /buildLabsCollectionJsonLd/);
  assert.match(labsCollectionRoute, /<JsonLd data=\{jsonLd\} \/>/);
  assert.match(labsCollectionRoute, /getPublishedCustomLabExperimentPage/);
});

test("Labs detail route wires canonical metadata, noindex missing records and server-rendered detail JSON-LD", () => {
  assert.match(labsDetailRoute, /buildLabExperimentMetadata/);
  assert.match(labsDetailRoute, /buildLabExperimentJsonLd/);
  assert.match(labsDetailRoute, /robots: \{ index: false, follow: false \}/);
  assert.match(labsDetailRoute, /notFound\(\)/);
  assert.match(labsDetailRoute, /<JsonLd data=\{jsonLd\} \/>/);
  assert.match(labsDetailRoute, /<article aria-labelledby="lab-page-title">/);
  assert.doesNotMatch(labsDetailRoute, /<iframe|LabWorkspace|LabRuntimeBoundary/);
});

test("Labs public collection and detail expose answer-ready visible information with real links", () => {
  assert.match(labsHeroSource, /Published frontend experiments by Vishal Kumar Choudhary/);
  assert.match(labsHeroSource, /Frontend Developer/);
  assert.match(labsDetailHeader, /<h1 id="lab-page-title"/);
  assert.match(labsDetailHeader, /A frontend experiment by Vishal Kumar Choudhary/);
  assert.match(labsDetailHeader, /experiment\.category/);
  assert.match(labsDetailHeader, /technologies\.join/);
  assert.match(labsExplanation, /How it works/);
  assert.match(labsExplanation, /\{explanation\}/);
});

test("sitemap includes eligible published Labs pages through all cursor pages and only uses real data dates", () => {
  assert.match(sitemapSource, /getPublishedCustomLabExperimentPage\(\{ cursor, limit: 24 \}\)/);
  assert.match(sitemapSource, /cursor = page\.nextCursor/);
  assert.match(sitemapSource, /experiment\.updatedAt \|\| experiment\.publishedAt/);
  assert.match(sitemapSource, /\/labs\/\$\{encodeURIComponent\(experiment\.slug\)\}/);
});

test("robots keeps private admin paths out of crawl discovery without blocking public Labs poster routes", () => {
  assert.match(robotsSource, /disallow: \["\/admin", "\/admin\/"\]/);
  assert.doesNotMatch(robotsSource, /"\/api\//);
});
