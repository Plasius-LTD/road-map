# Profile/account performance SLO baseline

This document defines latency and memory targets for the profile/account surface before/through rollout of Story [`#192`](https://github.com/Plasius-LTD/road-map/issues/192).

## 1) Objective

- Make p50/p95/p99 latency and memory stability requirements explicit and auditable.
- Provide explicit acceptance thresholds for frontend and backend profile/account flows.
- Define the monitoring and review cadence for sustained SLO and memory drift.
- Bind thresholds to release-safe rollback criteria.

## 2) Latency SLOs

All profile/account traffic covered by this document is part of the same profile/account service boundary described in the timeout budget documentation.

### 2.1 API response SLOs

| Flow | Route class | p50 target | p95 target | p99 target | Notes |
| --- | --- | --- | --- | --- | --- |
| Profile shell bootstrap | Interactive read | `400ms` | `900ms` | `1.5s` | Includes profile bootstrap hydration + feature-flag gate checks |
| Profile read/detail query | Interactive read | `350ms` | `800ms` | `1.4s` | Includes profile settings read + linked identity projection |
| Profile mutation save | Interactive update | `550ms` | `1.5s` | `2.8s` | Includes ownership validation and cache revalidation |
| Linked-identity promotion | Critical mutation | `700ms` | `1.8s` | `3.2s` | Includes notification emission and audit write |
| MFA mutation state checks | Security-sensitive | `500ms` | `1.1s` | `2.2s` | Includes verification token verification and fallback handling |
| Avatar upload staged path | User-visible async-safe path | `1.3s` | `3.0s` | `5.5s` | End-to-end checkpointed flow with resumable recovery |
| OAuth callback exchange | OAuth callback class | `1.8s` | `3.6s` | `6.0s` | Exception class; aligned with timeout/deadline exception policy |

### 2.2 Frontend render and interaction SLOs

| UI event | p50 target | p95 target | p99 target | Notes |
| --- | --- | --- | --- | --- |
| Profile page first paint (`/profile`) | `400ms` | `1.0s` | `1.6s` | Measured from navigation to first paint in perf marks |
| Profile save interaction complete | `600ms` | `1.5s` | `3.0s` | Includes confirmation/fallback UI states |
| Avatar modal open/close interaction | `100ms` | `220ms` | `450ms` | Accessibility and focus states included |

### 2.3 Throughput and saturation targets

- Baseline request concurrency for profile/account interactive reads should remain under `250 RPS` per instance average with no sustained error-rate increase.
- Error budget burn must remain below `1%` of requests exceeding p99 targets during a 7-day rolling period.
- Any sustained p95 or p99 breach for more than `15 min` requires on-call investigation and mitigation ticket.

## 3) Memory stability SLOs

### 3.1 Backend memory stability

- Average container memory RSS baseline target: `<= 310 MB` (7-day rolling).
- Peak `p95` RSS over a 5-minute window: `<= 420 MB`.
- Peak `p99` RSS over a 5-minute window: `<= 520 MB`.
- Heap trend must remain bounded: +`4 MB/min` max slope over any 30-minute continuous window in stable synthetic baseline runs.
- GC pressure in normal traffic should stay below `6 collections / min` with no growth slope in old-space after warmup.

### 3.2 In-browser memory stability

- Logged-in profile/dashboard session baseline heap: `<= 220 MB` (p95).
- In-session growth over 20-minute steady activity window: no trend increase beyond `2.5 MB/min`.
- Any tab session with sustained growth above the above threshold for three consecutive windows must trigger investigation and memory release action.

### 3.3 Data-path memory safety checks

- Cache snapshots must avoid full-entity deep copies for large profile-linked collections.
- Streaming data should remain bounded by request-size and projection bounds enforced at query boundaries.
- Retry/failure branches must not accumulate unbounded response buffers.

## 4) Verification and ownership

- A synthetic benchmark run must produce p50/p95/p99 metrics for all rows in sections 2.1–2.2 and submit them to evidence artifacts.
- Memory snapshots must be collected at least nightly from one production-equivalent environment.
- This document is reviewed jointly under Story `#192` with implementation teams from `plasius-ltd-site` and supporting packages.
