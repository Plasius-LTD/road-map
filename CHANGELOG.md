# Changelog

All notable changes to this repository are tracked here.

## [Unreleased]

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
