import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  buildAdrSearchIndex,
  discoverRepositories,
  parseAdrMarkdown
} from "../indexer.mjs";

test("parseAdrMarkdown extracts bullet metadata and decision summaries", () => {
  const adr = parseAdrMarkdown(`# ADR 0007: Mesh BVH Wavefront Path Tracing

- Status: Accepted
- Date: 2026-06-01
- Supersedes: ADR-0003
- Superseded by: N/A

## Context

Existing proxy geometry is not enough for display quality output.

## Decision

Use triangle mesh BVH data as the display-quality path tracing baseline.
`, {
    repository: repository("gpu-renderer"),
    repoRelativePath: "docs/adrs/adr-0007-triangle-mesh-wavefront-path-tracing.md",
    workspaceRelativePath: "gpu-renderer/docs/adrs/adr-0007-triangle-mesh-wavefront-path-tracing.md"
  });

  assert.equal(adr.adrId, "ADR-0007");
  assert.equal(adr.title, "Mesh BVH Wavefront Path Tracing");
  assert.equal(adr.status, "Accepted");
  assert.equal(adr.statusKey, "accepted");
  assert.equal(adr.date, "2026-06-01");
  assert.deepEqual(adr.supersedes, ["ADR-0003"]);
  assert.deepEqual(adr.supersededBy, []);
  assert.equal(adr.pathKind, "canonical");
  assert.match(adr.summary, /triangle mesh BVH/i);
  assert.match(adr.searchText, /display quality output/i);
});

test("parseAdrMarkdown handles title and status sections plus legacy paths", () => {
  const adr = parseAdrMarkdown(`# Architectural Decision Record (ADR)

## Title

> Legacy design map location

## Status

Superseded by ADR-0012

## Context

The legacy ADR folder should still be searchable.

## Decision

Keep the record in the index while marking it inactive.
`, {
    repository: repository("ui-foundry"),
    repoRelativePath: "docs/ADR/adr-0002-legacy-design-map.md",
    workspaceRelativePath: "ui-foundry/docs/ADR/adr-0002-legacy-design-map.md"
  });

  assert.equal(adr.adrId, "ADR-0002");
  assert.equal(adr.title, "Legacy design map location");
  assert.equal(adr.statusKey, "superseded");
  assert.equal(adr.pathKind, "legacy");
  assert.match(adr.summary, /marking it inactive/i);
});

test("discoverRepositories skips hidden worktrees and deduplicates remotes", async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "adr-index-workspace-"));

  try {
    await createGitRepo(workspace, "road-map", "https://github.com/Plasius-LTD/road-map.git");
    await createGitRepo(workspace, "road-map-copy", "https://github.com/Plasius-LTD/road-map.git");
    await createGitRepo(workspace, "schema", "git@github.com:Plasius-LTD/schema.git");
    await createGitWorktree(workspace, "schema", "schema-wt");
    await createGitRepo(path.join(workspace, ".codex-worktrees"), "schema-wt", "git@github.com:Plasius-LTD/schema.git");

    const repositories = await discoverRepositories(workspace);

    assert.deepEqual(
      repositories.map((entry) => entry.name),
      ["road-map", "schema"]
    );
    assert.equal(repositories.find((entry) => entry.name === "road-map")?.workspaceRelativePath, "road-map");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("buildAdrSearchIndex scans explicit repositories and omits templates", async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "adr-index-build-"));

  try {
    const repoPath = await createGitRepo(workspace, "graph-gateway-core", "https://github.com/Plasius-LTD/graph-gateway-core.git");
    await mkdir(path.join(repoPath, "docs", "adrs"), { recursive: true });
    await writeFile(path.join(repoPath, "docs", "adrs", "adr-template.md"), "# ADR Template\n", "utf8");
    await writeFile(path.join(repoPath, "docs", "adrs", "index.md"), "# ADR Index\n", "utf8");
    await writeFile(path.join(repoPath, "docs", "adrs", "adr-0001-gateway-boundary.md"), `# ADR 0001: Gateway Boundary

## Status

Accepted

## Decision

Keep gateway coordination behind the shared graph package boundary.
`, "utf8");

    const index = await buildAdrSearchIndex({
      workspaceRoot: workspace,
      repositories: [repoPath]
    });

    assert.equal(index.totals.adrCount, 1);
    assert.equal(index.totals.repositoriesWithAdrs, 1);
    assert.equal(index.adrs[0].title, "Gateway Boundary");
    assert.equal(index.adrs[0].repository, "graph-gateway-core");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

function repository(name) {
  return {
    name,
    slug: `Plasius-LTD/${name}`,
    remote: `https://github.com/Plasius-LTD/${name}.git`,
    workspaceRelativePath: name
  };
}

async function createGitRepo(workspace, name, remote) {
  const repoPath = path.join(workspace, name);
  await mkdir(path.join(repoPath, ".git"), { recursive: true });
  await writeFile(path.join(repoPath, ".git", "config"), `[remote "origin"]
  url = ${remote}
`, "utf8");

  return repoPath;
}

async function createGitWorktree(workspace, sourceName, worktreeName) {
  const sourceGitPath = path.join(workspace, sourceName, ".git");
  const worktreeGitDir = path.join(sourceGitPath, "worktrees", worktreeName);
  const worktreePath = path.join(workspace, worktreeName);

  await mkdir(worktreeGitDir, { recursive: true });
  await mkdir(worktreePath, { recursive: true });
  await writeFile(path.join(worktreeGitDir, "commondir"), "../..\n", "utf8");
  await writeFile(path.join(worktreePath, ".git"), `gitdir: ${worktreeGitDir}\n`, "utf8");

  return worktreePath;
}
