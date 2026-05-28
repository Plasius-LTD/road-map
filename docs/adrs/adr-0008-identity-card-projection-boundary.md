# ADR-0008: Identity Card projection requires a dedicated runtime-facing service boundary

## Status

Proposed

## Context

The technical and lore baselines expect Identity Card projection surfaces for
players and world objects, while the audit did not find a dedicated service that
owns authoritative projection into runtime/UI consumers.

## Decision

- Introduce an Identity Card Projection and Runtime Status System.
- Treat identity-card projections as runtime-facing views over authoritative
  character and world truth, not as a new truth source.
- Make this boundary responsible for bounded disclosure, projection shaping, and
  runtime-readable status delivery for self, allies, and valid targets.

## Consequences

- Identity System surfaces gain a stable upstream source.
- Bounded disclosure rules can be centralized instead of spread across runtime
  consumers.
- New projection models and delivery APIs are required.
