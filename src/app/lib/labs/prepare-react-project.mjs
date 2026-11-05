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
            path: "src/vite-env.d.ts",
            language: "typescript",
            content: '/// <reference types="vite/client" />\n',
          },
        ]),
  ];
}

function isReactProject(files) {
  return (
    hasReactEntries(files, PROJECT_ENTRIES.javascript) ||
    hasReactEntries(files, PROJECT_ENTRIES.typescript)
  );
}

function resolveHtmlAssetPath(sourceDirectory, value) {
  const trimmed = String(value || "").trim();
  if (
    !trimmed ||
    /^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(trimmed)
  ) {
    return trimmed;
  }

  const suffixIndex = trimmed.search(/[?#]/);
  const pathname = suffixIndex < 0 ? trimmed : trimmed.slice(0, suffixIndex);
  const suffix = suffixIndex < 0 ? "" : trimmed.slice(suffixIndex);
  const segments = sourceDirectory ? sourceDirectory.split("/") : [];
  for (const segment of pathname.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") {
      if (segments.length) segments.pop();
      continue;
    }
    segments.push(segment);
  }
  return "./" + segments.join("/") + suffix;
}

function rewriteNestedHtmlAssetPaths(html, sourceDirectory) {
  if (!sourceDirectory) return html;

  let result = html.replace(
    /\b(src|href|poster)\s*=\s*(["\'])(.*?)\2/gi,
    (match, attribute, quote, value) => {
      const rewritten = resolveHtmlAssetPath(sourceDirectory, value);
      return attribute + "=" + quote + rewritten + quote;
    },
  );

  result = result.replace(
    /url\(\s*(["\']?)([^)"\']+)\1\s*\)/gi,
    (match, quote, value) => {
      const rewritten = resolveHtmlAssetPath(sourceDirectory, value);
      return "url(" + (quote || "") + rewritten + (quote || "") + ")";
    },
  );

  return result;
}

function createStaticHtml(files) {
  const htmlFiles = files.filter((file) => /\.html?$/i.test(file.path));
  let index = files.find((file) => file.path === "index.html");
  let sourceDirectory = "";

  if (!index && htmlFiles.length === 1) {
    const existing = htmlFiles[0];
    sourceDirectory = existing.path.split("/").slice(0, -1).join("/");
    index = {
      ...existing,
      path: "index.html",
      language: "html",
      content: rewriteNestedHtmlAssetPaths(existing.content, sourceDirectory),
    };
    files = files.map((file) => file === existing ? index : file);
  }

  const styles = files.filter((file) => /\.css$/i.test(file.path));
  const scripts = files.filter((file) => /\.(?:js|mjs)$/i.test(file.path));

  if (!index) {
    if (!styles.length && !scripts.length) {
      fail(
        "MISSING_HTML_ENTRY",
        "Add an HTML file, a stylesheet, or a JavaScript file to create a runnable page.",
      );
    }

    const styleLinks = styles
      .map((file) => '<link rel="stylesheet" href="./' + file.path + '" />')
      .join("\n  ");
    const scriptEntry = scripts.find((file) =>
      /(?:^|\/)(?:main|index|app)\.(?:mjs|js)$/i.test(file.path),
    ) || scripts[0];
    const scriptTag = scriptEntry
      ? '<script type="module" src="./' + scriptEntry.path + '"></script>'
      : "";

    index = {
      path: "index.html",
      language: "html",
      generated: true,
      content: [
        "<!doctype html>",
        '<html lang="en">',
        "<head>",
        '  <meta charset="UTF-8" />',
        '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        "  <title>Labs HTML/CSS experiment</title>",
        "  " + styleLinks,
        "</head>",
        "<body>",
        "  <main id=\\"labs-root\\"></main>",
        "  " + scriptTag,
        "</body>",
        "</html>",
        "",
      ].join("\n"),
    };
    files = files.concat(index);
    return files;
  }

  let html = index.content;
  const lowerHtml = html.toLowerCase();
  const missingStyleLinks = styles.filter((file) => {
    const normalized = file.path.replace(/^\.\//, "");
    return !lowerHtml.includes(normalized.toLowerCase()) &&
      !lowerHtml.includes(file.path.split("/").pop().toLowerCase());
  });

  if (missingStyleLinks.length) {
    const links = missingStyleLinks
      .map((file) => '<link rel="stylesheet" href="./' + file.path + '" />')
      .join("\n");
    if (/<\/head\s*>/i.test(html)) {
      html = html.replace(/<\/head\s*>/i, links + "\n</head>");
    } else {
      html = "<head>\n" + links + "\n</head>\n" + html;
    }
  }

  const hasScriptReference = /<script\b[^>]*\bsrc\s*=/i.test(html);
  if (!hasScriptReference && scripts.length) {
    const scriptEntry = scripts.find((file) =>
      /(?:^|\/)(?:main|index|app)\.(?:mjs|js)$/i.test(file.path),
    ) || scripts[0];
    const scriptTag = '<script type="module" src="./' + scriptEntry.path + '"></script>';
    if (/<\/body\s*>/i.test(html)) {
      html = html.replace(/<\/body\s*>/i, scriptTag + "\n</body>");
    } else {
      html += "\n" + scriptTag + "\n";
    }
  }

  return files.map((file) =>
    file.path === index.path
      ? { ...file, path: "index.html", language: "html", content: html }
      : file,
  );
}
export function prepareReactProject(inputFiles) {
  if (!Array.isArray(inputFiles) || inputFiles.length < 1 || inputFiles.length > 40) {
    fail("INVALID_FILE_COUNT", "Add between 1 and 40 source files.");
  }

  let files = inputFiles.map((file) => {
    const language = String(file.language || "").toLowerCase();
    if (inputFiles.length === 1 && language === "jsx" && /\.js$/i.test(file.path)) {
      return { ...file, path: file.path.replace(/\.js$/i, ".jsx") };
    }
    if (inputFiles.length === 1 && language === "tsx" && /\.ts$/i.test(file.path)) {
      return { ...file, path: file.path.replace(/\.ts$/i, ".tsx") };
    }
    return { ...file };
  });

  if (isReactProject(files)) {
    return files;
  }

  const reactSource = files.some((file) =>
    /\.(?:jsx|tsx)$/i.test(file.path) ||
    ["jsx", "tsx"].includes(String(file.language || "").toLowerCase()),
  );
  if (reactSource) {
    if (files.length !== 1) {
      fail(
        "MISSING_ENTRY",
        "A multi-file React project needs index.html, a React main entry, an App component and a Tailwind CSS entry.",
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

    files = files.filter((file) => file.path !== component.path).concat(generated);
  } else {
    files = createStaticHtml(files);
  }

  if (files.length > 40) {
    fail("INVALID_FILE_COUNT", "The prepared experiment exceeds the 40-file source limit.");
  }
  const unique = new Set();
  for (const file of files) {
    const key = file.path.toLowerCase();
    if (unique.has(key)) fail("DUPLICATE_PATH", "Duplicate source path after entry generation: " + file.path);
    unique.add(key);
  }
  return files;
}
