# TDR-0001: Character lifecycle first implementation slice

## Status

Proposed

## Goal

Define the first delivery slice for character roster, creation, irreversible
confirmation checkpoints, and active-character selection.

## First Slice

- list playable characters for the signed-in account
- create a character draft or new playable character
- confirm the active character before world entry
- reserve explicit fields for stage-aware irreversible decisions
- expose one stable active-character selection result for downstream world entry

## Out of Scope

- full progression logic after world entry
- combat/runtime state mutation
- party, guild, or institution authority

## Delivery Notes

- first implementation home should be `plasius-ltd-site`
- supporting schema work is likely in `entity-manager`
- auth/profile flows remain upstream dependencies, not the owner of character
  lifecycle truth
