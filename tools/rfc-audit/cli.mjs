#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildApplicability, buildStandardsLock, inventoryRepositories, parseErrata, parseRfcIndex, validateAudit, writeAuditOutputs } from "./index.mjs";

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(moduleDirectory, "../..");
const args = new Set(process.argv.slice(2));
const mode = args.has("--refresh") ? "refresh" : args.has("--check") ? "check" : "generate";
const output = path.join(root, "docs/compliance/rfc");
const seed = JSON.parse(await readFile(path.join(moduleDirectory, "config/standards-seed.json"), "utf8"));
const policy = JSON.parse(await readFile(path.join(moduleDirectory, "config/audit-policy.json"), "utf8"));

try {
  let repositories;
  let standards;
  if (mode === "refresh") {
    const [xmlResponse, errataResponse] = await Promise.all([fetch("https://www.rfc-editor.org/rfc-index.xml"), fetch("https://www.rfc-editor.org/errata.json")]);
    if (!xmlResponse.ok || !errataResponse.ok) throw new Error("Unable to retrieve authoritative RFC metadata.");
    standards = buildStandardsLock(seed, parseRfcIndex(await xmlResponse.text()), parseErrata(await errataResponse.text()));
    repositories = await inventoryRepositories({ workspaceRoot: path.dirname(root), policy });
  } else {
    standards = JSON.parse(await readFile(path.join(output, "standards.json"), "utf8"));
    repositories = JSON.parse(await readFile(path.join(output, "repositories.json"), "utf8")).repositories;
  }
  const applicability = buildApplicability(repositories, standards, policy);
  const generatedAt = mode === "refresh" ? `${seed.retrievalDate}T00:00:00.000Z` : JSON.parse(await readFile(path.join(output, "repositories.json"), "utf8")).generatedAt;
  const audit = { generatedAt, repositories, standards, applicability, policy };
  const errors = validateAudit(repositories, standards, applicability, policy);
  if (errors.length) throw new Error(errors.join("\n"));
  const changed = await writeAuditOutputs(audit, output, mode === "check");
  if (mode === "check" && changed.length) throw new Error(`RFC audit drift detected: ${changed.join(", ")}.`);
  console.log(`${mode === "check" ? "Checked" : "Generated"} RFC audit: ${repositories.length} repositories, ${standards.standards.length} RFCs, ${applicability.length} classifications.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
