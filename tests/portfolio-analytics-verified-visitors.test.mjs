import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildPortfolioVerifiedVisitor,
  maskPortfolioVisitEmail,
} from "../src/app/lib/portfolio-analytics/verified-visitor.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const secret = "a".repeat(48);
const verifiedUser = {
  id: "auth-user-internal-id-123",
  name: "  Vishal\nKumar  ",
  email: "vishal.kumar@example.com",
  emailVerified: true,
};

test("only server-verified accounts receive a visitor identity", () => {
  const visitor = buildPortfolioVerifiedVisitor({ user: verifiedUser, secret });
  assert.deepEqual(visitor, {
    verifiedUserHash: visitor.verifiedUserHash,
    verifiedUserAccountId: verifiedUser.id,
    verifiedUserName: "Vishal Kumar",
    verifiedUserEmailMasked: "v***@example.com",
  });
  assert.match(visitor.verifiedUserHash, /^[a-f0-9]{64}$/);

  const expectedHash = createHmac("sha256", secret)
    .update("portfolio-analytics:verified-user:v1")
    .update("\0")
    .update(verifiedUser.id)
    .digest("hex");
  assert.equal(visitor.verifiedUserHash, expectedHash);

  assert.equal(JSON.stringify(visitor).includes(verifiedUser.id), true);
  assert.equal(JSON.stringify(visitor).includes(verifiedUser.email), false);
});

test("unverified, missing or invalid account identities are not linked", () => {
  assert.equal(buildPortfolioVerifiedVisitor({
    user: { ...verifiedUser, emailVerified: false },
    secret,
  }), null);
  assert.equal(buildPortfolioVerifiedVisitor({ user: null, secret }), null);
  assert.equal(buildPortfolioVerifiedVisitor({
    user: verifiedUser,
    secret: "short",
  }), null);
  assert.equal(buildPortfolioVerifiedVisitor({
    user: { ...verifiedUser, email: "invalid" },
    secret,
  }), null);
});

test("masked email never exposes a complete local part", () => {
  assert.equal(maskPortfolioVisitEmail("v@example.com"), "v***@example.com");
  assert.equal(maskPortfolioVisitEmail("hello@example.com"), "h***@example.com");
  assert.equal(maskPortfolioVisitEmail("not-an-email"), null);
  assert.equal(maskPortfolioVisitEmail("user name@example.com"), null);
  assert.equal(maskPortfolioVisitEmail("user@@example.com"), null);
  assert.equal(maskPortfolioVisitEmail("user@example..com"), null);
});

test("identity is resolved on the server and limited to the owner-only recent visit projection", async () => {
  const [service, helper, model, report, dashboard, privacy] = await Promise.all([
    read("../src/app/lib/portfolio-analytics/visit-service.js"),
    read("../src/app/lib/portfolio-analytics/verified-visitor.mjs"),
    read("../src/app/lib/portfolio-analytics/models/PortfolioVisit.js"),
    read("../src/app/lib/portfolio-analytics/report-service.js"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js"),
    read("../src/app/privacy/page.js"),
  ]);

  assert.ok(service.includes("getCurrentAuthSession"));
  assert.ok(service.includes("buildPortfolioVerifiedVisitor"));
  assert.ok(helper.includes("user?.emailVerified !== true"));
  assert.ok(model.includes("verifiedUserAccountId"));
  assert.ok(model.includes("verifiedUserHash"));
  assert.ok(model.includes("verifiedUserName"));
  assert.ok(model.includes("verifiedUserEmailMasked"));
  assert.ok(model.includes("select: false"));
  assert.ok(report.includes("+verifiedUserAccountId +verifiedUserName +verifiedUserEmailMasked"));
  assert.ok(report.includes("accountId: document.verifiedUserAccountId || null"));
  assert.ok(report.includes('kind: "verified"'));
  assert.ok(report.includes('kind: "guest"'));
  assert.ok(!report.includes("verifiedUserHash: document"));
  assert.ok(dashboard.includes('visit.visitor?.kind === "verified"'));
  assert.ok(dashboard.includes("Guest / unverified"));
  assert.ok(dashboard.includes("Verified"));
  assert.ok(dashboard.includes("Raw account ID"));
  assert.ok(dashboard.includes("visit.visitor.accountId"));
  const normalizedPrivacy = privacy.replace(/\s+/g, " ");
  assert.ok(normalizedPrivacy.includes("masked email label"));
  assert.ok(normalizedPrivacy.includes("The raw account ID and display name are stored in visit records"));
  assert.ok(normalizedPrivacy.includes("private owner-only visitor table"));
  assert.ok(!normalizedPrivacy.includes("visit records do not contain your name, email address"));
});
