import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

/**
 * Development-only source context endpoint used by the error diagnostics UI
 * to render the code surrounding a failing line from the stack trace.
 *
 * Safety model:
 * - Returns 404 in production builds (no source exposure to end users).
 * - Only resolves paths that stay inside the project's <root>/src directory;
 *   path traversal outside `src` is rejected.
 */
export async function GET(request) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const rel = searchParams.get("path") || "";
    if (!/^src\/.+/.test(rel) || rel.includes("..")) {
        return NextResponse.json({ error: "invalid_path" }, { status: 400 });
    }

    const root = process.cwd();
    const abs = path.join(root, rel);
    const srcRoot = path.join(root, "src");

    try {
        const resolved = path.resolve(abs);
        if (!resolved.startsWith(srcRoot + path.sep)) {
            return NextResponse.json({ error: "outside_src" }, { status: 400 });
        }
        const st = await stat(resolved);
        if (!st.isFile()) {
            return NextResponse.json({ error: "not_a_file" }, { status: 400 });
        }
        const text = await readFile(resolved, "utf8");
        return NextResponse.json({ lines: text.split(/\r?\n/) });
    } catch {
        return NextResponse.json({ error: "unreadable" }, { status: 404 });
    }
}
