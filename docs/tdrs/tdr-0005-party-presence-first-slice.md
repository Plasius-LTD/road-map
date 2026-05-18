# TDR-0005: Party presence and friendly-tracking first implementation slice

## Status

Proposed

## Goal

Define the first slice of party truth, allied presence, and friendly-tracking
state required by Party/System runtime surfaces.

## First Slice

- own party membership truth for the active character
- publish basic allied presence and separation state
- publish friendly-tracking summaries needed by combat-safe overlays
- expose shared-objective identifiers for downstream consumers

## Out of Scope

- full social graph/friends platform
- raid-scale coordination systems
- guild authority ownership

## Delivery Notes

- first implementation home should be `plasius-ltd-site`
- runtime/UI consumers should treat this as upstream truth, not derive it locally
