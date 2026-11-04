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

await fs.rm(fixture, { recursive: true, force: true });
await fs.rm(input, { recursive: true, force: true });
await fs.rm(output, { recursive: true, force: true });
await fs.mkdir(input, { recursive: true });
await fs.writeFile(path.join(input, "files.json"), JSON.stringify(files));
await fs.writeFile(path.join(input, "assets.j¶»§q«^