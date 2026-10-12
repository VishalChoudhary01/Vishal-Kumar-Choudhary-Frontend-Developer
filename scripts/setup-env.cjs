"use strict";

const fs = require("fs");
const path = require("path");

const envPath = path.resolve(process.cwd(), ".env.local");

const template = `# Next.js public site URL used for production SEO metadata,
# canonical URLs, Open Graph, Twitter/X, JSON-LD, and sitemap URLs.
# This must be the real production domain and must NOT be localhost in production.
NEXT_PUBLIC_SITE_URL=https://your-production-domain.example
`;

if (fs.existsSync(envPath)) {
  console.log(
    "A .env.local already exists. Do not overwrite it automatically.",
  );
  console.log("Add NEXT_PUBLIC_SITE_URL to your existing .env.local.");
  process.exit(0);
}

fs.writeFileSync(envPath, template, "utf8");
console.log(".env.local created from SEO template.");
console.log("Please edit NEXT_PUBLIC_SITE_URL before deploying.");
process.exit(0);
