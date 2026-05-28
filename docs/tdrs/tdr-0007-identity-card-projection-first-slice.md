# TDR-0007: Identity Card projection first implementation slice

## Status

Proposed

## Goal

Define the first runtime-facing projection slice for player and world-object
Identity Card surfaces.

## First Slice

- publish one stable identity-card projection for the active player
- publish bounded target projections for valid runtime targets
- define disclosure rules for self, ally, and hostile/unknown targets
- provide a projection surface consumable by Player System and runtime overlays

## Out of Scope

- full combat analytics
- raw world-truth storage ownership
- late-game social ranking displays

## Delivery Notes

- first implementation home should be `plasius-ltd-site`
- supporting schema and object-shape work is likely in `entity-manager`
