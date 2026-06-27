import { access, mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const DEFAULT_EXCLUDED_DIRECTORIES = new Set([
  ".git",
  ".codex-worktrees",
  ".turbo",
  ".vite",
  ".worktrees",
  "coverage",
  "dist",
  "node_modules",
  "playwright-report",
  "tsp-output"
]);

const STATUS_ORDER = [
  "accepted",
  "proposed",
  "superseded",
  "deprecated",
  "rejected",
  "unknown"
];

export function defaultWorkspaceRoot(cwd = process.cwd()) {
  if (path.basename(cwd) === "road-map") {
    return path.dirname(cwd);
  }

  return cwd;
}

export async function discoverRepositories(workspaceRoot, options = {}) {
  const root = path.resolve(workspaceRoot);
  const directRoot = await isGitRepository(root);
  const candidates = [];

  if (directRoot) {
    candidates.push(root);
  } else {
    const entries = await readdir(root, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || shouldSkipDirectory(entry.name, options)) {
        continue;
      }

      const candidate = path.join(root, entry.name);
      if (await isGitRepository(candidate)) {
        candidates.push(candidate);
      }
    }
  }

  const repositories = [];

  for (const repositoryPath of candidates.sort((a, b) => a.localeCompare(b))) {
    const remote = await readOriginRemote(repositoryPath);
    const slug = remote ? normaliseGitHubSlug(remote) : null;
    const name = slug ? slug.split("/").at(-1) : path.basename(repositoryPath);

    repositories.push({
      key: slug ? `remote:${slug.toLowerCase()}` : `local:${path.basename(repositoryPath)}`,
      name,
      slug,
      remote,
      path: repositoryPath,
      workspaceRelativePath: toPosixRelative(root, repositoryPath)
    });
  }

  return dedupeRepositories(repositories);
}

export async function buildAdrSearchIndex(options = {}) {
  const workspaceRoot = path.resolve(options.workspaceRoot ?? defaultWorkspaceRoot());
  const repositories = options.repositories
    ? await Promise.all(options.repositories.map((repositoryPath) => describeRepository(workspaceRoot, repositoryPath)))
    : await discoverRepositories(workspaceRoot, options);

  const sortedRepositories = repositories.sort(compareRepositories);
  const allAdrs = [];
  const repositoryEntries = [];

  for (const repository of sortedRepositories) {
    const files = await findAdrFiles(repository.path, options);
    const adrs = [];

    for (const absolutePath of files) {
      const markdown = await readFile(absolutePath, "utf8");
      const repoRelativePath = toPosixRelative(repository.path, absolutePath);
      const workspaceRelativePath = toPosixRelative(workspaceRoot, absolutePath);
      const adr = parseAdrMarkdown(markdown, {
        repository,
        repoRelativePath,
        workspaceRelativePath
      });

      adrs.push(adr);
      allAdrs.push(adr);
    }

    if (adrs.length === 0 && !options.includeEmptyRepositories) {
      continue;
    }

    adrs.sort(compareAdrs);
    repositoryEntries.push({
      name: repository.name,
      slug: repository.slug,
      remote: repository.remote,
      workspaceRelativePath: repository.workspaceRelativePath,
      adrCount: adrs.length,
      statusCounts: countByStatus(adrs),
      legacyPathCount: adrs.filter((adr) => adr.pathKind === "legacy").length,
      adrs: adrs.map(toRepositoryAdrSummary)
    });
  }

  allAdrs.sort(compareAdrs);

  return {
    schemaVersion: 1,
    generatedBy: "road-map/tools/adr-index",
    source: {
      workspaceRootName: path.basename(workspaceRoot),
      scanMode: options.repositories ? "explicit-repositories" : "top-level-git-repositories",
      canonicalAdrDirectory: "docs/adrs",
      legacyAdrDirectories: ["docs/adr", "docs/ADR", "docs/ADRS"],
      excludedDirectories: [...DEFAULT_EXCLUDED_DIRECTORIES].sort()
    },
    totals: {
      repositoriesScanned: sortedRepositories.length,
      repositoriesWithAdrs: repositoryEntries.length,
      adrCount: allAdrs.length,
      statusCounts: countByStatus(allAdrs),
      legacyPathCount: allAdrs.filter((adr) => adr.pathKind === "legacy").length,
      canonicalPathCount: allAdrs.filter((adr) => adr.pathKind === "canonical").length
    },
    repositories: repositoryEntries,
    adrs: allAdrs
  };
}

