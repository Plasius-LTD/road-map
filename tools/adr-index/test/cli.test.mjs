import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cliPath = path.resolve("tools/adr-index/cli.mjs");

test("CLI prints help output", () => {
  const result = runCli(["--help"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: npm run adr:index/);
});

test("CLI reports unknown arguments", () => {
  const result = runCli(["--wat"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown argument: --wat/);
});

test("CLI writes outputs and passes check mode for explicit repositories", async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "adr-cli-"));
  const repoPath = path.join(workspace, "graph-cache-redis");
  const outputDirectory = path.join(workspace, "output");

  try {
    await mkdir(path.join(repoPath, ".git"), { recursive: true });
    await mkdir(path.join(repoPath, "docs", "adrs"), { recursive: true });
    await writeFile(path.join(repoPath, ".git", "config"), `[remote "origin"]
  url = https://github.com/Plasius-LTD/graph-cache-redis.git
`, "utf8");
    await writeFile(path.join(repoPath, "docs", "adrs", "adr-0003-cache-policy.md"), `# ADR 0003: Cache Policy

- Status: Accepted
- Date: 2026-06-28

## Decision

Keep cache freshness thresholds explicit in the shared contracts.
`, "utf8");

    const writeResult = runCli([
      "--workspace-root",
      workspace,
      "--repo",
      repoPath,
      "--out-dir",
      outputDirectory
    ]);

    assert.equal(writeResult.status, 0);
    assert.match(writeResult.stdout, /Indexed 1 ADRs across 1 repositories\./);

    const markdown = await readFile(path.join(outputDirectory, "adr-search-index.md"), "utf8");
    assert.match(markdown, /graph-cache-redis/);
    assert.match(markdown, /Cache Policy/);

    const checkResult = runCli([
      "--workspace-root",
      workspace,
      "--repo",
      repoPath,
      "--out-dir",
      outputDirectory,
      "--check"
    ]);

    assert.equal(checkResult.status, 0);
    assert.match(checkResult.stdout, /ADR search index is up to date\./);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: path.dirname(cliPath),
    encoding: "utf8"
  });
}
