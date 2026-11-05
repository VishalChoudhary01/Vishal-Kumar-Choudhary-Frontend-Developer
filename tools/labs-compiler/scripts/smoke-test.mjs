import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { prepareReactProject } from "../../../src/app/lib/labs/prepare-react-project.mjs";

const root = path.resolve(process.cwd());
const fixture = path.join(root, ".smoke-fixture");
const input = path.join(root, ".smoke-input");
const output = path.join(root, ".smoke-output");
const negativeInput = path.join(root, ".smoke-negative-input");
const negativeRoot = path.join(root, ".smoke-negative-project");
const negativeOutput = path.join(root, ".smoke-negative-output");

const source = [
  {
    path: "src/new-file.js",
    language: "jsx",
    content: [
      'import { useState } from "react";',
      'import { motion, useReducedMotion } from "motion/react";',
      'import { ArrowUpRight, Sparkles } from "lucide-react";',
      "",
      "export default function Experiment() {",
      "  const [count, setCount] = useState(0);",
      "  const reduceMotion = useReducedMotion();",
      "  return (",
      '    <main className="grid min-h-screen place-items-center bg-slate-950 p-8 text-white">',
      "      <motion.section",
      "        initial={reduceMotion ? false : { opacity: 0, y: 20 }}",
      "        animate={{ opacity: 1, y: 0 }}",
      '        className="w-full max-w-xl border border-white/10 p-8"',
      "      >",
      '        <Sparkles aria-hidden="true" />',
      '        <h1 className="mt-4 text-3xl font-bold">Single-file JSX preview passed</h1>',
      '        <button type="button" className="mt-6 bg-teal-300 px-4 py-2 text-black" onClick={() => setCount((value) => value + 1)}>',
      '          Count {count} <ArrowUpRight aria-hidden="true" />',
      "        </button>",
      "      </motion.section>",
      "    </main>",
      "  );",
      "}",
    ].join("\n"),
  },
];

const files = prepareReactProject(source);
if (!files.some((file) => file.path === "src/new-file.jsx")) {
  throw new Error("The JSX adapter did not normalize src/new-file.js to src/new-file.jsx.");
}
if (!files.some((file) => file.path === "src/main.jsx") ||
    !files.some((file) => file.path === "src/App.jsx") ||
    !files.some((file) => file.path === "src/index.css") ||
    !files.some((file) => file.path === "index.html")) {
  throw new Error("The JSX adapter did not generate the React entry files.");
}

async function writeInput(directory, nextFiles) {
  await fs.rm(directory, { recursive: true, force: true });
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, "files.json"), JSON.stringify(nextFiles));
  await fs.writeFile(path.join(directory, "assets.json"), "{}");
}

function runBuild(buildInput, buildRoot, buildOutput) {
  return spawnSync(process.execPath, [path.join(root, "scripts/build.mjs")], {
    cwd: root,
    env: {
      ...process.env,
      LABS_BUILD_INPUT: buildInput,
      LABS_PROJECT_ROOT: buildRoot,
      LABS_BUILD_OUTPUT: buildOutput,
      LABS_BUILD_BASE: "./",
    },
    encoding: "utf8",
  });
}

try {
  await Promise.all([
    fs.rm(fixture, { recursive: true, force: true }),
    fs.rm(output, { recursive: true, force: true }),
    fs.rm(negativeRoot, { recursive: true, force: true }),
    fs.rm(negativeOutput, { recursive: true, force: true }),
  ]);
  await writeInput(input, files.map(({ path: filePath, content }) => ({ path: filePath, content })));

  const positive = runBuild(input, fixture, output);
  if (positive.status !== 0) {
    process.stderr.write(positive.stderr || "The single-file JSX build failed.\n");
    process.exit(positive.status || 1);
  }

  const result = JSON.parse(await fs.readFile(path.join(output, "labs-build-result.json"), "utf8"));
  if (!result.success || !/^[a-f0-9]{64}$/.test(result.buildHash || "")) {
    throw new Error("The compiler did not produce a valid immutable build hash.");
  }
  for (const key of ["react", "reactDom", "motion", "tailwind"]) {
    if (!result.compiler?.[key]) throw new Error("The build manifest is missing compiler version: " + key);
  }

  const cssFile = result.outputFiles.find((file) => file.path.endsWith(".css"));
  const jsFile = result.outputFiles.find((file) => file.path.endsWith(".js"));
  if (!cssFile || !jsFile) throw new Error("The build did not emit JavaScript and CSS bundles.");

  const css = await fs.readFile(path.join(output, cssFile.path), "utf8");
  for (const token of [".bg-slate-950", ".text-3xl", ".font-bold"]) {
    if (!css.includes(token)) throw new Error("Tailwind v4 did not emit utility: " + token);
  }

  const js = await fs.readFile(path.join(output, jsFile.path), "utf8");
  if (!js.includes("Single-file JSX preview passed")) {
    throw new Error("The compiled React component is missing from the emitted JavaScript bundle.");
  }

  const tampered = files.map((file) => ({ ...file }));
  const component = tampered.find((file) => file.path === "src/new-file.jsx");
  component.content = 'import blocked from "not-approved-package";\n' + component.content;
  await writeInput(negativeInput, tampered);
  const negative = runBuild(negativeInput, negativeRoot, negativeOutput);
  if (negative.status === 0 || !String(negative.stderr).includes("Package is not allowed in Labs")) {
    process.stderr.write(negative.stderr || "Unsupported packages were not rejected.\n");
    process.exit(1);
  }

  const html = await fs.readFile(path.join(output, "index.html"), "utf8");
  if (!html.includes("Content-Security-Policy")) {
    throw new Error("The compiled HTML is missing its runtime Content Security Policy.");
  }

  process.stdout.write(
    "PASS: single-file .js + JSX language adapter, React 19, Motion, lucide-react, Tailwind v4, CSP and package allowlist.\n",
  );
} finally {
  await Promise.all([
    fixture,
    input,
    output,
    negativeInput,
    negativeRoot,
    negativeOutput,
  ].map((directory) => fs.rm(directory, { recursive: true, force: true })));
}
