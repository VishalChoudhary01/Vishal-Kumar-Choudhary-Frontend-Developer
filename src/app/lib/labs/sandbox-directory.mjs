const INPUT_DIRECTORY = "/vercel/sandbox/input";

/**
 * Create the fixed build-input directory idempotently.
 *
 * Compiler snapshots can already contain this directory. Sandbox.mkDir()
 * rejects that valid state with HTTP 400, so use mkdir -p instead.
 */
export async function ensureSandboxInputDirectory(sandbox) {
  if (!sandbox || typeof sandbox.runCommand !== "function") {
    const error = new Error("The isolated build workspace is unavailable.");
    error.code = "SANDBOX_INPUT_INIT_FAILED";
    throw error;
  }

  const command = await sandbox.runCommand({
    cmd: "mkdir",
    args: ["-p", INPUT_DIRECTORY],
    cwd: "/vercel",
    timeoutMs: 5000,
  });

  if (!command || command.exitCode !== 0) {
    const [stdout, stderr] = await Promise.all([
      typeof command?.stdout === "function" ? command.stdout() : "",
      typeof command?.stderr === "function" ? command.stderr() : "",
    ]);
    const detail = String(stderr || stdout || "mkdir -p failed").trim().slice(0, 300);
    const error = new Error("The isolated build workspace could not be initialized. " + detail);
    error.code = "SANDBOX_INPUT_INIT_FAILED";
    throw error;
  }
}
