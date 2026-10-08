import { projects as baseProjects } from "./projectsData.js";

/*
 * PROJECT SEO FIELDS — the single place SEO metadata is attached to
 * canonical project records (spec §8: no second project database).
 *
 * - seo.title / seo.description follow spec §9 recommended titles.
 * - seo.keywords are factual, source-derived only.
 * - updatedAt is the git-verified last content-update date of
 *   projectsData.js (2026-10-07). Never fabricate this value; when the
 *   project content changes, update it to the real change date.
 */
export const projects = baseProjects.map((project) => {
  const slug = project?.slug || "";

  const seo = {
    'class-fuse': {
      title:
        "ClassFuse — Frontend Development Case Study | Vishal Kumar Choudhary",
      description:
        "A frontend case study of ClassFuse, a Tailwind CSS utility for cleaning, organizing, and formatting utility class strings with Next.js, React, and Tailwind CSS.",
      keywords: [
        "ClassFuse",
        "Tailwind CSS",
        "utility formatter",
        "class cleanup",
        "Next.js",
        "React",
        "JavaScript",
      ],
    },
    spendwise: {
      title:
        "Spendwise — Frontend Development Case Study | Vishal Kumar Choudhary",
      description:
        "A frontend case study of Spendwise, a shopping planning and price comparison web app built with Next.js, React, Redux Toolkit, Tailwind CSS, and Motion.",
      keywords: [
        "Spendwise",
        "shopping list",
        "price comparison",
        "Redux Toolkit",
        "Next.js",
        "React",
        "Tailwind CSS",
      ],
    },
    "system-canvas": {
      title:
        "System Canvas — Frontend Development Case Study | Vishal Kumar Choudhary",
      description:
        "A frontend case study of System Canvas, an interactive React workspace for exploring structured color and theme systems with Vite, Tailwind CSS, Redux Toolkit, and Motion.",
      keywords: [
        "System Canvas",
        "color system",
        "theme system",
        "React",
        "Vite",
        "Redux Toolkit",
        "Tailwind CSS",
      ],
    },
    "nextjs-master": {
      title:
        "Next.js Master — Frontend Development Case Study | Vishal Kumar Choudhary",
      description:
        "A frontend case study of Next.js Master, a reusable React and Next.js interface project using Tailwind CSS, Redux Toolkit, Motion, and Lenis.",
      keywords: [
        "Next.js Master",
        "Next.js",
        "React",
        "Tailwind CSS",
        "Redux Toolkit",
        "Motion",
        "Lenis",
      ],
    },
  }[slug] || {
    title: `${project.name} — Frontend Developer`,
    description: project.description,
  };

  return {
    ...project,
    seo,
    updatedAt: "2026-10-07",
  };
});
