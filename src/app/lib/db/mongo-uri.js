import { Resolver, promises as dnsPromises } from "node:dns";

/**
 * Resolvers used only when the system resolver cannot answer MongoDB SRV
 * queries. MongoDB Atlas URIs require SRV lookups, which some networks and
 * local DNS proxies refuse.
 */
export const DEFAULT_FALLBACK_DNS_SERVERS = ["8.8.8.8", "1.1.1.1"];

const SRV_URI_PATTERN = /^mongodb\+srv:\/\/(?:([^@/]*)@)?([^/?]+)(\/[^?]*)?(?:\?(.*))?$/;

export function getConfiguredDnsServers() {
  return (process.env.MONGODB_DNS_SERVERS || "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);
}

export function parseMongoSrvUri(uri) {
  const match = SRV_URI_PATTERN.exec(uri);
  if (!match) return null;

  return {
    userinfo: match[1] || "",
    hostname: match[2],
    pathname: match[3] || "",
    search: match[4] || "",
  };
}

/**
 * Detect a connection failure caused by the SRV lookup itself (for example
 * `querySrv ECONNREFUSED` from a local DNS proxy or VPN), as opposed to a
 * credentials, TLS or network failure.
 */
export function isSrvResolutionFailure(error) {
  if (!error) return false;

  return (
    error.syscall === "querySrv" ||
    (typeof error.message === "string" && error.message.includes("querySrv"))
  );
}

function parseTxtOptions(txtRecords) {
  const options = new Map();

  for (const record of txtRecords || []) {
    const value = Array.isArray(record) ? record.join("") : String(record ?? "");

    for (const pair of value.split("&")) {
      const separator = pair.indexOf("=");
      if (separator <= 0) continue;

      options.set(pair.slice(0, separator), pair.slice(separator + 1));
    }
  }

  return options;
}

/**
 * Rewrite a `mongodb+srv://` URI into a `mongodb://` URI whose hosts and
 * options were resolved through an explicit DNS resolver.
 *
 * Returns null when the URI cannot be rewritten.
 */
export function buildDirectMongoUri(uri, srvRecords, txtRecords) {
  const parsed = parseMongoSrvUri(uri);
  if (!parsed) return null;

  const hosts = (srvRecords || [])
    .filter((record) => record && record.name)
    .map((record) => `${record.name}:${record.port}`)
    .join(",");

  if (!hosts) return null;

  const params = new URLSearchParams(parsed.search);

  for (const [key, value] of parseTxtOptions(txtRecords)) {
    if (!params.has(key)) params.set(key, value);
  }

  // SRV URIs imply TLS, so preserve it when switching to a direct host list.
  if (!params.has("tls") && !params.has("ssl")) params.set("tls", "true");

  const userinfo = parsed.userinfo ? `${parsed.userinfo}@` : "";

  return `mongodb://${userinfo}${hosts}${parsed.pathname || "/"}?${params.toString()}`;
}

function resolveRecordsWith(hostname, servers) {
  const resolver = new Resolver({ timeout: 5000, tries: 2 });
  resolver.setServers(servers);

  const srvRecords = new Promise((resolve, reject) => {
    resolver.resolveSrv(`_mongodb._tcp.${hostname}`, (error, records) => {
      if (error) reject(error);
      else resolve(records || []);
    });
  });

  const txtRecords = new Promise((resolve) => {
    resolver.resolveTxt(hostname, (error, records) => {
      resolve(error ? [] : records || []);
    });
  });

  return Promise.all([srvRecords, txtRecords]);
}

/**
 * Resolve the SRV and TXT records through an explicit resolver, bypassing a
 * system resolver that refuses SRV queries. Returns a direct `mongodb://` URI
 * or null when nothing could be resolved.
 */
export async function resolveMongoSrvUri(uri) {
  const parsed = parseMongoSrvUri(uri);
  if (!parsed) return null;

  const configuredServers = getConfiguredDnsServers();
  const serverGroups = configuredServers.length > 0
    ? [configuredServers, DEFAULT_FALLBACK_DNS_SERVERS]
    : [DEFAULT_FALLBACK_DNS_SERVERS];

  for (const servers of serverGroups) {
    try {
      const [srvRecords, txtRecords] = await resolveRecordsWith(
        parsed.hostname,
        servers,
      );
      const directUri = buildDirectMongoUri(uri, srvRecords, txtRecords);

      if (directUri) return directUri;
    } catch {
      // Try the next resolver group.
    }
  }

  return null;
}

/**
 * Return a connection URI that works on this network.
 *
 * Healthy networks keep the original `mongodb+srv://` URI (the driver resolves
 * it normally). When the SRV lookup fails, the records are resolved through an
 * explicit resolver and the URI is rewritten to a direct host list.
 */
export async function resolveMongoConnectionUri(uri) {
  if (!uri || !uri.startsWith("mongodb+srv://")) return uri;

  const parsed = parseMongoSrvUri(uri);
  if (!parsed) return uri;

  try {
    const records = await dnsPromises.resolveSrv(`_mongodb._tcp.${parsed.hostname}`);

    if (records?.length) return uri;
  } catch {
    // Fall through to the explicit-resolver fallback.
  }

  return (await resolveMongoSrvUri(uri)) || uri;
}
