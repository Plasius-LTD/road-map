# ADR-0005: Game capabilities and unlocks require a character-scoped bridge service

## Status

Proposed

## Context

The account/profile plane already exposes capability and rollout controls, but
the game side needs a parallel character-scoped answer for stage unlocks,
institution eligibility, and gameplay surface access.

## Decision

- Introduce a dedicated Game Capabilities, Eligibility, and Unlocks System.
- Scope this system to playable-character state, stage gates, institutional
  readiness, and authority eligibility.
- Keep rollout flags and player-character unlock truth separate, even when both
  affect UI discoverability.
- Require Player System and UI surfaces to preflight against this character
  capability boundary before exposing gated actions.

## Consequences

- Character-state access rules become explicit instead of being inferred from
  profile or UI state.
- Discoverability and authorization flows gain a stable bridge contract.
- New capability/read-model APIs are required for gameplay surfaces.
