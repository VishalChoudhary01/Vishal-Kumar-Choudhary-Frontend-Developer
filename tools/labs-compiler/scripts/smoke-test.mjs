import fs from "node:fs/promises";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { prepareReactProject } from "../../../src/app/lib/labs/prepare-react-project.mjs";
import { ensureSandboxInputDirectory } from "../../../src/app/lib/labs/sandbox-directory.mjs";

const root = path.resolve(process.cwd());
const fixture = path.join(root, ".smoke-fixture");
const input = path.join(root, ".smoke-input");
const output = path.join(root, ".smoke-output");
const negativeInput = path.join(root, ".smoke-negative-input");
const negativeRoot = path.join(root, ".smoke-negative-project");
const negativeOutput = path.join(root, ".smoke-negative-output");
const staticInput = path.join(root, ".smoke-static-input");
const staticProject = path.join(root, ".smoke-static-project");
const staticOutput = path.join(root, ".smoke-static-output");
const cssOnlyInput = path.join(root, ".smoke-css-only-input");
const cssOnlyProject = path.join(root, ".smoke-css-only-project");
const cssOnlyOutput = path.join(root, ".smoke-css-only-output");

const sandboxInputDirectory = "/vercel/sandbox/input";
await fs.rm(sandboxInputDirectory, { recursive: true, force: true });

const directoryCommands = [];
const fakeSandbox = {
  async runCommand(options) {
    directoryCommands.push(options);
    const result = spawnSync(options.cmd, options.args, {
      cwd: options.cwd,
      encoding: "utf8",
    });
    return {
      exitCode: result.status ?? 1,
      stdout: async () => result.stdout || "",
      stderr: async () => result.stderr || "",
    };
  },
  async mkDir() {
    throw new Error("sandbox.mkDir must not be used for an existing input directory");
  },
};

await ensureSandboxInputDirectory(fakeSandbox);
await ensureSandboxInputDirectory(fakeSandbox);

