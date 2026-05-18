# TDR-0004: Game capabilities and unlocks first implementation slice

## Status

Proposed

## Goal

Define the first character-scoped capability answer for stage unlocks,
institution readiness, and gated gameplay surfaces.

## First Slice

- answer what the active character may access now
- express stage unlocks separately from rollout flags
- express institution and authority readiness checks
- provide one stable capability surface for Player System and UI preflight

## Out of Scope

- long-term entitlement billing models
- admin capability-rule management
- all late-game divine gating

## Delivery Notes

- first implementation home should be `plasius-ltd-site`
- this slice should stay distinct from existing account/profile capability flows
