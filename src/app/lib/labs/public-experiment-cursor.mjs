const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const CURSOR_MAX_LENGTH = 384;

export function encodePublicExperimentCursor({ publishedAt, id }) {
  const published =
    publishedAt === null || publishedAt === undefined
      ? null
      : publishedAt instanceof Date
        ? publishedAt
        : new Date(publishedAt);

  if (
    (published && Number.isNaN(published.getTime())) ||
    typeof id !== "string" ||
    !OBJECT_ID_PATTERN.test(id)
  ) {
    throw new TypeError("Invalid public experiment cursor values.");
  }

  const payload = {
    p: published ? published.toISOString() : null,
    id: id.toLowerCase(),
  };

  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

export function decodePublicExperimentCursor(value) {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > CURSOR_MAX_LENGTH ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) {
    throw new TypeError("Invalid public experiment cursor.");
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw new TypeError("Invalid public experiment cursor.");
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !(payload.p === null || typeof payload.p === "string") ||
    typeof payload.id !== "string" ||
    !OBJECT_ID_PATTERN.test(payload.id)
  ) {
    throw new TypeError("Invalid public experiment cursor.");
  }

  const publishedAt = payload.p === null ? null : new Date(payload.p);

  if (
    (publishedAt && Number.isNaN(publishedAt.getTime())) ||
    (publishedAt && publishedAt.toISOString() !== payload.p)
  ) {
    throw new TypeError("Invalid public experiment cursor.");
  }

  return {
    publishedAt,
    id: payload.id.toLowerCase(),
  };
}

/**
 * Keyset predicate for sort order { publishedAt: -1, _id: -1 }.
 * Both fields are stable for a given published record, preventing updatedAt
 * changes from moving a card across pagination boundaries.
 */
export function buildPublicExperimentCursorMatch(cursor, ObjectId) {
  if (!cursor || typeof ObjectId !== "function") return null;

  const id = new ObjectId(cursor.id);
  if (cursor.publishedAt === null) {
    return {
      publishedAt: null,
      _id: { $lt: id },
    };
  }

  return {
    $or: [
      { publishedAt: { $lt: cursor.publishedAt } },
      { publishedAt: cursor.publishedAt, _id: { $lt: id } },
    ],
  };
}
