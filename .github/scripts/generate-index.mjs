#!/usr/bin/env node
/**
 * Scans Projects/ and rebuilds projects.json from each folder's project.json.
 * Validates required fields, enforces Title-Case folder names, and fails the
 * workflow if any project is malformed.
 */
import { readdir, readFile, writeFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PROJECTS_DIR = join(ROOT, "Projects");
const OUTPUT = join(ROOT, "projects.json");

const REQUIRED = ["title", "description", "author", "tags", "entry"];

function isTitleCaseWithSpaces(name) {
  // Each word starts uppercase, allows digits/spaces, disallows - and _.
  if (/[-_]/.test(name)) return false;
  return name.split(" ").every((w) => /^[A-Z0-9][A-Za-z0-9]*$/.test(w));
}

async function findFileCaseInsensitive(dir, targetName) {
  const files = await readdir(dir);
  return files.find(
    (file) => file.toLowerCase() === targetName.toLowerCase()
  );
}

async function main() {
  if (!existsSync(PROJECTS_DIR)) {
    await writeFile(OUTPUT, JSON.stringify({ generatedAt: new Date().toISOString(), projects: [] }, null, 2));
    console.log("No Projects/ directory. Wrote empty index.");
    return;
  }

  const entries = await readdir(PROJECTS_DIR, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  const errors = [];
  const projects = [];

  for (const folder of folders) {
    const folderPath = join(PROJECTS_DIR, folder);
    const metaPath = join(folderPath, "project.json");

    if (!isTitleCaseWithSpaces(folder)) {
      errors.push(`"${folder}" — folder must be Title Case with real spaces (e.g. "To Do Web App").`);
      continue;
    }
    if (!existsSync(metaPath)) {
      errors.push(`"${folder}" — missing project.json.`);
      continue;
    }

    let meta;
    try {
      meta = JSON.parse(await readFile(metaPath, "utf8"));
    } catch (err) {
      errors.push(`"${folder}" — project.json is not valid JSON: ${err.message}`);
      continue;
    }

    for (const field of REQUIRED) {
      if (!meta[field]) errors.push(`"${folder}" — project.json missing "${field}".`);
    }
    if (meta.title && meta.title !== folder) {
      errors.push(`"${folder}" — project.json title "${meta.title}" must match the folder name.`);
    }
    if (meta.author && (!meta.author.name || !meta.author.github)) {
      errors.push(`"${folder}" — author.name and author.github are required.`);
    }
    if (meta.tags && (!Array.isArray(meta.tags) || meta.tags.length < 1 || meta.tags.length > 6)) {
      errors.push(`"${folder}" — tags must be an array of 1 to 6 strings.`);
    }
    if (meta.entry && !existsSync(join(folderPath, meta.entry))) {
      errors.push(`"${folder}" — entry "${meta.entry}" does not exist.`);
    }

    const readmeFile = await findFileCaseInsensitive(folderPath, "README.md");
    if (!readmeFile) {
      errors.push(`"${folder}" — missing README.md.`);
    }

    let thumbnail = null;
    if (meta.thumbnail && existsSync(join(folderPath, meta.thumbnail))) {
      thumbnail = `Projects/${encodeURIComponent(folder)}/${meta.thumbnail}`;
    }

    const stats = await stat(folderPath);

    const normalizedTags = Array.isArray(meta.tags)
      ? [...new Set(
          meta.tags
            .filter((tag) => typeof tag === "string")
            .map((tag) => tag.trim().toLowerCase())
        )].map(
          (tag) => tag.charAt(0).toUpperCase() + tag.slice(1)
        )
      : [];

    projects.push({
      slug: folder,
      title: meta.title || folder,
      description: meta.description || "",
      author: meta.author || null,
      tags: normalizedTags,
      entry: `Projects/${encodeURIComponent(folder)}/${meta.entry || "index.html"}`,
      folder: `Projects/${encodeURIComponent(folder)}`,
      thumbnail,
      addedAt: stats.birthtime?.toISOString?.() || null,
    });
  }

  if (errors.length) {
    console.error("Project index errors:");
    for (const e of errors) console.error("  - " + e);
    process.exit(1);
  }

  projects.sort((a, b) => a.title.localeCompare(b.title));

  await writeFile(
    OUTPUT,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), count: projects.length, projects },
      null,
      2
    ) + "\n"
  );

  console.log(`Indexed ${projects.length} project(s) -> projects.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
