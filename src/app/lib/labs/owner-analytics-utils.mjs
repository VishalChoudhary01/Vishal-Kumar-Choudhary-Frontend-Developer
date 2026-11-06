export function createRankings(rows, limit = 5) {
  const safeLimit = Number.isInteger(limit) ? Math.max(0, limit) : 5;

  function rankBy(metric, select = () => ({})) {
    return [...rows]
      .filter((row) => Number(row[metric]) > 0)
      .sort((a, b) => {
        const difference = Number(b[metric]) - Number(a[metric]);
        if (difference !== 0) return difference;
        const titleOrder = a.title.localeCompare(b.title, "en-IN");
        return titleOrder || a.slug.localeCompare(b.slug);
      })
      .slice(0, safeLimit)
      .map((row, index) => ({
        rank: index + 1,
        slug: row.slug,
        title: row.title,
        value: Number(row[metric]) || 0,
        ...select(row),
      }));
  }

  return {
    mostSourceOpens: rankBy("sourceOpens"),
    mostCodeCopies: rankBy("codeCopies"),
    mostActiveLikes: rankBy("totalActiveLikes", (row) => ({
      activeVerifiedLikes: row.activeVerifiedLikes,
      activeAnonymousLikes: row.activeAnonymousLikes,
    })),
  };
}

export function normalizePeriod(days, generatedAt = new Date()) {
  const allowedDays = new Set([7, 30, 90, 365]);
  const periodDays = allowedDays.has(Number(days)) ? Number(days) : 30;
  const generated = generatedAt instanceof Date ? new Date(generatedAt) : new Date(generatedAt);

  if (Number.isNaN(generated.getTime())) {
    throw new TypeError("generatedAt must be a valid date.");
  }

  const since = new Date(
    generated.getTime() - periodDays * 24 * 60 * 60 * 1000,
  );

  return { periodDays, generatedAt: generated, since };
}

