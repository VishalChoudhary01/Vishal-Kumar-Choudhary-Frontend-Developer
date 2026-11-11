import "server-only";

import mongoose from "mongoose";

const portfolioVisitSchema = new mongoose.Schema(
  {
    visitId: {
      type: String,
      required: true,
      minlength: 36,
      maxlength: 36,
      match: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    },
    // HMACs are hidden from normal model projections and cannot be used as
    // browser/session identifiers outside this analytics domain.
    startKeyHash: {
      type: String,
      required: true,
      minlength: 64,
      maxlength: 64,
      select: false,
    },
    sessionHash: {
      type: String,
      required: true,
      minlength: 64,
      maxlength: 64,
      select: false,
    },
    pageType: {
      type: String,
      required: true,
      enum: ["home", "project", "labs_index", "lab_detail"],
    },
    path: {
      type: String,
      required: true,
      maxlength: 200,
      match: /^(?:\/|\/labs|\/labs\/[a-z0-9]+(?:-[a-z0-9]+)*|\/projects\/[a-z0-9]+(?:-[a-z0-9]+)*)$/,
    },
    slug: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    sourceType: {
      type: String,
      required: true,
      enum: ["direct", "referral", "campaign", "internal"],
    },
    referrerHost: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      maxlength: 253,
    },
    utmSource: { type: String, default: null, trim: true, maxlength: 80 },
    utmMedium: { type: String, default: null, trim: true, maxlength: 80 },
    utmCampaign: { type: String, default: null, trim: true, maxlength: 80 },
    countryCode: {
      type: String,
      default: null,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
      match: /^[A-Z]{2}$/,
    },
    regionCode: {
      type: String,
      default: null,
      uppercase: true,
      maxlength: 3,
      match: /^[A-Z0-9]{1,3}$/,
    },
    city: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },
    deviceType: {
      type: String,
      required: true,
      enum: ["desktop", "mobile", "tablet", "unknown"],
    },
    // Verified account identity is derived only from the server-side
    // Better Auth session. Raw ID, name and masked email are hidden from
    // default model projections and requested only by the owner report.
    verifiedUserAccountId: {
      type: String,
      default: null,
      trim: true,
      maxlength: 128,
      select: false,
    },
    verifiedUserHash: {
      type: String,
      default: null,
      minlength: 64,
      maxlength: 64,
      match: /^[a-f0-9]{64}$/i,
      select: false,
    },
    verifiedUserName: {
      type: String,
      default: null,
      trim: true,
      maxlength: 80,
      select: false,
    },
    verifiedUserEmailMasked: {
      type: String,
      default: null,
      trim: true,
      maxlength: 254,
      select: false,
    },
    startedAt: {
      type: Date,
      required: true,
      immutable: true,
    },
    lastHeartbeatAt: {
      type: Date,
      required: true,
    },
    activeSeconds: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: Number.isSafeInteger,
    },
    status: {
      type: String,
      required: true,
      enum: ["active", "paused", "ended", "expired"],
      default: "active",
    },
    endedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      immutable: true,
    },
    schemaVersion: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  {
    collection: "portfolio_visits",
    strict: "throw",
    versionKey: false,
    timestamps: false,
    autoIndex: false,
  },
);

portfolioVisitSchema.index(
  { visitId: 1 },
  { unique: true, name: "portfolio_visits_visit_id_unique" },
);
portfolioVisitSchema.index(
  { startKeyHash: 1 },
  { unique: true, name: "portfolio_visits_start_key_unique" },
);
portfolioVisitSchema.index(
  { startedAt: -1 },
  { name: "portfolio_visits_started_at_desc" },
);
portfolioVisitSchema.index(
  { startedAt: -1, _id: -1 },
  { name: "portfolio_visits_recent_cursor" },
);
portfolioVisitSchema.index(
  { startedAt: 1, sessionHash: 1 },
  { name: "portfolio_visits_started_session_distinct" },
);
portfolioVisitSchema.index(
  { pageType: 1, startedAt: -1 },
  { name: "portfolio_visits_page_type_started_at" },
);
portfolioVisitSchema.index(
  { slug: 1, startedAt: -1 },
  {
    name: "portfolio_visits_slug_started_at",
    partialFilterExpression: { slug: { $type: "string" } },
  },
);
portfolioVisitSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0, name: "portfolio_visits_expiry_ttl" },
);

const PortfolioVisit =
  mongoose.models.PortfolioVisit ||
  mongoose.model("PortfolioVisit", portfolioVisitSchema);

export default PortfolioVisit;
