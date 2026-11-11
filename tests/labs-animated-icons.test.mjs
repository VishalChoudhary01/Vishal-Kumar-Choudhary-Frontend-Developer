import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Labs animated icons use a pinned package, direct icon imports and reduced-motion safeguards", async () => {
  const [packageJson, navigation, inventory, analytics, portfolioAnalytics, sourceAccess] = await Promise.all([
    read("../package.json").then(JSON.parse),
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/components/labs/admin/LabSourceInventory.js"),
    read("../src/app/components/labs/admin/LabsLiveAnalyticsDashboard.js"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js"),
    read("../src/app/components/labs/detail/LabSourceAccess.js"),
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
    "@animateicons/react/lucide/eye-icon",
  ]) assert.ok(inventory.includes(iconPath), "inventory is missing " + iconPath);

  for (const iconPath of [
    "@animateicons/react/lucide/eye-icon",
    "@animateicons/react/lucide/user-round-check-icon",
    "@animateicons/react/lucide/copy-check-icon",
    "@animateicons/react/lucide/heart-pulse-icon",
  ]) assert.ok(analytics.includes(iconPath), "analytics is missing " + iconPath);

  for (const iconPath of [
    "@animateicons/react/lucide/activity-icon",
    "@animateicons/react/lucide/clock-icon",
    "@animateicons/react/lucide/eye-icon",
    "@animateicons/react/lucide/users-icon",
  ]) assert.ok(portfolioAnalytics.includes(iconPath), "Portfolio Analytics is missing " + iconPath);

  assert.ok(portfolioAnalytics.includes("isAnimated={!reduceMotion}"));
  assert.ok(portfolioAnalytics.includes("duration={0.72}"));

  for (const iconPath of [
    "@animateicons/react/lucide/copy-icon",
    "@animateicons/react/lucide/eye-icon",
    "@animateicons/react/lucide/lock-icon",
  ]) assert.ok(sourceAccess.includes(iconPath), "Protected source access is missing " + iconPath);

  assert.ok(sourceAccess.includes("useReducedMotion"));
  assert.ok(sourceAccess.includes("isAnimated={!prefersReducedMotion}"));

  for (const source of [navigation, inventory, analytics, sourceAccess]) {
    assert.ok(source.includes("useReducedMotion"));
    assert.ok(source.includes("isAnimated={!prefersReducedMotion}"));
    assert.ok(source.includes("@animateicons/react/lucide/"));
    assert.equal(source.includes('from "@animateicons/react/lucide";'), false);
  }

  assert.ok(inventory.includes('<AnimatedTrash ref={deleteModalIconRef}'));
  assert.ok(inventory.includes('<AnimatedTrash size={13}'));
  assert.ok(analytics.includes('<RefreshCw size={13} className={refreshing ? "animate-spin motion-reduce:animate-none" : ""} aria-hidden="true" />'));
  assert.ok(analytics.includes('<AnimatedTrash ref={removeDialogIconRef}'));
  assert.ok(analytics.includes('<AnimatedTrash size={13}'));

  const [sourceEditor, editPage, metadataEditor, snapshotPanel] = await Promise.all([
    read("../src/app/components/labs/admin/LabSourceEditor.js"),
    read("../src/app/admin/labs/experiments/[slug]/edit/page.js"),
    read("../src/app/components/labs/admin/LabExperimentMetadataEditor.js"),
    read("../src/app/components/labs/admin/LabSnapshotStoragePanel.js"),
  ]);

  for (const iconPath of [
    "@animateicons/react/lucide/arrow-left-icon",
    "@animateicons/react/lucide/chevron-right-icon",
    "@animateicons/react/lucide/lock-open-icon",
    "@animateicons/react/lucide/trash-icon",
    "@animateicons/react/lucide/upload-icon",
  ]) assert.ok(sourceEditor.includes(iconPath), "Source editor is missing " + iconPath);

  assert.ok(sourceEditor.includes('aria-label="Breadcrumb"'));
  assert.ok(sourceEditor.includes("publishDialogIconRef.current?.startAnimation?.()"));
  assert.ok(sourceEditor.includes("unpublishDialogIconRef.current?.startAnimation?.()"));
  assert.ok(sourceEditor.includes("deleteDialogIconRef.current?.startAnimation?.()"));
  assert.ok(sourceEditor.includes("ref={publishDialogIconRef}"));
  assert.ok(sourceEditor.includes("ref={unpublishDialogIconRef}"));
  assert.ok(sourceEditor.includes("ref={deleteDialogIconRef}"));

  for (const iconPath of [
    "@animateicons/react/lucide/arrow-left-icon",
    "@animateicons/react/lucide/chevron-right-icon",
    "@animateicons/react/lucide/pencil-icon",
  ]) assert.ok(editPage.includes(iconPath), "Edit page is missing " + iconPath);
  assert.ok(editPage.includes('aria-label="Breadcrumb"'));
  assert.ok(metadataEditor.includes("@animateicons/react/lucide/arrow-left-icon"));

  assert.ok(sourceAccess.includes("copyIconRef.current?.startAnimation?.()"));
  assert.ok(sourceAccess.includes("onMouseEnter={startCopyIconAnimation}"));
  assert.ok(sourceAccess.includes("onFocus={startCopyIconAnimation}"));
  assert.ok(sourceAccess.includes("ref={copyIconRef}"));

  assert.ok(snapshotPanel.includes("@animateicons/react/lucide/trash-icon"));
  assert.ok(snapshotPanel.includes("deleteModalIconRef.current?.startAnimation?.()"));
});
