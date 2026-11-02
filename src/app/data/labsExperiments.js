/**
 * Public Labs data source.
 *
 * This is a presentation contract, not the final MongoDB schema.
 * Keep it separate from portfolio.projects. Populate only with real,
 * published experiments and public metadata; never put source code,
 * unpublished drafts, or private access rules in this module.
 *
 * Experiment shape:
 * {
 *   slug: string,
 *   title: string,
 *   description: string,
 *   category: one of LAB_CATEGORIES[].name,
 *   technologies: string[],
 *   thumbnail?: { src: string, alt: string, fit?: "cover" | "contain" }
 * }
 */

export const LAB_CATEGORIES = [
  { id: "motion-animation", name: "Motion & Animation", label: "Motion" },
  { id: "css-experiments", name: "CSS Experiments", label: "CSS" },
  { id: "interface-interactions", name: "Interface Interactions", label: "Interactions" },
  { id: "creative-coding", name: "Creative Coding", label: "Creative Coding" },
];

/**
 * Intentionally empty until actual experiment content is approved.
 * This prevents sample/fabricated cards from appearing in production.
 */
export const publishedLabExperiments = [];

/**
 * Must reference an item in publishedLabExperiments.
 * A null value hides the featured section until a real experiment is chosen.
 */
export const featuredLabExperiment = null;
