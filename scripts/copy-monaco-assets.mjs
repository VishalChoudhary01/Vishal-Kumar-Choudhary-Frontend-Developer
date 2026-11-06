import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(projectRoot, "node_modules", "monaco-editor", "min", "vs");
const publicRoot = path.join(projectRoot, "public", "monaco");
const destination = path.join(publicRoot, "vs");

try {
  const sourceStats = await stat(source);
  if (!sourceStats.isDirectory()) {
    throw new Error("The Monaco editor asset directory is not a directory.");
  }

  await mkdir(publicRoot, { recursive: true });
  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true, force: true });

  const copied = await stat(path.join(destination, "loader.js"));
  if (!copied.isFile() || copied.size < 1000) {
    throw new Error("The local Monaco AMD loader was not copied correctly.");
  }

  console.log("[labs-monaco] Self-hosted Monaco assets copied to public/monaco/vs.");
} catch (error) {
  console.error("[labs-monaco] Failed to prepare self-hosted Monaco assets:", error.message);
  process.exitCode = 1;
}
