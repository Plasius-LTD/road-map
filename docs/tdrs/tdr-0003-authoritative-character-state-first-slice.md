# TDR-0003: Authoritative character state and resume first implementation slice

## Status

Proposed

## Goal

Define the first slice of durable character state, inventory/equipment truth,
and resume-safe restoration.

## First Slice

- persist a canonical character-state aggregate
- persist inventory and equipment truth separate from local runtime stores
- restore the current canonical state on resume or world re-entry
- publish a runtime-hydration shape for downstream consumers

## Out of Scope

- final economy balancing
- advanced crafting authority
- multiplayer state synchronization

## Delivery Notes

- first implementation home should be `plasius-ltd-site`
- likely supporting schema work is needed in `entity-manager`
