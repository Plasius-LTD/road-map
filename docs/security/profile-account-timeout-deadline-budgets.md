# Profile/account timeout and deadline budgets

## Purpose

This document defines explicit timeout and deadline budgets for profile/account workflows
before implementation in `plasius-ltd-site` and supporting services.
It is the source of truth for Story [`#183`](https://github.com/Plasius-LTD/road-map/issues/183)
and the route/ownership baseline extended by Task
[`#280`](https://github.com/Plasius-LTD/road-map/issues/280) under Story
[`#192`](https://github.com/Plasius-LTD/road-map/issues/192).

## Budget principles

- Every outbound call in a request chain must have a bounded timeout.
- Budgets are budgeted by class, then scaled by call position in a chain.
- Deadline propagation is mandatory: inner calls use the remaining request budget.
- Failures must return bounded `timeout`/`deadline` errors; do not extend retries through
  request-lifetime expiry.
- Soft budgets indicate pre-alert thresholds for telemetry; hard budgets are cancellation points.

## Endpoint class budgets (profile/account surface)

| Endpoint class | Representative operations | Soft budget | Hard timeout | Error contract / fallback |
| --- | --- | --- | --- | --- |
| Interactive read | `GET /profile`, session profile bootstrap, settings page shell load | `800ms` | `1500ms` | Render partial fallback + clear loading state; show retry affordance |
| Interactive update | `PATCH /profile`, linked identity primary-switch mutation, field save | `1200ms` | `2500ms` | Preserve user input, show controlled retry state, avoid duplicate submit |
| Security-sensitive mutation | Token/session revoke, passwordless step-up confirmation callbacks | `1500ms` | `3000ms` | Keep session state machine coherent, show secure fallback state |
| OAuth callback | Identity provider callback exchange and verification | `2500ms` | `5000ms` | Continue callback state machine and surface verification failure state |
| Uploads | Avatar upload initialization, blob stage/commit, content validation | `3000ms` | `6000ms` | Retry safe checkpoint, resumable upload messaging |
| Background reconciliation | Deletion queue worker, profile retention jobs, policy sweep | `2000ms` | `5000ms` | Fail item fast, emit queue retry with bounded attempts |

## Route and endpoint ownership matrix

Owners below are accountable for keeping the budget current, implementing the fallback
contract, and providing benchmark or incident evidence when the budget changes.

| Route or endpoint surface | Endpoint class | Soft budget | Hard timeout | Primary owner | Backup owner | Evidence / notes |
| --- | --- | --- | --- | --- | --- | --- |
| `/profile` shell bootstrap and settings page hydration | Interactive read | `800ms` | `1500ms` | Platform App Owners (`frontend`) | Backend Platform | Keep aligned with profile shell and settings-page perf marks in `docs/security/profile-account-performance-slos.md` |
| `GET /profile` and linked-identity/settings read projections | Interactive read | `800ms` | `1500ms` | Backend Platform | Platform App Owners (`frontend`) | Query shaping and cache revalidation must preserve interactive-read fallback behavior |
| `PATCH /profile` editable field saves | Interactive update | `1200ms` | `2500ms` | Platform App Owners (`frontend`) | Backend Platform | Preserve user input and deterministic retry state on timeout |
| Linked-identity link/promote/unlink mutations | Interactive update | `1200ms` | `2500ms` | Backend Platform | Identity/Directory Owner | Includes ownership validation, notification emission, and audit-write budget usage |
| MFA commit and step-up confirmation callbacks | Security-sensitive mutation | `1500ms` | `3000ms` | Backend Platform | Security Engineering | Must keep session/profile mutation state coherent when verification expires or times out |
| `/oauth/logout` and server-side session/token revocation | Security-sensitive mutation | `1500ms` | `3000ms` | Backend Platform | Platform Security | Logout fallback must end in a safe unauthenticated client state even on remote failure |
| OAuth provider callback exchange and verification endpoints | OAuth callback | `2500ms` | `5000ms` | Identity/Directory Owner | Security Engineering | Exception-class route; provider latency evidence required for any budget increase |
| Avatar upload init/stage/commit endpoints | Uploads | `3000ms` | `6000ms` | Media/Storage Platform | Platform App Owners (`frontend`) | Resumable upload checkpoints and MIME/size validation remain mandatory |
| Deletion, retention, and reconciliation workers | Background reconciliation | `2000ms` | `5000ms` | Backend Platform | SRE | Queue retries must remain bounded and observable for overdue work items |

## Dependency budgets by client type

| Dependency type | Soft budget | Hard timeout | Notes |
| --- | --- | --- | --- |
| Cosmos/SQL data read | `350ms` | `800ms` | Prefer projected reads and strict query bounds |
| Cosmos/SQL data write | `500ms` | `1200ms` | Keep write batches bounded; fail fast on contention |
| Internal service call (trusted boundary) | `250ms` | `900ms` | Short TTLs required; preserve downstream budget metadata |
| Identity provider | `1200ms` | `2500ms` | No recursive token exchange retries; enforce provider timeout policy |
| Blob/listing and download pre-signed token fetch | `700ms` | `1700ms` | Validate MIME and size before full stream continuation |
| Notification/email dispatch | `800ms` | `2000ms` | Queue event on timeout for reliable retry in async worker |
| Blob upload complete path | `1200ms` | `2500ms` | Keep multipart completion bounded; reissue idempotent completion token |

## Call-chain composition rules

1. Standard interactive request paths must not allocate more than `3000ms` at
   the start. The OAuth callback, upload, and background reconciliation classes
   in the endpoint table are pre-approved high-latency classes and may use their
   listed `5000ms`/`6000ms` hard timeouts when the class is recorded in telemetry
   and the fallback/error contract is implemented. Any other request above
   `3000ms` still requires explicit exception and ticketed approval.
2. Inner dependency budgets must be <= half of parent hard timeout unless the call is
   classified as high-latency external dependency.
3. If a child budget exceeds the parent remaining budget, the child must use the parent
   remaining budget and a short per-attempt cap.
4. Timeout exceptions are only permitted for audited, queue-backed fallback paths.

## Deadline propagation pattern

- All service boundaries should use request-scoped cancellation primitives (for example
  `AbortController`, `CancellationToken`, `Context`, depending on runtime).
- Middleware should translate client request deadlines into dependency budgets.
- Deadline information should be emitted via trace metadata for correlation and audit.
- On timeout, request paths should avoid side effects beyond the failed call boundary.

## Test expectations

- Add timeout-budget unit/integration tests for representative endpoint classes.
- Add synthetic tests that validate cancellation propagation through chain boundaries.
- Add telemetry assertions on budget exceeded events and verify alerting for repeated breaches.
- Publish budget breach and fallback-path test evidence before closing Story `#183` and
  related downstream task tickets.
