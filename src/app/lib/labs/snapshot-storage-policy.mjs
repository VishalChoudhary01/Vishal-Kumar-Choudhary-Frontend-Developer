const SNAPSHOT_ID_PATTERN = /^(?:snap_[A-Za-z0-9]{28}|vhs_[a-z0-9]{28})$/;

function addReason(reasons, id, reason) {
  if (!id || !reason) return;
  const current = reasons.get(id) || [];
  if (!current.includes(reason)) current.push(reason);
  reasons.set(id, current);
}

function toSafeNumber(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : 0;
}

/**
 * Derives conservative deletion eligibility from the latest complete
 * project snapshot + named Sandbox inventory. Unknown state always protects.
 */
export function buildSnapshotStorageInventory({
  snapshots = [],
  sandboxes = [],
  activeSnapshotIds = [],
  scanComplete = true,
} = {}) {
  const validSnapshots = Array.isArray(snapshots)
    ? snapshots.filter((item) => item && typeof item.id === "string" && SNAPSHOT_ID_PATTERN.test(item.id))
    : [];
  const validSandboxes = Array.isArray(sandboxes) ? sandboxes.filter(Boolean) : [];
  const snapshotIds = new Set(validSnapshots.map((item) => item.id));
  const reasons = new Map();
  const childrenByParent = new Map();
  const sandboxReferences = new Map();
  const activeIds = new Set(
    (Array.isArray(activeSnapshotIds) ? activeSnapshotIds : [])
      .filter((id) => typeof id === "string" && SNAPSHOT_ID_PATTERN.test(id)),
  );

  for (const sandbox of validSandboxes) {
    const snapshotId = sandbox.currentSnapshotId;
    if (typeof snapshotId !== "string" || !snapshotIds.has(snapshotId)) continue;
    const names = sandboxReferences.get(snapshotId) || [];
    if (typeof sandbox.name === "string" && !names.includes(sandbox.name)) names.push(sandbox.name);
    sandboxReferences.set(snapshotId, names);
    addReason(reasons, snapshotId, "Referenced by a named Sandbox");
  }

  for (const snapshot of validSnapshots) {
    if (typeof snapshot.parentId === "string" && SNAPSHOT_ID_PATTERN.test(snapshot.parentId)) {
      const children = childrenByParent.get(snapshot.parentId) || [];
      children.push(snapshot.id);
      childrenByParent.set(snapshot.parentId, children);
      addReason(reasons, snapshot.parentId, "Required parent of another snapshot");
    }

    if (snapshot.creationMethod !== "automatic") {
      addReason(reasons, snapshot.id, "Manual or unknown creation method; retained as a possible compiler/base snapshot");
    }
    if (snapshot.status !== "created") {
      addReason(reasons, snapshot.id, "Snapshot is not in the created state");
    }
  }

  for (const snapshotId of activeIds) {
    if (snapshotIds.has(snapshotId)) {
      addReason(reasons, snapshotId, "Configured compiler snapshot in this deployment");
    }
  }

  // Protect every ancestor of a deployment- or Sandbox-referenced snapshot.
  const protectedSeeds = new Set([...activeIds, ...sandboxReferences.keys()]);
  for (const startId of protectedSeeds) {
    let currentId = startId;
    const visited = new Set();
    while (snapshotIds.has(currentId) && !visited.has(currentId)) {
      visited.add(currentId);
      const current = validSnapshots.find((item) => item.id === currentId);
      const parentId = current?.parentId;
      if (typeof parentId !== "string" || !snapshotIds.has(parentId)) break;
      addReason(reasons, parentId, "Ancestor of a snapshot referenced by a Sandbox or deployment");
      currentId = parentId;
    }
  }

  if (!scanComplete) {
    for (const snapshot of validSnapshots) {
      addReason(reasons, snapshot.id, "Deletion disabled because the Sandbox reference scan was incomplete");
    }
  }

  const rows = validSnapshots.map((snapshot) => {
    const protectionReasons = reasons.get(snapshot.id) || [];
    const children = childrenByParent.get(snapshot.id) || [];
    const canDelete =
      scanComplete &&
      snapshot.status === "created" &&
      snapshot.creationMethod === "automatic" &&
      children.length === 0 &&
      protectionReasons.length === 0;

    return {
      id: snapshot.id,
      status: typeof snapshot.status === "string" ? snapshot.status : "unknown",
      creationMethod: typeof snapshot.creationMethod === "string" ? snapshot.creationMethod : "unknown",
      sizeBytes: toSafeNumber(snapshot.sizeBytes),
      createdAt: toSafeNumber(snapshot.createdAt) || null,
      updatedAt: toSafeNumber(snapshot.updatedAt) || null,
      lastUsedAt: toSafeNumber(snapshot.lastUsedAt) || null,
      expiresAt: toSafeNumber(snapshot.expiresAt) || null,
      parentId: typeof snapshot.parentId === "string" ? snapshot.parentId : null,
      sourceSessionId: typeof snapshot.sourceSessionId === "string" ? snapshot.sourceSessionId : null,
      region: typeof snapshot.region === "string" ? snapshot.region : null,
      architecture: typeof snapshot.architecture === "string" ? snapshot.architecture : null,
      workloadType: typeof snapshot.workloadType === "string" ? snapshot.workloadType : null,
      sandboxNames: sandboxReferences.get(snapshot.id) || [],
      childSnapshotIds: children,
      protectionReasons,
      canDelete,
    };
  }).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  const activeRows = rows.filter((row) => row.status === "created");
  const automaticRows = rows.filter((row) => row.creationMethod === "automatic");
  const manualRows = rows.filter((row) => row.creationMethod === "manual");
  const reclaimableRows = rows.filter((row) => row.canDelete);

  return {
    snapshots: rows,
    summary: {
      snapshotCount: rows.length,
      activeSnapshotCount: activeRows.length,
      automaticSnapshotCount: automaticRows.length,
      manualSnapshotCount: manualRows.length,
      protectedSnapshotCount: rows.filter((row) => !row.canDelete).length,
      reclaimableSnapshotCount: reclaimableRows.length,
      totalBytes: activeRows.reduce((total, row) => total + row.sizeBytes, 0),
      reclaimableBytes: reclaimableRows.reduce((total, row) => total + row.sizeBytes, 0),
      namedSandboxCount: validSandboxes.length,
      sandboxReferenceCount: sandboxReferences.size,
      scanComplete: Boolean(scanComplete),
    },
  };
}

export function isSnapshotId(value) {
  return typeof value === "string" && SNAPSHOT_ID_PATTERN.test(value);
}
