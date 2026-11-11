import "server-only";
import { setServers } from "node:dns";
import mongoose from "mongoose";

import {
    getConfiguredDnsServers,
    isSrvResolutionFailure,
    resolveMongoSrvUri,
} from "./mongo-uri.js";

const globalForMongoose = globalThis;

if (!globalForMongoose.mongoose) {
    globalForMongoose.mongoose = {
        conn: null,
        promise: null,
    };
}

const cached = globalForMongoose.mongoose;

/**
 * Configure Node.js global DNS resolution for MongoDB SRV records.
 *
 * Optional: Set MONGODB_DNS_SERVERS when the default system resolver cannot
 * resolve MongoDB SRV records. This is best-effort only: some runtimes ignore
 * the global setter, so `resolveMongoSrvUri` is the supported fallback.
 */
function configureMongoDns() {
    const servers = getConfiguredDnsServers();

    if (servers.length > 0) {
        setServers(servers);
    }
}

/**
 * Resolve database configuration only when a connection is requested.
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

async function connectWithDnsFallback(uri, options) {
    try {
        return await mongoose.connect(uri, options);
    } catch (error) {
        if (!uri.startsWith("mongodb+srv://") || !isSrvResolutionFailure(error)) {
            throw error;
        }

        const directUri = await resolveMongoSrvUri(uri);

        if (!directUri) throw error;

        console.warn(
            "[db] SRV lookup failed; retrying with hosts resolved through fallback DNS.",
        );

        return mongoose.connect(directUri, options);
    }
}

export async function connectToDatabase() {
    const { uri, dbName } = getDatabaseConfig();

    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    // A previously resolved mongoose.connect() promise stays fulfilled even
    // after MongoDB disconnects. Never reuse that stale promise as a reconnect.
    if (cached.conn && mongoose.connection.readyState !== 1) {
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        configureMongoDns();

        cached.promise = connectWithDnsFallback(uri, {
            dbName,
            bufferCommands: false,
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        });
    }

    try {
        const connectionPromise = cached.promise;
        const connection = await connectionPromise;

        if (mongoose.connection.readyState !== 1) {
            throw new Error("MongoDB connection did not reach the connected state.");
        }

        cached.conn = connection;
        // The active connection is checked above on every call. Keeping the
        // resolved promise would prevent a later disconnected state reconnect.
        if (cached.promise === connectionPromise) cached.promise = null;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        cached.conn = null;

        throw error;
    }
}
