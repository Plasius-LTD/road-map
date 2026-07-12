import { execFile as execFileCallback } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
export const STATES = new Set(["conformant", "partial", "nonconformant", "delegated", "not_applicable", "unverified"]);

export function parseRfcIndex(xml) {
  const entries = new Map();
  for (const match of xml.matchAll(/<rfc-entry>([\s\S]*?)<\/rfc-entry>/g)) {
    const block = match[1];
    const number = Number(textValue(block, "doc-id")?.replace(/^RFC/, ""));
    if (!number) continue;
    entries.set(number, {
      id: `RFC${number}`,
      number,
      title: decodeXml(textValue(block, "title") ?? ""),
      date: parseDate(block),
      status: textValue(block, "current-status")?.toLowerCase() ?? "unknown",
      stream: textValue(block, "stream") ?? null,
      bcp: documentIds(block, "is-also").filter((id) => id.startsWith("BCP")),
      updates: documentNumbers(block, "updates"),
      updatedBy: documentNumbers(block, "updated-by"),
      obsoletes: documentNumbers(block, "obsoletes"),
      obsoletedBy: documentNumbers(block, "obsoleted-by"),
      url: `https://www.rfc-editor.org/info/rfc${number}`
    });
  }
  return entries;
}

export function parseErrata(json) {
  const rows = JSON.parse(json);
  return rows
    .filter((row) => row.errata_status_code !== "Rejected")
    .map((row) => ({
      id: Number(row.errata_id),
      rfc: Number(row["doc-id"]?.replace(/^RFC/, "")),
      status: row.errata_status_code,
      type: row.errata_type_code,
      section: row.section || null,
      submitted: row.submit_date || null,
      url: `https://www.rfc-editor.org/errata/eid${row.errata_id}`
    }))
    .sort((a, b) => a.id - b.id);
}

export function resolveSuccessors(number, index) {
  const visited = new Set();
  const successors = [];
  const visit = (current) => {
    if (visited.has(current)) return;
    visited.add(current);
    for (const next of index.get(current)?.obsoletedBy ?? []) {
      successors.push(next);
      visit(next);
    }
  };
  visit(number);
  return [...new Set(successors)];
}

export function buildStandardsLock(seed, index, errata) {
  const requested = new Set(seed.published);
  for (const number of seed.published) {
    for (const related of resolveSuccessors(number, index)) requested.add(related);
  }
  const standards = [...requested].sort((a, b) => a - b).map((number) => {
    const entry = index.get(number);
    if (!entry) throw new Error(`RFC ${number} is missing from the RFC index.`);
    return { ...entry, technicalErrata: errata.filter((item) => item.rfc === number) };
  });
  return {
    schemaVersion: 1,
    generatedBy: "road-map/tools/rfc-audit",
    retrievalDate: seed.retrievalDate,
    authorities: {
      rfcIndex: "https://www.rfc-editor.org/rfc-index.xml",
      errata: "https://www.rfc-editor.org/errata.json"
    },
    standards,
    drafts: [...seed.drafts].sort((a, b) => a.id.localeCompare(b.id))
  };
}

export function inferRoles(repositoryName, policy) {
  return policy.roles.filter((role) =>
    role.repositories?.includes(repositoryName) ||
    role.patterns?.some((pattern) => repositoryName.toLowerCase().includes(pattern))
  ).map((role) => role.id).sort();
}

export function buildApplicability(repositories, standardsLock, policy) {
  const knownStandards = new Set(standardsLock.standards.map((entry) => entry.id));
  const rows = [];
  for (const repository of repositories) {
    const roles = inferRoles(repository.name, policy);
    const applicable = new Map();
    for (const role of policy.roles.filter((item) => roles.includes(item.id))) {
      for (const number of role.standards ?? []) applicable.set(`RFC${number}`, role.id);
      for (const draft of role.drafts ?? []) applicable.set(draft, role.id);
    }
    if (applicable.size === 0) {
      rows.push(baseRow(repository, "platform-boundary", "not_applicable", "No direct protocol implementation role was found; platform behavior remains delegated at integration boundaries."));
      continue;
    }
    for (const [standard, role] of [...applicable].sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))) {
      if (standard.startsWith("RFC") && !knownStandards.has(standard)) continue;
      rows.push(baseRow(repository, standard, "unverified", `Candidate applicability derived from the ${role} implementation role; clause-level verification is pending.` , role));
    }
  }
  for (const finding of policy.confirmedFindings) {
    for (const repositoryName of finding.repositories) {
      if (!repositories.some((repo) => repo.name === repositoryName)) {
        throw new Error(`Finding ${finding.id} references ${repositoryName}, which is absent from the repository manifest.`);
      }
      const row = rows.find((item) => item.repository === repositoryName && item.standard === finding.standard);
      const replacement = {
        ...(row ?? baseRow(repositories.find((repo) => repo.name === repositoryName), finding.standard, finding.state, finding.summary)),
        section: finding.section,
        requirement: finding.requirement,
        state: finding.state,
        rationale: finding.summary,
        sourceEvidence: finding.sourceEvidence,
        testEvidence: finding.testEvidence,
        findingId: finding.id,
        severity: finding.severity,
        remediation: finding.remediation
      };
      if (row) Object.assign(row, replacement); else rows.push(replacement);
    }
  }
  return rows.sort((a, b) => a.repository.localeCompare(b.repository) || a.standard.localeCompare(b.standard, undefined, { numeric: true }));
}

