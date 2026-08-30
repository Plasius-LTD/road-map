# Changelog

All notable changes to this repository are tracked here.

## [Unreleased]

- Security: Pinned patched transitive npm dependencies to clear the current audit baseline.

- Added the 93-repository RFC compliance manifest, official RFC/errata metadata
  lock, applicability and verified-gap reports, deterministic audit tooling,
  tests, ADR 0012, and a monthly read-only drift workflow for Task `#526` under
  Feature `Plasius-LTD/plasius-ltd-site#1477`.
- Refreshed the pinned default-branch inventory after remediation and recorded
  merged, released, and production-probed findings as conformant while retaining
  the explicit RFC 5646 registry-membership limitation and DPoP non-applicability.

- Added a `project:board` helper CLI, tests, and runbook for low-cost
  `Plasius-LTD-site` Project discovery and targeted status updates, plus ADR
  `0011` documenting the cursor-checkpoint query strategy for blocker Task
  `#524`.
- Added a Node 24 runtime baseline, `c8`-backed coverage command, and a pull
  request / `main` CI workflow for the `road-map` ADR tooling repository.
- Added road-map ADR search-index tooling and generated JSON/Markdown inspection
  outputs for Task `Plasius-LTD/road-map#520` under Feature
  `Plasius-LTD/plasius-ltd-site#1131`.
- Added explicit route and endpoint ownership assignments to the profile/account
  timeout budget matrix in `docs/security/profile-account-timeout-deadline-budgets.md`
  for Task `#280` under Story `#192`.
- Added profile/account latency and memory SLO baselines for Story `#192` in
  `docs/security/profile-account-performance-slos.md`, including API, UI, and memory
  stability targets.
- Added a high-level game service bridge gap document covering the missing layer
  between account/profile services and gameplay runtime systems.
- Added ADRs and TDRs for character lifecycle, world entry, authoritative
  character state, game unlocks, party presence, external authorities, Identity
  Card projection, observed-event projection, and AI authority-bridge planning.
- Added a compact tree/table hierarchy view for active-development game systems
  and their current parent/child planning relationships.
- Added a canonical game systems inventory covering documentation, ticket
  coverage, implementation depth, and current gaps across gameplay, scene, and
  GPU package families.
- Added a draft missing-issue set for central planning issues and repo tasks
  needed to close the main game runtime integration gaps.
- Added baseline governance, legal, and security docs required for docs-only repo
  standardization.
- Added `NFR.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`, and `docs/adrs/`
  to align the planning repo with active org conventions.
- Added a concrete private security reporting address to the security policy.
- Added profile/account OWASP Top 10 + ASVS control matrix for threat-modeling evidence
  (`docs/security/owasp-asvs-profile-account-controls.md`) supporting
  Feature `#169` and Story `#177` work.
- Added threat model and data-flow documentation for profile/account surfaces for
  F21.S1 (`docs/security/profile-account-threat-model.md`) supporting Story
  `#177`.
- Added profile/account security control ownership and review cadence mapping
  (`docs/security/profile-account-security-control-ownership-and-review-cadence.md`)
  for Story `#177`.
- Added explicit timeout/deadline budgets and propagation expectations for
  profile/account reliability workstreams (`docs/security/profile-account-timeout-deadline-budgets.md`)
  for Story `#231` in NFR Feature `#171`.
- Added a compliance runbook and recurring control-review checklist for profile/account
  evidence under Story `#182` (`docs/security/profile-account-compliance-runbook.md`).
- Added an explicit `NFR-Compliance` criteria matrix for Story `#182` mapping
  implemented profile/account controls to documented compliance criteria
  (`docs/security/profile-account-compliance-criteria-matrix.md`).
- Added a compliance control mapping for profile/account flows covering GDPR / UK
  GDPR / CCPA / SOC 2 touchpoints (`docs/security/profile-account-compliance-control-mapping-gdpr-ccpa-soc2.md`)
  for Story `#182` in Feature `#170`.