export async function writeAdrSearchIndex(index, options = {}) {
  const outputDirectory = path.resolve(options.outputDirectory ?? "docs");
  const jsonPath = path.resolve(options.jsonPath ?? path.join(outputDirectory, "adr-search-index.json"));
  const markdownPath = path.resolve(options.markdownPath ?? path.join(outputDirectory, "adr-search-index.md"));
  const json = `${JSON.stringify(index, null, 2)}\n`;
  const markdown = renderAdrSearchMarkdown(index, {
    outputDirectory,
    workspaceRoot: options.workspaceRoot
  });

  if (options.check) {
    const [existingJson, existingMarkdown] = await Promise.all([
      readFile(jsonPath, "utf8").catch(() => null),
      readFile(markdownPath, "utf8").catch(() => null)
    ]);

    return {
      jsonPath,
      markdownPath,
      changed: existingJson !== json || existingMarkdown !== markdown
    };
  }

  await mkdir(path.dirname(jsonPath), { recursive: true });
  await mkdir(path.dirname(markdownPath), { recursive: true });
  await Promise.all([
    writeFile(jsonPath, json),
    writeFile(markdownPath, markdown)
  ]);

  return {
    jsonPath,
    markdownPath,
    changed: true
  };
}

export async function findAdrFiles(repositoryPath, options = {}) {
  const files = [];

  async function walk(currentPath) {
    const entries = await readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!shouldSkipDirectory(entry.name, options)) {
          await walk(path.join(currentPath, entry.name));
        }

        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const absolutePath = path.join(currentPath, entry.name);
      const relativePath = toPosixRelative(repositoryPath, absolutePath);

      if (isAdrMarkdownFile(relativePath, options)) {
        files.push(absolutePath);
      }
    }
  }

  await walk(repositoryPath);
  return files.sort((a, b) => a.localeCompare(b));
}

export function parseAdrMarkdown(markdown, context = {}) {
  const repository = context.repository ?? {
    name: "unknown",
    slug: null,
    remote: null,
    workspaceRelativePath: "."
  };
  const repoRelativePath = context.repoRelativePath ?? "docs/adrs/unknown.md";
  const workspaceRelativePath = context.workspaceRelativePath ?? repoRelativePath;
  const sections = parseSections(markdown);
  const title = extractTitle(markdown, sections, repoRelativePath);
  const adrNumber = extractAdrNumber(repoRelativePath, markdown);
  const adrId = adrNumber ? `ADR-${adrNumber.padStart(4, "0")}` : null;
  const status = extractStatus(markdown, sections);
  const date = extractLabelValue(markdown, "Date") ?? null;
  const supersedes = extractReferences(extractLabelValue(markdown, "Supersedes"));
  const supersededBy = extractReferences(extractLabelValue(markdown, "Superseded by"));
  const headingSummaries = extractHeadingSummaries(sections);
  const headings = headingSummaries.map((entry) => entry.heading);
  const summary = extractSummary(headingSummaries, markdown);
  const pathKind = classifyAdrPath(repoRelativePath);
  const tags = buildTags({
    repository,
    title,
    status,
    pathKind,
    headings,
    supersedes,
    supersededBy
  });

  return {
    id: `${repository.name}:${repoRelativePath}`,
    adrId,
    number: adrNumber,
    title,
    status,
    statusKey: normaliseStatusKey(status),
    date,
    repository: repository.name,
    repositorySlug: repository.slug,
    repositoryRemote: repository.remote,
    repositoryRelativePath: repoRelativePath,
    workspaceRelativePath,
    pathKind,
    headings,
    headingSummaries,
    summary,
    supersedes,
    supersededBy,
    tags,
    searchText: buildSearchText({
      repository,
      repoRelativePath,
      title,
      status,
      date,
      headings,
      headingSummaries,
      summary,
      supersedes,
      supersededBy,
      markdown
    })
  };
}

