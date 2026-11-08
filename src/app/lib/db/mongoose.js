import "server-only";
import mongoose from "mongoose";

const globalForMongoose = globalThis;

if (!globalForMongoose.mongoose) {
    globalForMongoose.mongoose = {
        conn: null,
        promise: null,
    };
}

const cached = globalForMongoose.mongoose;

/**
 * Resolve database configuration only when a connection is requested.
 *
 * Do not read/validate MongoDB environment variables at module scope.
 * Next.js may load route modules while building or starting a deployment,
 * including routes that return before connecting to the database. Importing
 * this helper must therefore remain safe when a deployment environment does
 * not need MongoDB (for example, the production-disabled diagnostic route).
 */
function getDatabaseConfig() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if (!uri) {
        throw new Error("Missing MONGODB_URI environment variable.");
    }

    if (!dbName) {
        throw new Error("Missing MONGODB_DB_NAME environment variable.");
    }

    return { uri, dbName };
}

export async function connectToDatabase() {
    const { uri, dbName } = getDatabaseConfig();

    if (
        cached.conn &&
        mongoose.connection.readyState === 1
    ) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(uri, {
                dbName,
                bufferCommands: false,
                serverSelectionTimeoutMS: 10000,
                maxPoolSize: 10,
            })
            .then((instance) => instance);
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        cached.conn = null;

        throw error;
    }
}
