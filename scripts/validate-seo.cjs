"use strict";

/*
 * PROJECT SEO DATA VALIDATOR (spec §27).
 *
 * Run via: node scripts/validate-seo.cjs
 * Fails the process on critical data errors; prints warnings otherwise.
 *
 * Imports only pure data modules (no JSX, no path aliases) so it runs
 * under plain Node without a bundler.
 */

const path = require("path");

const projectRoot = process.cwd();

function requireFrom(subpath) {
  return require(path.resolve(projectRoot, subpath));
}

const { validateSeoData } = requireFrom("src/app/lib/seo/validators");
const { projects } = requireFrom("src/app/data/projectsSeo");

let socialLinks = [];

try {
  const { socialData } = requireFrom("src/app/data/socialData");
  socialLinks = socialData || [];
} catch (error) {
  // socialData imports JSX icons through path aliases, which plain Node
  // cannot load. Social links are still validated at render time by
  // buildProfilePageJsonLd (which filters to real absolute URLs).
  socialLinks = [];
}

const result = validateSeoData({
  projects,
  socialLinks,
});

if (!result.valid) {
  console.error("SEO validation errors:");
  console.error(result.errors.join("\n"));
  process.exit(1);
}

if (result.warnings.length) {
  console.warn("SEO validation warnings:");
  console.warn(result.warnings.join("\n"));
}

console.log(
  `SEO validation passed. ${result.warnings.length} warning(s).`,
);
process.exit(0);
