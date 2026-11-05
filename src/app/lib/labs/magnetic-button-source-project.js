import "server-only";

import { readFile } from "node:fs/promises";
import nodePath from "node:path";

const root = process.cwd();

export async function getMagneticButtonSourceProjectFiles() {
  const base = "src/app/components/labs";
  const [button, physics, runtime] = await Promise.all([
    readFile(nodePath.join(root, base, "ui/MagneticButton.js"), "utf8"),
    readFile(nodePath.join(root, base, "ui/magnetic-physics.mjs"), "utf8"),
    readFile(
      nodePath.join(root, base, "runtime/experiments/magnetic-interaction/index.js"),
      "utf8",
    ),
  ]);

  const app = runtime
    .replace(
      'import MagneticButton from "@/app/components/labs/ui/MagneticButton";',
      'import MagneticButton from "./components/MagneticButton.jsx";',
    )
    .replace(
      "export default function MagneticInteraction({ settings = {} }) {",
      "export default function App({ settings = { strength: 28, radius: 180, showField: true } }) {",
    );

  if (
    app === runtime ||
    app.includes("@/app/") ||
    !app.includes('from "./components/MagneticButton.jsx"')
  ) {
    const error = new Error("The MagneticButton source template is not portable.");
    error.code = "SOURCE_TEMPLATE_INVALID";
    throw error;
  }

  const html = [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    "  <title>MagneticButton Component Lab</title>",
    "</head>",
    "<body>",
    '  <div id="root"></div>',
    '  <script type="module" src="./src/main.jsx"></script>',
    "</body>",
    "</html>",
    "",
  ].join("\n");

  const main = [
    'import React from "react";',
    'import { createRoot } from "react-dom/client";',
    'import App from "./App.jsx";',
    'import "./index.css";',
    "",
    'createRoot(document.getElementById("root")).render(',
    "  <React.StrictMode>",
    "    <App />",
    "  </React.StrictMode>,",
    ");",
    "",
  ].join("\n");

  const declaration = [
    'import type { MouseEventHandler, ReactNode, RefObject } from "react";',
    "",
    "export interface MagneticButtonProps {",
    "  children?: ReactNode;",
    "  fieldRef?: RefObject<HTMLElement | null> | null;",
    "  strength?: number;",
    "  radius?: number;",
    "  onClick?: MouseEventHandler<HTMLButtonElement>;",
    "  onEngagementChange?: (engaged: boolean) => void;",
    "  className?: string;",
    "  disabled?: boolean;",
    '  "aria-label"?: string;',
    "}",
    "",
    "export declare function MagneticButton(props: MagneticButtonProps): ReactNode;",
    "export default MagneticButton;",
    "",
  ].join("\\n");

  const css = [
    '@import "tailwindcss";',
    "",
    ":root {",
    "  color-scheme: dark;",
    "  --background: #0b0f0c;",
    "  --brand: #69bdb9;",
    "  --brand-hover: #7ad0cc;",
    "  --brand-pressed: #55b3af;",
    "  --brand-soft: #173332;",
    "  --brand-contrast: #0b0f0c;",
    "  --border-strong: #383b38;",
    "  --text-primary: #f3f4ee;",
    "  --text-secondary: #b9bdb3;",
    "  --text-muted: #7d8479;",
    "  --success: #63d3a5;",
    "  --radius-sm: 8px;",
    "  --radius-md: 12px;",
    "}",
    "",
    "@theme inline {",
    "  --color-background: var(--background);",
    "  --color-brand: var(--brand);",
    "  --color-brand-hover: var(--brand-hover);",
    "  --color-brand-pressed: var(--brand-pressed);",
    "  --color-brand-soft: var(--brand-soft);",
    "  --color-brand-contrast: var(--brand-contrast);",
    "  --color-border-strong: var(--border-strong);",
    "  --color-text-primary: var(--text-primary);",
    "  --color-text-secondary: var(--text-secondary);",
    "  --color-text-muted: var(--text-muted);",
    "  --color-success: var(--success);",
    "}",
    "",
    "* { box-sizing: border-box; }",
    "html, body, #root { min-height: 100%; }",
    "body { margin: 0; background: var(--background); color: var(--text-primary); font-family: ui-sans-serif, system-ui, sans-serif; }",
    "",
  ].join("\n");

  return [
    { path: "index.html", language: "html", content: html },
    { path: "src/main.jsx", language: "jsx", content: main },
    { path: "src/App.jsx", language: "jsx", content: app },
    { path: "src/components/MagneticButton.jsx", language: "jsx", content: button },
    { path: "src/components/MagneticButton.d.ts", language: "typescript", content: declaration },
    { path: "src/components/magnetic-physics.mjs", language: "javascript", content: physics },
    { path: "src/index.css", language: "css", content: css },
  ];
}
