
import "server-only";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

if (!MONGODB_URI) {
    throw new Error(
        "Missing MONGODB_URI environment variable."
    );
}

if (!MONGODB_DB_NAME) {
    throw new Error(
        "Missing MONGODB_DB_NAME environment variable."
    );
}

// Reuse the connection across Next.js development hot reloads.
const globalForMongoose = globalThis;

if (!globalForMongoose.mongoose) {
    globalForMongoose.mongoose = {
        conn: null,
        promise: null,
    };
}

const cached = globalForMongoose.mongoose;

export async function connectToDatabase() {
    if (
        cached.conn &&
        mongoose.connection.readyState === 1
    ) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(MONGODB_URI, {
                dbName: MONGODB_DB_NAME,
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
