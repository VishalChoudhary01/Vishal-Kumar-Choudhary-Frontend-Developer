import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSnapshotStorageInventory,
  isSnapshotId,
} from "../src/app/lib/labs/snapshot-storage-policy.mjs";

const ids = {
  active: "snap_1111111111111111111111111111",
  autoLeaf: "snap_2222222222222222222222222222",
  manual: "snap_3333333333333333333333333333",
  parent: "snap_4444444444444444444444444444",
  child: "snap_5555555555555555555555555555",
  sandboxRef: "snap_6666666666666666666666666666",
};

function snapshot(id, overrides = {}) {
  return {
    id,
    status: "created",
    creationMethod: "automatic",
    sizeBytes: 1024,
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    lastUsedAt: 1_700_000_000_000,
    expiresAt: 1_800_000_000_000,
    ...overrides,
  };
}

test("only unused automatic leaf snapshots are eligible for deletion", () => {
  const result = buildSnapshotStorageInventory({
    snapshots: [
      snapshot(ids.active),
      snapshot(ids.autoLeaf),
      snapshot(ids.manual, { creationMethod: "manual" }),
      snapshot(ids.parent),
      snapshot(ids.child, { parentId: ids.parent }),
      snapshot(ids.sandboxRef),
    ],
    sandboxes: [{ name: "labs-compiler", currentSnapshotId: ids.sandboxRef }],
    activeSnapshotIds: [ids.active],
  });

  const rows = new Map(result.snapshots.map((item) => [item.id, item]));
  assert.equal(rows.get(ids.autoLeaf).canDelete, true);
  assert.equal(rows.get(ids.active).canDelete, false);
  assert.match(rows.get(ids.active).protectionReasons.join(" "), /Configured compiler snapshot/);
  assert.equal(rows.get(ids.manual).canDelete, false);
  assert.match(rows.get(ids.manual).protectionReasons.join(" "), /Manual/);
  assert.equal(rows.get(ids.parent).canDelete, false);
  assert.match(rows.get(ids.parent).protectionReasons.join(" "), /parent/);
  assert.equal(rows.get(ids.child).canDelete, true);
  assert.equal(rows.get(ids.sandboxRef).canDelete, false);
  assert.match(rows.get(ids.sandboxRef).protectionReasons.join(" "), /named Sandbox/);
  assert.equal(result.summary.reclaimableSnapshotCount, 2);
  assert.equal(result.summary.reclaimableBytes, 2048);
});

test("a snapshot referenced by multiple sandboxes reports all reference names", () => {
  const result = buildSnapshotStorageInventory({
    snapshots: [snapshot(ids.sandboxRef)],
    sandboxes: [
      { name: "preview-worker", currentSnapshotId: ids.sandboxRef },
      { name: "compiler-base", currentSnapshotId: ids.sandboxRef },
    ],
  });

  assert.deepEqual(
    result.snapshots[0].sandboxNames.sort(),
    ["compiler-base", "preview-worker"],
  );
  assert.equal(result.snapshots[0].canDelete, false);
});

test("active compiler snapshot parent ancestry is protected", () => {
  const grandparent = ids.parent;
  const parent = ids.child;
  const active = ids.active;
  const result = buildSnapshotStorageInventory({
    snapshots: [
      snapshot(grandparent),
      snapshot(parent, { parentId: grandparent }),
      snapshot(active, { parentId: parent }),
    ],
    sandboxes: [],
    activeSnapshotIds: [active],
  });

  const rows = new Map(result.snapshots.map((item) => [item.id, item]));
  assert.equal(rows.get(active).canDelete, false);
  assert.equal(rows.get(parent).canDelete, false);
  assert.equal(rows.get(grandparent).canDelete, false);
  assert.match(rows.get(grandparent).protectionReasons.join(" "), /Ancestor/);
});

test("unknown creation methods and non-created snapshots are protected", () => {
  const result = buildSnapshotStorageInventory({
    snapshots: [
      snapshot(ids.autoLeaf, { creationMethod: null }),
      snapshot(ids.manual, { status: "failed" }),
    ],
    sandboxes: [],
  });

  assert.equal(result.snapshots.every((item) => item.canDelete === false), true);
});

test("incomplete inventory scan disables every deletion action", () => {
  const result = buildSnapshotStorageInventory({
    snapshots: [snapshot(ids.autoLeaf)],
    sandboxes: [],
    scanComplete: false,
  });

  assert.equal(result.summary.scanComplete, false);
  assert.equal(result.summary.reclaimableSnapshotCount, 0);
  assert.equal(result.snapshots[0].canDelete, false);
  assert.match(result.snapshots[0].protectionReasons.join(" "), /incomplete/);
});

test("snapshot accounting is project-level and reports only eligible reclaimable bytes", () => {
  const result = buildSnapshotStorageInventory({
    snapshots: [
      snapshot(ids.autoLeaf, { sizeBytes: "2048" }),
      snapshot(ids.manual, { sizeBytes: "4096", creationMethod: "manual" }),
    ],
    sandboxes: [],
  });

  assert.equal(result.summary.totalBytes, 6144);
  assert.equal(result.summary.reclaimableBytes, 2048);
  assert.equal(result.summary.snapshotCount, 2);
  assert.equal(result.summary.manualSnapshotCount, 1);
});

test("snapshot IDs use Vercel snapshot identifier format", () => {
  assert.equal(isSnapshotId(ids.active), true);
  assert.equal(isSnapshotId("snap_not-valid"), false);
  assert.equal(isSnapshotId("../snap_111"), false);
});