export function validateAudit(repositories, lock, applicability, policy) {
  const errors = [];
  if (repositories.length !== policy.expectedRepositoryCount) errors.push(`Expected ${policy.expectedRepositoryCount} repositories, found ${repositories.length}.`);
  const names = new Set(repositories.map((repo) => repo.name));
  for (const repo of repositories) if (!applicability.some((row) => row.repository === repo.name)) errors.push(`${repo.name} has no classification.`);
  for (const row of applicability) {
    if (!names.has(row.repository)) errors.push(`Classification references unknown repository ${row.repository}.`);
    if (!STATES.has(row.state)) errors.push(`${row.repository}/${row.standard} has invalid state ${row.state}.`);
    if (!row.rationale || !row.owner) errors.push(`${row.repository}/${row.standard} lacks rationale or owner.`);
  }
  for (const standard of lock.standards) {
    for (const successor of standard.obsoletedBy) if (!lock.standards.some((item) => item.number === successor)) errors.push(`${standard.id} successor RFC${successor} is not locked.`);
  }
  return errors;
}

export function renderReport(audit) {
  const counts = countBy(audit.applicability, "state");
  const findings = audit.policy.confirmedFindings;
  const lines = [
    "# Plasius RFC Compliance Audit",
    "",
    `Generated from authoritative default branches pinned on ${audit.generatedAt.slice(0, 10)}. Local changes are recorded separately and are not treated as authoritative evidence.`,
    "",
    "## Coverage",
    "",
    `- Primary repositories: ${audit.repositories.length}`,
    `- Published RFCs locked: ${audit.standards.standards.length}`,
    `- Explicitly adopted drafts: ${audit.standards.drafts.length}`,
    `- Applicable classifications: ${audit.applicability.length}`,
    `- States: ${Object.entries(counts).sort().map(([key, value]) => `${key} ${value}`).join(", ")}`,
    "",
    "## Verified gaps",
    "",
    "| Severity | Finding | RFC section | Repositories | State | Remediation |",
    "| --- | --- | --- | --- | --- | --- |",
    ...findings.map((item) => `| ${item.severity} | ${item.id}: ${escapeCell(item.summary)} | ${item.standard} §${item.section} | ${item.repositories.join(", ")} | ${item.state} | ${escapeCell(item.remediation)} |`),
    "",
    "## Repository applicability matrix",
    "",
    "| Repository | Pinned commit | Roles | Applicable standards | Confirmed gaps | Local state |",
    "| --- | --- | --- | --- | --- | --- |"
  ];
  for (const repo of audit.repositories) {
    const rows = audit.applicability.filter((row) => row.repository === repo.name);
    const standards = rows.filter((row) => row.standard !== "platform-boundary").map((row) => `${row.standard} (${row.state})`).join(", ") || "Delegated platform boundary only";
    const gaps = rows.filter((row) => row.findingId).map((row) => row.findingId).join(", ") || "None verified";
    lines.push(`| ${repo.name} | \`${repo.pinnedCommit.slice(0, 12)}\` | ${repo.roles.join(", ") || "none"} | ${standards} | ${gaps} | ${escapeCell(repo.localState.summary)} |`);
  }
  lines.push("", "## Scope notes", "", "- `unverified` is an explicit queue for clause-level evidence, not a compliance claim.", "- `delegated` means the integration boundary was checked while protocol internals remain owned by Node.js, browsers, Azure, TLS, CDN, or another named dependency.", "- OAuth 2.1 draft-15 is reported separately from published RFCs.", "- SSE, MCP, glTF, WebGPU, WebXR, IFC, STEP, and other non-IETF specifications are companion standards outside this clause-level RFC audit.", "");
  return lines.join("\n");
}

