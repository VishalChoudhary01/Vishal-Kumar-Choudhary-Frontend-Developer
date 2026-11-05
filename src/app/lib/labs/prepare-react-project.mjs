function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

const PROJECT_ENTRIES = {
  javascript: {
    html: "index.html",
    main: "src/main.jsx",
    app: "src/App.jsx",
    style: "src/index.css",
    language: "jsx",
    jsx: true,
  },
  typescript: {
    html: "index.html",
    main: "src/main.tsx",
    app: "src/App.tsx",
    style: "src/index.css",
    language: "tsx",
    jsx: false,
  },
};

function hasReactEntries(files, entries) {
  return [entries.html, entries.main, entries.app, entries.style].every((entry) =>
    files.some((file) => file.path === entry),
  );
}

function createEntryFiles(component, mode) {
  const entries = PROJECT_ENTRIES[mode];
  const extension = entries.jsx ? ".jsx" : ".tsx";
  const basename = component.path.split("/").pop().replace(/\.(?:js|jsx|ts|tsx)$/i, extension);
  const sourcePath = component.path.startsWith("src/") ? component.path.replace(/\.(?:js|jsx|ts|tsx)$/i, extension) : "src/" + basename;
  const sourceImport = "./" + sourcePath.split("/").pop();
  let sourceContent = component.content;
  let appBridge = "";

  if (/\bexport\s+default\b/.test(sourceContent)) {
    appBridge = 'export { default } from "' + sourceImport + '";\n';
  } else {
    const exportedName = sourceContent.match(
      /\bexport\s+(?:async\s+)?(?:function|class|const|let|var)\s+([A-Z][A-Za-z0-9_$]*)/,
    );
    if (exportedName) {
      appBridge = 'export { ' + exportedName[1] + ' as default } from "' + sourceImport + '";\n';
    } else {
      const declaredName = sourceContent.match(
        /^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Z][A-Za-z0-9_$]*)|^\s*(?:export\s+)?(?:const|let|var)\s+([A-Z][A-Za-z0-9_$]*)\s*=/m,
      );
      const componentName = declaredName?.[1] || declaredName?.[2];
      if (!componentName) {
        fail(
          "MISSING_DEFAULT_EXPORT",
          "The single React file must export a component. Use export default function App() or declare an uppercase component.",
        );
      }
      sourceContent += "\nexport default " + componentName + ";\n";
      appBridge = 'export { default } from "' + sourceImport + '";\n';
    }
  }

  const mainContent = entries.jsx
    ? 'import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\nimport "./index.css";\n\ncreateRoot(document.getElementById("root")).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);\n'
    : 'import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.tsx";\nimport "./index.css";\n\ncreateRoot(document.getElementById("root")!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);\n';

  return [
    { path: sourcePath, language: entries.language, content: sourceContent },
    {
      path: entries.html,
      language: "html",
      content:
        '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Labs experiment</title>\n</head>\n<body>\n<div id="root"></div>\n<script type="module" src="./' + entries.main + '"></script>\n</body>\n</html>\n',
    },
    { path: entries.main, language: entries.language, content: mainContent },
    { path: entries.app, language: entries.language, content: appBridge },
    { path: entries.style, language: "css", content: '@import "tailwindcss";\n' },
    ...(entries.jsx
      ? []
      : [
          {
            path: "tsconfig.json",
            language: "json",
            generated: true,
            content: JSON.stringify({
              compilerOptions: {
                target: "ES2022",
                lib: ["ES2022", "DOM", "DOM.Iterable"],
                module: "ESNext",
                moduleResolution: "Bundler",
                jsx: "react-jsx",
                strict: true,
                noEmit: true,
                isolatedModules: true,
                verbatimModuleSyntax: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true,
                types: ["vite/client"],
                allowJs: true,
                checkJs: false,
              },
              include: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"],
              exclude: ["node_modules", "dist"],
            }, null, 2),
          },
          {
            path: "src/vite-env.d.ts",
            language: "typescript",
            content: '/// <reference types="vite/client" />\n',
          },
        ]),
  ];
}

export function prepareReactProject(inputFiles) {
  if (!Array.isArray(inputFiles) || inputFiles.length < 1) {
    fail("INVALID_FILE_COUNT", "Add at least one source file.");
  }

  const files = inputFiles.map((file) => {
    const language = String(file.language || "").toLowerCase();
    if (inputFiles.length === 1 && language === "jsx" && /\.js$/i.test(file.path)) {
      return { ...file, path: file.path.replace(/\.js$/i, ".jsx") };
    }
    if (inputFiles.length === 1 && language === "tsx" && /\.ts$/i.test(file.path)) {
      return { ...file, path: file.path.replace(/\.ts$/i, ".tsx") };
    }
    return { ...file };
  });

  const javascript = PROJECT_ENTRIES.javascript;
  const typescript = PROJECT_ENTRIES.typescript;
  if (hasReactEntries(files, javascript) || hasReactEntries(files, typescript)) {
    return files;
  }

  if (files.length !== 1) {
    fail(
      "MISSING_ENTRY",
      "This project needs index.html, a React entry, an App component and src/index.css. Add the React starter files or use a single component file.",
    );
  }

  const component = files[0];
  const extension = component.path.split(".").pop()?.toLowerCase();
  const language = String(component.language || "").toLowerCase();
  let mode;

  if (["jsx", "javascript"].includes(language) && ["js", "jsx"].includes(extension)) {
    mode = "javascript";
  } else if (["tsx", "typescript"].includes(language) && ["ts", "tsx"].includes(extension)) {
    mode = "typescript";
  } else {
    fail(
      "MISSING_ENTRY",
      "A single-file React preview must be a JavaScript/JSX or TypeScript/TSX component. Select the matching language.",
    );
  }

  const generated = createEntryFiles(component, mode);
  const existingPaths = new Set(files.filter((file) => file.path !== component.path).map((file) => file.path.toLowerCase()));
  for (const file of generated) {
    const key = file.path.toLowerCase();
    if (existingPaths.has(key) && key !== component.path.toLowerCase()) {
      fail("DUPLICATE_PATH", "The generated React entry conflicts with an existing file: " + file.path);
    }
    existingPaths.add(key);
  }

  const normalized = files.filter((file) => file.path !== component.path).concat(generated);
  if (normalized.length > 40) {
    fail("INVALID_FILE_COUNT", "The React starter exceeds the source file limit.");
  }
  return normalized;
}
