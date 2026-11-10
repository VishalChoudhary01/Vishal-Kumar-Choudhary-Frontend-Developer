
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectToDatabase } from "@/app/lib/db/mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    // Temporary diagnostic endpoint: development only.
    if (process.env.NODE_ENV !== "development") {
        return NextResponse.json(
            { error: "not_found" },
            { status: 404 }
        );
    }

    try {
        const connection = await connectToDatabase();

        return NextResponse.json({
            ok: true,
            service: "mongodb",
            status: "connected",
            database: connection.connection.name,
            readyState: mongoose.connection.readyState,
        });
    } catch (error) {
        console.error(
            "[database-health-check]",
            error?.message || error
        );

        return NextResponse.json(
            {
                ok: false,
                service: "mongodb",
                status: "disconnected",
                error: "Unable to connect to the database.",
            },
            { status: 503 }
        );
    }
}
