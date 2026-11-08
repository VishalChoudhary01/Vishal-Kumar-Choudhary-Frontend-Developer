const ALLOWED_PERIODS = new Set([7, 30, 60]);
const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const MAX_CURSOR_LENGTH = 256;

function validDate(value, name) {
  const result = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(result.getTime())) throw new TypeError(name + " must be a valid date.");
  return result;
}

export function normalizePortfolioAnalyticsPeriod(days, generatedAt = new Date()) {
  const now = validDate(generatedAt, "generatedAt");
  const requestedDays = Number(days);
  const periodDays = ALLOWED_PERIODS.has(requestedDays) ? requestedDays : 30;
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const from = new Date(todayUtc);
  from.setUTCDate(from.getUTCDate() - (periodDays - 1));
  return { days: periodDays, from, to: now, timeZone: "UTC" };
}

function toUtcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export function buildCompletePortfolioDailySeries({ from, to, groups = [] } = {}) {
  const start = validDate(from, "from");
  const end = validDate(to, "to");
  if (start.getTime() > end.getTime()) throw new RangeError("from must not be later than to.");
  if (!Array.isArray(groups)) throw new TypeError("groups must be an array.");

  const byDate = new Map();
  for (const group of groups) {
    const date = typeof group?.date === "string" ? group.date : group?._id;
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    byDate.set(date, group);
  }

  const firstDay = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  const result = [];
  for (const cursor = new Date(firstDay); cursor <= lastDay; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = toUtcDateKey(cursor);
    const group = byDate.get(date);
    result.push({
      date,
      visits: Math.max(0, Number(group?.visits) || 0),
      activeSeconds: Math.max(0, Number(group?.activeSeconds) || 0),
    });
  }
  return result;
}

export function encodePortfolioRecentCursor({ startedAt, id } = {}) {
  const date = validDate(startedAt, "startedAt");
  if (typeof id !== "string" || !OBJECT_ID_PATTERN.test(id)) {
    throw new TypeError("id must be a MongoDB ObjectId hex string.");
  }
  return Buffer.from(JSON.stringify({
    startedAt: date.toISOString(),
    id: id.toLowerCase(),
  }), "utf8").toString("base64url");
}

export function decodePortfolioRecentCursor(cursor) {
  if (
    typeof cursor !== "string" ||
    cursor.length < 8 ||
    cursor.length > MAX_CURSOR_LENGTH ||
    !/^[A-Za-z0-9_-]+$/.test(cursor)
  ) {
    throw new TypeError("Invalid recent-visits cursor.");
  }

  let value;
  try {
    value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
  } catch {
    throw new TypeError("Invalid recent-visits cursor.");
  }

  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== 2 ||
    typeof value.startedAt !== "string" ||
    typeof value.id !== "string" ||
    !OBJECT_ID_PATTERN.test(value.id)
  ) {
    throw new TypeError("Invalid recent-visits cursor.");
  }

  const date = new Date(value.startedAt);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value.startedAt) {
    throw new TypeError("Invalid recent-visits cursor.");
  }
  return { startedAt: date, id: value.id.toLowerCase() };
}

export function buildPortfolioRecentCursorMatch(cursor, ObjectId) {
  if (!cursor) return null;
  const decoded = decodePortfolioRecentCursor(cursor);
  if (typeof ObjectId !== "function") throw new TypeError("A MongoDB ObjectId constructor is required.");

  return {
    $or: [
      { startedAt: { $lt: decoded.startedAt } },
      { startedAt: decoded.startedAt, _id: { $lt: new ObjectId(decoded.id) } },
    ],
  };
}

export function normalizePortfolioRecentLimit(limit = 25) {
  const value = Number(limit);
  if (!Number.isInteger(value)) return 25;
  return Math.min(50, Math.max(1, value));
}
