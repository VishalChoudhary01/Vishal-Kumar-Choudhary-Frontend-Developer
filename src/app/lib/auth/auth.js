import "server-only";

import { after } from "next/server";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { betterAuth } from "better-auth";
import { dash } from "@better-auth/infra";
import { getAuthBaseURL, getAuthBaseURLConfig } from "./base-url";
import { resolveMongoConnectionUri } from "@/app/lib/db/mongo-uri";

import { sendAuthEmail, isAuthEmailConfigured } from "./email";
import { markVerificationFlowVerified } from "./verification-flows";

const configuredMongoUri = process.env.MONGODB_URI;
const configuredDatabaseName = process.env.MONGODB_DB_NAME;
const configuredSecret = process.env.BETTER_AUTH_SECRET;
const isDatabaseConfigured = Boolean(
  configuredMongoUri && configuredDatabaseName && configuredSecret,
);
const baseURL = getAuthBaseURLConfig();
const trustedOrigins = [
  ...(typeof baseURL === "string" ? [baseURL] : []),
  ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean),
].filter((value, index, values) => values.indexOf(value) === index);

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;

export const isGoogleAuthConfigured = Boolean(googleClientId && googleClientSecret);
export const isGitHubAuthConfigured = Boolean(githubClientId && githubClientSecret);

async function getGitHubUserInfo(token) {
  if (!token?.accessToken) {
    throw new Error("GitHub did not return an access token.");
  }

  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: "Bearer " + token.accessToken,
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const [profileResponse, emailsResponse] = await Promise.all([
    fetch("https://api.github.com/user", {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }),
    fetch("https://api.github.com/user/emails?per_page=100", {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }),
  ]);

  if (!profileResponse.ok || !emailsResponse.ok) {
    throw new Error("GitHub identity could not be verified.");
  }

  const [profile, emailAddresses] = await Promise.all([
    profileResponse.json(),
    emailsResponse.json(),
  ]);

  if (!profile?.id || !Array.isArray(emailAddresses)) {
    throw new Error("GitHub returned an incomplete identity.");
  }

  const verifiedEmail =
    emailAddresses.find((entry) => entry?.primary === true && entry?.verified === true) ||
    emailAddresses.find((entry) => entry?.verified === true);

  if (!verifiedEmail?.email) {
    throw new Error("GitHub must provide a verified email address.");
  }

  const user = {
    id: String(profile.id),
    name: profile.name || profile.login || "Labs member",
    email: verifiedEmail.email.trim().toLowerCase(),
    image: profile.avatar_url || undefined,
    emailVerified: true,
  };

  return {
    user,
    data: {
      ...profile,
      email: user.email,
      email_verified: true,
    },
  };
}
export const isAuthRuntimeConfigured = () => isDatabaseConfigured;
export const isAuthDeliveryConfigured = () => isDatabaseConfigured && isAuthEmailConfigured();

/**
 * Return non-sensitive readiness categories for email/password registration.
 * OAuth registration uses provider readiness separately and does not require SMTP.
 */
export function getAuthRegistrationReadiness() {
  return {
    database: isDatabaseConfigured,
    emailDelivery: isDatabaseConfigured && isAuthEmailConfigured(),
  };
}

/*
 * Better Auth uses the native MongoDB driver so its adapter can use Atlas
 * transactions. Mongoose remains the app's repository/model connection.
 * A local placeholder permits static builds without deployment secrets;
 * request handlers never serve auth while the real configuration is absent.
 */
// Atlas URIs are `mongodb+srv://`, which needs an SRV lookup. Resolve it here
// through the shared fallback so authentication keeps working on networks
// that refuse SRV queries.
const mongoConnectionUri = await resolveMongoConnectionUri(
  configuredMongoUri || "mongodb://127.0.0.1:27017",
);

// A dev server keeps module-scope globals across hot reloads, so a cached value
// can come from another revision of this file or target a different URI. Only
// reuse it when both the URI and the client shape still match.
const cachedAuthMongoClient = globalThis.__labsBetterAuthMongoClient;
const mongoClient =
  cachedAuthMongoClient?.uri === mongoConnectionUri &&
  typeof cachedAuthMongoClient.client?.db === "function"
    ? cachedAuthMongoClient.client
    : new MongoClient(mongoConnectionUri, {
        maxPoolSize: 5,
        minPoolSize: 0,
        serverSelectionTimeoutMS: 10000,
      });

if (process.env.NODE_ENV !== "production") {
  globalThis.__labsBetterAuthMongoClient = {
    uri: mongoConnectionUri,
    client: mongoClient,
  };
}

