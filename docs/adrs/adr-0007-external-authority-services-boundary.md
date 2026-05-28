# ADR-0007: Guild, institution, and commerce authority remain external to the Player System

## Status

Proposed

## Context

The current canon already states that guild quests and institutional training are
not owned by the Player System. The remaining audited gap is the lack of a
cleanly named and planned bridge service layer for those external authorities,
especially commerce.

## Decision

- Introduce an External Authority Services boundary for guild, institution, and
  commerce ownership.
- Keep guild quests externally authoritative and only synchronized into the
  Player System after acceptance or state change.
- Keep schools, barracks, academies, apprenticeships, and shops authoritative in
  their own service flows rather than inside Player System state.
- Use the Player System only as an orchestration, recommendation, and routing
  layer across those authorities.

## Consequences

- External authorities remain distinct from guidance/orchestration.
- Commerce and shop authority gain an explicit planning home instead of falling
  through profile or runtime gaps.
- Cross-service contract work is required to link Player System guidance to
  real institutional and commercial truth.