export function renderAdrSearchMarkdown(index, options = {}) {
  const outputDirectory = path.resolve(options.outputDirectory ?? "docs");
  const workspaceRoot = path.resolve(options.workspaceRoot ?? path.join(outputDirectory, "..", ".."));
  const lines = [
    "# Cross-Repository ADR Search Index",
    "",
    "> Generated by `npm run adr:index`. Do not edit this file manually.",
    "",
    "This index is intended for review and inspection of Architectural Decision Records across local Plasius-LTD repository checkouts. Use editor or browser find against this Markdown file for quick review, or consume `adr-search-index.json` for structured search.",
    "",
    "## Summary",
    "",
    `- Workspace: \`${index.source.workspaceRootName}\``,
    `- Scan mode: \`${index.source.scanMode}\``,
    `- Repositories scanned: ${index.totals.repositoriesScanned}`,
    `- Repositories with ADRs: ${index.totals.repositoriesWithAdrs}`,
    `- ADRs indexed: ${index.totals.adrCount}`,
    `- Canonical ADR paths: ${index.totals.canonicalPathCount}`,
    `- Legacy ADR paths: ${index.totals.legacyPathCount}`,
    "",
    "## Status Counts",
    "",
    "| Status | Count |",
    "| --- | ---: |"
  ];

  for (const [status, count] of sortedStatusEntries(index.totals.statusCounts)) {
    lines.push(`| ${escapeTable(status)} | ${count} |`);
  }

  lines.push(
    "",
    "## Repository Coverage",
    "",
    "| Repository | ADRs | Accepted | Proposed | Superseded | Deprecated | Rejected | Unknown | Legacy paths |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |"
  );

  for (const repository of index.repositories) {
    const counts = repository.statusCounts;
    lines.push([
      `| ${escapeTable(repository.name)}`,
      repository.adrCount,
      counts.accepted ?? 0,
      counts.proposed ?? 0,
      counts.superseded ?? 0,
      counts.deprecated ?? 0,
      counts.rejected ?? 0,
      counts.unknown ?? 0,
      `${repository.legacyPathCount} |`
    ].join(" | "));
  }

  const inactiveAdrs = index.adrs.filter((adr) => ["deprecated", "rejected", "superseded"].includes(adr.statusKey));
  lines.push(
    "",
    "## Superseded, Deprecated, And Rejected ADRs",
    "",
    "| Repository | ADR | Status | Title | Relations | Path |",
    "| --- | --- | --- | --- | --- | --- |"
  );

  if (inactiveAdrs.length === 0) {
    lines.push("| None |  |  |  |  |  |");
  } else {
    for (const adr of inactiveAdrs) {
      lines.push(renderAdrTableRow(adr, outputDirectory, workspaceRoot));
    }
  }

  lines.push("", "## ADRs By Repository", "");

  for (const repository of index.repositories) {
    lines.push(
      `### ${repository.name}`,
      "",
      "| ADR | Status | Date | Title | Relations | Path |",
      "| --- | --- | --- | --- | --- | --- |"
    );

    for (const adr of repository.adrs) {
      lines.push(renderAdrTableRow(adr, outputDirectory, workspaceRoot));
    }

    lines.push("");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function renderAdrTableRow(adr, outputDirectory, workspaceRoot) {
  const label = adr.adrId ?? "ADR";
  const link = markdownLink(label, adr.workspaceRelativePath, outputDirectory, workspaceRoot);
  const relations = [
    adr.supersedes.length > 0 ? `Supersedes ${adr.supersedes.join(", ")}` : null,
    adr.supersededBy.length > 0 ? `Superseded by ${adr.supersededBy.join(", ")}` : null
  ].filter(Boolean).join("; ") || "-";
  const pathLink = markdownLink("source", adr.workspaceRelativePath, outputDirectory, workspaceRoot);

  return [
    `| ${link}`,
    escapeTable(displayStatus(adr.status)),
    escapeTable(adr.date ?? "-"),
    escapeTable(adr.title),
    escapeTable(relations),
    `${pathLink} |`
  ].join(" | ");
}

async function describeRepository(workspaceRoot, repositoryPath) {
  const absolutePath = path.resolve(repositoryPath);
  const remote = await readOriginRemote(absolutePath);
  const slug = remote ? normaliseGitHubSlug(remote) : null;
  const name = slug ? slug.split("/").at(-1) : path.basename(absolutePath);

  return {
    key: slug ? `remote:${slug.toLowerCase()}` : `local:${path.basename(absolutePath)}`,
    name,
    slug,
    remote,
    path: absolutePath,
    workspaceRelativePath: toPosixRelative(workspaceRoot, absolutePath)
  };
}

async function isGitRepository(candidatePath) {
  try {
    await access(path.join(candidatePath, ".git"));
    return true;
  } catch {
    return false;
  }
}

async function readOriginRemote(repositoryPath) {
  const gitPath = path.join(repositoryPath, ".git");
  let configPath = path.join(gitPath, "config");

  try {
    const gitStat = await stat(gitPath);

    if (gitStat.isFile()) {
      const gitFile = await readFile(gitPath, "utf8");
      const match = gitFile.match(/^gitdir:\s*(.+)$/m);
      if (!match) {
        return null;
      }

      const gitDir = path.resolve(repositoryPath, match[1].trim());
      configPath = path.join(gitDir, "config");
      const worktreeRemote = await readRemoteFromConfig(configPath);
      if (worktreeRemote) {
        return worktreeRemote;
      }

      const commonDirectory = await readFile(path.join(gitDir, "commondir"), "utf8").catch(() => null);
      if (commonDirectory) {
        const commonGitDir = path.resolve(gitDir, commonDirectory.trim());
        return readRemoteFromConfig(path.join(commonGitDir, "config"));
      }
    }

    return readRemoteFromConfig(configPath);
  } catch {
    return null;
  }
}

async function readRemoteFromConfig(configPath) {
  const config = await readFile(configPath, "utf8").catch(() => null);
  return config ? parseOriginRemote(config) : null;
}

function parseOriginRemote(config) {
  const lines = config.split(/\r?\n/);
  let inOrigin = false;

  for (const line of lines) {
    const section = line.match(/^\s*\[remote\s+"([^"]+)"\]\s*$/);
    if (section) {
      inOrigin = section[1] === "origin";
      continue;
    }

    if (inOrigin) {
      const url = line.match(/^\s*url\s*=\s*(.+?)\s*$/);
      if (url) {
        return url[1];
      }
    }
  }

  return null;
}

function normaliseGitHubSlug(remote) {
  const withoutSuffix = remote.replace(/\.git$/i, "");
  const sshMatch = withoutSuffix.match(/github\.com[:/]([^/]+\/[^/]+)$/i);
  const httpsMatch = withoutSuffix.match(/github\.com\/([^/]+\/[^/]+)$/i);
  const match = sshMatch ?? httpsMatch;

  return match ? match[1] : withoutSuffix;
}

function dedupeRepositories(repositories) {
  const byKey = new Map();

  for (const repository of repositories) {
    const existing = byKey.get(repository.key);
    if (!existing || preferRepository(repository, existing)) {
      byKey.set(repository.key, repository);
    }
  }

  return [...byKey.values()].sort(compareRepositories);
}

function preferRepository(candidate, existing) {
  if (candidate.name && path.basename(candidate.path) === candidate.name && path.basename(existing.path) !== existing.name) {
    return true;
  }

  if (candidate.workspaceRelativePath.length !== existing.workspaceRelativePath.length) {
    return candidate.workspaceRelativePath.length < existing.workspaceRelativePath.length;
  }

  return candidate.path.localeCompare(existing.path) < 0;
}

function shouldSkipDirectory(name, options = {}) {
  if (options.includeHidden !== true && name.startsWith(".")) {
    return true;
  }

  return DEFAULT_EXCLUDED_DIRECTORIES.has(name);
}

function isAdrMarkdownFile(relativePath, options = {}) {
  const normalisedPath = toPosixPath(relativePath);
  const basename = path.posix.basename(normalisedPath);

  if (!basename.toLowerCase().endsWith(".md")) {
    return false;
  }

  if (!options.includeTemplates && /(?:^|-)template\.md$/i.test(basename)) {
    return false;
  }

  if (/^index\.md$/i.test(basename)) {
    return false;
  }

  if (!/adr[-_\s:]*0*\d+/i.test(basename)) {
    return false;
  }

  return classifyAdrPath(normalisedPath) !== "other";
}

function classifyAdrPath(relativePath) {
  const parts = toPosixPath(relativePath).split("/");

  for (let index = 0; index < parts.length - 1; index += 1) {
    const current = parts[index].toLowerCase();
    const next = parts[index + 1];
    const nextLower = next.toLowerCase();

    if (current === "docs" && (nextLower === "adrs" || nextLower === "adr")) {
      return next === "adrs" ? "canonical" : "legacy";
    }
  }

  return "other";
}

function parseSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);

    if (heading) {
      current = {
        level: heading[1].length,
        heading: cleanInlineMarkdown(heading[2]),
        content: []
      };
      sections.push(current);
      continue;
    }

    if (current) {
      current.content.push(line);
    }
  }

  return sections;
}