const database = mongoClient.db(configuredDatabaseName || "portfolio");
const authSecret = configuredSecret || "local-development-only-better-auth-secret-32";

function scheduleEmail(message) {
  after(async () => {
    try {
      await sendAuthEmail(message);
    } catch (error) {
      // Never log recipients, message contents, reset links, or tokens.
      console.error("[auth-email] delivery failed:", error?.code || "DELIVERY_ERROR");
    }
  });
}

function buildEmailHtml({ heading, message, actionLabel, url }) {
  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  return [
    '<!doctype html><html lang="en"><body style="margin:0;padding:32px 16px;background:#f7f4ee;color:#1c1b19;font-family:Arial,sans-serif;">',
    '<main style="max-width:520px;margin:0 auto;padding:28px;background:#fffcf7;border:1px solid #ded8cf;border-radius:12px;">',
    '<p style="margin:0 0 18px;color:#176b68;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">Portfolio Labs</p>',
    '<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:28px;font-weight:400;">',
    escapeHtml(heading),
    "</h1><p style=\"margin:0 0 24px;color:#625e57;line-height:1.65;\">",
    escapeHtml(message),
    '</p><p style="margin:0 0 24px;"><a href="',
    escapeHtml(url),
    '" style="display:inline-block;padding:13px 18px;background:#176b68;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;">',
    escapeHtml(actionLabel),
    "</a></p>",
    '<p style="margin:0;color:#817d75;font-size:12px;line-height:1.6;">If you did not request this message, you can safely ignore it.</p>',
    "</main></body></html>",
  ].join("");
}

export const auth = betterAuth({
  appName: "Portfolio Labs",
  baseURL,
  secret: authSecret,
  trustedOrigins,
  database: mongodbAdapter(database, { client: mongoClient }),
  // Activate Better Auth Dash only when its server-side project key is present.
  // Authentication itself remains available when Dash has not been connected.
  plugins: process.env.BETTER_AUTH_API_KEY
    ? [dash({ apiKey: process.env.BETTER_AUTH_API_KEY })]
    : [],
  account: {
    accountLinking: {
      enabled: true,
      disableImplicitLinking: false,
      allowDifferentEmails: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      scheduleEmail({
        to: user.email,
        subject: "Reset your Portfolio Labs password",
        text: [
          "A password reset was requested for your Portfolio Labs account.",
          "",
          url,
          "",
          "If you did not request this, you can safely ignore this email.",
        ].join("\n"),
        html: buildEmailHtml({
          heading: "Reset your password",
          message: "Use the secure link below to choose a new password for your Labs account.",
          actionLabel: "Reset password",
          url,
        }),
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: false,
    afterEmailVerification: async (user) => {
      try {
        await markVerificationFlowVerified({ email: user.email });
      } catch (error) {
        console.error(
          "[auth-verification] flow update failed:",
          error?.code || "VERIFICATION_FLOW_ERROR",
        );
      }
    },
    sendVerificationEmail: async ({ user, url }) => {
      scheduleEmail({
        to: user.email,
        subject: "Verify your Portfolio Labs email",
        text: [
          "Verify your email address to activate your Portfolio Labs account.",
          "",
          url,
          "",
          "If you did not create this account, you can safely ignore this email.",
        ].join("\n"),
        html: buildEmailHtml({
          heading: "Verify your email",
          message: "Follow this link to verify your email address and activate your Labs account.",
          actionLabel: "Verify email",
          url,
        }),
      });
    },
  },
  socialProviders: {
    ...(isGoogleAuthConfigured
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            requireEmailVerification: true,
            disableImplicitSignUp: true,
            prompt: "select_account",
          },
        }
      : {}),
    ...(isGitHubAuthConfigured
      ? {
          github: {
            clientId: githubClientId,
            clientSecret: githubClientSecret,
            scope: ["read:user", "user:email"],
            requireEmailVerification: true,
            disableImplicitSignUp: true,
            getUserInfo: getGitHubUserInfo,
          },
        }
      : {}),
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "database",
    modelName: "rateLimit",
    customRules: {
      "/sign-in/email": { window: 60, max: 8 },
      "/sign-in/social": { window: 60, max: 8 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
      "/send-verification-email": { window: 60, max: 3 },
    },
  },
  advanced: {
    database: { joins: true },
    useSecureCookies: process.env.NODE_ENV === "production",
    ipAddress: {
      ipAddressHeaders: process.env.AUTH_TRUSTED_IP_HEADER
        ? [process.env.AUTH_TRUSTED_IP_HEADER]
        : ["x-vercel-forwarded-for"],
    },
  },
});
