import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  LABS_ANALYTICS_EXCLUDED_OWNER_EMAIL,
  isExcludedLabsAnalyticsOwner,
} from "../src/app/lib/labs/analytics-owner.mjs";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("owner exclusion matches the exact configured email case-insensitively", () => {
  assert.equal(LABS_ANALYTICS_EXCLUDED_OWNER_EMAIL, "vishal.bhumca21@gmail.com");
  assert.equal(
    isExcludedLabsAnalyticsOwner({ id: "owner-1", email: "Vishal.Bhumca21@GMAIL.com" }),
    true,
  );
  assert.equal(
    isExcludedLabsAnalyticsOwner({ id: "user-2", email: "another.user@gmail.com" }),
    false,
  );
  assert.equal(
    isExcludedLabsAnalyticsOwner({ id: "user-3", email: "vishal.bhumca21+test@gmail.com" }),
    false,
  );
  assert.equal(isExcludedLabsAnalyticsOwner({ email: LABS_ANALYTICS_EXCLUDED_OWNER_EMAIL }), false);
  assert.equal(isExcludedLabsAnalyticsOwner(null), false);
});

test("owner exclusion does not depend on email verification state", () => {
  assert.equal(
    isExcludedLabsAnalyticsOwner({
      id: "owner-1",
      email: LABS_ANALYTICS_EXCLUDED_OWNER_EMAIL,
      emailVerified: false,
    }),
    true,
  );
});

test("source event API excludes the owner before verification checks and request-body parsing", async () => {
  const route = await read("../src/app/api/v1/labs/[slug]/source/events/route.js");
  const ownerGuard = route.indexOf("if (isExcludedLabsAnalyticsOwner(session.user))");
  const verificationGate = route.indexOf("if (session.user.emailVerified !== true)");
  const bodyRead = route.indexOf("body = await request.json()");

  assert.ok(ownerGuard >= 0);
  assert.ok(verificationGate > ownerGuard);
  assert.ok(bodyRead > ownerGuard);
  assert.match(route, /return json\(\{ data: \{ recorded: false, excluded: true \} \}\)/);
});

test("like API prevents owner likes on both reads and writes", async () => {
  const route = await read("../src/app/api/v1/labs/[slug]/engagement/route.js");
  assert.equal(route.split("isExcludedLabsAnalyticsOwner(session?.user)").length - 1, 2);
  assert.match(route, /likeAllowed: false/);
  assert.match(route, /actorType: "owner_excluded"/);
});

test("engagement index initialization cannot fail from a removed model reference", async () => {
  const service = await read("../src/app/lib/labs/engagement.js");
  const initializer = service.slice(
    service.indexOf("async function ensureEngagementIndexes"),
    service.indexOf("let excludedOwnerUserIdPromise"),
  );
  assert.match(initializer, /LabLike\.createIndexes\(\)/);
  assert.match(initializer, /LabGuestLike\.createIndexes\(\)/);
  assert.match(initializer, /LabAnalyticsEvent\.createIndexes\(\)/);
  assert.doesNotMatch(initializer, /LabComponentCopyProgress/);
});

test("engagement service blocks owner event writes and excludes existing owner likes", async () => {
  const service = await read("../src/app/lib/labs/engagement.js");
  assert.match(service, /const excludedOwnerUserId = await getLabsAnalyticsExcludedOwnerUserId\(\)/);
  assert.match(service, /if \(excludedOwnerUserId && userId === excludedOwnerUserId\)/);
  assert.match(service, /verifiedLikeFilter\.userId = \{ \$ne: excludedUserId \}/);
  assert.match(service, /verifiedLikeFilter = \{ experimentSlug: matchSlugs, active: true \}/);
  assert.match(service, /const ownerExcluded = isExcludedLabsAnalyticsOwner\(session\?\.user\)/);
  assert.match(service, /likeAllowed: !ownerExcluded/);
  assert.match(service, /existingEvent\.actorUserId === userId/);
  assert.match(service, /existingEvent\.experimentSlug === slug/);
  assert.match(service, /existingEvent\.sourceVersionId ===/);
  assert.match(service, /eventIdConflict: true/);
});

test("owner Labs reports and verified-like drilldown exclude the owner account ID", async () => {
  const analytics = await read("../src/app/lib/labs/owner-analytics.js");
  assert.match(analytics, /actorUserId: user\.id/);
  assert.match(analytics, /userId: \{ \$ne: user\.id \}/);
  assert.match(analytics, /\$nor: \[\{ actorCategory: "verified_user", actorUserId: user\.id \}\]/);
});

test("owner account ID lookup resolves the exact email without trusting request input", async () => {
  const service = await read("../src/app/lib/labs/engagement.js");
  assert.ok(service.includes('$regex: "^vishal\\\\.bhumca21@gmail\\\\.com$"'));
  assert.match(service, /collection\("user"\)\.findOne/);
});
