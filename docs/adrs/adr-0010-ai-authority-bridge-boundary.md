# ADR-0010: AI dialogue, NPC action, and GM mediation require a bounded authority bridge

## Status

Proposed

## Context

The platform already has chatbot and `ai-game` surfaces, and the game canon
expects AI-assisted NPC and governance behaviors. The audited gap is that there
is no clearly bounded bridge between AI outputs and runtime-authoritative world
mutation.

## Decision

- Introduce a dedicated AI authority bridge between AI/chatbot outputs and
  runtime/world authorities.
- Treat AI outputs as advisory unless they pass deterministic checks or an
  explicit operator gate.
- Keep generic chatbot surfaces separate from authoritative NPC/world mutation
  paths.
- Require runtime-facing contracts to translate approved AI outputs into bounded
  gameplay authority requests.

## Consequences

- AI-driven NPC dialogue and GM-style mediation gain one explicit trust
  boundary.
- World/runtime systems keep deterministic control over authoritative
  mutations.
- Additional mediation contracts, auditability, and policy checks are required
  before AI outputs can influence gameplay state.
