# ADR-0001: Baseline alignment for planning repository governance

## Status

Accepted

## Context

`road-map` functions as a process and planning repository and previously lacked
standard baseline governance files expected across repo families.

## Decision

- Add missing baseline files (`CHANGELOG.md`, `CONTRIBUTING.md`,
  `SECURITY.md`, `LICENSE`, `NFR.md`) and a minimal ADR index/docs scaffold to
  establish explicit governance.
- Keep all additions additive and non-functional with no behavior impact.

## Consequences

- Planning docs now have explicit operational expectations and release-safety
  checks for future changes.
- Review and onboarding paths are explicit and easier to validate during future
  audits.
