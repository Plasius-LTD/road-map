# ADR-0004: Authoritative character state and resume ownership stays outside local runtime stores

## Status

Proposed

## Context

The audit found runtime-local player-state constructs for inventory, equipment,
skills, and effects, but not a clearly authoritative bridge service for durable
character state persistence, checkpointing, and resume-safe restoration.

## Decision

- Introduce a dedicated Authoritative Character State, Inventory, and Resume
  System.
- Treat renderer-local or scene-local player stores as consumer-facing runtime
  caches, not as the source of durable truth.
- Persist canonical character state, inventory, equipment, effects, and resume
  checkpoints in an authoritative service boundary.
- Restore runtime-local state only from explicit authoritative payloads.

## Consequences

- Durable character truth becomes separate from local runtime state.
- Save/load, resume, and re-entry flows gain clearer ownership.
- Inventory, equipment, effect, and checkpoint contracts need explicit canonical
  representations.
