function validateProjectSeo(project, index) {
  const errors = [];
  const warnings = [];

  if (!project) {
    errors.push("Project record is missing.");
    return { errors, warnings };
  }

  if (!project.slug) {
    errors.push(`Project at index ${index} has no slug.`);
  }

  if (!project.name) {
    errors.push(`Project at index ${index} has no name.`);
  }

  if (!project.description) {
    warnings.push(
      `Project "${project.name || index}" has no description.`,
    );
  }

  if (!project.role) {
    warnings.push(
      `Project "${project.name}" has no role.`,
    );
  }

  if (!project.year) {
    warnings.push(
      `Project "${project.name}" has no year.`,
    );
  }

  if (!Array.isArray(project.technologies) || !project.technologies.length) {
    warnings.push(
      `Project "${project.name}" has no technologies.`,
    );
  }

  if (!project.media?.alt) {
    warnings.push(
      `Project "${project.name || project.slug}" has no media alt text.`,
    );
  }

  if (!project.seo?.title) {
    warnings.push(
      `Project "${project.name}" has no SEO title.`,
    );
  }

  if (!project.seo?.description) {
    warnings.push(
      `Project "${project.name}" has no SEO description.`,
    );
  }

  if (!project.updatedAt) {
    warnings.push(
      `Project "${project.name}" has no verified updatedAt.`,
    );
  }

  if (project.links) {
    const linkKeys = Object.keys(project.links);
    for (const key of linkKeys) {
      const value = project.links[key];
      if (!value || typeof value !== "string" || !value.trim()) {
        warnings.push(
          `Project "${project.name}" has an empty ${key} link.`,
        );
      } else {
        try {
          new URL(value);
        } catch (error) {
          warnings.push(
            `Project "${project.name}" has an invalid ${key} link: ${value}`,
          );
        }
      }
    }
  }

  return { errors, warnings };
}

function validateProjects(projects) {
  const errors = [];
  const warnings = [];

  if (!Array.isArray(projects)) {
    errors.push("projects is not an array.");
    return { errors, warnings };
  }

  const slugs = new Set();
  const titles = new Set();
  const descriptions = new Set();

  projects.forEach((project, index) => {
    const result = validateProjectSeo(project, index);
    errors.push(...result.errors);
    warnings.push(...result.warnings);

    if (project?.slug) {
      if (slugs.has(project.slug)) {
        warnings.push(
          `Duplicate slug: ${project.slug}`,
        );
      }
      slugs.add(project.slug);
    }

    if (project?.seo?.title) {
      if (titles.has(project.seo.title)) {
        warnings.push(
          `Duplicate SEO title: ${project.seo.title}`,
        );
      }
      titles.add(project.seo.title);
    }

    if (project?.seo?.description) {
      if (descriptions.has(project.seo.description)) {
        warnings.push(
          `Duplicate SEO description for: ${project.name}`,
        );
      }
      descriptions.add(project.seo.description);
    }
  });

  return { errors, warnings };
}

function validateSeoData({
  projects,
  socialLinks,
} = {}) {
  const errors = [];
  const warnings = [];

  if (!projects) {
    errors.push("projects is missing for SEO validation.");
  } else {
    const projectResult = validateProjects(projects);
    errors.push(...projectResult.errors);
    warnings.push(...projectResult.warnings);
  }

  if (socialLinks && Array.isArray(socialLinks)) {
    for (const link of socialLinks) {
      const href = link?.href;
      if (typeof href === "string" && href.trim()) {
        try {
          new URL(href);
        } catch (error) {
          warnings.push(
            `Invalid social link: ${href}`,
          );
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

module.exports = {
  validateProjectSeo,
  validateProjects,
  validateSeoData,
};
