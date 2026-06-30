# ADR 0011: GitHub Project board automation uses thin paged queries and cursor checkpoints

- Status: Accepted
- Date: 2026-06-30

## Context

The `Plasius-LTD-site` organisation Project is large enough that one
automation-runner account can exhaust its GitHub GraphQL budget while
enumerating candidate items. That failure is especially harmful for backlog
automation because the same run still needs GraphQL budget for `ProjectV2`
status updates after it selects a deliverable.

Using `gh project item-list` or custom full-detail GraphQL pages for the entire
board front-loads most of the budget into discovery, leaving too little for the
write operations that the workflow cannot avoid.

## Decision

Backlog automation will query the Project in two phases:

1. Resolve stable metadata such as the Project id, Status field id, and Status
   option ids once at the start of the run.
2. Page through items with a minimal GraphQL selection set and a bounded page
   count, then persist the returned cursor in automation memory for resume.

The `road-map` repository will own a small helper CLI that implements this
strategy and exposes targeted commands for:

- field discovery,
- next-item selection within a bounded scan window,
- Project status updates by name,
- linked-issue assignment and comments through REST-backed paths.

## Consequences

- Positive: routine discovery no longer burns the full GraphQL budget before the
  automation reaches status updates.
- Positive: future runs can resume from a saved cursor rather than rescanning
  the same Project prefix.
- Positive: linked-issue comments remain available even when Project writes must
  be minimized.
- Negative: candidate selection becomes windowed; strict global priority sorting
  across the entire board is traded for Project order plus local tiebreaking.
- Negative: automation memory becomes part of the operational control surface and
  must be kept current.
