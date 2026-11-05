function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

export function prepareReactProject(inputFiles) {
  const files = inputFiles.map((file) => {
    if (inputFiles.length === 1 && file.language === "jsx" && /\.js$/i.test(file.path)) {
      return { ...file, path: file.path.replace(/\.js$/i, ".jsx") };
    }
    return { ...file };
  });

  const required = ["index.html", "src/main.jsx", "src/App.jsx", "src/index.css"];
  if (required.every((path) => files.some((file) => file.path === path))) {
    return files;
  }

  if (
    files.length !== 1 ||
    !["jsx", "javascript"].includes(files[0].language) ||
    !/\.(?:js|jsx)$/i.test(files[0].path)
  ) {
    fail(
      "MISSING_ENTRY",
      "This project needs index.html, src/main.jsx, src/App.jsx and src/index.css. For a single component, keep one JavaScript/JSX file and mark its language as JSX.",
    );
  }

  const component = files[0];
  const basename = component.path.split("/").pop().replace(/\.js$/i, ".jsx");
  const sourcePath = component.path.startsWith("src/")
    ? component.path
    : "src/" + basename;
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
      appBridge =
        'export { ' + exportedName[1] + ' as default } from "' + sourceImport + '";\n';
    } else {
      const declaredName = sourceContent.match(
        /^\s*(?:async\s+)?function\s+([A-Z][A-Za-z0-9_$]*)|^\s*(?:const|let|var)\s+([A-Z][A-Za-z0-9_$]*)\s*=/m,
      );
      const componentName = declaredName?.[1] || declaredName?.[2];
      if (!componentName) {
        fail(
          "MISSING_DEFAULT_EXPORT",
          "The single JSX file must declare a React component. Use export default function App() or function App().",
        );
      }
      sourceContent += "\nexport default " + componentName + ";\n";
      appBridge = 'export { default } from "' + sourceImport + '";\n';
    }
  }

  const generated = [
    { path: sourcePath, language: "jsx", content: sourceContent },
    {
      path: "index.html",
      language: "html",
      content:
        '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="UTF-8" />\n<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n<title>Labs experiment</title>\n</head>\n<body>\n<div id="root"></div>\n<script type="module" src="./src/main.jsx"></script>\n</body>\n</html>\n',
    },
    {
      path: "src/main.jsx",
      language: "jsx",
      content:
        'import React from "react";\nimport { createRoot } from "react-dom/client";\nimport App from "./App.jsx";\nimport "./index.css";\n\ncreateRoot(document.getElementById("root")).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>,\n);\n',
    },
    { path: "src/App.jsx", language: "jsx", content: appBridge },
    { path: "src/index.css", language: "css", content: '@import "tailwindcss";\n' },
  ];

  const generatedPaths = new Set();
  for (const file of files.filter((item) => item.path !== component.path)) {
    generatedPaths.add(file.path.toLowerCase());
  }
  for (const file of generated) {
    const key = file.path.toLowerCase();
    if (generatedPaths.has(key)) {
      fail(
        "DUPLICATE_PATH",
        "The generated React entry conflicts with an existing file: " + file.path,
      );
    }
    generatedPaths.add(key);
  }

  const normalized = files.filter((file) => file.path !== component.path).concat(generated);
  if (normalized.length > 40) {
    fail("INVALID_FILE_COUNT", "The React starter exceeds the source file limit.");
  }
  return normalized;
}
