import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Labs animated icons use a pinned package, direct icon imports and reduced-motion safeguards", async () => {
  const [packageJson, navigation, inventory, analytics] = await Promise.all([
    read("../package.json").then(JSON.parse),
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/components/labs/admin/LabSourceInventory.js"),
    read("../src/app/components/labs/admin/LabsLiveAnalyticsDashboard.js"),
  ]);

  assert.equal(packageJson.dependencies["@animateicons/react"], "0.13.0");

  for (const iconPath of [
    "@animateicons/react/lucide/chart-spline-icon",
    "@animateicons/react/lucide/folder-open-icon",
    "@animateicons/react/lucide/hard-drive-icon",
  ]) assert.ok(navigation.includes(iconPath), "navigation is missing " + iconPath);

  for (const iconPath of [
    "@animateicons/react/lucide/triangle-alert-icon",
    "@animateicons/react/lucide/circle-check-icon",
    "@animateicons/react/lucide/file-code-icon",
    "@animateicons/react/lucide/folder-plus-icon",
    "@animateicons/react/lucide/pencil-icon",
    "@animateicons/react/lucide/refresh-cw-icon",
    "@animateicons/react/lucide/trash-icon",
  ]) assert.ok(inventory.includes(iconPath), "inventory is missing " + iconPath);

  for (const iconPath of [
    "@animateicons/react/lucide/eye-icon",
    "@animateicons/react/lucide/user-round-check-icon",
    "@animateicons/react/lucide/copy-check-icon",
    "@animateicons/react/lucide/heart-icon",
  ]) assert.ok(analytics.includes(iconPath), "analytics is missing " + iconPath);

  for (const source of [navigation, inventory, analytics]) {
    assert.ok(source.includes("useReducedMotion"));
    assert.ok(source.includes("isAnimated={!prefersReducedMotion}"));
    assert.ok(source.includes("@animateicons/react/lucide/"));
    assert.equal(source.includes('from "@animateicons/react/lucide";'), false);
  }

  assert.ok(inventory.includes('<Trash2 size={16} aria-hidden="true" />'));
  assert.ok(inventory.includes('<Trash2 size={13} aria-hidden="true" />'));
  assert.ok(analytics.includes('<RefreshCw size={13} className={refreshing ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />'));
});
