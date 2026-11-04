import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

const SHARED_FILES = [
  {
    path: "src/app/hooks/useReducedMotion.js",
    language: "javascript",
    load: () =>
      readFile(
        path.join(process.cwd(), "src/app/hooks/useReducedMotion.js"),
        "utf8",
      ),
  },
  {
    path: "src/app/providers/MotionProvider.js",
    language: "javascript",
    load: () =>
      readFile(
        path.join(process.cwd(), "src/app/providers/MotionProvider.js"),
        "utf8",
      ),
  },
];

const RUNTIME_SOURCE_MANIFEST = Object.freeze({
  "magnetic-interaction": {
    title: "Magnetic Interaction",
    runtimeKey: "magnetic-interaction",
    entry: "src/app/components/labs/runtime/experiments/magnetic-interaction/index.js",
    loadEntry: () =>
      readFile(
        path.join(
          process.cwd(),
          "src/app/components/labs/runtime/experiments/magnetic-interaction/index.js",
        ),
        "utf8",
      ),
    dependencies: ["react", "motion", "useReducedMotion", "MotionProvider"],
  },
  "scroll-driven-text-reveal": {
    title: "Scroll-driven Text Reveal",
    runtimeKey: "scroll-driven-text-reveal",
    entry: "src/app/components/labs/runtime/experiments/scroll-driven-text-reveal/index.js",
    loadEntry: () =>
      readFile(
        path.join(
          process.cwd(),
          "src/app/components/labs/runtime/experiments/scroll-driven-text-reveal/index.js",
        ),
        "utf8",
      ),
 ¶»§q«^