# TDR-0002: World entry and session bootstrap first implementation slice

## Status

Proposed

## Goal

Define the first authenticated bridge from selected character identity into
world/session bootstrap payloads consumed by runtime systems.

## First Slice

- accept authenticated active-character input
- validate target world/session selection rules
- support spawn or resume bootstrap shape
- emit one bootstrap payload for scene/runtime consumers
- include enough metadata for Player System and renderer initialization

## Out of Scope

- full world-authority simulation ownership
- cooperative presence or party membership
- long-term save-state persistence

## Delivery Notes

- first implementation home should be `plasius-ltd-site`
- downstream consumers include scene/runtime, renderer, and Player System
