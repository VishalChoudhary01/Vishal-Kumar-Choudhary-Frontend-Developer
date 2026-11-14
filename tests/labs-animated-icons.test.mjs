import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Labs animated icons use a pinned package, direct icon imports and reduced-motion safeguards", async () => {
  const [packageJson, navigation, workspaceDestinations, inventory, analytics, portfolioAnalytics, sourceAccess] = await Promise.all([
    read("../package.json").then(JSON.parse),
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/components/labs/LabsWorkspaceDestinations.js"),
    read("../src/app/components/labs/admin/LabSourceInventory.js"),
    read("../src/app/components/labs/admin/LabsLiveAnalyticsDashboard.js"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js"),
    read("../src/app/components/labs/detail/LabSourceAccess.js"),
  ]);

  assert.equal(packageJson.dependencies["@animateicons/react"], "0.13.0");

  assert.ok(navigation.includes("LABS_WORKSPACE_DESTINATIONS"));
  for (const iconPath of [
    "@animateicons/react/lucide/chart-spline-icon",
    "@animateicons/react/lucide/activity-icon",
    "@animateicons/react/lucide/folder-open-icon",
    "@animateicons/react/lucide/hard-drive-icon",
  ]) assert.ok(workspaceDestinations.includes(iconPath), "workspace destinations are missing " + iconPath);

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
  assert.ok(inventory.includes("createIconRef.current?.startAnimation?.()"));
  assert.ok(inventory.includes("refreshIconRef.current?.startAnimation?.()"));
  assert.ok(inventory.includes("searchIconRef.current?.startAnimation?.()"));
  assert.ok(inventory.includes("editIconRefs.current.get(item.slug)?.startAnimation?.()"));
  assert.ok(inventory.includes("openIconRefs.current.get(item.slug)?.startAnimation?.()"));

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

  assert.ok(navigation.includes("useReducedMotion"));
  assert.ok(navigation.includes("isAnimated={!prefersReducedMotion}"));
  assert.ok(navigation.includes("LABS_WORKSPACE_DESTINATIONS"));
  assert.ok(workspaceDestinations.includes("@animateicons/react/lucide/"));
  assert.equal(workspaceDestinations.includes('from "@animateicons/react/lucide";'), false);

  for (const source of [inventory, analytics, sourceAccess]) {
    assert.ok(source.includes("useReducedMotion"));
    assert.ok(source.includes("isAnimated={!prefersReducedMotion}"));
    assert.ok(source.includes("@animateicons/react/lucide/"));
    assert.equal(source.includes('from "@animateicons/react/lucide";'), false);
  }

  assert.ok(inventory.includes('<AnimatedTrash ref={deleteModalIconRef}'));
  assert.ok(inventory.includes('<AnimatedTrash size={13}'));
  assert.ok(analytics.includes("AnimatedRefreshCw"));
  assert.ok(analytics.includes("refreshIconRef.current?.startAnimation?.()"));
  assert.ok(analytics.includes("isAnimated={!prefersReducedMotion}"));
  assert.ok(analytics.includes('<AnimatedTrash ref={removeDialogIconRef}'));
  assert.ok(analytics.includes('<AnimatedTrash ref={removeConfirmIconRef} size={13}'));

  const [sourceEditor, editPage, metadataEditor, snapshotPanel, breadcrumbs] = await Promise.all([
    read("../src/app/components/labs/admin/LabSourceEditor.js"),
    read("../src/app/admin/labs/experiments/[slug]/edit/page.js"),
    read("../src/app/components/labs/admin/LabExperimentMetadataEditor.js"),
    read("../src/app/components/labs/admin/LabSnapshotStoragePanel.js"),
    read("../src/app/components/labs/admin/AdminBreadcrumbs.js"),
  ]);

  for (const iconPath of [
    "@animateicons/react/lucide/lock-open-icon",
    "@animateicons/react/lucide/trash-icon",
    "@animateicons/react/lucide/upload-icon",
  ]) assert.ok(sourceEditor.includes(iconPath), "Source editor is missing " + iconPath);
  assert.ok(sourceEditor.includes("<AdminBreadcrumbs"));
  assert.ok(sourceEditor.includes("publishDialogIconRef.current?.startAnimation?.()"));
  assert.ok(sourceEditor.includes("unpublishDialogIconRef.current?.startAnimation?.()"));
  assert.ok(sourceEditor.includes("deleteDialogIconRef.current?.startAnimation?.()"));
  assert.ok(sourceEditor.includes("deleteHeaderIconRef.current?.startAnimation?.()"));
  assert.ok(sourceEditor.includes("ref={deleteHeaderIconRef}"));
  assert.ok(sourceEditor.includes("ref={publishDialogIconRef}"));
  assert.ok(sourceEditor.includes("ref={unpublishDialogIconRef}"));
  assert.ok(sourceEditor.includes("ref={deleteDialogIconRef}"));

  assert.ok(editPage.includes("@animateicons/react/lucide/pencil-icon"));
  assert.ok(editPage.includes("<AdminBreadcrumbs"));
  assert.ok(breadcrumbs.includes("@animateicons/react/lucide/arrow-left-icon"));
  assert.ok(breadcrumbs.includes("@animateicons/react/lucide/chevron-right-icon"));
  assert.ok(breadcrumbs.includes('aria-label="Breadcrumb"'));
  assert.ok(metadataEditor.includes("@animateicons/react/lucide/arrow-left-icon"));

  assert.ok(sourceAccess.includes("copyIconRef.current?.startAnimation?.()"));
  assert.ok(sourceAccess.includes("onMouseEnter={startCopyIconAnimation}"));
  assert.ok(sourceAccess.includes("onFocus={startCopyIconAnimation}"));
  assert.ok(sourceAccess.includes("ref={copyIconRef}"));

  assert.ok(snapshotPanel.includes("@animateicons/react/lucide/trash-icon"));
  assert.ok(snapshotPanel.includes("deleteModalIconRef.current?.startAnimation?.()"));
  assert.ok(snapshotPanel.includes("AnimatedRefreshCw"));
  assert.ok(snapshotPanel.includes("refreshIconRef.current?.startAnimation?.()"));
  assert.ok(snapshotPanel.includes("deleteConfirmIconRef.current?.startAnimation?.()"));
});