if (directoryCommands.length !== 2) {
  throw new Error("Input directory initialization should be safe to repeat.");
}
for (const command of directoryCommands) {
  if (
    command.cmd !== "mkdir" ||
    !command.args.includes("-p") ||
    !command.args.includes(sandboxInputDirectory)
  ) {
    throw new Error("Sandbox input initialization must use mkdir -p.");
  }
}
await fs.writeFile(path.join(sandboxInputDirectory, "existing-directory-check.txt"), "ready");

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

  const tsSource = [
    {
      path: "src/experiment.ts",
      language: "tsx",
      content: [
        'import { useState } from "react";',
        'import { motion, useReducedMotion } from "motion/react";',
        'import { Sparkles } from "lucide-react";',
        'import { FiActivity } from "react-icons/fi";',
        "type CardProps = { title: string; count: number };",
        "function Card({ title, count }: CardProps) {",
        '  return <p className="mt-2 text-sm text-slate-300">{title}: {count}</p>;',
        "}",
        "export default function Experiment() {",
        "  const [count, setCount] = useState<number>(0);",
        "  const reduceMotion = useReducedMotion();",
        "  return (",
        '    <main className="grid min-h-screen place-items-center bg-slate-950 p-8 text-white">',
        "      <motion.section initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} className=\"border border-white/10 p-8\">",
        '        <Sparkles aria-hidden="true" />',
        '        <FiActivity aria-hidden="true" />',
        '        <h1 className="text-3xl font-bold">TypeScript TSX preview passed</h1>',
        "        <Card title=\"Typed state\" count={count} />",
        '        <button className="mt-4 bg-teal-300 px-4 py-2 text-slate-950" onClick={() => setCount((value) => value + 1)}>Count {count}</button>',
        "      </motion.section>",
        "    </main>",
        "  );",
        "}",
      ].join("\n"),
    },
  ];
  const tsFiles = prepareReactProject(tsSource);
  for (const required of ["src/experiment.tsx", "src/main.tsx", "src/App.tsx", "src/index.css", "src/vite-env.d.ts", "index.html"]) {
    if (!tsFiles.some((file) => file.path === required)) {
      throw new Error("The TSX adapter did not generate " + required + ".");
    }
  }
  const tsInput = path.join(root, ".smoke-ts-input");
  const tsRoot = path.join(root, ".smoke-ts-project");
  const tsOutput = path.join(root, ".smoke-ts-output");
  const invalidInput = path.join(root, ".smoke-ts-invalid-input");
  const invalidRoot = path.join(root, ".smoke-ts-invalid-project");
  const invalidOutput = path.join(root, ".smoke-ts-invalid-output");

  await writeInput(tsInput, tsFiles.map(({ path: filePath, content }) => ({ path: filePath, content })));
  const tsPositive = runBuild(tsInput, tsRoot, tsOutput);
  if (tsPositive.status !== 0) {
    process.stderr.write(tsPositive.stderr || tsPositive.stdout || "The valid TSX project failed.\n");
    process.exit(1);
  }
  const tsManifest = JSON.parse(await fs.readFile(path.join(tsOutput, "labs-build-result.json"), "utf8"));
  const tsCssFile = tsManifest.outputFiles.find((file) => file.path.endsWith(".css"));
  if (!tsCssFile) throw new Error("The TSX build did not emit a Tailwind CSS bundle.");
  const tsCss = await fs.readFile(path.join(tsOutput, tsCssFile.path), "utf8");
  for (const token of [".bg-slate-950", ".text-3xl", ".font-bold"]) {
    if (!tsCss.includes(token)) throw new Error("Tailwind v4 did not emit TSX utility: " + token);
  }
  const tsJsFile = tsManifest.outputFiles.find((file) => file.path.endsWith(".js") && file.path.includes("assets/"));
  if (!tsJsFile) throw new Error("The TSX build did not emit a JavaScript bundle.");
  const tsJs = await fs.readFile(path.join(tsOutput, tsJsFile.path), "utf8");
  if (!tsJs.includes("TypeScript TSX preview passed")) {
    throw new Error("The TSX component is missing from the compiled JavaScript bundle.");
  }

  const invalidTsSource = [
    {
      path: "src/invalid.tsx",
      language: "tsx",
      content: 'export default function Invalid() { const count: number = "not a number"; return <div>{count}</div>; }',
    },
  ];
  const invalidTsFiles = prepareReactProject(invalidTsSource);
  await writeInput(invalidInput, invalidTsFiles.map(({ path: filePath, content }) => ({ path: filePath, content })));
  const tsNegative = runBuild(invalidInput, invalidRoot, invalidOutput);
  if (tsNegative.status === 0 || !String(tsNegative.stderr).includes("TYPECHECK_FAILED")) {
    process.stderr.write(tsNegative.stderr || "The compiler did not reject an invalid TSX type.\n");
    process.exit(1);
  }

  await Promise.all([
    tsInput,
    tsRoot,
    tsOutput,
    invalidInput,
    invalidRoot,
    invalidOutput,
  ].map((directory) => fs.rm(directory, { recursive: true, force: true })));

  const staticHtmlFiles = prepareReactProject([
    {
      path: "index.html",
      language: "html",
      content: [
        "<!doctype html>",
        '<html lang="en"><head><meta charset="UTF-8"><title>Static Labs preview</title></head>',
        '<body><main class="static-card"><h1 id="message">Static HTML preview</h1></main></body></html>',
      ].join("\n"),
    },
    {
      path: "styles.css",
      language: "css",
      content: ".static-card { color: #123456; padding: 24px; }",
    },
    {
      path: "main.js",
      language: "javascript",
      content: 'document.querySelector("#message").textContent = "Static HTML/CSS/JS preview passed";',
    },
  ]);
  const staticHtmlEntry = staticHtmlFiles.find((file) => file.path === "index.html")?.content || "";
  if (!staticHtmlEntry.includes("./styles.css") || !staticHtmlEntry.includes("./main.js")) {
    throw new Error("The static HTML adapter did not preserve/inject its CSS and JavaScript entry files.");
  }
  await writeInput(
    staticInput,
    staticHtmlFiles.map(({ path: filePath, content }) => ({ path: filePath, content })),
  );
  const staticBuild = runBuild(staticInput, staticProject, staticOutput);
  if (staticBuild.status !== 0) {
    process.stderr.write(staticBuild.stderr || staticBuild.stdout || "The static HTML/CSS/JS build failed.\n");
    process.exit(1);
  }
  const staticManifest = JSON.parse(
    await fs.readFile(path.join(staticOutput, "labs-build-result.json"), "utf8"),
  );
  const staticCssFile = staticManifest.outputFiles.find((file) => file.path.endsWith(".css"));
  const staticJsFile = staticManifest.outputFiles.find((file) => file.path.endsWith(".js"));
  if (!staticManifest.outputFiles.some((file) => file.path === "index.html") || !staticCssFile || !staticJsFile) {
    throw new Error("The static HTML/CSS/JS build did not emit its HTML, CSS and JavaScript files.");
  }
  const staticHtmlOutput = await fs.readFile(path.join(staticOutput, "index.html"), "utf8");
  if (!staticHtmlOutput.includes("Static Labs preview")) {
    throw new Error("The custom static HTML entry was not preserved.");
  }
  const staticCssOutput = await fs.readFile(path.join(staticOutput, staticCssFile.path), "utf8");
  if (!staticCssOutput.includes("#123456")) {
    throw new Error("The standalone CSS file was not compiled into the static HTML preview.");
  }
  const staticJsOutput = await fs.readFile(path.join(staticOutput, staticJsFile.path), "utf8");
  if (!staticJsOutput.includes("Static HTML/CSS/JS preview passed")) {
    throw new Error("The static JavaScript file was not bundled into the static HTML preview.");
  }

  const fluidGradientFiles = prepareReactProject([
    {
      path: "src/fluid_gradient_background-1-.html",
      language: "html",
      content: [
        "<!DOCTYPE html>",
        '<html lang="en">',
        "<head>",
        '  <meta charset="UTF-8">',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
        "  <title>Fluid Gradient Background</title>",
        "  <style>",
        "    * { margin: 0; padding: 0; box-sizing: border-box; }",
        "    html, body { width: 100%; height: 100%; overflow: hidden; background: #0b0d19; }",
        "    #gradient-canvas { position: absolute; inset: 0; width: 100%; height: 100%; filter: blur(60px); }",
        "    .content-overlay { position: relative; z-index: 10; display: grid; min-height: 100vh; place-items: center; pointer-events: none; }",
        "    .glass-card { padding: 40px 48px; border: 1px solid rgba(255,255,255,.15); background: rgba(255,255,255,.07); color: white; pointer-events: auto; }",
        "  </style>",
        "</head>",
        "<body>",
        '  <canvas id="gradient-canvas"></canvas>',
        '  <div class="content-overlay"><div class="glass-card"><h1>Fluid Canvas</h1><p>Canvas animation preview</p></div></div>',
        "  <script>",
        "    const canvas = document.getElementById('gradient-canvas');",
        "    const ctx = canvas.getContext('2d');",
        "    let width = 0, height = 0;",
        "    const colors = [{r:79,g:70,b:229},{r:236,g:72,b:153},{r:6,g:182,b:212},{r:147,g:51,b:234}];",
        "    const orbs = [];",
        "    function resize() { width = canvas.width = innerWidth; height = canvas.height = innerHeight; }",
        "    function animate() { ctx.clearRect(0,0,width,height); ctx.globalCompositeOperation = 'screen'; requestAnimationFrame(animate); }",
        "    addEventListener('resize', resize); resize(); animate();",
        "  </script>",
        "</body>",
        "</html>",
      ].join("\n"),
    },
  ]);
  const fluidEntry = fluidGradientFiles.find((file) => file.path === "index.html");
  if (!fluidEntry || !fluidEntry.content.includes("<canvas id=\"gradient-canvas\">") ||
      !fluidEntry.content.includes("<style>") || !fluidEntry.content.includes("requestAnimationFrame(animate)")) {
    throw new Error("The nested Fluid Gradient HTML entry lost its inline CSS, Canvas or JavaScript.");
  }
  const fluidInput = path.join(root, ".smoke-fluid-input");
  const fluidProject = path.join(root, ".smoke-fluid-project");
  const fluidOutput = path.join(root, ".smoke-fluid-output");
  await writeInput(fluidInput, fluidGradientFiles.map(({ path: filePath, content }) => ({ path: filePath, content })));
  const fluidBuild = runBuild(fluidInput, fluidProject, fluidOutput);
  if (fluidBuild.status !== 0) {
    process.stderr.write(fluidBuild.stderr || fluidBuild.stdout || "The nested Fluid Gradient HTML build failed.\n");
    process.exit(1);
  }
  const fluidHtml = await fs.readFile(path.join(fluidOutput, "index.html"), "utf8");
  if (!fluidHtml.includes("Fluid Gradient Background") ||
      !fluidHtml.includes("<canvas") ||
      !fluidHtml.includes("requestAnimationFrame(animate)")) {
    throw new Error("The built Fluid Gradient preview did not preserve its inline HTML/CSS/Canvas script.");
  }
  await fs.rm(fluidInput, { recursive: true, force: true });
  await fs.rm(fluidProject, { recursive: true, force: true });
  await fs.rm(fluidOutput, { recursive: true, force: true });

  const cssOnlyFiles = prepareReactProject([
    {
      path: "styles.css",
      language: "css",
      content: "body { background: #0b0b0e; color: #f5f5f5; }",
    },
  ]);
  const cssOnlyHtml = cssOnlyFiles.find((file) => file.path === "index.html")?.content || "";
  if (!cssOnlyHtml.includes("./styles.css") || !cssOnlyHtml.includes("labs-root")) {
    throw new Error("The CSS-only preview did not generate a linked HTML entry.");
  }
  await writeInput(cssOnlyInput, cssOnlyFiles.map(({ path: filePath, content }) => ({ path: filePath, content })));
  const cssOnlyBuild = runBuild(cssOnlyInput, cssOnlyProject, cssOnlyOutput);
  if (cssOnlyBuild.status !== 0) {
    process.stderr.write(cssOnlyBuild.stderr || cssOnlyBuild.stdout || "The CSS-only build failed.\n");
    process.exit(1);
  }
  const cssOnlyManifest = JSON.parse(
    await fs.readFile(path.join(cssOnlyOutput, "labs-build-result.json"), "utf8"),
  );
  if (!cssOnlyManifest.outputFiles.some((file) => file.path.endsWith(".css"))) {
    throw new Error("The CSS-only preview did not emit its stylesheet.");
  }

  // Keep the static build output until its HTTP preview test completes.

  const staticPreviewServer = spawn(process.execPath, [path.join(root, "scripts/serve-preview.mjs")], {
    cwd: root,
    env: {
      ...process.env,
      LABS_BUILD_OUTPUT: staticOutput,
      LABS_PREVIEW_PREFIX: "/preview/static-smoke-1234",
      LABS_PARENT_ORIGIN: "https://example.test",
      PORT: "41938",
    },
    stdio: "ignore",
  });
  try {
    const staticBase = "http://127.0.0.1:41938/preview/static-smoke-1234/";
    let staticReady = false;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        const health = await fetch(staticBase + "__health", { signal: AbortSignal.timeout(500) });
        if (health.ok && (await health.json()).status === "ok") {
          staticReady = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!staticReady) throw new Error("The static HTML preview server did not become healthy.");

    const staticPage = await fetch(staticBase);
    const staticServedHtml = await staticPage.text();
    if (!staticPage.ok || !staticServedHtml.includes("Static Labs preview")) {
      throw new Error(
        "The static preview server did not return the authored HTML. HTTP " +
        staticPage.status + "; body: " + staticServedHtml.slice(0, 500),
      );
    }
    const cssPath = staticServedHtml.match(/href="([^"]+\.css)"/)?.[1];
    const jsPath = staticServedHtml.match(/src="([^"]+\.js)"/)?.[1];
    if (!cssPath || !jsPath) {
      throw new Error("The static preview HTML is missing its compiled CSS or JavaScript asset reference.");
    }
    const [cssResponse, jsResponse] = await Promise.all([
      fetch(new URL(cssPath, staticBase)),
      fetch(new URL(jsPath, staticBase)),
    ]);
    if (
      !cssResponse.ok ||
      !(cssResponse.headers.get("content-type") || "").includes("text/css") ||
      !jsResponse.ok ||
      !(jsResponse.headers.get("content-type") || "").includes("javascript")
    ) {
      throw new Error("The static preview server did not serve its CSS and JavaScript assets.");
    }
  } finally {
    staticPreviewServer.kill("SIGTERM");
    await new Promise((resolve) => {
      if (staticPreviewServer.exitCode !== null) resolve();
      else staticPreviewServer.once("exit", resolve);
    });
  }

  const previewServer = spawn(process.execPath, [path.join(root, "scripts/serve-preview.mjs")], {
    cwd: root,
    env: {
      ...process.env,
      LABS_BUILD_OUTPUT: output,
      LABS_PREVIEW_PREFIX: "/preview/smoke-run-1234",
      LABS_PARENT_ORIGIN: "https://example.test",
      PORT: "41937",
    },
    stdio: "ignore",
  });
  try {
    const previewBase = "http://127.0.0.1:41937/preview/smoke-run-1234/";
    let serverReady = false;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        const health = await fetch(previewBase + "__health", { signal: AbortSignal.timeout(500) });
        if (health.ok && (await health.json()).status === "ok") {
          serverReady = true;
          break;
        }
      } catch {}
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (!serverReady) throw new Error("The isolated preview server did not become healthy.");

    const pageResponse = await fetch(previewBase);
    const pageHtml = await pageResponse.text();
    if (!pageResponse.ok || !pageHtml.includes("https://example.test") || !pageHtml.includes("labs-preview-ready")) {
      throw new Error("The preview server did not serve the bridged React entry document.");
    }

    const scriptMatch = pageHtml.match(/src="([^"]+\.js)"/);
    if (!scriptMatch) throw new Error("The served preview HTML is missing its JavaScript bundle.");
    const scriptResponse = await fetch(new URL(scriptMatch[1], previewBase));
    if (!scriptResponse.ok || !(scriptResponse.headers.get("content-type") || "").includes("javascript")) {
      throw new Error("The preview server did not serve the compiled JavaScript bundle.");
    }

    const traversal = await fetch(previewBase + "%2e%2e/labs-build-result.json");
    if (traversal.status !== 404) throw new Error("The preview server did not block a traversal request.");
  } finally {
    previewServer.kill("SIGTERM");
    await new Promise((resolve) => {
      if (previewServer.exitCode !== null) resolve();
      else previewServer.once("exit", resolve);
    });
  }

  const html = await fs.readFile(path.join(output, "index.html"), "utf8");
  if (!html.includes("Content-Security-Policy")) {
    throw new Error("The compiled HTML is missing its runtime Content Security Policy.");
  }

  process.stdout.write(
    "PASS: idempotent sandbox input setup, nested Fluid Gradient HTML with inline CSS/Canvas JavaScript, static HTML/CSS/JS builds and asset delivery, CSS-only builds, JSX + TSX type checking, React 19, Motion, Lucide, React Icons, Tailwind v4, CSP, isolated preview HTTP server/bridge, traversal blocking and invalid-type rejection.\n",
  );
} finally {
  await Promise.all([
    fixture,
    input,
    output,
    negativeInput,
    negativeRoot,
    negativeOutput,
    staticInput,
    staticProject,
    staticOutput,
    cssOnlyInput,
    cssOnlyProject,
    cssOnlyOutput,
  ].map((directory) => fs.rm(directory, { recursive: true, force: true })));
}
