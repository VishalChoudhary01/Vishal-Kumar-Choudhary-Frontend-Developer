import "server-only";

import { Sandbox, Snapshot } from "@vercel/sandbox";
import {
  buildSnapshotStorageInventory,
  isSnapshotId,
} from "./snapshot-storage-policy.mjs";

const MAX_SNAPSHOT_RECORDS = 2_000;
const MAX_SANDBOX_RECORDS = 5_000;

function createError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function collectPaginated(iterable, maximum, label) {
  const records = [];
  for await (const item of iterable) {
    records.push(item);
    if (records.length > maximum) {
      throw createError(
        "SNAPSHOT_INVENTORY_TOO_LARGE",
        "The Vercel " + label + " inventory exceeded the safety scan limit.",
      );
    }
  }
  return records;
}

async function readProjectSnapshotRecords() {
  if (!process.env.VERCEL_OIDC_TOKEN) {
    throw createError(
      "SNAPSHOT_AUTH_NOT_CONFIGURED",
      "Vercel deployment identity is unavailable. Open this page from a Vercel deployment with OIDC enabled.",
    );
  }

  try {
    const [snapshotResult, sandboxResult] = await Promise.all([
      Snapshot.list({ limit: 50, sortOrder: "desc" }),
      Sandbox.list({ limit: 50, sortBy: "createdAt", sortOrder: "desc" }),
    ]);

    const [snapshots, sandboxes] = await Promise.all([
      collectPaginated(snapshotResult, MAX_SNAPSHOT_RECORDS, "snapshot"),
      collectPaginated(sandboxResult, MAX_SANDBOX_RECORDS, "Sandbox"),
    ]);

    return { snapshots, sandboxes };
  } catch (error) {
    if (error?.code) throw error;
    console.error("[labs-snapshot-storage] Vercel inventory request failed:", {
      name: error?.name || "Error",
      message: String(error?.message || "Unknown error").slice(0, 300),
    });
    throw createError(
      "SNAPSHOT_INVENTORY_UNAVAILABLE",
      "Vercel snapshot inventory could not be loaded. Check deployment OIDC permissions and the Sandbox API status.",
    );
  }
}

export async function getSnapshotStorageReport() {
  const { snapshots, sandboxes } = await readProjectSnapshotRecords();
  const activeSnapshotIds = [
    process.env.LABS_COMPILER_SNAPSHOT_ID,
  ].filter(isSnapshotId);

  const inventory = buildSnapshotStorageInventory({
    snapshots,
    sandboxes,
    activeSnapshotIds,
    scanComplete: true,
  });

  return {
    ...inventory,
    source: "vercel-sandbox-project",
    accountQuotaAvailable: false,
    accountQuotaNote:
      "This is the snapshot inventory for the current Vercel project. The Hobby account's billing quota is separate and must be checked in Vercel Usage.",
    refreshedAt: new Date().toISOString(),
  };
}

export async function deleteUnusedSnapshot({ snapshotId, confirmation }) {
  if (!isSnapshotId(snapshotId)) {
    throw createError("VALIDATION_ERROR", "A valid Vercel snapshot ID is required.");
  }
  if (confirmation !== snapshotId) {
    throw createError("SNAPSHOT_CONFIRMATION_REQUIRED", "Type the complete snapshot ID to confirm deletion.");
  }

  // Re-read the entire inventory immediately before deletion. Never trust the
  // eligibility value sent by the browser or from an earlier dashboard load.
  const report = await getSnapshotStorageReport();
  const target = report.snapshots.find((item) => item.id === snapshotId);

  if (!target) {
    throw createError("NOT_FOUND", "The snapshot no longer exists in this project inventory. Refresh the list.");
  }
  if (!target.canDelete) {
    throw createError(
      "SNAPSHOT_NOT_SAFE_TO_DELETE",
      "This snapshot is protected and cannot be deleted from Labs. Refresh the inventory and inspect its protection reasons.",
    );
  }

  try {
    const snapshot = await Snapshot.get({ snapshotId });
    await snapshot.delete();
  } catch (error) {
    if (error?.code) throw error;
    console.error("[labs-snapshot-storage] snapshot deletion failed:", {
      snapshotId,
      name: error?.name || "Error",
      message: String(error?.message || "Unknown error").slice(0, 300),
    });
    throw createError(
      "SNAPSHOT_DELETE_FAILED",
      "Vercel did not confirm snapshot deletion. Refresh the inventory before trying again.",
    );
  }

  // Verify by reading the project inventory again. Absence or status=deleted
  // confirms completion; a lingering created record is not reported as success.
  const after = await getSnapshotStorageReport();
  const remaining = after.snapshots.find((item) => item.id === snapshotId);
  if (remaining && remaining.status !== "deleted") {
    throw createError(
      "SNAPSHOT_DELETE_UNCONFIRMED",
      "Vercel accepted the delete request, but the snapshot is still listed. Refresh before taking further action.",
    );
  }

  return {
    deleted: true,
    snapshotId,
    verified: true,
    inventory: after,
  };
}