export async function fetchJson(url, token) {
  const response = await fetch(url, { headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
  if (!response.ok) throw new Error(`GET ${url} failed: ${response.status}`);
  return response.json();
}

export async function inventoryRepositories({ workspaceRoot, policy, githubToken = process.env.GITHUB_TOKEN }) {
  const remote = githubToken
    ? await fetchAllRepositories(policy.owner, githubToken)
    : await repositoriesViaGitHubCli(policy.owner);
  const primary = remote.filter((repo) => !repo.archived && !repo.disabled && !repo.fork).sort((a, b) => a.name.localeCompare(b.name));
  const local = await localRepositories(workspaceRoot);
  const repositories = [];
  for (const repo of primary) {
    const pinnedCommit = await remoteHead(repo.clone_url, repo.default_branch);
    const checkouts = local.filter((entry) => entry.slug?.toLowerCase() === repo.full_name.toLowerCase());
    repositories.push({
      name: repo.name,
      owner: policy.owner,
      slug: repo.full_name,
      lifecycle: "active",
      defaultBranch: repo.default_branch,
      pinnedCommit,
      roles: inferRoles(repo.name, policy),
      localState: summarizeLocal(checkouts, pinnedCommit),
      remoteUrl: repo.html_url
    });
  }
  return repositories;
}

async function fetchAllRepositories(owner, token) {
  const remote = [];
  for (let page = 1; ; page += 1) {
    const batch = await fetchJson(`https://api.github.com/orgs/${owner}/repos?type=all&per_page=100&page=${page}`, token);
    remote.push(...batch);
    if (batch.length < 100) break;
  }
  return remote;
}

async function repositoriesViaGitHubCli(owner) {
  try {
    const { stdout } = await execFile("gh", ["api", "--paginate", "--slurp", `orgs/${owner}/repos?type=all&per_page=100`], { maxBuffer: 50 * 1024 * 1024 });
    return JSON.parse(stdout).flat();
  } catch {
    return fetchAllRepositories(owner);
  }
}

export async function writeAuditOutputs(audit, outputDirectory, check = false) {
  const files = new Map([
    ["repositories.json", stableJson({ schemaVersion: 1, generatedAt: audit.generatedAt, repositories: audit.repositories })],
    ["standards.json", stableJson(audit.standards)],
    ["applicability.json", stableJson({ schemaVersion: 1, generatedAt: audit.generatedAt, featureFlag: audit.policy.featureFlag, classifications: audit.applicability, findings: audit.policy.confirmedFindings })],
    ["report.md", renderReport(audit)]
  ]);
  const changed = [];
  for (const [name, content] of files) {
    const file = path.join(outputDirectory, name);
    const existing = await readFile(file, "utf8").catch(() => null);
    if (existing !== content) changed.push(name);
    if (!check) { await mkdir(outputDirectory, { recursive: true }); await writeFile(file, content); }
  }
  return changed;
}

export const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

function baseRow(repository, standard, state, rationale, role = null) {
  if (!repository) throw new Error(`Finding for ${standard} references a repository absent from the manifest.`);
  return { repository: repository.name, standard, section: null, requirement: null, role, state, rationale, owner: repository.owner, sourceEvidence: [], testEvidence: [], findingId: null, severity: null, remediation: null };
}
function textValue(block, tag) { return block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1]?.trim(); }
function documentNumbers(block, tag) { const section = textValue(block, tag) ?? ""; return [...section.matchAll(/<doc-id>RFC(\d+)<\/doc-id>/g)].map((match) => Number(match[1])); }
function documentIds(block, tag) { const section = textValue(block, tag) ?? ""; return [...section.matchAll(/<doc-id>([^<]+)<\/doc-id>/g)].map((match) => match[1]); }
function parseDate(block) { const section = textValue(block, "date") ?? ""; return { month: textValue(section, "month") ?? null, year: Number(textValue(section, "year")) || null }; }
function decodeXml(value) { return value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"').replaceAll("&apos;", "'"); }
function countBy(rows, key) { return rows.reduce((counts, row) => ({ ...counts, [row[key]]: (counts[row[key]] ?? 0) + 1 }), {}); }
function escapeCell(value) { return String(value).replaceAll("|", "\\|").replaceAll("\n", " "); }
async function remoteHead(url, branch) { const { stdout } = await execFile("git", ["ls-remote", url, `refs/heads/${branch}`]); const sha = stdout.trim().split(/\s+/)[0]; if (!sha) throw new Error(`Cannot resolve ${url}#${branch}.`); return sha; }
async function localRepositories(root) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(root, { withFileTypes: true });
  const result = [];
  for (const entry of entries.filter((item) => item.isDirectory())) {
    const cwd = path.join(root, entry.name);
    try {
      const [{ stdout: remote }, { stdout: branch }, { stdout: head }, { stdout: status }] = await Promise.all([
        execFile("git", ["remote", "get-url", "origin"], { cwd }), execFile("git", ["branch", "--show-current"], { cwd }), execFile("git", ["rev-parse", "HEAD"], { cwd }), execFile("git", ["status", "--porcelain"], { cwd })
      ]);
      const slug = remote.trim().replace(/^.*github\.com[/:]/, "").replace(/\.git$/, "");
      result.push({ path: cwd, slug, branch: branch.trim(), head: head.trim(), dirtyFiles: status.trim() ? status.trim().split("\n").length : 0 });
    } catch { /* not a top-level Git checkout */ }
  }
  return result;
}
function summarizeLocal(checkouts, pinned) {
  if (checkouts.length === 0) return { checkoutCount: 0, summary: "not checked out", checkouts: [] };
  const described = checkouts.map((item) => ({ path: path.basename(item.path), branch: item.branch, head: item.head, matchesPinnedCommit: item.head === pinned, dirtyFiles: item.dirtyFiles }));
  const deltas = described.filter((item) => !item.matchesPinnedCommit || item.dirtyFiles > 0 || item.branch !== "main");
  return { checkoutCount: described.length, summary: deltas.length ? `${deltas.length} checkout(s) differ from authoritative main` : "matches authoritative main", checkouts: described };
}
