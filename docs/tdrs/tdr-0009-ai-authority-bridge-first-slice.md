# TDR-0009: AI authority bridge first implementation slice

## Status

Proposed

## Goal

Define the first bounded bridge from AI/chatbot outputs into NPC dialogue,
NPC-action suggestions, and GM-style world mediation requests.

## First Slice

- accept bounded AI outputs from approved gameplay AI surfaces
- classify outputs as advisory, deterministic-checkable, or operator-gated
- translate approved outputs into stable runtime-facing authority requests
- emit audit-friendly mediation results for downstream consumers

## Out of Scope

- free-form AI control over world-authoritative state
- full autonomous NPC simulation ownership
- replacing gameplay authority validation with generic chatbot logic

## Delivery Notes

- first implementation home should be `plasius-ltd-site`
- supporting contract work is likely in `ai-game`
- runtime/world authorities remain the final owner of authoritative mutations
