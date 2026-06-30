import assert from "node:assert/strict";
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const cliPath = path.resolve("tools/project-board/cli.mjs");

test("CLI prints help output", () => {
  const result = runCli(["--help"]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: npm run project:board/);
});

test("CLI reports unknown commands", () => {
  const result = runCli(["wat"]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /Unknown command: wat/);
});

test("find-next uses gh responses and returns a candidate", async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "project-board-cli-"));

  try {
    const { fakeGhPath } = await createFakeGh(workspace);
    const result = runCli([
      "find-next",
      "--owner",
      "Plasius-LTD",
      "--project-number",
      "1",
      "--self-login",
      "zephod111r"
    ], {
      env: {
        PLASIUS_GH_BIN: fakeGhPath
      }
    });

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.candidate.number, 524);
    assert.equal(parsed.candidate.priority, "P0");
    assert.equal(parsed.pagesScanned, 1);
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("fields prints project status ids", async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "project-board-cli-"));

  try {
    const { fakeGhPath } = await createFakeGh(workspace);
    const result = runCli([
      "fields",
      "--owner",
      "Plasius-LTD",
      "--project-number",
      "1"
    ], {
      env: {
        PLASIUS_GH_BIN: fakeGhPath
      }
    });

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.projectId, "project-1");
    assert.equal(parsed.statuses["In progress"], "progress-id");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("find-item locates a linked issue by repo and number", async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "project-board-cli-"));

  try {
    const { fakeGhPath } = await createFakeGh(workspace);
    const result = runCli([
      "find-item",
      "--owner",
      "Plasius-LTD",
      "--project-number",
      "1",
      "--repo",
      "Plasius-LTD/road-map",
      "--issue-number",
      "524"
    ], {
      env: {
        PLASIUS_GH_BIN: fakeGhPath
      }
    });

    assert.equal(result.status, 0);
    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed.item.number, 524);
    assert.equal(parsed.item.itemId, "item-2");
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("set-status resolves field ids then edits the project item", async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "project-board-cli-"));

  try {
    const { fakeGhPath, logPath } = await createFakeGh(workspace);
    const result = runCli([
      "set-status",
      "--owner",
      "Plasius-LTD",
      "--project-number",
      "1",
      "--item-id",
      "item-2",
      "--status",
      "In progress"
    ], {
      env: {
        PLASIUS_GH_BIN: fakeGhPath,
        FAKE_GH_LOG: logPath
      }
    });

    assert.equal(result.status, 0);
    const log = await readLog(logPath);
    assert.ok(log.some((entry) => entry[0] === "project" && entry[1] === "item-edit" && entry.includes("progress-id")));
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("claim assigns the issue and updates project status", async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "project-board-cli-"));

  try {
    const { fakeGhPath, logPath } = await createFakeGh(workspace);
    const result = runCli([
      "claim",
      "--owner",
      "Plasius-LTD",
      "--project-number",
      "1",
      "--item-id",
      "item-2",
      "--status",
      "In progress",
      "--repo",
      "Plasius-LTD/road-map",
      "--issue-number",
      "524",
      "--assignee",
      "zephod111r"
    ], {
      env: {
        PLASIUS_GH_BIN: fakeGhPath,
        FAKE_GH_LOG: logPath
      }
    });

    assert.equal(result.status, 0);
    const log = await readLog(logPath);
    assert.ok(log.some((entry) => entry[0] === "api" && entry[1] === "repos/Plasius-LTD/road-map/issues/524" && entry.includes("assignees[]=zephod111r")));
    assert.ok(log.some((entry) => entry[0] === "project" && entry[1] === "item-edit"));
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("comment posts an issue comment through REST", async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "project-board-cli-"));

  try {
    const { fakeGhPath, logPath } = await createFakeGh(workspace);
    const result = runCli([
      "comment",
      "--repo",
      "Plasius-LTD/road-map",
      "--issue-number",
      "524",
      "--body",
      "evidence"
    ], {
      env: {
        PLASIUS_GH_BIN: fakeGhPath,
        FAKE_GH_LOG: logPath
      }
    });

    assert.equal(result.status, 0);
    const log = await readLog(logPath);
    assert.ok(log.some((entry) => entry[0] === "api" && entry[1] === "repos/Plasius-LTD/road-map/issues/524/comments" && entry.includes("body=evidence")));
  } finally {
    await rm(workspace, { recursive: true, force: true });
  }
});

test("set-status validates required arguments", () => {
  const result = runCli([
    "set-status",
    "--owner",
    "Plasius-LTD",
    "--project-number",
    "1"
  ]);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /--item-id is required/);
});

function runCli(args, overrides = {}) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: path.dirname(cliPath),
    encoding: "utf8",
    env: {
      ...process.env,
      ...(overrides.env ?? {})
    }
  });
}

async function createFakeGh(workspace) {
  await mkdir(workspace, { recursive: true });
  const fakeGhPath = path.join(workspace, "gh");
  const logPath = path.join(workspace, "gh.log");
  await writeFile(fakeGhPath, `#!/usr/bin/env node
const { appendFileSync } = require("node:fs");
const args = process.argv.slice(2);
if (process.env.FAKE_GH_LOG) {
  appendFileSync(process.env.FAKE_GH_LOG, JSON.stringify(args) + "\\n", "utf8");
}
if (args[0] === "project" && args[1] === "list") {
  process.stdout.write(JSON.stringify({
    projects: [{ id: "project-1", number: 1, title: "Plasius-LTD-site" }]
  }));
  process.exit(0);
}
if (args[0] === "project" && args[1] === "field-list") {
  process.stdout.write(JSON.stringify({
    fields: [{
      id: "status-field",
      name: "Status",
      options: [
        { id: "backlog-id", name: "Backlog" },
        { id: "progress-id", name: "In progress" },
        { id: "done-id", name: "Done" }
      ]
    }]
  }));
  process.exit(0);
}
if (args[0] === "project" && args[1] === "item-edit") {
  process.stdout.write(JSON.stringify({ ok: true }));
  process.exit(0);
}
if (args[0] === "api" && args[1] === "graphql") {
  process.stdout.write(JSON.stringify({
    data: {
      organization: {
        projectV2: {
          id: "project-1",
          title: "Plasius-LTD-site",
          items: {
            pageInfo: {
              hasNextPage: false,
              endCursor: "cursor-1"
            },
            nodes: [{
              id: "item-2",
              content: {
                __typename: "Issue",
                number: 524,
                title: "[TASK] Unblock Plasius-LTD-site backlog automation from GitHub GraphQL rate exhaustion",
                url: "https://github.com/Plasius-LTD/road-map/issues/524",
                repository: {
                  nameWithOwner: "Plasius-LTD/road-map"
                },
                assignees: {
                  nodes: [{ login: "zephod111r" }]
                }
              },
              fieldValues: {
                nodes: [
                  {
                    __typename: "ProjectV2ItemFieldSingleSelectValue",
                    name: "Backlog",
                    field: { name: "Status" }
                  },
                  {
                    __typename: "ProjectV2ItemFieldSingleSelectValue",
                    name: "P0",
                    field: { name: "Priority" }
                  }
                ]
              }
            }]
          }
        }
      }
    }
  }));
  process.exit(0);
}
if (args[0] === "api") {
  process.stdout.write(JSON.stringify({ ok: true }));
  process.exit(0);
}
process.stderr.write("unexpected gh invocation: " + JSON.stringify(args));
process.exit(1);
`, "utf8");
  await chmod(fakeGhPath, 0o755);
  return { fakeGhPath, logPath };
}

async function readLog(logPath) {
  const content = await readFile(logPath, "utf8");
  return content
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}
