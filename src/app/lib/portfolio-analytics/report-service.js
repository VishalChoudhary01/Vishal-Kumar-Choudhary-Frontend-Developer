import "server-only";

import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";
import PortfolioVisit from "./models/PortfolioVisit";
import { getPortfolioAnalyticsExcludedOwnerHash } from "./verified-visitor.mjs";
import {
  buildCompletePortfolioDailySeries,
  buildPortfolioRecentCursorMatch,
  encodePortfolioRecentCursor,
  normalizePortfolioAnalyticsPeriod,
  normalizePortfolioRecentLimit,
} from "./report-utils.mjs";

const REPORT_TOP_LIMIT = 12;
const RECENT_DEFAULT_LIMIT = 25;

function safeCount(value) {
  return Math.max(0, Number(value) || 0);
}

function dateRangeMatch(period, excludedOwnerHash = null) {
  const match = {
    startedAt: {
      $gte: period.from,
      $lte: period.to,
    },
  };

  if (excludedOwnerHash) {
    match.verifiedUserHash = { $ne: excludedOwnerHash };
  }

  return match;
}

function getExcludedOwnerHash(excludedOwnerUser) {
  return getPortfolioAnalyticsExcludedOwnerHash({
    user: excludedOwnerUser,
    secret: process.env.PORTFOLIO_ANALYTICS_HMAC_SECRET,
  });
}

function activeSecondsExpression() {
  return { $ifNull: ["$activeSeconds", 0] };
}

function buildReportPipeline(match) {
  return [
    { $match: match },
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalVisits: { $sum: 1 },
              totalActiveSeconds: { $sum: activeSecondsExpression() },
              visitsWithActiveTime: {
                $sum: {
                  $cond: [{ $gt: [activeSecondsExpression(), 0] }, 1, 0],
                },
              },
            },
          },
          { $project: { _id: 0 } },
        ],
        daily: [
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$startedAt",
                  timezone: "UTC",
                },
              },
              visits: { $sum: 1 },
              activeSeconds: { $sum: activeSecondsExpression() },
            },
          },
          { $sort: { _id: 1 } },
        ],
        pageTypes: [
          {
            $group: {
              _id: "$pageType",
              visits: { $sum: 1 },
              activeSeconds: { $sum: activeSecondsExpression() },
            },
          },
          { $sort: { visits: -1, _id: 1 } },
          { $project: { _id: 0, pageType: "$_id", visits: 1, activeSeconds: 1 } },
        ],
        topPages: [
          {
            $group: {
              _id: {
                pageType: "$pageType",
                path: "$path",
                slug: "$slug",
              },
              visits: { $sum: 1 },
              activeSeconds: { $sum: activeSecondsExpression() },
            },
          },
          { $sort: { visits: -1, "_id.path": 1 } },
          { $limit: REPORT_TOP_LIMIT },
          {
            $project: {
              _id: 0,
              pageType: "$_id.pageType",
              path: "$_id.path",
              slug: "$_id.slug",
              visits: 1,
              activeSeconds: 1,
            },
          },
        ],
        sources: [
          {
            $group: {
              _id: {
                sourceType: "$sourceType",
                source: {
                  $switch: {
                    branches: [
                      {
                        case: { $eq: ["$sourceType", "referral"] },
                        then: { $ifNull: ["$referrerHost", "Unknown referral"] },
                      },
                      {
                        case: { $eq: ["$sourceType", "campaign"] },
                        then: { $ifNull: ["$utmSource", "Unspecified campaign"] },
                      },
                      {
                        case: { $eq: ["$sourceType", "internal"] },
                        then: "Internal navigation",
                      },
                    ],
                    default: "Direct",
                  },
                },
                medium: {
                  $cond: [
                    { $eq: ["$sourceType", "campaign"] },
                    { $ifNull: ["$utmMedium", "Unspecified medium"] },
                    null,
                  ],
                },
                campaign: {
                  $cond: [
                    { $eq: ["$sourceType", "campaign"] },
                    { $ifNull: ["$utmCampaign", "Unspecified campaign"] },
                    null,
                  ],
                },
              },
              visits: { $sum: 1 },
            },
          },
          { $sort: { visits: -1, "_id.source": 1, "_id.medium": 1 } },
          { $limit: REPORT_TOP_LIMIT },
          {
            $project: {
              _id: 0,
              sourceType: "$_id.sourceType",
              source: "$_id.source",
              medium: "$_id.medium",
              campaign: "$_id.campaign",
              visits: 1,
            },
          },
        ],
        countries: [
          {
            $group: {
              _id: { $ifNull: ["$countryCode", "unknown"] },
              visits: { $sum: 1 },
            },
          },
          { $sort: { visits: -1, _id: 1 } },
          { $limit: REPORT_TOP_LIMIT },
          { $project: { _id: 0, countryCode: "$_id", visits: 1 } },
        ],
        cities: [
          {
            $group: {
              _id: {
                countryCode: { $ifNull: ["$countryCode", "unknown"] },
                regionCode: { $ifNull: ["$regionCode", null] },
                city: { $ifNull: ["$city", "Unknown city"] },
              },
              visits: { $sum: 1 },
            },
          },
          { $sort: { visits: -1, "_id.city": 1 } },
          { $limit: REPORT_TOP_LIMIT },
          {
            $project: {
              _id: 0,
              countryCode: "$_id.countryCode",
              regionCode: "$_id.regionCode",
              city: "$_id.city",
              visits: 1,
            },
          },
        ],
        devices: [
          {
            $group: {
              _id: { $ifNull: ["$deviceType", "unknown"] },
              visits: { $sum: 1 },
            },
          },
          { $sort: { visits: -1, _id: 1 } },
          { $project: { _id: 0, deviceType: "$_id", visits: 1 } },
        ],
      },
    },
  ];
}

