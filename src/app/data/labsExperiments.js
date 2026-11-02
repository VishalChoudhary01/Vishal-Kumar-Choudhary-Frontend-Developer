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

export const publishedLabExperiments = [];

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

  return {
    slug: experiment.slug,
    title: experiment.title,
    description: experiment.description,
    explanation: experiment.explanation,
    category: experiment.category,
    technologies: Array.isArray(experiment.technologies)
      ? experiment.technologies.filter((value) => typeof value === "string")
      : [],
    thumbnail: experiment.thumbnail
      ? {
          src: experiment.thumbnail.src,
          alt: experiment.thumbnail.alt || "",
          fit: experiment.thumbnail.fit === "contain" ? "contain" : "cover",
        }
      : null,
    seo: experiment.seo
      ? {
          title: experiment.seo.title,
          description: experiment.seo.description,
        }
      : undefined,
    demo: experiment.demo
      ? {
          runtimeKey: experiment.demo.runtimeKey,
          aspectRatio: experiment.demo.aspectRatio,
          capabilities: {
            restart: experiment.demo.capabilities?.restart === true,
            fullscreen: experiment.demo.capabilities?.fullscreen === true,
          },
          controls: Array.isArray(experiment.demo.controls)
            ? experiment.demo.controls
                .filter((control) =>
                  control &&
                  typeof control.id === "string" &&
                  typeof control.label === "string" &&
                  ["range", "number", "toggle", "select", "color"].includes(control.type)
                )
                .map((control) => ({
                  id: control.id,
                  label: control.label,
                  type: control.type,
                  defaultValue: control.defaultValue,
                  min: control.min,
                  max: control.max,
                  step: control.step,
                  options: Array.isArray(control.options)
                    ? control.options.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))
                    : [],
                }))
            : [],
        }
      : null,
  };
}

export const featuredLabExperiment = null;
