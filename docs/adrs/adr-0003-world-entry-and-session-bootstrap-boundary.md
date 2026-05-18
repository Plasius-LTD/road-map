# ADR-0003: Authenticated world entry and session bootstrap as a distinct bridge system

## Status

Proposed

## Context

The game runtime needs an authenticated handoff from selected character identity
into an active world/session context. The audit found runtime-facing scene
surfaces, but no clear world-entry bridge that owns spawn, resume, or region
bootstrap responsibilities.

## Decision

- Introduce a dedicated Authenticated World Entry and Session Bootstrap System.
- Require world entry to consume an authenticated active-character context rather
  than raw account/profile identity.
- Make this boundary responsible for spawn, resume, region/world target
  selection, and session bootstrap payload delivery into downstream runtime
  consumers.
- Keep scene/runtime and renderer consumers downstream of this session bootstrap
  boundary rather than letting them infer entry state ad hoc.

## Consequences

- World-entry semantics become explicit and testable.
- Continue-game, spawn, and resume flows can be implemented consistently.
- Backend/runtime APIs need dedicated contracts rather than anonymous or
  loosely-scoped runtime reads.
