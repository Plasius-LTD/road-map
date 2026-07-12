import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const cli = path.join(root, "tools/rfc-audit/cli.mjs");

test("RFC audit CLI checks committed deterministic outputs", async () => {
  const { stdout, stderr } = await execFile(process.execPath, [cli, "--check"], { cwd: root });
  assert.equal(stderr, "");
  assert.match(stdout, /Checked RFC audit: 93 repositories, 47 RFCs, 497 classifications\./u);
});
