export function updateSourceFileContent(files, filePath, content) {
  if (!Array.isArray(files) || typeof filePath !== "string" || typeof content !== "string") {
    return Array.isArray(files) ? files : [];
  }

  let changed = false;
  const nextFiles = files.map((file) => {
    if (file?.path !== filePath || file.content === content) return file;
    changed = true;
    return { ...file, content };
  });

  return changed ? nextFiles : files;
}
