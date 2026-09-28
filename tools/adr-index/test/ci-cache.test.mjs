import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const files = [".github/workflows/ci.yml", ".github/actions/road-map-ci/action.yml"];
const policy = "cache: ${{ runner.environment == 'github-hosted' && 'npm' || '' }}";

test("persistent self-hosted jobs do not export the global npm cache", () => {
  for (const file of files) {
    const workflow = readFileSync(resolve(process.cwd(), file), "utf8");
    assert.ok(workflow.includes(policy));
    assert.doesNotMatch(workflow, /cache:\s*['"]?npm['"]?\s*$/m);
  }
});
