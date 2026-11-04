import { buildSiteUrl } from "@/app/lib/seo/urls";

/*
 * Server-owned policy versions. Update the relevant version whenever the
 * published policy changes materially. Never accept these values from a
 * registration request.
 */
export const TERMS_VERSION = "2026-11-04";
export const PRIVACY_VERSION = "2026-11-04.1";

export function getLegalDocumentConfig() {
  const siteUrl = buildSiteUrl();

  return {
    terms: {
      path: "/terms",
      url: new URL("/terms", siteUrl).toString(),
      version: TERMS_VERSION,
    },
    privacy: {
      path: "/privacy",
      url: new URL("/privacy", siteUrl).toString(),
      version: PRIVACY_VERSION,
    },
  };
}

export function areLegalDocumentsConfigured() {
  try {
    const documents = getLegalDocumentConfig();
    const urls = [documents.terms.url, documents.privacy.url];

    return urls.every((value) => {
      const url = new URL(value);

      return (
        url.protocol === "https:" ||
        (process.env.NODE_ENV !== "production" &&
          url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname))
      );
    });
  } catch {
    return false;
  }
}
