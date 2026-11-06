const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const CURSOR_MAX_LENGTH = 512;

export function encodePublicExperimentCursor({ publishedAt, updatedAt, id }) {
  const updated = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  const published =
    publishedAt === null || publishedAt === undefined
      ? null
      : publishedAt instanceof Date
        ? publishedAt
        : new Date(publishedAt);

  if (
    Number.isNaN(updated.getTime()) ||
    (published && Number.isNaN(published.getTime())) ||
    typeof id !== "string" ||
    !OBJECT_ID_PATTERN.test(id)
  ) {
    throw new TypeError("Invalid public experiment cursor values.");
  }

  const payload = {
    p: published ? published.toISOString() : null,
    u: updated.toISOString(),
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
    typeof payload.u !== "string" ||
    typeof payload.id !== "string" ||
    !OBJECT_ID_PATTERN.test(payload.id)
  ) {
    throw new TypeError("Invalid public experiment cursor.");
  }

  const updatedAt = new Date(payload.u);
  const publishedAt = payload.p === null ? null : new Date(payload.p);

  if (
    Number.isNaN(updatedAt.getTime()) ||
    (publishedAt && Number.isNaN(publishedAt.getTime())) ||
    (publishedAt && publishedAt.toISOString() !== payload.p) ||
    updatedAt.toISOString() !== payload.u
  ) {
    throw new TypeError("Invalid public experiment cursor.");
  }

  return {
    publishedAt,
    updatedAt,
    id: payload.id.toLowerCase(),
  };
}

export function buildPublicExperimentCursorMatch(cursor, ObjectId) {
  if (!cursor || typeof ObjectId !== "function") return null;

  const id = new ObjectId(cursor.id);
  if (cursor.publishedAt === null) {
    return {
      publishedAt: null,
      $or: [
        { updatedAt: { $lt: cursor.updatedAt } },
        { updatedAt: cursor.updatedAt, _id: { $lt: id } },
      ],
    };
  }

  return {
    $or: [
      { publishedAt: { $lt: cursor.publishedAt } },
      {
        publishedAt: cursor.publishedAt,
        updatedAt: { $lt: cursor.updatedAt },
      },
      {
        publishedAt: cursor.publishedAt,
        updatedAt: cursor.updatedAt,
        _id: { $lt: id },
      },
    ],
  };
}
