const OBJECT_ID_PATTERN = /^[a-f0-9]{24}$/i;
const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const MAX_PORTFOLIO_VISITS_PER_DELETE = 25;
export const MAX_PORTFOLIO_DELETE_RANGE_DAYS = 65;
export const DELETE_ALL_CONFIRMATION = "DELETE ALL PORTFOLIO VISIT DATA";

function invalid(message) {
  const error = new TypeError(message);
  error.code = "INVALID_PORTFOLIO_DELETE";
  error.status = 400;
  return error;
}

function assertPlainObject(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(value))
  ) {
    throw invalid("A valid deletion request is required.");
  }
}

function assertExactKeys(value, expectedKeys) {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();

  if (
    actual.length !== expected.length ||
    actual.some((key, index) => key !== expected[index])
  ) {
    throw invalid("The deletion request contains unexpected fields.");
  }
}

function parseCalendarDate(value, fieldName) {
  if (typeof value !== "string" || !CALENDAR_DATE_PATTERN.test(value)) {
    throw invalid(fieldName + " must be a YYYY-MM-DD date.");
  }

  const date = new Date(value + "T00:00:00.000Z");
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    throw invalid(fieldName + " is not a real calendar date.");
  }

  return date;
}

function utcToday(now) {
  const date = now instanceof Date ? new Date(now) : new Date(now);
  if (Number.isNaN(date.getTime())) throw invalid("The current date is invalid.");

  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  ));
}

function assertConfirmation(actual, expected) {
  if (typeof actual !== "string" || actual !== expected) {
    throw invalid("The typed confirmation does not match the requested deletion scope.");
  }
}

export function getPortfolioDeleteConfirmation({ scope, visitIds, from, to } = {}) {
  if (scope === "selected") {
    const count = Array.isArray(visitIds) ? visitIds.length : 0;
    return "DELETE " + count + " SELECTED " + (count === 1 ? "VISIT" : "VISITS");
  }

  if (scope === "date_range") {
    return "DELETE VISITS FROM " + from + " TO " + to;
  }

  if (scope === "all") return DELETE_ALL_CONFIRMATION;
  return "";
}

export function parsePortfolioVisitDeletionPayload(payload, now = new Date()) {
  assertPlainObject(payload);

  if (payload.scope === "selected") {
    assertExactKeys(payload, ["scope", "visitIds", "confirmation"]);

    if (
      !Array.isArray(payload.visitIds) ||
      payload.visitIds.length < 1 ||
      payload.visitIds.length > MAX_PORTFOLIO_VISITS_PER_DELETE
    ) {
      throw invalid(
        "Select between 1 and " + MAX_PORTFOLIO_VISITS_PER_DELETE + " visits per deletion.",
      );
    }

    const normalizedIds = payload.visitIds.map((id) => {
      if (typeof id !== "string" || !OBJECT_ID_PATTERN.test(id)) {
        throw invalid("A selected visit identifier is invalid.");
      }
      return id.toLowerCase();
    });

    if (new Set(normalizedIds).size !== normalizedIds.length) {
      throw invalid("Duplicate visit identifiers are not allowed.");
    }

    const confirmation = getPortfolioDeleteConfirmation({
      scope: "selected",
      visitIds: normalizedIds,
    });
    assertConfirmation(payload.confirmation, confirmation);

    return {
      scope: "selected",
      visitIds: normalizedIds,
    };
  }

  if (payload.scope === "date_range") {
    assertExactKeys(payload, ["scope", "from", "to", "confirmation"]);

    const from = parseCalendarDate(payload.from, "Start date");
    const to = parseCalendarDate(payload.to, "End date");
    const today = utcToday(now);

    if (from.getTime() > to.getTime()) {
      throw invalid("The start date must not be later than the end date.");
    }
    if (to.getTime() > today.getTime()) {
      throw invalid("The end date cannot be in the future.");
    }

    const inclusiveDays =
      Math.floor((to.getTime() - from.getTime()) / 86_400_000) + 1;

    if (inclusiveDays > MAX_PORTFOLIO_DELETE_RANGE_DAYS) {
      throw invalid(
        "A date-range deletion cannot exceed " +
          MAX_PORTFOLIO_DELETE_RANGE_DAYS +
          " calendar days.",
      );
    }

    const confirmation = getPortfolioDeleteConfirmation({
      scope: "date_range",
      from: payload.from,
      to: payload.to,
    });
    assertConfirmation(payload.confirmation, confirmation);

    return {
      scope: "date_range",
      from,
      toExclusive: new Date(to.getTime() + 86_400_000),
    };
  }

  if (payload.scope === "all") {
    assertExactKeys(payload, ["scope", "confirmation"]);
    assertConfirmation(payload.confirmation, DELETE_ALL_CONFIRMATION);
    return { scope: "all" };
  }

  throw invalid("The deletion scope is not supported.");
}

export function buildPortfolioVisitDeletionFilter(parsedScope, ObjectId) {
  if (!parsedScope || typeof parsedScope !== "object") {
    throw new TypeError("A parsed deletion scope is required.");
  }

  if (parsedScope.scope === "selected") {
    if (typeof ObjectId !== "function") {
      throw new TypeError("A MongoDB ObjectId constructor is required.");
    }

    return {
      _id: {
        $in: parsedScope.visitIds.map((id) => new ObjectId(id)),
      },
    };
  }

  if (parsedScope.scope === "date_range") {
    return {
      startedAt: {
        $gte: parsedScope.from,
        $lt: parsedScope.toExclusive,
      },
    };
  }

  if (parsedScope.scope === "all") return {};

  throw new TypeError("Unsupported Portfolio Analytics deletion scope.");
}
