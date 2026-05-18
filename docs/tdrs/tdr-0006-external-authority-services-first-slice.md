# TDR-0006: External authority services first implementation slice

## Status

Proposed

## Goal

Define the first service slice for guild, institution, and commerce authorities
that remain external to the Player System.

## First Slice

- keep guild quest truth external and synchronizable
- expose institution readiness/admission checks for schools, barracks,
  academies, and apprenticeships
- expose a first commerce/shop authority surface
- provide stable authority-hand-off points for Player System orchestration

## Out of Scope

- full economy simulation
- all late-stage divine influence systems
- replacing Player System guidance behavior

## Delivery Notes

- first implementation home should be `plasius-ltd-site`
- existing guild/training issues should be reused where they already cover part
  of this slice
