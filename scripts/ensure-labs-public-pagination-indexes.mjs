import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME;

if (!uri || !databaseName) {
  throw new Error("MONGODB_URI and MONGODB_DB_NAME are required to ensure Labs pagination indexes.");
}

const indexes = [
  {
    key: { kind: 1, status: 1, publishedAt: -1, _id: -1 },
    name: "lab_experiments_publication_cursor",
  },
  {
    key: { kind: 1, status: 1, category: 1, publishedAt: -1, _id: -1 },
    name: "lab_experiments_category_publication_cursor",
  },
];

const client = new MongoClient(uri, {
  maxPoolSize: 2,
  serverSelectionTimeoutMS: 10000,
});

try {
  await client.connect();
  const collection = client.db(databaseName).collection("lab_experiments");

  for (const index of indexes) {
    const name = await collection.createIndex(index.key, { name: index.name });
    const existing = await collection.listIndexes().toArray();
    const created = existing.find((entry) => entry.name === name);

    if (!created) {
      throw new Error(`MongoDB did not return the created index: ${index.name}`);
    }

    const fields = Object.keys(index.key);
    const matches = fields.every(
      (field) => created.key?.[field] === index.key[field],
    );
    if (!matches || Object.keys(created.key || {}).length !== fields.length) {
      throw new Error(`Existing index definition does not match: ${index.name}`);
    }

    process.stdout.write(`Ensured ${name}\n`);
  }
} finally {
  await client.close();
}
