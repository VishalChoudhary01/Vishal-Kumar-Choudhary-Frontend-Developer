const ALLOWED_DAYS = new Set(["7", "30", "60"]);
const ALLOWED_VIEWS = new Set(["summary", "recent"]);
const MAX_CURSOR_LENGTH = 256;

function invalid(message) {
  const error = new TypeError(message);
  error.code = "INVALID_ANALYTICS_QUERY";
  error.status = 400;
  return error;
}

export function parsePortfolioAnalyticsReadQuery(searchParams) {
  if (!searchParams || typeof searchParams.getAll !== "function") {
    throw invalid("Analytics query parameters are invalid.");
  }

  const allowedKeys = new Set(["view", "days", "cursor"]);
  for (const key of searchParams.keys()) {
    if (!allowedKeys.has(key)) {
      throw invalid("Unexpected analytics query parameter.");
    }
    if (searchParams.getAll(key).length !== 1) {
      throw invalid("Analytics query parameters must not be repeated.");
    }
  }

  const rawView = searchParams.get("view") || "summary";
  const rawDays = searchParams.get("days") || "30";
  const cursor = searchParams.get("cursor");

  if (!ALLOWED_VIEWS.has(rawView)) {
    throw invalid("Analytics view is not supported.");
  }
  if (!ALLOWED_DAYS.has(rawDays)) {
    throw invalid("Analytics period is not supported.");
  }
  if (rawView === "summary" && cursor !== null) {
    throw invalid("A cursor is valid only for recent visits.");
  }
  if (cursor !== null && (
    cursor.length < 8 ||
    cursor.length > MAX_CURSOR_LENGTH ||
    !/^[A-Za-z0-9_-]+$/.test(cursor)
  )) {
    throw invalid("Recent visits cursor is invalid.");
  }

  return {
    view: rawView,
    days: Number(rawDays),
    cursor,
  };
}