function extractTitle(markdown, sections, relativePath) {
  const h1 = sections.find((section) => section.level === 1)?.heading ?? "";
  let candidate = h1;

  if (/^architectural decision record(?:\s*\(adr\))?$/i.test(candidate) || /^adr$/i.test(candidate)) {
    const titleSection = findSection(sections, "Title");
    const firstTitleLine = titleSection ? firstContentLine(titleSection.content) : "";
    if (firstTitleLine) {
      candidate = firstTitleLine;
    }
  }

  if (!candidate) {
    candidate = path.basename(relativePath, ".md");
  }

  return cleanTitle(candidate);
}

function cleanTitle(value) {
  return cleanInlineMarkdown(value)
    .replace(/^ADR[-\s_:]*0*\d+\s*[:\-]\s*/i, "")
    .replace(/^Architectural Decision Record\s*[:\-]\s*/i, "")
    .trim();
}

function extractAdrNumber(relativePath, markdown) {
  const filename = path.posix.basename(toPosixPath(relativePath), ".md");
  const fromFilename = filename.match(/adr[-_\s:]*0*(\d+)/i);
  if (fromFilename) {
    return fromFilename[1].padStart(4, "0");
  }

  const fromHeading = markdown.match(/^#\s*ADR[-\s_:]*0*(\d+)/im);
  return fromHeading ? fromHeading[1].padStart(4, "0") : null;
}

function extractStatus(markdown, sections) {
  const labelStatus = extractLabelValue(markdown, "Status");
  if (labelStatus) {
    return displayStatus(labelStatus);
  }

  const statusSection = findSection(sections, "Status");
  const statusLine = statusSection ? firstContentLine(statusSection.content) : null;

  return statusLine ? displayStatus(statusLine) : "Unknown";
}

function extractLabelValue(markdown, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const expression = new RegExp(`^\\s*(?:[-*]\\s*)?(?:\\*\\*)?${escapedLabel}(?:\\*\\*)?\\s*:\\s*(.+?)\\s*$`, "im");
  const match = markdown.match(expression);

  if (!match) {
    return null;
  }

  const value = cleanInlineMarkdown(match[1]);
  return isEmptyRelation(value) ? null : value;
}

function extractReferences(value) {
  if (!value || isEmptyRelation(value)) {
    return [];
  }

  const references = new Set();
  const matches = value.matchAll(/ADR[-\s_]*0*(\d+)/gi);

  for (const match of matches) {
    references.add(`ADR-${match[1].padStart(4, "0")}`);
  }

  if (references.size === 0) {
    references.add(value);
  }

  return [...references].sort();
}

function extractHeadingSummaries(sections) {
  return sections
    .filter((section) => section.level === 2)
    .map((section) => ({
      heading: section.heading,
      summary: summariseLines(section.content)
    }))
    .filter((entry) => entry.summary.length > 0);
}

function extractSummary(headingSummaries, markdown) {
  const decision = headingSummaries.find((entry) => /^Decision$/i.test(entry.heading));
  if (decision) {
    return decision.summary;
  }

  const context = headingSummaries.find((entry) => /^Context$/i.test(entry.heading));
  if (context) {
    return context.summary;
  }

  return summariseLines(markdown.split(/\r?\n/));
}

function summariseLines(lines) {
  const paragraphs = [];
  let current = [];

  for (const line of lines) {
    const cleaned = cleanBlockLine(line);

    if (!cleaned) {
      if (current.length > 0) {
        paragraphs.push(current.join(" "));
        current = [];
      }

      continue;
    }

    if (/^#{1,6}\s/.test(cleaned)) {
      continue;
    }

    current.push(cleaned);
  }

  if (current.length > 0) {
    paragraphs.push(current.join(" "));
  }

  const summary = paragraphs.find((paragraph) => paragraph.length > 0) ?? "";
  return truncate(normalizeWhitespace(summary), 260);
}

function buildTags({ repository, title, status, pathKind, headings, supersedes, supersededBy }) {
  const tags = new Set([
    repository.name,
    normaliseStatusKey(status),
    `${pathKind}-adr-path`
  ]);

  for (const word of tokenize(`${title} ${headings.join(" ")}`)) {
    tags.add(word);
  }

  if (supersedes.length > 0) {
    tags.add("supersedes");
  }

  if (supersededBy.length > 0) {
    tags.add("superseded-by");
  }

  return [...tags].sort();
}

function buildSearchText(parts) {
  return normalizeWhitespace(stripMarkdown([
    parts.repository.name,
    parts.repository.slug,
    parts.repoRelativePath,
    parts.title,
    parts.status,
    parts.date,
    ...parts.headings,
    ...parts.headingSummaries.flatMap((entry) => [entry.heading, entry.summary]),
    parts.summary,
    ...parts.supersedes,
    ...parts.supersededBy,
    parts.markdown
  ].filter(Boolean).join(" "))).toLowerCase();
}

function toRepositoryAdrSummary(adr) {
  return {
    id: adr.id,
    adrId: adr.adrId,
    number: adr.number,
    title: adr.title,
    status: adr.status,
    statusKey: adr.statusKey,
    date: adr.date,
    repositoryRelativePath: adr.repositoryRelativePath,
    workspaceRelativePath: adr.workspaceRelativePath,
    pathKind: adr.pathKind,
    summary: adr.summary,
    supersedes: adr.supersedes,
    supersededBy: adr.supersededBy,
    tags: adr.tags
  };
}

function countByStatus(adrs) {
  const counts = {};

  for (const adr of adrs) {
    const key = adr.statusKey ?? normaliseStatusKey(adr.status);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.fromEntries(sortedStatusEntries(counts));
}

function sortedStatusEntries(counts) {
  return Object.entries(counts).sort(([left], [right]) => {
    const leftIndex = STATUS_ORDER.indexOf(left);
    const rightIndex = STATUS_ORDER.indexOf(right);
    const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    return normalizedLeft - normalizedRight || left.localeCompare(right);
  });
}

function normaliseStatusKey(status) {
  const value = stripMarkdown(status ?? "").toLowerCase();

  if (value.includes("accepted")) {
    return "accepted";
  }

  if (value.includes("proposed")) {
    return "proposed";
  }

  if (value.includes("superseded")) {
    return "superseded";
  }

  if (value.includes("deprecated")) {
    return "deprecated";
  }

  if (value.includes("rejected")) {
    return "rejected";
  }

  return "unknown";
}

function displayStatus(value) {
  const key = normaliseStatusKey(value);

  if (key === "unknown") {
    return cleanInlineMarkdown(value ?? "Unknown") || "Unknown";
  }

  return key[0].toUpperCase() + key.slice(1);
}

function findSection(sections, heading) {
  return sections.find((section) => section.heading.toLowerCase() === heading.toLowerCase());
}

function firstContentLine(lines) {
  for (const line of lines) {
    const cleaned = cleanBlockLine(line);
    if (cleaned) {
      return cleaned;
    }
  }

  return "";
}

function cleanBlockLine(line) {
  return cleanInlineMarkdown(line)
    .replace(/^[-*]\s+/, "")
    .trim();
}

function cleanInlineMarkdown(value) {
  return stripMarkdown(value)
    .replace(/^>\s*/, "")
    .trim();
}

function stripMarkdown(value) {
  return String(value ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[*_~]/g, "")
    .replace(/<([^>]+)>/g, "$1");
}

function tokenize(value) {
  return normalizeWhitespace(stripMarkdown(value).toLowerCase())
    .split(/[^a-z0-9@.-]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3)
    .slice(0, 40);
}

function isEmptyRelation(value) {
  return /^(?:n\/a|na|none|-|not applicable)$/i.test(String(value ?? "").trim());
}

function markdownLink(label, workspaceRelativePath, outputDirectory, workspaceRoot) {
  const absoluteTarget = path.resolve(workspaceRoot, workspaceRelativePath);
  const relativeTarget = toPosixRelative(outputDirectory, absoluteTarget);

  return `[${escapeTable(label)}](${encodeMarkdownPath(relativeTarget)})`;
}

function encodeMarkdownPath(relativePath) {
  return relativePath.split("/").map(encodeURIComponent).join("/");
}

function escapeTable(value) {
  return String(value ?? "")
    .replace(/\|/g, "\\|")
    .replace(/\n/g, " ")
    .trim();
}

function truncate(value, limit) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit - 3).trimEnd()}...`;
}

function normalizeWhitespace(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function toPosixRelative(from, to) {
  return toPosixPath(path.relative(from, to)) || ".";
}

function toPosixPath(value) {
  return value.split(path.sep).join("/");
}

function compareRepositories(left, right) {
  return left.name.localeCompare(right.name) || left.workspaceRelativePath.localeCompare(right.workspaceRelativePath);
}

function compareAdrs(left, right) {
  return left.repository.localeCompare(right.repository)
    || String(left.number ?? "").localeCompare(String(right.number ?? ""))
    || left.repositoryRelativePath.localeCompare(right.repositoryRelativePath);
}
