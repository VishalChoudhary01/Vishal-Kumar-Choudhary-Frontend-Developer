import assert from "node:assert/strict";
import test from "node:test";

import { buildTrustedAuthOrigins } from "../src/app/lib/auth/trusted-origins.mjs";

const canonicalOrigin = "https://vishal-kumar-choudhary-frontend-developer.vercel.app";
const deploymentPattern =
  "https://vishal-kumar-choudhary-frontend-developer-*.vercel.app";
const branchAliasPattern =
  "https://vishal-kumar-choudh-git-*-vishal-kumar-choudharys-projects.vercel.app";
const projectAlias =
  "https://vishal-kumar-choudhary-fronten-vishal-kumar-choudharys-projects.vercel.app";

test("production trusts the canonical host and only this project's HTTPS deployment hosts", () => {
  const origins = buildTrustedAuthOrigins({
    baseURL: canonicalOrigin,
    configuredOrigins: "https://accounts.example.com, https://accounts.example.com ",
    vercelEnvironment: "production",
  });

  assert.ok(origins.includes(canonicalOrigin));
  assert.ok(origins.includes(deploymentPattern));
  assert.ok(origins.includes(branchAliasPattern));
  assert.ok(origins.includes(projectAlias));
  assert.ok(origins.includes("https://accounts.example.com"));
  assert.equal(origins.length, new Set(origins).size);
  assert.equal(origins.includes("https://*.vercel.app"), false);
  assert.equal(origins.includes("*://*.vercel.app"), false);
});

test("Vercel deployment wildcard supports exact production deployment hostname shape", () => {
  const origins = buildTrustedAuthOrigins({
    baseURL: canonicalOrigin,
    vercelEnvironment: "production",
  });
  const pattern = origins.find((item) => item === deploymentPattern);
  assert.ok(pattern);
  assert.match(
    "https://vishal-kumar-choudhary-frontend-developer-mok2iryor.vercel.app",
    /^https:\/\/vishal-kumar-choudhary-frontend-developer-[a-z0-9-]+\.vercel\.app$/i,
  );
});

test("preview baseURL config contributes its canonical fallback instead of stringifying the object", () => {
  const origins = buildTrustedAuthOrigins({
    baseURL: {
      allowedHosts: ["vishal-kumar-choudhary-frontend-developer-*.vercel.app"],
      protocol: "https",
      fallback: canonicalOrigin,
    },
    vercelEnvironment: "preview",
  });

  assert.ok(origins.includes(canonicalOrigin));
  assert.ok(origins.includes(deploymentPattern));
  assert.equal(origins.some((origin) => origin === "[object Object]"), false);
});

test("local development does not trust Vercel deployment host patterns", () => {
  const origins = buildTrustedAuthOrigins({
    baseURL: "http://localhost:3000",
    configuredOrigins: "http://localhost:3001",
    vercelEnvironment: "development",
  });

  assert.deepEqual(origins, ["http://localhost:3000", "http://localhost:3001"]);
  assert.equal(origins.includes(deploymentPattern), false);
  assert.equal(origins.includes(branchAliasPattern), false);
});

test("auth configuration consumes the scoped trusted-origin builder", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(
    new URL("../src/app/lib/auth/auth.js", import.meta.url),
    "utf8",
  );

  assert.ok(source.includes('import { buildTrustedAuthOrigins } from "./trusted-origins.mjs"'));
  assert.ok(source.includes("trustedOrigins:"));
  assert.ok(source.includes("vercelEnvironment: process.env.VERCEL_ENV"));
});
