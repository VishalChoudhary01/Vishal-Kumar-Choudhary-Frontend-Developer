/**
 * Public Labs data source.
 *
 * This is a browser-safe presentation contract, not the final MongoDB
 * schema. Keep it separate from portfolio.projects. Populate only with
 * real, published experiments and public metadata; never put source code,
 * unpublished drafts, user records, or private access rules in this module.
 *
 * The demo object contains validated configuration only. It never contains
 * executable source or an import path. Runtime code is selected only by the
 * code-owned registry under components/labs/runtime/registry.js.
 */

export const LAB_CATEGORIES = [
  { id: "motion-animation", name: "Motion & Animation", label: "Motion" },
  { id: "css-experiments", name: "CSS Experiments", label: "CSS" },
  { id: "interface-interactions", name: "Interface Interactions", label: "Interactions" },
  { id: "creative-coding", name: "Creative Coding", label: "Creative Coding" },
];

const ASPECT_RATIOS = new Set(["16:9", "4:3", "1:1", "3:4"]);
const CONTROL_TYPES = new Set(["range", "number", "toggle", "select", "color"]);
const CONTROL_ID_PATTERN = /^[a-z0-9][a-z0-9_-]{0,39}$/i;
const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

export const publishedLabExperiments = [];

function sanitizeAspectRatio(value) {
  if (!value || typeof value !== "object") return undefined;

  const mobile = ASPECT_RATIOS.has(value.mobile) ? value.mobile : undefined;
  const desktop = ASPECT_RATIOS.has(value.desktop) ? value.desktop : undefined;

  return mobile || desktop ? { mobile, desktop } : undefined;
}

function sanitizeControl(control) {
  if (
    !control ||
    typeof control.id !== "string" ||
    !CONTROL_ID_PATTERN.test(control.id) ||
    typeof control.label !== "string" ||
    !control.label.trim() ||
    !CONTROL_TYPES.has(control.type)
  ) {
    return null;
  }

  if (control.type === "toggle") {
    return typeof control.defaultValue === "boolean"
      ? { id: control.id, label: control.label, type: "toggle", defaultValue: control.defaultValue }
      : null;
  }

  if (control.type === "color") {
    return typeof control.defaultValue === "string" && COLOR_PATTERN.test(control.defaultValue)
      ? { id: control.id, label: control.label, type: "color", defaultValue: control.defaultValue }
      : null;
  }

  if (control.type === "select") {
    const options = Array.isArray(control.options)
      ? control.options.filter(
          (option) =>
            option &&
            typeof option.value === "string" &&
            typeof option.label === "string"
        )
      : [];

    if (
      !options.length ||
      typeof control.defaultValue !== "string" ||
      !options.some((option) => option.value === control.defaultValue)
    ) {
      return null;
    }

    return {
      id: control.id,
      label: control.label,
      type: "select",
      defaultValue: control.defaultValue,
      options: options.map(({ value, label }) => ({ value, label })),
    };
  }

  const min = Number(control.min);
  const max = Number(control.max);
  const defaultValue = Number(control.defaultValue);
  const step = control.step === undefined ? 1 : Number(control.step);

  if (
    !Number.isFinite(min) ||
    !Number.isFinite(max) ||
    !Number.isFinite(defaultValue) ||
    !Number.isFinite(step) ||
    min > max ||
    defaultValue < min ||
    defaultValue > max ||
    step <= 0
  ) {
    return null;
  }

  return {
    id: control.id,
    label: control.label,
    type: control.type,
    defaultValue,
    min,
    max,
    step,
  };
}

/**
 * Map one approved published record into a deliberately small public DTO.
 * Replace this in-memory lookup with a server-only repository/service when
 * the approved MongoDB content flow is implemented.
 */
export function getPublishedLabExperimentBySlug(slug) {
  if (typeof slug !== "string" || !slug) return null;

  const experiment = publishedLabExperiments.find(
    (item) => item?.slug === slug
  );

  if (!experiment) return null;

  const category = LAB_CATEGORIES.some(
    (item) => item.name === experiment.category
  )
    ? experiment.category
    : undefined;

  const runtimeKey =
    typeof experiment.demo?.runtimeKey === "string" &&
    /^[a-z0-9][a-z0-9-]{0,79}$/i.test(experiment.demo.runtimeKey)
      ? experiment.demo.runtimeKey
      : undefined;

  return {
    slug: experiment.slug,
    title: experiment.title,
    description: experiment.description,
    explanation:
      typeof experiment.explanation === "string"
        ? experiment.explanation
        : undefined,
    category,
    technologies: Array.isArray(experiment.technologies)
      ? experiment.technologies.filter((value) => typeof value === "string")
      : [],
    thumbnail: experiment.thumbnail
      ? {
          src: experiment.thumbnail.src,
          alt:
            typeof experiment.thumbnail.alt === "string"
              ? experiment.thumbnail.alt
              : "",
          fit: experiment.thumbnail.fit === "contain" ? "contain" : "cover",
        }
      : null,
    seo: experiment.seo
      ? {
          title: experiment.seo.title,
          description: experiment.seo.description,
        }
      : undefined,
    demo: runtimeKey
      ? {
          runtimeKey,
          aspectRatio: sanitizeAspectRatio(experiment.demo.aspectRatio),
          capabilities: {
            restart: experiment.demo.capabilities?.restart === true,
            fullscreen: experiment.demo.capabilities?.fullscreen === true,
          },
          controls: Array.isArray(experiment.demo.controls)
            ? experiment.demo.controls.map(sanitizeControl).filter(Boolean)
            : [],
        }
      : null,
  };
}

export const featuredLabExperiment = null;
