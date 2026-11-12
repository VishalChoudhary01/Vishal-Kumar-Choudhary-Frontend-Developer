import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("owner workspace dropdown includes all four private destinations", async () => {
  const [navigation, destinations, dropdown] = await Promise.all([
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/components/labs/LabsWorkspaceDestinations.js"),
    read("../src/app/components/labs/LabsWorkspaceDropdown.js"),
  ]);
  assert.ok(navigation.includes("LABS_WORKSPACE_DESTINATIONS"));
  for (const route of ["/admin/labs/analytics", "/admin/portfolio/analytics", "/admin/labs/sources", "/admin/labs/sources/snapshots"]) {
    assert.ok(destinations.includes(route));
  }
  assert.ok(navigation.includes('aria-haspopup="menu"'));
  assert.ok(navigation.includes("aria-expanded={open}"));
  assert.ok(navigation.includes("Switch workspace"));
  assert.ok(dropdown.includes('role="menuitem"'));
  assert.ok(navigation.includes("ChevronDown"));
  assert.ok(navigation.includes("ThemeToggle"));
  assert.ok(navigation.includes("LabsWorkspaceAvatar"));
});

test("profile fields support OAuth name and HTTPS image with initials fallback", async () => {
  const [navigation, helper, dropdown] = await Promise.all([
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/lib/labs/auth-user-presentation.mjs"),
    read("../src/app/components/labs/LabsWorkspaceDropdown.js"),
  ]);
  assert.ok(navigation.includes("getLabsAccountDisplayName"));
  assert.ok(dropdown.includes("getLabsAccountInitials"));
  assert.ok(dropdown.includes("user?.image"));
  assert.ok(dropdown.includes('startsWith("https://")'));
  assert.ok(dropdown.includes("user?.email"));
  assert.ok(helper.includes("user.name"));
  assert.ok(helper.includes("user.image"));
  assert.ok(helper.includes('url.protocol !== "https:"'));
  assert.ok(helper.includes('return "Account"'));
});

test("workspace dropdown closes on outside pointer and Escape", async () => {
  const navigation = await read("../src/app/components/labs/admin/LabsOwnerNavigation.js");
  assert.ok(navigation.includes('document.addEventListener("pointerdown"'));
  assert.ok(navigation.includes('document.addEventListener("keydown"'));
  assert.ok(navigation.includes('event.key === "Escape"'));
  assert.ok(navigation.includes("triggerRef.current?.focus()"));
});

test("one theme toggle is shared by analytics pages, not duplicated in headers", async () => {
  const [navigation, labsAnalytics, portfolioAnalytics] = await Promise.all([
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/admin/labs/analytics/page.js"),
    read("../src/app/admin/portfolio/analytics/page.js"),
  ]);
  assert.equal(navigation.split("<ThemeToggle />").length - 1, 1);
  assert.ok(!labsAnalytics.includes("ThemeToggle"));
  assert.ok(!portfolioAnalytics.includes("ThemeToggle"));
  assert.ok(labsAnalytics.includes("user={toLabsAccountUser(session.user)}"));
  assert.ok(portfolioAnalytics.includes("user={toLabsAccountUser(session.user)}"));
});

test("owner navigation pages pass their server-resolved profile fields", async () => {
  const pages = [
    "../src/app/admin/labs/analytics/page.js",
    "../src/app/admin/labs/analytics/[slug]/page.js",
    "../src/app/admin/portfolio/analytics/page.js",
    "../src/app/admin/labs/sources/page.js",
    "../src/app/admin/labs/sources/import/page.js",
    "../src/app/admin/labs/experiments/[slug]/edit/page.js",
  ];
  for (const path of pages) {
    const source = await read(path);
    assert.ok(source.includes("toLabsAccountUser(session.user)"), path);
    assert.ok(source.includes("LabsOwnerNavigation"), path);
  }
});


test("shared workspace menu uses compact radii and a clear selected state", async () => {
  const [navigation, dropdown] = await Promise.all([
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/components/labs/LabsWorkspaceDropdown.js"),
  ]);
  assert.ok(navigation.includes("rounded-[3px]"));
  assert.ok(navigation.includes("rounded-[4px]"));
  assert.ok(dropdown.includes("rounded-[2px]"));
  assert.ok(dropdown.includes("rounded-[3px]"));
  assert.ok(dropdown.includes("rounded-[4px]"));
  assert.ok(dropdown.includes("border-brand/30 bg-brand-soft/35 text-brand"));
  assert.ok(dropdown.includes('aria-current={isActive ? "page" : undefined}'));
});


test("owner dropdown shares the animated responsive workspace menu and active icon behavior", async () => {
  const [navigation, dropdown, menuItem] = await Promise.all([
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/components/labs/LabsWorkspaceDropdown.js"),
    read("../src/app/components/labs/LabsWorkspaceDropdown.js"),
  ]);
  assert.ok(navigation.includes("LABS_WORKSPACE_DESTINATIONS.map"));
  assert.ok(navigation.includes("<LabsWorkspaceDropdown"));
  assert.ok(menuItem.includes("iconRef.current?.startAnimation?.()"));
  assert.ok(menuItem.includes("isActive"));
  assert.ok(dropdown.includes("height: 0"));
  assert.ok(dropdown.includes('height: "auto"'));
  assert.ok(dropdown.includes("transformOrigin: \"top right\""));
  assert.ok(dropdown.includes("transformPerspective: 900"));
  assert.ok(dropdown.includes('type: "spring"'));
  assert.ok(dropdown.includes("prefersReducedMotion"));
  assert.ok(dropdown.includes("overflow-y-auto"));
});
