import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { execFile as execFileCallback } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import {
  buildApplicability,
  buildStandardsLock,
  inferRoles,
  inventoryLocalState,
  inventoryRepositories,
  parseErrata,
  parseRfcIndex,
  renderReport,
  resolveSuccessors,
  writeAuditOutputs,
  validateAudit
} from "../index.mjs";

const execFile = promisify(execFileCallback);

const INDEX = `<?xml version="1.0"?>
<rfc-index>
  <rfc-entry><doc-id>RFC4122</doc-id><title>A &amp; B</title><date><month>July</month><year>2005</year></date><current-status>PROPOSED STANDARD</current-status><obsoleted-by><doc-id>RFC9562</doc-id></obsoleted-by></rfc-entry>
  <rfc-entry><doc-id>RFC9562</doc-id><title>UUIDs</title><date><month>May</month><year>2024</year></date><current-status>PROPOSED STANDARD</current-status><is-also><doc-id>BCP999</doc-id></is-also><obsoletes><doc-id>RFC4122</doc-id></obsoletes><updated-by><doc-id>RFC9999</doc-id></updated-by></rfc-entry>
</rfc-index>`;

test("parses RFC index relationships and XML entities", () => {
  const index = parseRfcIndex(INDEX);
  assert.equal(index.get(4122).title, "A & B");
  assert.deepEqual(index.get(4122).obsoletedBy, [9562]);
  assert.deepEqual(index.get(9562).obsoletes, [4122]);
  assert.equal(index.get(9562).date.year, 2024);
  assert.deepEqual(index.get(9562).bcp, ["BCP999"]);
});

test("parses non-rejected errata deterministically", () => {
  const errata = parseErrata(JSON.stringify([
    { errata_id: "2", "doc-id": "RFC9562", errata_status_code: "Rejected", errata_type_code: "Technical", section: "1" },
    { errata_id: "1", "doc-id": "RFC9562", errata_status_code: "Verified", errata_type_code: "Technical", section: "2" }
  ]));
  assert.deepEqual(errata.map((item) => item.id), [1]);
  assert.equal(errata[0].rfc, 9562);
});

test("resolves obsolete RFC successor chains", () => {
  const index = parseRfcIndex(INDEX);
  assert.deepEqual(resolveSuccessors(4122, index), [9562]);
  const lock = buildStandardsLock({ retrievalDate: "2026-07-12", published: [4122], drafts: [] }, index, []);
  assert.deepEqual(lock.standards.map((item) => item.number), [4122, 9562]);
});

test("classifies every repository and suppresses irrelevant keyword-free repositories", () => {
  const repositories = [repo("auth"), repo("gpu-noise")];
  const standards = { standards: [{ id: "RFC6749", number: 6749, obsoletedBy: [] }], drafts: [] };
  const policy = {
    expectedRepositoryCount: 2,
    featureFlag: "flag",
    roles: [{ id: "oauth", repositories: ["auth"], standards: [6749] }],
    confirmedFindings: []
  };
  const rows = buildApplicability(repositories, standards, policy);
  assert.equal(rows.find((row) => row.repository === "auth").state, "unverified");
  assert.equal(rows.find((row) => row.repository === "gpu-noise").state, "not_applicable");
  assert.deepEqual(validateAudit(repositories, standards, rows, policy), []);
});

test("confirmed evidence overrides candidate classification", () => {
  const repositories = [repo("issuer")];
  const standards = { standards: [{ id: "RFC9068", number: 9068, obsoletedBy: [] }], drafts: [] };
  const policy = {
    expectedRepositoryCount: 1,
    roles: [{ id: "oauth", repositories: ["issuer"], standards: [9068] }],
    confirmedFindings: [{ id: "F1", severity: "high", standard: "RFC9068", section: "2.1", requirement: "MUST", repositories: ["issuer"], state: "nonconformant", summary: "Wrong typ.", sourceEvidence: ["src/a.ts"], testEvidence: [], remediation: "Fix typ." }]
  };
  const row = buildApplicability(repositories, standards, policy)[0];
  assert.equal(row.state, "nonconformant");
  assert.equal(row.findingId, "F1");
});

test("renders deterministic report content", () => {
  const repositories = [repo("auth")];
  const policy = { confirmedFindings: [], expectedRepositoryCount: 1 };
  const audit = { generatedAt: "2026-07-12T00:00:00.000Z", repositories, standards: { standards: [], drafts: [] }, applicability: [{ repository: "auth", standard: "platform-boundary", state: "not_applicable", findingId: null }], policy };
  const first = renderReport(audit);
  assert.equal(renderReport(audit), first);
  assert.match(first, /Primary repositories: 1/);
});

