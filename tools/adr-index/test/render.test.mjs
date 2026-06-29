import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import {
  defaultWorkspaceRoot,
  findAdrFiles,
  renderAdrSearchMarkdown,
  writeAdrSearchIndex
} from "../indexer.mjs";

test("defaultWorkspaceRoot uses the parent of the road-map checkout", () => {
  assert.equal(defaultWorkspaceRoot("/tmp/workspace/road-map"), "/tmp/workspace");
  assert.equal(defaultWorkspaceRoot("/tmp/workspace/schema"), "/tmp/workspace/schema");
});

test("findAdrFiles respects hidden and template exclusions", async () => {
  const repositoryPath = await mkdtemp(path.join(os.tmpdir(), "adr-find-"));

  try {
    await mkdir(path.join(repositoryPath, "docs", "adrs"), { recursive: true });
    await mkdir(path.join(repositoryPath, "docs", "ADR"), { recursive: true });
    await mkdir(path.join(repositoryPath, ".hidden", "docs", "adrs"), { recursive: true });

    await writeFile(path.join(repositoryPath, "docs", "adrs", "adr-0001-valid.md"), "# ADR 0001: Valid\n", "utf8");
    await writeFile(path.join(repositoryPath, "docs", "ADR", "adr-0002-legacy.md"), "# ADR 0002: Legacy\n", "utf8");
    await writeFile(path.join(repositoryPath, "docs", "adrs", "adr-0004-template.md"), "# ADR Template\n", "utf8");
    await writeFile(path.join(repositoryPath, "docs", "adrs", "index.md"), "# Index\n", "utf8");
    await writeFile(path.join(repositoryPath, ".hidden", "docs", "adrs", "adr-0003-hidden.md"), "# ADR 0003: Hidden\n", "utf8");

    const defaultFiles = await findAdrFiles(repositoryPath);
    assert.deepEqual(
      defaultFiles.map((entry) => path.relative(repositoryPath, entry).split(path.sep).join("/")),
      ["docs/ADR/adr-0002-legacy.md", "docs/adrs/adr-0001-valid.md"]
    );

    const expandedFiles = await findAdrFiles(repositoryPath, {
      includeHidden: true,
      includeTemplates: true
    });
    assert.deepEqual(
      expandedFiles.map((entry) => path.relative(repositoryPath, entry).split(path.sep).join("/")),
      [
        ".hidden/docs/adrs/adr-0003-hidden.md",
        "docs/ADR/adr-0002-legacy.md",
        "docs/adrs/adr-0001-valid.md",
        "docs/adrs/adr-0004-template.md"
      ]
    );
  } finally {
    await rm(repositoryPath, { recursive: true, force: true });
  }
});

test("writeAdrSearchIndex persists JSON and markdown and check mode is stable", async () => {
  const outputDirectory = await mkdtemp(path.join(os.tmpdir(), "adr-write-"));
  const workspaceRoot = path.join(outputDirectory, "workspace");

  try {
    const index = sampleIndex();
    const firstWrite = await writeAdrSearchIndex(index, {
      outputDirectory,
      workspaceRoot
    });

    assert.equal(firstWrite.changed, true);

    const markdown = await readFile(firstWrite.markdownPath, "utf8");
    const json = await readFile(firstWrite.jsonPath, "utf8");

    assert.match(markdown, /Cross-Repository ADR Search Index/);
    assert.match(markdown, /Superseded, Deprecated, And Rejected ADRs/);
    assert.match(markdown, /\[ADR-0002\]/);
    assert.match(json, /"schemaVersion": 1/);

    const secondWrite = await writeAdrSearchIndex(index, {
      outputDirectory,
      workspaceRoot,
      check: true
    });

    assert.equal(secondWrite.changed, false);
    assert.equal(renderAdrSearchMarkdown(index, { outputDirectory, workspaceRoot }), markdown);
  } finally {
    await rm(outputDirectory, { recursive: true, force: true });
  }
});

function sampleIndex() {
  return {
    schemaVersion: 1,
    generatedBy: "road-map/tools/adr-index",
    source: {
      workspaceRootName: "plasius",
      scanMode: "explicit-repositories",
      canonicalAdrDirectory: "docs/adrs",
      legacyAdrDirectories: ["docs/adr", "docs/ADR", "docs/ADRS"],
      excludedDirectories: ["coverage", "dist", "node_modules"]
    },
    totals: {
      repositoriesScanned: 2,
      repositoriesWithAdrs: 2,
      adrCount: 2,
      statusCounts: {
        accepted: 1,
        superseded: 1
      },
      legacyPathCount: 1,
      canonicalPathCount: 1
    },
    repositories: [
      {
        name: "graph-client-core",
        slug: "Plasius-LTD/graph-client-core",
        remote: "https://github.com/Plasius-LTD/graph-client-core.git",
        workspaceRelativePath: "graph-client-core",
        adrCount: 1,
        legacyPathCount: 0,
        statusCounts: {
          accepted: 1
        },
        adrs: [
          sampleAdr({
            id: "graph-client-core:docs/adrs/adr-0001-cache.md",
            adrId: "ADR-0001",
            number: "0001",
            title: "Cache Contract",
            status: "Accepted",
            statusKey: "accepted",
            date: "2026-06-20",
            repositoryRelativePath: "docs/adrs/adr-0001-cache.md",
            workspaceRelativePath: "graph-client-core/docs/adrs/adr-0001-cache.md",
            pathKind: "canonical"
          })
        ]
      },
      {
        name: "graph-cache-redis",
        slug: "Plasius-LTD/graph-cache-redis",
        remote: "https://github.com/Plasius-LTD/graph-cache-redis.git",
        workspaceRelativePath: "graph-cache-redis",
        adrCount: 1,
        legacyPathCount: 1,
        statusCounts: {
          superseded: 1
        },
        adrs: [
          sampleAdr({
            id: "graph-cache-redis:docs/ADR/adr-0002-legacy.md",
            adrId: "ADR-0002",
            number: "0002",
            title: "Legacy Redis Strategy",
            status: "Superseded",
            statusKey: "superseded",
            date: null,
            repositoryRelativePath: "docs/ADR/adr-0002-legacy.md",
            workspaceRelativePath: "graph-cache-redis/docs/ADR/adr-0002-legacy.md",
            pathKind: "legacy",
            supersededBy: ["ADR-0005"]
          })
        ]
      }
    ],
    adrs: [
      sampleAdr({
        id: "graph-client-core:docs/adrs/adr-0001-cache.md",
        adrId: "ADR-0001",
        number: "0001",
        title: "Cache Contract",
        status: "Accepted",
        statusKey: "accepted",
        date: "2026-06-20",
        repositoryRelativePath: "docs/adrs/adr-0001-cache.md",
        workspaceRelativePath: "graph-client-core/docs/adrs/adr-0001-cache.md",
        pathKind: "canonical"
      }),
      sampleAdr({
        id: "graph-cache-redis:docs/ADR/adr-0002-legacy.md",
        adrId: "ADR-0002",
        number: "0002",
        title: "Legacy Redis Strategy",
        status: "Superseded",
        statusKey: "superseded",
        date: null,
        repositoryRelativePath: "docs/ADR/adr-0002-legacy.md",
        workspaceRelativePath: "graph-cache-redis/docs/ADR/adr-0002-legacy.md",
        pathKind: "legacy",
        supersededBy: ["ADR-0005"]
      })
    ]
  };
}

function sampleAdr(overrides) {
  return {
    supersedes: [],
    supersededBy: [],
    tags: [],
    ...overrides
  };
}