test("Labs owner subpages reuse the animated breadcrumb for analytics and snapshot routes", async () => {
  const [analyticsPage, snapshotsPage] = await Promise.all([
    read("../src/app/admin/labs/analytics/[slug]/page.js"),
    read("../src/app/admin/labs/sources/snapshots/page.js"),
  ]);
  assert.ok(analyticsPage.includes("<AdminBreadcrumbs"));
  assert.ok(snapshotsPage.includes("<AdminBreadcrumbs"));
  assert.ok(analyticsPage.includes('href: "/admin/labs/analytics"'));
  assert.ok(snapshotsPage.includes('href: "/admin/labs/sources"'));
});


test("Labs owner subpages use the shared animated breadcrumb", async () => {
  const [createForm, importPage, analyticsDetail, snapshotPage, breadcrumb] = await Promise.all([
    read("../src/app/components/labs/admin/LabExperimentCreateForm.js"),
    read("../src/app/admin/labs/sources/import/page.js"),
    read("../src/app/admin/labs/analytics/[slug]/page.js"),
    read("../src/app/admin/labs/sources/snapshots/page.js"),
    read("../src/app/components/labs/admin/AdminBreadcrumbs.js"),
  ]);
  assert.ok(createForm.includes("<AdminBreadcrumbs"));
  assert.ok(importPage.includes("<AdminBreadcrumbs"));
  assert.ok(analyticsDetail.includes("<AdminBreadcrumbs"));
  assert.ok(snapshotPage.includes("<AdminBreadcrumbs"));
  assert.ok(breadcrumb.includes("AnimatedArrowLeft"));
  assert.ok(breadcrumb.includes("AnimatedChevronRight"));
  assert.ok(breadcrumb.includes("onMouseEnter={startIcon}"));
  assert.ok(breadcrumb.includes("onFocus={startIcon}"));
});


test("admin action icons animate on hover or focus and respect reduced motion", async () => {
  const [metadata, runtimeImport, livePreview, createForm, inventory, analytics, navigation, snapshot, workspaceDropdown] = await Promise.all([
    read("../src/app/components/labs/admin/LabExperimentMetadataEditor.js"),
    read("../src/app/components/labs/admin/LabRuntimeImportPanel.js"),
    read("../src/app/components/labs/admin/LabSourceLivePreview.js"),
    read("../src/app/components/labs/admin/LabExperimentCreateForm.js"),
    read("../src/app/components/labs/admin/LabSourceInventory.js"),
    read("../src/app/components/labs/admin/LabsLiveAnalyticsDashboard.js"),
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/components/labs/admin/LabSnapshotStoragePanel.js"),
    read("../src/app/components/labs/LabsWorkspaceDropdown.js"),
  ]);

  assert.ok(metadata.includes("AnimatedSave"));
  assert.ok(metadata.includes("saveIconRef.current?.startAnimation?.()"));
  assert.ok(metadata.includes("isAnimated={!prefersReducedMotion}"));

  assert.ok(runtimeImport.includes("AnimatedDownload"));
  assert.ok(runtimeImport.includes("downloadIconRef.current?.startAnimation?.()"));
  assert.ok(runtimeImport.includes("AnimatedFolderPlus"));
  assert.equal(runtimeImport.split("import { FolderPlusIcon as AnimatedFolderPlus").length - 1, 1);
  assert.ok(runtimeImport.includes("useReducedMotion"));
  assert.equal(runtimeImport.includes("runtimesIconRef"), false);

  assert.ok(livePreview.includes("AnimatedMonitor"));
  assert.ok(livePreview.includes("AnimatedSmartphone"));
  assert.ok(livePreview.includes("desktopIconRef.current?.startAnimation?.()"));
  assert.ok(livePreview.includes("mobileIconRef.current?.startAnimation?.()"));
  assert.ok(livePreview.includes("retryIconRef.current?.startAnimation?.()"));

  assert.ok(createForm.includes("AnimatedPlus"));
  assert.ok(createForm.includes("createIconRef.current?.startAnimation?.()"));
  assert.ok(inventory.includes("rounded-[2px] border px-3 text-[11px]"));
  assert.ok(analytics.includes("restoreIconRefs.current.get(experiment.slug)?.startAnimation?.()"));
  assert.ok(navigation.includes("LABS_WORKSPACE_DESTINATIONS.map"));
  assert.ok(workspaceDropdown.includes("iconRef.current?.startAnimation?.()"));
  assert.ok(workspaceDropdown.includes("iconRef.current?.stopAnimation?.()"));
  assert.ok(workspaceDropdown.includes("if (!isAnimated || !isActive)"));
  assert.ok(workspaceDropdown.includes("iconRef.current?.startAnimation?.()"));
  assert.ok(workspaceDropdown.includes("window.setInterval"));
  assert.ok(workspaceDropdown.includes("window.clearInterval(replayId)"));
  assert.ok(snapshot.includes("deleteConfirmIconRef.current?.startAnimation?.()"));
});