function normalizeReportResult(facets, period, uniqueTabSessions) {
  const result = facets?.[0] || {};
  const overview = result.overview?.[0] || {};
  const totalVisits = safeCount(overview.totalVisits);
  const totalActiveSeconds = safeCount(overview.totalActiveSeconds);

  return {
    generatedAt: period.to,
    period: {
      days: period.days,
      from: period.from,
      to: period.to,
      timeZone: "UTC",
    },
    overview: {
      totalVisits,
      uniqueTabSessions: safeCount(uniqueTabSessions),
      totalActiveSeconds,
      averageActiveSeconds: totalVisits
        ? Math.round(totalActiveSeconds / totalVisits)
        : 0,
      visitsWithActiveTime: safeCount(overview.visitsWithActiveTime),
    },
    daily: buildCompletePortfolioDailySeries({
      from: period.from,
      to: period.to,
      groups: result.daily || [],
    }),
    pageTypes: (result.pageTypes || []).map((row) => ({
      pageType: row.pageType,
      visits: safeCount(row.visits),
      activeSeconds: safeCount(row.activeSeconds),
    })),
    topPages: (result.topPages || []).map((row) => ({
      pageType: row.pageType,
      path: row.path,
      slug: row.slug || null,
      visits: safeCount(row.visits),
      activeSeconds: safeCount(row.activeSeconds),
    })),
    sources: (result.sources || []).map((row) => ({
      sourceType: row.sourceType,
      source: row.source,
      medium: row.medium || null,
      campaign: row.campaign || null,
      visits: safeCount(row.visits),
    })),
    countries: (result.countries || []).map((row) => ({
      countryCode: row.countryCode,
      visits: safeCount(row.visits),
    })),
    cities: (result.cities || []).map((row) => ({
      countryCode: row.countryCode,
      regionCode: row.regionCode || null,
      city: row.city,
      visits: safeCount(row.visits),
    })),
    devices: (result.devices || []).map((row) => ({
      deviceType: row.deviceType || "unknown",
      visits: safeCount(row.visits),
    })),
  };
}

/**
 * Reporting is intentionally server-only and called by a future owner-only
 * endpoint. All pipelines begin with the indexed startedAt range.
 */
export async function getPortfolioAnalyticsReport({
  days = 30,
  now = new Date(),
  excludedOwnerUser = null,
} = {}) {
  const period = normalizePortfolioAnalyticsPeriod(days, now);
  const excludedOwnerHash = getExcludedOwnerHash(excludedOwnerUser);
  const match = dateRangeMatch(period, excludedOwnerHash);

  await connectToDatabase();

  const [facetResult, sessionResult] = await Promise.all([
    PortfolioVisit.aggregate(buildReportPipeline(match))
      .allowDiskUse(true)
      .exec(),
    PortfolioVisit.aggregate([
      { $match: match },
      { $group: { _id: "$sessionHash" } },
      { $count: "uniqueTabSessions" },
    ])
      .allowDiskUse(true)
      .exec(),
  ]);

  return normalizeReportResult(
    facetResult,
    period,
    sessionResult?.[0]?.uniqueTabSessions || 0,
  );
}

function mapRecentVisit(document) {
  return {
    id: document._id.toString(),
    path: document.path,
    pageType: document.pageType,
    visitor: document.verifiedUserName
      ? {
          kind: "verified",
          accountId: document.verifiedUserAccountId || null,
          name: document.verifiedUserName,
          email: document.verifiedUserEmailMasked || null,
        }
      : { kind: "guest" },
    slug: document.slug || null,
    sourceType: document.sourceType,
    referrerHost: document.referrerHost || null,
    countryCode: document.countryCode || null,
    regionCode: document.regionCode || null,
    city: document.city || null,
    deviceType: document.deviceType || "unknown",
    startedAt: document.startedAt,
    activeSeconds: safeCount(document.activeSeconds),
    status: document.status,
  };
}

export async function getPortfolioRecentVisits({
  days = 30,
  limit = RECENT_DEFAULT_LIMIT,
  cursor = null,
  now = new Date(),
  excludedOwnerUser = null,
} = {}) {
  const period = normalizePortfolioAnalyticsPeriod(days, now);
  const safeLimit = normalizePortfolioRecentLimit(limit);
  const excludedOwnerHash = getExcludedOwnerHash(excludedOwnerUser);
  const match = dateRangeMatch(period, excludedOwnerHash);
  const cursorMatch = buildPortfolioRecentCursorMatch(
    cursor,
    mongoose.Types.ObjectId,
  );

  if (cursorMatch) match.$and = [cursorMatch];

  await connectToDatabase();

  const documents = await PortfolioVisit.find(match)
    .select(
      "_id path pageType slug sourceType referrerHost countryCode regionCode city deviceType startedAt activeSeconds status +verifiedUserAccountId +verifiedUserName +verifiedUserEmailMasked",
    )
    .sort({ startedAt: -1, _id: -1 })
    .limit(safeLimit + 1)
    .lean();

  const hasMore = documents.length > safeLimit;
  const pageDocuments = hasMore ? documents.slice(0, safeLimit) : documents;
  const lastDocument = pageDocuments[pageDocuments.length - 1];

  return {
    visits: pageDocuments.map(mapRecentVisit),
    nextCursor: hasMore && lastDocument
      ? encodePortfolioRecentCursor({
          startedAt: lastDocument.startedAt,
          id: lastDocument._id.toString(),
        })
      : null,
    pageSize: safeLimit,
    hasMore,
    period: {
      days: period.days,
      from: period.from,
      to: period.to,
      timeZone: "UTC",
    },
  };
}
