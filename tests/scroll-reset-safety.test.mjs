import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("route scroll reset selects Lenis only for routes that retain Lenis", async () => {
  const source = await read("../src/app/providers/PageLoaderProvider.js");
  assert.ok(source.includes("shouldUseLenis(pathname)"));
  assert.ok(source.includes("resetScrollLocks({ useLenis: shouldUseLenis(pathname) })"));
  assert.ok(source.includes("if (useLenis && window.lenis"));
  assert.ok(source.includes('window.scrollTo({ top: 0, left: 0, behavior: "instant" })'));
});

test("mobile menu does not restore a previous route's captured body-lock position", async () => {
  const source = await read("../src/app/components/layout/MobileMenu.js");
  assert.ok(source.includes("const lockedPathname = window.location.pathname"));
  assert.ok(source.includes("window.location.pathname === lockedPathname"));
  assert.ok(source.includes("previous page's frozen offset"));
});