test("admin controls, cards and dialogs use the compact radius scale", async () => {
  const [navigation, workspaceDropdown, inventory, editor, snapshot, labsAnalytics, portfolioAnalytics, deletion] = await Promise.all([
    read("../src/app/components/labs/admin/LabsOwnerNavigation.js"),
    read("../src/app/components/labs/LabsWorkspaceDropdown.js"),
    read("../src/app/components/labs/admin/LabSourceInventory.js"),
    read("../src/app/components/labs/admin/LabSourceEditor.js"),
    read("../src/app/components/labs/admin/LabSnapshotStoragePanel.js"),
    read("../src/app/components/labs/admin/LabsLiveAnalyticsDashboard.js"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDashboard.js"),
    read("../src/app/components/portfolio-analytics/PortfolioAnalyticsDeletionControls.js"),
  ]);

  for (const source of [workspaceDropdown, inventory, editor, snapshot, labsAnalytics, portfolioAnalytics, deletion]) {
    assert.equal(/className="[^"]*\brounded-(?:sm|md|lg|xl|2xl)\b/.test(source), false);
    assert.ok(source.includes("rounded-[2px]"));
    assert.ok(source.includes("rounded-[3px]"));
  }
  assert.ok(navigation.includes("rounded-[3px]"));
  assert.ok(workspaceDropdown.includes("rounded-[4px]"));
  assert.ok(editor.includes("rounded-[4px]"));
  assert.ok(snapshot.includes("rounded-[4px]"));
  assert.ok(labsAnalytics.includes("rounded-[4px]"));
  assert.ok(deletion.includes("rounded-[4px]"));
});


test("Source Library, Snapshot storage and account sign-out reuse the supplied animated icon sources", async () => {
  const [destinations, account, fileCode, database, logout] = await Promise.all([
    read("../src/app/components/labs/LabsWorkspaceDestinations.js"),
    read("../src/app/components/labs/LabsAccountControl.js"),
    read("../src/app/components/ui/FileCodeIcon.js"),
    read("../src/app/components/ui/DatabaseArrowDownIcon.js"),
    read("../src/app/components/ui/LogOutAnimatedIcon.js"),
  ]);

  assert.ok(destinations.includes('import FileCodeIcon from "@/app/components/ui/FileCodeIcon"'));
  assert.ok(destinations.includes('import DatabaseArrowDownIcon from "@/app/components/ui/DatabaseArrowDownIcon"'));
  assert.match(destinations, /id: "sources"[\s\S]*?icon: FileCodeIcon/);
  assert.match(destinations, /id: "snapshots"[\s\S]*?icon: DatabaseArrowDownIcon/);

  for (const source of [fileCode, database, logout]) {
    assert.ok(source.includes("forwardRef"));
    assert.ok(source.includes("useImperativeHandle"));
    assert.ok(source.includes("startAnimation"));
    assert.ok(source.includes("stopAnimation"));
    assert.ok(source.includes("useReducedMotion"));
  }

  assert.ok(account.includes("LogOutAnimatedIcon"));
  assert.ok(account.includes("signOutIconRef"));
  assert.ok(account.includes("isAnimated={!prefersReducedMotion}"));
});

test("CTA icon disc uses muted charcoal in light mode and smoky gray with a dark icon in dark mode", async () => {
  const cta = await read("../src/app/components/common/ProjectResumeButton.js");
  assert.ok(cta.includes('"border border-[#3D4640]"'));
  assert.ok(cta.includes('"bg-[#292F2B]"'));
  assert.ok(cta.includes('"text-[#F1F3EF]"'));
  assert.ok(cta.includes('"dark:bg-[#DCE1DD]"'));
  assert.ok(cta.includes('"dark:text-[#343B36]"'));
  assert.ok(cta.includes('"border border-[#3D4640]"'));
  assert.ok(cta.includes('"dark:border-[#C9D0CB]"'));
});
