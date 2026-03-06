# Graph Package Release Governance

## Scope

This document defines the cross-repo rollout policy for:

- `@plasius/graph-contracts`
- `@plasius/graph-client-core`
- `@plasius/graph-client-react`
- `@plasius/graph-gateway-core`
- `@plasius/graph-cache-redis`
- `@plasius/graph-events`
- `@plasius/graph-write-coordinator`
- `@plasius/graph-runtime-azure-functions`

## Publish Order

1. `@plasius/graph-contracts`
2. `@plasius/graph-client-core`
3. `@plasius/graph-client-react`
4. `@plasius/graph-gateway-core`
5. `@plasius/graph-cache-redis`
6. `@plasius/graph-events`
7. `@plasius/graph-write-coordinator`
8. `@plasius/graph-runtime-azure-functions`

Rationale: publish shared contracts first, then consumer packages in dependency order.

## Compatibility Matrix

| Package | Depends On | Compatibility Rule |
|---|---|---|
| `graph-contracts` | none | SemVer source of truth for shared contracts and ports |
| `graph-client-core` | `graph-contracts` | Must support current + previous non-breaking contracts minor |
| `graph-client-react` | `graph-client-core`, `graph-contracts` | Must align with `graph-client-core` minor line |
| `graph-gateway-core` | `graph-contracts` | Must support current contract schema versions |
| `graph-cache-redis` | `graph-contracts` | Must preserve cache envelope compatibility |
| `graph-events` | `graph-contracts` | Must enforce event schema compatibility guard |
| `graph-write-coordinator` | `graph-contracts` | Must preserve write operation lifecycle contract |
| `graph-runtime-azure-functions` | gateway + coordinator + contracts | Must remain host-only adapter with no contract forks |

## Release Gates (Per Package)

Before publishing any graph package:

1. Lint, typecheck, tests, and build pass in CI.
2. `README.md` updated for user-facing behavior changes.
3. `CHANGELOG.md` updated with release-relevant entries.
4. New ADR added when architecture/behavior contract changes.
5. Acceptance criteria issue includes evidence comment and checkbox validation.
6. Project board item moved out of `Backlog` and synced to current status.

## Cross-Repo Dependency Update Workflow

1. Publish dependency package version.
2. Update dependent repos to new version range.
3. Run dependent repo lint/type/test/build.
4. Merge/push dependency update in each affected repo.
5. Add/update `road-map` issue comment with:
   - package versions,
   - linked commits,
   - CI run references.
6. Move project board item status to reflect completion (`Ready` or `Done`).

## Release Notes / Changeset Template

Use:

- [`docs/templates/graph-release-notes-template.md`](./templates/graph-release-notes-template.md)
- [`docs/templates/graph-changeset-template.md`](./templates/graph-changeset-template.md)

## Initial Milestone Plan

### Milestone 1: Baseline Contracts and Core Flow

- Contracts, client core, gateway core, write coordinator initial release.
- Acceptance: issue `#2`, `#3`, `#5`, `#8`.

### Milestone 2: React + Cache + Events Hardening

- React bindings, redis adapter resilience, event ordering + telemetry.
- Acceptance: issue `#4`, `#6`, `#7`.

### Milestone 3: Runtime Adapter + Governance Lock

- Runtime host adapter hardening and governance process finalization.
- Acceptance: issue `#9`, `#10`, `#12`.
