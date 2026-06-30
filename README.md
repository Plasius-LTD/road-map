# road-map

Cross-repository planning and delivery tracking for Plasius packages.

## Validation Baseline

- Runtime baseline: Node 24 (`.nvmrc`, `package.json#engines`, `packageManager`).
- Deterministic repo validation commands:

  ```sh
  npm run build
  npm test
  npm run typecheck
  npm run test:coverage
  ```

- CI runs the same validation set for pull requests and pushes to `main`.
- Coverage is reported with `c8`, produces `coverage/lcov.info`, and enforces
  an 80% line/function floor for the ADR index tooling tests.

## Game Systems Planning

- Canonical cross-repo inventory for the current game implementation audit:
  - [`docs/game-systems-inventory.md`](./docs/game-systems-inventory.md)
- Compact hierarchy view of active-development game systems:
  - [`docs/game-systems-hierarchy.md`](./docs/game-systems-hierarchy.md)
- High-level service-to-game bridge gap document:
  - [`docs/game-service-bridge-gaps.md`](./docs/game-service-bridge-gaps.md)
- Draft issue set for missing planning and integration coverage:
  - [`docs/game-systems-missing-issue-drafts.md`](./docs/game-systems-missing-issue-drafts.md)

## Graph Package Rollout Governance

- Release governance + compatibility matrix:
  - [`docs/graph-release-governance.md`](./docs/graph-release-governance.md)
- Release notes template:
  - [`docs/templates/graph-release-notes-template.md`](./docs/templates/graph-release-notes-template.md)
- Changeset template:
  - [`docs/templates/graph-changeset-template.md`](./docs/templates/graph-changeset-template.md)

## Project Board

- Active cross-repo execution board:
  - [Plasius-LTD Project #1](https://github.com/orgs/Plasius-LTD/projects/1)
- Low-cost backlog automation runbook + helper CLI:
  - [`docs/project-board-automation.md`](./docs/project-board-automation.md)

  ```sh
  npm run project:board -- --help
  ```

## ADR Search Index

- Generated cross-repository ADR review index:
  - [`docs/adr-search-index.md`](./docs/adr-search-index.md)
  - [`docs/adr-search-index.json`](./docs/adr-search-index.json)
- Tooling design and scan rules:
  - [`docs/adr-search-index-tooling.md`](./docs/adr-search-index-tooling.md)
- Regenerate from the `road-map` repo root:

  ```sh
  npm run adr:index
  ```

- Validate committed generated outputs are current:
  This remains a workspace-level check for multi-repository review environments,
  rather than the deterministic CI baseline for this repository.

  ```sh
  npm run adr:index:check
  ```

## Security readiness references

- Profile/account security control mapping: [OWASP Top 10 + ASVS profile/account matrix](./docs/security/owasp-asvs-profile-account-controls.md)
- Profile/account threat model and data-flow diagrams: [`docs/security/profile-account-threat-model.md`](./docs/security/profile-account-threat-model.md)
- Profile/account security ownership and review cadence: [`docs/security/profile-account-security-control-ownership-and-review-cadence.md`](./docs/security/profile-account-security-control-ownership-and-review-cadence.md)
- Profile/account timeout and deadline budgets for reliability workstreams: [`docs/security/profile-account-timeout-deadline-budgets.md`](./docs/security/profile-account-timeout-deadline-budgets.md)
- Profile/account latency and memory SLO baseline targets: [`docs/security/profile-account-performance-slos.md`](./docs/security/profile-account-performance-slos.md)
- Profile/account legal/control mapping for GDPR/UK GDPR/CCPA/SOC 2: [`docs/security/profile-account-compliance-control-mapping-gdpr-ccpa-soc2.md`](./docs/security/profile-account-compliance-control-mapping-gdpr-ccpa-soc2.md)
- Profile/account compliance runbook and recurring control-review checklist: [`docs/security/profile-account-compliance-runbook.md`](./docs/security/profile-account-compliance-runbook.md)
- Profile/account explicit compliance criteria matrix (NFR-Compliance evidence): [`docs/security/profile-account-compliance-criteria-matrix.md`](./docs/security/profile-account-compliance-criteria-matrix.md)

## Governance and contribution docs

- Contribution guide: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Security policy: [`SECURITY.md`](./SECURITY.md)
- Non-functional requirements: [`NFR.md`](./NFR.md)
- Changelog: [`CHANGELOG.md`](./CHANGELOG.md)
- Release license: [`LICENSE`](./LICENSE)
- ADR index: [`docs/adrs/index.md`](./docs/adrs/index.md)
- TDR index: [`docs/tdrs/index.md`](./docs/tdrs/index.md)
