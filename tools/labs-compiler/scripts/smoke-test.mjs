import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(process.cwd());
const fixture = path.join(root, ".smoke-fixture");
const input = path.join(root, ".smoke-input");
const output = path.join(root, ".smoke-output");

const files = [
  {
    path: "index.html",
    content: "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"></head><body><div id=\"root\"></div><script type=\"module\" src=\"./src/main.jsx\"></script></body></html>",
  },
  {
    path: "src/main.jsx",
    content: "import React from 'react'; import { createRoot } from 'react-dom/client'; import App from './App.jsx'; import './index.css'; createRoot(document.getElementById('root')).render(<App />);",
  },
  {
    path: "src/App.jsx",
    content: "import { motion } from 'motion/react'; export default function App(){ return <motion.main initial={{opacity:0}} animate={{opacity:1}} className=\"min-h-screen bg-slate-950 p-8 text-white\"><h1 className=\"text-3xl font-bold\">Labs smoke test</h1></motion.main>; }",
  },
  {
    path: "src/index.css",
    content: "@import \"tailwindcss\";",
  },
];

async function runBuild(buildInput, buildRoot, buildOutput) {
  return spawnSync(process.execPath, [path.join(root, "scripts/build.mjs")], {
    cwd: root,
    env: {
      ...process.env,
      LABS_BUILD_INPUT: buildInput,
      LABS_PROJECT_ROOT: buildRoot,
      LABS_BUILD_OUTPUT: buildOutput,
    },
    encoding: "utf8",
 ¶»§q«^