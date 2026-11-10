import assert from "node:assert/strict";
import test from "node:test";

import { buildTrustedAuthOrigins } from "../src/app/lib/auth/trusted-origins.mjs";

const canonicalOrigin = "https://vishal-kumar-choudhary-frontend-developer.vercel.app";
const currentDeploymentOrigin =
  "https://vishal-kumar-choudhary-frontend-developer-mok2iryor.vercel.app";
const branchAliasOrigin =
  "https://vishal-kumar-choudh-git-develop-vishal-kumar-choudharys-projects.vercel.app";

test("production adds only the exact incoming HTTPS origin for this project", () => {
  const origins = buildTrustedAuthOrigins({
    baseURL: canonicalOrigin,
    configuredOrigins: "https://accounts.example.com, https://accounts.example.com ",
    vercelEnvironment: "production",
    request: { headers: new Headers({ origin: currentDeploymentOrigin }) },
  });

  assert.ok(origins.includes(canonicalOrigin));
  assert.ok(origins.includes(currentDeploymentOrigin));
  assert.ok(origins.includes("https://accounts.example.com"));
  assert.equal(origins.length, new Set(origins).size);
  assert.equal(origins.some((origin) => origin.includes("*")), false);
});

test("untrusted hosts, HTTP origins and malformed values cannot extend trusted origins", () => {
  for (const origin of [
    "https://vishal-kumar-choudhary-frontend-developer-attacker.vercel.app.evil.example",
    "https://another-project-mok2iryor.vercel.app",
    "http://vishal-kumar-choudhary-frontend-developer-mok2iryor.vercel.app",
    "https://vishal-kumar-choudhary-frontend-developer-mok2iryor.vercel.app.evil",
    "https://user@vishal-kumar-choudhary-frontend-developer-mok2iryor.vercel.app",
    "not-a-url",
  ]) {
    const origins = buildTrustedAuthOrigins({
      baseURL: canonicalOrigin,
      vercelEnvironment: "production",
      request: { headers: new Headers({ origin }) },
    });

    assert.deepEqual(origins, [canonicalOrigin], origin);
  }
});

test("validated Vercel runtime and branch alias hostnames support internal auth API calls", () => {
  const origins = buildTrustedAuthOrigins({
    baseURL: canonicalOrigin,
    vercelEnvironment: "preview",
    vercelURL: "vishal-kumar-choudhary-frontend-developer-mok2iryor.vercel.app",
    vercelBranchURL: "vishal-kumar-choudh-git-develop-vishal-kumar-choudharys-projects.vercel.app",
  });

  assert.ok(origins.includes(canonicalOrigin));
  assert.ok(origins.includes(currentDeploymentOrigin));
  assert.ok(origins.includes(branchAliasOrigin));
});

test("preview baseURL config contributes its canonical fallback rather than stringifying the object", () => {
  const origins = buildTrustedAuthOrigins({
    baseURL: {
      allowedHosts: ["vishal-kumar-choudhary-frontend-developer-*.vercel.app"],
      protocol: "https",
      fallback: canonicalOrigin,
    },
    vercelEnvironment: "preview",
    vercelURL: "vishal-kumar-choudhary-frontend-developer-mok2iryor.vercel.app",
  });

  assert.ok(origins.includes(canonicalOrigin));
  assert.ok(origins.includes(currentDeploymentOrigin));
  assert.equal(origins.some((origin) => origin === "[object Object]"), false);
});

test("local development does not trust Vercel deployment host patterns", () => {
  const origins = buildTrustedAuthOrigins({
    baseURL: "http://localhost:3000",
    configuredOrigins: "http://localhost:3001",
    vercelEnvironment: "development",
    vercelURL: "vishal-kumar-choudhary-frontend-developer-mok2iryor.vercel.app",
    request: { headers: new Headers({ origin: "https://vishal-kumar-choudhary-frontend-developer-mok2iryor.vercel.app" }) },
  });

  assert.deepEqual(origins, ["http://localhost:3000", "http://localhost:3001"]);
});

test("Better Auth resolves origins per request and carries Vercel deployment context", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(
    new URL("../src/app/lib/auth/auth.js", import.meta.url),
    "utf8",
  );

  assert.ok(source.includes('import { buildTrustedAuthOrigins } from "./trusted-origins.mjs"'));
  assert.ok(source.includes("trustedOrigins: async (request) => getTrustedAuthOrigins(request)"));
  assert.ok(source.includes("vercelURL: process.env.VERCEL_URL"));
  assert.ok(source.includes("vercelBranchURL: process.env.VERCEL_BRANCH_URL"));
});

test("verification and password-reset callbacks await SMTP delivery instead of hiding failures", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(
    new URL("../src/app/lib/auth/auth.js", import.meta.url),
    "utf8",
  );

  assert.ok(source.includes("async function deliverAuthEmail(message)"));
  assert.ok(source.includes('deliveryError.code = "AUTH_EMAIL_DELIVERY_FAILED"'));
  assert.match(source, /sendResetPassword: async \(\{ user, url \}\) => \{\s*await deliverAuthEmail\(/);
  assert.match(source, /sendVerificationEmail: async \(\{ user, url \}\) => \{\s*await deliverAuthEmail\(/);
  assert.equal(source.includes("scheduleEmail("), false);
  assert.equal(source.includes('import { after } from "next/server"'), false);
});

test("registration and verification resend surface email delivery failures without exposing account existence", async () => {
  const { readFile } = await import("node:fs/promises");
  const [registration, resend] = await Promise.all([
    readFile(new URL("../src/app/api/labs/register/route.js", import.meta.url), "utf8"),
    readFile(new URL("../src/app/api/labs/verification/resend/route.js", import.meta.url), "utf8"),
  ]);

  for (const source of [registration, resend]) {
    assert.ok(source.includes("export const maxDuration = 30"));
    assert.ok(source.includes('"AUTH_EMAIL_DELIVERY_FAILED"'));
    assert.ok(source.includes("Email delivery is temporarily unavailable"));
    assert.ok(source.includes("503"));
  }
  assert.ok(resend.includes("const sendResult = await auth.api.sendVerificationEmail"));
  assert.ok(!resend.includes("Keep the same client-visible result for existing and unknown emails."));
  assert.ok(registration.includes("const resultErrorStatus = Number("));
});