function toUtcDateKey(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

export function buildCompleteDailySeries({ since, generatedAt, dailyGroups = [] }) {
  const start = new Date(since);
  const end = new Date(generatedAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new TypeError("since and generatedAt must be valid dates.");
  }
  if (start > end) {
    throw new RangeError("since must not be later than generatedAt.");
  }

  const groupsByDate = new Map(dailyGroups.map((day) => [day._id, day]));
  const firstDay = new Date(Date.UTC(
    start.getUTCFullYear(),
    start.getUTCMonth(),
    start.getUTCDate(),
  ));
  const lastDay = new Date(Date.UTC(
    end.getUTCFullYear(),
    end.getUTCMonth(),
    end.getUTCDate(),
  ));
  const days = [];

  for (
    const cursor = new Date(firstDay);
    cursor <= lastDay;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const date = toUtcDateKey(cursor);
    const group = groupsByDate.get(date);

    const sourceOpens = Number(group?.sourceOpens) || 0;
    const codeCopies = Number(group?.codeCopies) || 0;
    const verifiedLikeActions = Number(group?.verifiedLikeActions) || 0;
    const anonymousLikeActions = Number(group?.anonymousLikeActions) || 0;

    days.push({
      date,
      sourceOpens,
      codeCopies,
      verifiedLikeActions,
      anonymousLikeActions,
      totalActions:
        sourceOpens +
        codeCopies +
        verifiedLikeActions +
        anonymousLikeActions,
    });
  }

  return days;
}


export function selectEligiblePublishedCustomExperiments({
  experiments = [],
  sources = [],
  artifacts = [],
}) {
  const sourceBySlug = new Map(sources.map((source) => [source.slug, source]));
  const artifactsById = new Map();

  for (const artifact of artifacts) {
    const existing = artifactsById.get(artifact.artifactId) || [];
    existing.push(artifact);
    artifactsById.set(artifact.artifactId, existing);
  }

  const seenSlugs = new Set();
  const eligible = [];

  for (const experiment of experiments) {
    const slug = experiment?.slug;
    if (
      typeof slug !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
      seenSlugs.has(slug)
    ) {
      continue;
    }

    const source = sourceBySlug.get(slug);
    if (
      !source ||
      source.published !== true ||
      typeof source.publishedVersionId !== "string" ||
      !source.publishedVersionId ||
      typeof source.publishedArtifactId !== "string" ||
      !source.publishedArtifactId
    ) {
      continue;
    }

    const artifact = (artifactsById.get(source.publishedArtifactId) || []).find(
      (item) =>
        item.status === "ready" &&
        item.experimentSlug === slug &&
        item.sourceVersionId === source.publishedVersionId,
    );

    if (!artifact) continue;

    seenSlugs.add(slug);
    eligible.push({ experiment, artifact });
  }

  return eligible;
}


const ZERO_TOTALS = {
  sourceOpens: 0,
  uniqueVerifiedAccounts: 0,
  codeCopies: 0,
  verifiedLikeActions: 0,
  verifiedUnlikeActions: 0,
  anonymousLikeActions: 0,
  anonymousUnlikeActions: 0,
  activeVerifiedLikes: 0,
  activeAnonymousLikes: 0,
  totalActiveLikes: 0,
};

export function applyAnalyticsEventGroups(rows, eventGroups) {
  const bySlug = new Map(rows.map((row) => [row.slug, { ...row }]));

  for (const group of eventGroups) {
    const row = bySlug.get(group?._id?.slug);
    if (!row) continue;

    const eventType = group?._id?.eventType;
    const actorCategory = group?._id?.actorCategory;
    const count = Math.max(0, Number(group?.count) || 0);

    if (eventType === "source_open" && actorCategory === "verified_user") {
      row.sourceOpens += count;
      row.uniqueVerifiedAccounts += new Set(
        (Array.isArray(group.actorIds) ? group.actorIds : []).filter(
          (actorId) => typeof actorId === "string" && actorId.length > 0,
        ),
      ).size;
    } else if (eventType === "code_copy" && actorCategory === "verified_user") {
      row.codeCopies += count;
    } else if (eventType === "like" && actorCategory === "verified_user") {
      row.verifiedLikeActions += count;
    } else if (eventType === "unlike" && actorCategory === "verified_user") {
      row.verifiedUnlikeActions += count;
    } else if (eventType === "guest_like" && actorCategory === "guest") {
      row.anonymousLikeActions += count;
    } else if (eventType === "guest_unlike" && actorCategory === "guest") {
      row.anonymousUnlikeActions += count;
    }
  }

  return [...bySlug.values()];
}

export function applyActiveLikeGroups(rows, verifiedLikeGroups, guestLikeGroups) {
  const bySlug = new Map(rows.map((row) => [row.slug, { ...row }]));

  for (const group of verifiedLikeGroups) {
    const row = bySlug.get(group?._id);
    if (row) row.activeVerifiedLikes = Math.max(0, Number(group.count) || 0);
  }

  for (const group of guestLikeGroups) {
    const row = bySlug.get(group?._id);
    if (row) row.activeAnonymousLikes = Math.max(0, Number(group.count) || 0);
  }

  for (const row of bySlug.values()) {
    row.totalActiveLikes = row.activeVerifiedLikes + row.activeAnonymousLikes;
  }

  return [...bySlug.values()];
}

export function summarizeAnalyticsRows(rows) {
  return rows.reduce(
    (total, row) => {
      for (const key of Object.keys(ZERO_TOTALS)) {
        total[key] += Math.max(0, Number(row[key]) || 0);
      }
      return total;
    },
    { ...ZERO_TOTALS },
  );
}


const SOURCE_EVENT_RATE_LIMITS = Object.freeze({
  source_open: 30,
  code_copy: 20,
});

export function getSourceEventRateLimit(eventType) {
  return SOURCE_EVENT_RATE_LIMITS[eventType] || null;
}

export function evaluateFixedWindowRateLimit({
  count,
  windowStartedAt,
  now,
  windowMs,
  maxEvents,
}) {
  const numericCount = Number(count);
  const numericWindow = Number(windowMs);
  const numericMaximum = Number(maxEvents);
  const startedAt = new Date(windowStartedAt);
  const currentTime = new Date(now);

  if (
    !Number.isFinite(numericCount) ||
    numericCount < 0 ||
    !Number.isFinite(numericWindow) ||
    numericWindow <= 0 ||
    !Number.isInteger(numericMaximum) ||
    numericMaximum < 1 ||
    Number.isNaN(startedAt.getTime()) ||
    Number.isNaN(currentTime.getTime())
  ) {
    throw new TypeError("Invalid fixed-window rate limit input.");
  }

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((startedAt.getTime() + numericWindow - currentTime.getTime()) / 1000),
  );

  return {
    allowed: numericCount <= numericMaximum,
    retryAfterSeconds,
    remaining: Math.max(0, numericMaximum - numericCount),
  };
}
