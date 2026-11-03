/**
 * Public Labs content.
 *
 * Keep this presentation data separate from portfolio.projects. This module
 * contains only public, code-owned display metadata and validated demo
 * configuration. It must never contain source code, drafts, user data or
 * private source-access policy.
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

export const publishedLabExperiments = [
  {
    slug: "magnetic-interaction",
    title: "Magnetic Interaction",
    description:
      "A pointer-aware button that follows your cursor inside a magnetic field, then smoothly returns to its resting position.",
    explanation:
      "The pointer position is measured from the center of the canvas. Inside the configured radius, that offset is softened and limited by the strength setting, then animated with a spring. The result is a small, responsive pull without moving the surrounding layout.",
    category: "Interface Interactions",
    technologies: ["React", "Motion", "Pointer Events"],
    seo: {
      title: "Magnetic Interaction — Labs",
      description:
        "Experiment with a magnetic button interaction, adjustable attraction strength and pointer radius.",
    },
    demo: {
      runtimeKey: "magnetic-interaction",
      aspectRatio: {
        mobile: "4:3",
        desktop: "16:9",
      },
      capabilities: {
        restart: true,
        fullscreen: true,
      },
      controls: [
        {
          id: "strength",
          label: "Magnetic strength",
          type: "range",
          defaultValue: 28,
          min: 0,
          max: 42,
          step: 1,
        },
        {
          id: "radius",
          label: "Field radius",
          type: "range",
          defaultValue: 180,
          min: 80,
          max: 300,
          step: 10,
        },
        {
          id: "showField",
          label: "Show magnetic field",
          type: "toggle",
          defaultValue: true,
        },
      ],
    },
  },
  {
    slug: "scroll-driven-text-reveal",
    title: "Scroll-driven Text Reveal",
    description:
      "A typography study where each word emerges as the canvas moves through the viewport.",
    explanation:
      "The canvas scroll progress is mapped to each word's opacity and vertical offset. Scrolling forward reveals the sentence, while scrolling back reverses it. Reduced-motion preferences show the complete sentence without scroll-linked movement.",
    category: "Motion & Animation",
    technologies: ["React", "Motion", "useScroll"],
    seo: {
      title: "Scroll-driven Text Reveal — Labs",
      description:
        "Explore a scroll-linked typography reveal with adjustable reveal span and progress feedback.",
    },
    demo: {
      runtimeKey: "scroll-driven-text-reveal",
      aspectRatio: {
        mobile: "4:3",
        desktop: "16:9",
      },
      capabilities: {
        restart: false,
        fullscreen: false,
      },
      controls: [
        {
          id: "pace",
          label: "Reveal span",
          type: "range",
          defaultValue: 80,
          min: 55,
          max: 100,
          step: 5,
        },
        {
          id: "showProgress",
          label: "Show scroll progress",
          type: "toggle",
          defaultValue: true,
        },
      ],
    },
  },
  {
    slug: "gradient-bloom",
    title: "Gradient Bloom",
    description:
      "A CSS-only color study that layers radial and conic gradients into a soft, configurable field of light.",
    explanation:
      "The composition is built from CSS radial gradients, a conic gradient and color-mix(). The controls update CSS custom properties, so intensity, spread and color change in place without a canvas renderer or animation library.",
    category: "CSS Experiments",
    technologies: ["CSS Gradients", "CSS Custom Properties", "color-mix()"],
    seo: {
      title: "Gradient Bloom — Labs",
      description:
        "Explore a CSS gradient composition with live controls for color, intensity and spread.",
    },
    demo: {
      runtimeKey: "gradient-bloom",
      aspectRatio: {
        mobile: "4:3",
        desktop: "16:9",
      },
      capabilities: {
        restart: false,
        fullscreen: false,
      },
      controls: [
        {
          id: "color",
          label: "Bloom color",
          type: "color",
          defaultValue: "#07A290",
        },
        {
          id: "intensity",
          label: "Intensity",
          type: "range",
          defaultValue: 58,
          min: 15,
          max: 85,
          step: 1,
        },
        {
          id: "spread",
          label: "Spread",
          type: "range",
          defaultValue: 74,
          min: 35,
          max: 90,
          step: 1,
        },
      ],
    },
  },
];

const featuredSlug = "magnetic-interaction";

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
      ? {
          id: control.id,
          label: control.label,
          type: "toggle",
          defaultValue: control.defaultValue,
        }
      : null;
  }

  if (control.type === "color") {
    return typeof control.defaultValue === "string" &&
      COLOR_PATTERN.test(control.defaultValue)
      ? {
          id: control.id,
          label: control.label,
          type: "color",
          defaultValue: control.defaultValue,
        }
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

function toPublicExperiment(experiment) {
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

export function getPublishedLabExperimentBySlug(slug) {
  if (typeof slug !== "string" || !slug) return null;

  const experiment = publishedLabExperiments.find(
    (item) => item?.slug === slug
  );

  return toPublicExperiment(experiment);
}

const featuredExperiment = publishedLabExperiments.find(
  (experiment) => experiment.slug === featuredSlug
);

export const featuredLabExperiment = featuredExperiment
  ? {
      slug: featuredExperiment.slug,
      title: featuredExperiment.title,
      description: featuredExperiment.description,
      category: featuredExperiment.category,
      technologies: [...featuredExperiment.technologies],
      thumbnail: featuredExperiment.thumbnail
        ? { ...featuredExperiment.thumbnail }
        : null,
    }
  : null;
