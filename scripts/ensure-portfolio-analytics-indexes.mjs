import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME;

if (!uri || !databaseName) {
  throw new Error(
    "MONGODB_URI and MONGODB_DB_NAME are required to ensure Portfolio Analytics indexes.",
  );
}

const indexes = [
  {
    key: { visitId: 1 },
    options: { unique: true },
    name: "portfolio_visits_visit_id_unique",
  },
  {
    key: { startKeyHash: 1 },
    options: { unique: true },
    name: "portfolio_visits_start_key_unique",
  },
  {
    key: { startedAt: -1 },
    options: {},
    name: "portfolio_visits_started_at_desc",
  },
  {
    key: { pageType: 1, startedAt: -1 },
    options: {},
    name: "portfolio_visits_page_type_started_at",
  },
  {
    key: { slug: 1, startedAt: -1 },
    options: {
      partialFilterExpression: { slug: { $type: "string" } },
    },
    name: "portfolio_visits_slug_started_at",
  },
  {
    key: { expiresAt: 1 },
    options: { expireAfterSeconds: 0 },
    name: "portfolio_visits_expiry_ttl",
  },
];

function sameKey(actual, expected) {
  const actualEntries = Object.entries(actual || {});
  const expectedEntries = Object.entries(expected || {});
  return actualEntries.length === expectedEntries.length &&
    expectedEntries.every(([field, direction]) => actual[field] === direction);
}

function samePartial(actual, expected) {
  return JSON.stringify(actual || null) === JSON.stringify(expected || null);
}

const client = new MongoClient(uri, {
  maxPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
});

try {
  await client.connect();
  const collection = client.db(databaseName).collection("portfolio_visits");

  for (const index of indexes) {
    await collection.createIndex(index.key, {
      ...index.options,
      name: index.name,
    });

    const existing = (await collection.listIndexes().toArray())
      .find((entry) => entry.name === index.name);

    if (!existing || !sameKey(existing.key, index.key)) {
      throw new Error(`MongoDB index verification failed: ${index.name}`);
    }
    if (Boolean(existing.unique) !== Boolean(index.options.unique)) {
      throw new Error(`MongoDB unique option mismatch: ${index.name}`);
    }
    if (
      (existing.expireAfterSeconds ?? null) !==
      (index.options.expireAfterSeconds ?? null)
    ) {
      throw new Error(`MongoDB TTL option mismatch: ${index.name}`);
    }
    if (!samePartial(existing.partialFilterExpression, index.options.partialFilterExpression)) {
      throw new Error(`MongoDB partial filter mismatch: ${index.name}`);
    }

    process.stdout.write(`Ensured ${index.name}\n`);
  }
} finally {
  await client.close();
}