test("validation reports coverage and schema drift", () => {
  const errors = validateAudit([repo("one")], { standards: [] }, [], { expectedRepositoryCount: 2 });
  assert.ok(errors.some((message) => message.includes("Expected 2")));
  assert.ok(errors.some((message) => message.includes("no classification")));
});

test("role inference supports exact repositories and bounded patterns", () => {
  const policy = { roles: [
    { id: "exact", repositories: ["api"] },
    { id: "pattern", patterns: ["graph"] },
    { id: "unrelated", patterns: ["oauth"] }
  ] };
  assert.deepEqual(inferRoles("api", policy), ["exact"]);
  assert.deepEqual(inferRoles("graph-api", policy), ["pattern"]);
  assert.deepEqual(inferRoles("gpu-noise", policy), []);
});

test("writes all deterministic outputs and detects drift in check mode", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "rfc-audit-"));
  const repositories = [repo("auth")];
  const policy = { confirmedFindings: [], expectedRepositoryCount: 1, featureFlag: "flag" };
  const audit = {
    generatedAt: "2026-07-12T00:00:00.000Z",
    repositories,
    standards: { schemaVersion: 1, standards: [], drafts: [] },
    applicability: [{ ...baseClassification("auth") }],
    policy
  };
  try {
    assert.deepEqual((await writeAuditOutputs(audit, directory)).sort(), ["applicability.json", "report.md", "repositories.json", "standards.json"]);
    assert.deepEqual(await writeAuditOutputs(audit, directory, true), []);
    assert.match(await readFile(path.join(directory, "report.md"), "utf8"), /Repository applicability matrix/);
    const changed = { ...audit, generatedAt: "2026-07-13T00:00:00.000Z" };
    assert.ok((await writeAuditOutputs(changed, directory, true)).includes("repositories.json"));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("inventories authenticated remote defaults and records local deltas", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "rfc-inventory-"));
  const checkout = path.join(directory, "sample");
  const bare = path.join(directory, "sample.git");
  const originalFetch = globalThis.fetch;
  try {
    await execFile("git", ["init", "--initial-branch=main", checkout]);
    await execFile("git", ["config", "user.email", "audit@example.invalid"], { cwd: checkout });
    await execFile("git", ["config", "user.name", "Audit Test"], { cwd: checkout });
    await import("node:fs/promises").then(({ writeFile }) => writeFile(path.join(checkout, "README.md"), "test\n"));
    await execFile("git", ["add", "README.md"], { cwd: checkout });
    await execFile("git", ["commit", "-m", "test"], { cwd: checkout });
    await execFile("git", ["clone", "--bare", checkout, bare]);
    await execFile("git", ["remote", "add", "origin", "https://github.com/Plasius-LTD/sample.git"], { cwd: checkout });
    const head = (await execFile("git", ["rev-parse", "HEAD"], { cwd: checkout })).stdout.trim();
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => [{ name: "sample", full_name: "Plasius-LTD/sample", archived: false, disabled: false, fork: false, clone_url: bare, default_branch: "main", html_url: "https://github.com/Plasius-LTD/sample" }]
    });
    const policy = { owner: "Plasius-LTD", roles: [{ id: "sample-role", repositories: ["sample"], standards: [] }] };
    const rows = await inventoryRepositories({ workspaceRoot: directory, policy, githubToken: "test-token" });
    assert.equal(rows.length, 1);
    assert.equal(rows[0].pinnedCommit, head);
    assert.deepEqual(rows[0].roles, ["sample-role"]);
    assert.equal(rows[0].localState.summary, "matches authoritative main");
    const remoteOnlyRows = await inventoryRepositories({
      workspaceRoot: directory,
      policy,
      githubToken: "test-token",
      includeLocalState: false,
    });
    assert.equal(remoteOnlyRows[0].localState.summary, "Recorded separately in local-state.json");
    const localSnapshot = await inventoryLocalState({ workspaceRoot: directory, repositories: rows });
    assert.equal(localSnapshot[0].repository, "sample");
    assert.equal(localSnapshot[0].localState.summary, "matches authoritative main");
  } finally {
    globalThis.fetch = originalFetch;
    await rm(directory, { recursive: true, force: true });
  }
});

function repo(name) {
  return { name, owner: "Plasius-LTD", pinnedCommit: "a".repeat(40), roles: [], localState: { summary: "not checked out" } };
}

function baseClassification(repository) {
  return { repository, standard: "platform-boundary", section: null, requirement: null, role: null, state: "not_applicable", rationale: "No direct role.", owner: "Plasius-LTD", sourceEvidence: [], testEvidence: [], findingId: null, severity: null, remediation: null };
}
