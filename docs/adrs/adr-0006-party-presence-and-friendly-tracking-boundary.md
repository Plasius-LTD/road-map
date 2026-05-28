# ADR-0006: Party presence and friendly-tracking truth require a dedicated service boundary

## Status

Proposed

## Context

The game canon gives the Party System explicit responsibility for group
membership, friendly-player tracking, and cooperative-state visibility, but the
audit did not find a surrounding service that owns that truth.

## Decision

- Introduce a dedicated Party Membership, Presence, and Friendly-Tracking
  System.
- Treat party truth as a sibling service to Player System orchestration rather
  than a child module hidden inside player guidance contracts.
- Make this boundary responsible for membership truth, allied presence,
  separation state, and condensed cooperative-state projections for runtime/UI
  consumers.

## Consequences

- Friendly tracking and allied overlays gain an authoritative upstream source.
- Cooperative runtime behavior can be implemented without inventing ad hoc local
  truth.
- Presence, membership, and separation semantics need dedicated contracts.
