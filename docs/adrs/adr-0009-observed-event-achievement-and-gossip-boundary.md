# ADR-0009: Observed-event projection, achievements, and gossip share one bridge pipeline

## Status

Proposed

## Context

The canon already defines a blob-backed observed-event processing model for
player recall, achievement projection, and gossip sourcing. The audited gap is
that the surrounding platform plane is still more mature for profile/account
service traffic than for gameplay event projection traffic.

## Decision

- Treat Observed-Event Projection, Achievement, and Gossip as one bridge
  pipeline rather than three isolated service systems.
- Make this boundary responsible for ingestion, normalization, compaction,
  player-safe projection, and curated read-model delivery.
- Keep hidden server-only truth out of player-facing recall, achievement, and
  gossip exports.

## Consequences

- The event-to-read-model pipeline gains one explicit service home.
- Gameplay recall and achievement work can evolve without overloading account or
  analytics-only surfaces.
- Storage-backed processing, timer triggers, and projection APIs need explicit
  operational ownership.
