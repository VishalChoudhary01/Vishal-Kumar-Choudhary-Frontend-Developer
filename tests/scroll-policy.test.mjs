import assert from "node:assert/strict";
import test from "node:test";

import { shouldUseLenis } from "../src/app/lib/lenis/scroll-policy.mjs";

test("public portfolio and project detail routes keep the existing Lenis scroll system", () => {
  assert.equal(shouldUseLenis("/"), true);
  assert.equal(shouldUseLenis("/projects/spendwise"), true);
  assert.equal(shouldUseLenis("/projects/class-fuse"), true);
});

test("Labs and all owner/admin routes use native document scrolling", () => {
  for (const pathname of [
    "/labs",
    "/labs/example",
    "/labs/login",
    "/admin/labs/analytics",
    "/admin/labs/sources",
    "/admin/labs/sources/magnetic-interaction",
    "/admin/labs/sources/import",
    "/admin/portfolio/analytics",
  ]) {
    assert.equal(shouldUseLenis(pathname), false, pathname);
  }
});

test("route matching does not disable Lenis for unrelated public paths", () => {
  assert.equal(shouldUseLenis("/administrator"), true);
  assert.equal(shouldUseLenis("/laboratory"), true);
  assert.equal(shouldUseLenis("admin/labs/sources"), false);
  assert.equal(shouldUseLenis(""), false);
  assert.equal(shouldUseLenis(null), false);
});
