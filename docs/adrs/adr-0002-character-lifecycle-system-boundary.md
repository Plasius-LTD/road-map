# ADR-0002: Character lifecycle system as a dedicated bridge boundary

## Status

Proposed

## Context

The platform already supports account identity and profile management, while the
game canon expects a playable character lifecycle with stage-aware path
confirmation before normal gameplay progression.

The current audited gap is the absence of a dedicated bridge boundary between:

- signed-in account/profile identity
- playable character identity
- active character selection before gameplay/world entry

## Decision

- Introduce a dedicated Character Lifecycle System between account/profile
  services and gameplay runtime entry.
- Keep account identity separate from playable character identity.
- Make this boundary responsible for character roster, character creation,
  irreversible confirmation checkpoints, and active-character selection.
- Keep gameplay runtime consumers downstream of an explicit active-character
  handoff rather than reading profile state directly.

## Consequences

- The login-to-game funnel gains a clear intermediate step instead of jumping
  straight from account/profile surfaces into runtime systems.
- Character identity, roster ownership, and irreversible progression decisions
  become easier to audit and evolve safely.
- New contracts and service endpoints are required before world entry can be
  treated as complete.
