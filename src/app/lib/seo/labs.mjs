const PERSON_NAME = "Vishal Kumar Choudhary";
const PERSON_JOB_TITLE = "Frontend Developer";
const SITE_NAME = "Vishal Kumar Choudhary";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const LABS_COLLECTION_TITLE =
  "Frontend Experiments — Portfolio Labs | Vishal Kumar Choudhary";

export const LABS_COLLECTION_DESCRIPTION =
  "Explore published frontend experiments by Vishal Kumar Choudhary, a Frontend Developer. Browse motion and animation, CSS experiments, interface interactions, and creative coding.";

function normalizeSiteUrl(value) {
  const url = new URL(value);
  return url.toString().replace(/\/+$/, "");
}

function absoluteCanonical(siteUrl, slug) {
  return `${normalizeSiteUrl(siteUrl)}/labs/${encodeURIComponent(slug)}`;
}

/** Resolve only public HTTPS assets or app-root-relative media paths. */
export function buildLabPreviewImageUrl(experiment, siteUrl) {
  const preview =
    experiment?.thumbnail ||
    experiment?.generatedPoster ||
    experiment?.galleryPreview ||
    null;
  const src = typeof preview?.src === "string" ? preview.src.trim() : "";
  if (!src) return null;

  try {
    const absolute = new URL(src);
    if (absolute.protocol !== "https:" || absolute.username || absolute.password) {
      return null;
    }
    return absolute.toString();
  } catch {
    if (!src.startsWith("/") || src.startsWith("//")) return null;
    try {
      return new URL(src, `${normalizeSiteUrl(siteUrl)}/`).toString();
    } catch {
      return null;
    }
  }
}

function buildImageObject(experiment, imageUrl) {
  if (!imageUrl) return undefined;
  const preview =
    experiment?.thumbnail ||
    experiment?.generatedPoster ||
    experiment?.galleryPreview ||
    null;
  const alt =
    typeof preview?.alt === "string" && preview.alt.trim()
      ? preview.alt.trim()
      : `Preview of ${experiment?.title || "frontend experiment"}`;
  return [{ url: imageUrl, alt }];
}

export function buildLabsCollectionMetadata({ siteUrl, featuredExperiment = null } = {}) {
  const base = normalizeSiteUrl(siteUrl);
  const canonical = `${base}/labs`;
  const imageUrl = buildLabPreviewImageUrl(featuredExperiment, base);
  const images = buildImageObject(featuredExperiment, imageUrl);

  return {
    title: LABS_COLLECTION_TITLE,
    description: LABS_COLLECTION_DESCRIPTION,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "website",
      title: LABS_COLLECTION_TITLE,
      description: LABS_COLLECTION_DESCRIPTION,
      url: canonical,
      siteName: SITE_NAME,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: LABS_COLLECTION_TITLE,
      description: LABS_COLLECTION_DESCRIPTION,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export function buildLabExperimentMetadata({ siteUrl, experiment } = {}) {
  if (
    !experiment ||
    typeof experiment.slug !== "string" ||
    !SLUG_PATTERN.test(experiment.slug) ||
    typeof experiment.title !== "string" ||
    !experiment.title.trim()
  ) {
    return {
      title: "Experiment not found — Labs",
      robots: { index: false, follow: false },
    };
  }

  const base = normalizeSiteUrl(siteUrl);
  const canonical = absoluteCanonical(base, experiment.slug);
  const title =
    typeof experiment.seo?.title === "string" && experiment.seo.title.trim()
      ? experiment.seo.title.trim()
      : `${experiment.title.trim()} — Frontend Experiment | ${PERSON_NAME}`;
  const description =
    typeof experiment.seo?.description === "string" && experiment.seo.description.trim()
      ? experiment.seo.description.trim()
      : (experiment.description || "").trim();
  const imageUrl = buildLabPreviewImageUrl(experiment, base);
  const images = buildImageObject(experiment, imageUrl);

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      authors: [`${base}/`],
      ...(images ? { images } : {}),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export function buildLabsCollectionJsonLd({ siteUrl, experiments = [], totalCount } = {}) {
  const base = normalizeSiteUrl(siteUrl);
  const canonical = `${base}/labs`;
  const validExperiments = Array.isArray(experiments)
    ? experiments.filter(
        (experiment) =>
          typeof experiment?.slug === "string" &&
          SLUG_PATTERN.test(experiment.slug) &&
          typeof experiment?.title === "string" &&
          experiment.title.trim() &&
          typeof experiment?.description === "string" &&
          experiment.description.trim(),
      )
    : [];
  const parsedTotal = Number(totalCount);
  const numberOfItems = Number.isFinite(parsedTotal)
    ? Math.max(validExperiments.length, Math.floor(parsedTotal))
    : validExperiments.length;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonical}/#webpage`,
    url: canonical,
    name: LABS_COLLECTION_TITLE,
    description: LABS_COLLECTION_DESCRIPTION,
    isPartOf: { "@id": `${base}/#website` },
    mainEntity: {
      "@type": "ItemList",
      name: "Published frontend experiments",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems,
      itemListElement: validExperiments.map((experiment, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: experiment.title.trim(),
          description: experiment.description.trim(),
          url: absoluteCanonical(base, experiment.slug),
        },
      })),
    },
  };
}

export function buildLabExperimentJsonLd({ siteUrl, experiment } = {}) {
  if (
    !experiment ||
    typeof experiment.slug !== "string" ||
    !SLUG_PATTERN.test(experiment.slug) ||
    typeof experiment.title !== "string" ||
    !experiment.title.trim() ||
    typeof experiment.description !== "string" ||
    !experiment.description.trim()
  ) {
    return null;
  }

  const base = normalizeSiteUrl(siteUrl);
  const canonical = absoluteCanonical(base, experiment.slug);
  const image = buildLabPreviewImageUrl(experiment, base);
  const technologies = Array.isArray(experiment.technologies)
    ? [...new Set(
        experiment.technologies
          .filter((value) => typeof value === "string" && value.trim())
          .map((value) => value.trim()),
      )]
    : [];
  const keywords = [
    ...(experiment.category ? [experiment.category] : []),
    ...technologies,
  ];
  const creativeWork = {
    "@type": "CreativeWork",
    "@id": `${canonical}/#experiment`,
    name: experiment.title.trim(),
    description: experiment.description.trim(),
    url: canonical,
    creator: {
      "@type": "Person",
      "@id": `${base}/#person`,
      name: PERSON_NAME,
      jobTitle: PERSON_JOB_TITLE,
      url: `${base}/`,
    },
    ...(experiment.category ? { genre: experiment.category } : {}),
    ...(keywords.length ? { keywords } : {}),
    ...(image ? { image } : {}),
  };
  const breadcrumbId = `${canonical}/#breadcrumb`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}/#webpage`,
        url: canonical,
        name: `${experiment.title.trim()} | Portfolio Labs`,
        description: experiment.description.trim(),
        isPartOf: { "@id": `${base}/#website` },
        mainEntity: { "@id": `${canonical}/#experiment` },
        breadcrumb: { "@id": breadcrumbId },
      },
      creativeWork,
      {
        "@type": "BreadcrumbList",
        "@id": breadcrumbId,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${base}/` },
          { "@type": "ListItem", position: 2, name: "Labs", item: `${base}/labs` },
          {
            "@type": "ListItem",
            position: 3,
            name: experiment.title.trim(),
            item: canonical,
          },
        ],
      },
    ],
  };
}
