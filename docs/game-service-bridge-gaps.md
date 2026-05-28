# Game Service Bridge Gaps

## Purpose

This document captures the missing bridge systems between the existing
account/profile service plane and the in-game runtime systems already being
planned and implemented.

- Audit date: `2026-05-15`
- Related game inventory:
  - [`game-systems-inventory.md`](./game-systems-inventory.md)
  - [`game-systems-hierarchy.md`](./game-systems-hierarchy.md)
  - [`game-systems-missing-issue-drafts.md`](./game-systems-missing-issue-drafts.md)

## Current Transition Problem

The current platform already has meaningful surrounding services:

- account/session identity through `@plasius/auth`
- profile/settings and avatar flows through `@plasius/profile`
- account/profile graph rollouts in `plasius-ltd-site`
- generic API, storage, analytics, graph, and translation services

The game side already has meaningful runtime planning:

- Player System orchestration
- scene/runtime composition
- renderer and `gpu-*` runtime families
- external authority package boundaries for spellcraft, item crafting, and
  dungeon crafting

The missing layer is the bridge between those two planes.

In practice, the current flow is still much closer to:

`auth -> account/profile -> game runtime`

The target flow needs to be closer to:

`auth -> account/profile -> character lifecycle -> world/session bootstrap -> authoritative character/world state -> gameplay runtime`

## Missing Systems Summary

| Missing system | Main bridge role | Current upstream plane | Current downstream plane |
| --- | --- | --- | --- |
| Character Lifecycle System | Move from account identity to playable character identity | `auth`, `profile`, account graph | Player System, world entry, progression |
| Authenticated World Entry and Session Bootstrap System | Move from selected character into an active world/runtime session | character lifecycle, auth/session | scene runtime, renderer, Player System |
| Authoritative Character State, Inventory, and Resume System | Persist and restore durable game state | world entry, profile linkage, ledgers | Player System, renderer, crafting, quests |
| Game Capabilities, Eligibility, and Unlocks System | Expose what the current character may access right now | auth/profile, character state, progression truth | Player System, UI, external authority systems |
| Party Membership, Presence, and Friendly-Tracking System | Provide party truth and allied state handoffs | character/session state | Party overlays, route cues, cooperative play |
| External Authority Services for Guild, Institution, and Commerce | Provide non-Player-System authority surfaces | character state, stage unlocks, social context | guild quests, training, shops, crafting handoff |
| Identity Card Projection and Runtime Status System | Project authoritative character/object state into runtime-readable surfaces | character/world state, entity truth | Identity System, target overlays, scene/runtime |
| Observed-Event Projection, Achievement, and Gossip Pipeline | Convert raw observed events into player-facing read models | gameplay event ingestion, storage, timers | Event Log, achievements, gossip, Player System recall |
| AI Dialogue, NPC Action, and GM Authority Bridge System | Bound AI outputs before they can affect authoritative game state | `chatbot`, `ai-game`, governance/evals | NPC dialogue, GM mediation, world/runtime authorities |

## Gap Details

### 1. Character Lifecycle System

Problem:

- Account and profile identity already exist, but there is no dedicated bridge
  system for character roster, character creation, character selection, and
  active-character ownership.
- The game canon expects deterministic path confirmation, feature selection,
  name, gender, and social-form lock before normal social gameplay.

Bridge responsibility:

- list playable characters for the signed-in account
- create a new playable character or draft
- confirm irreversible character choices at the correct stage
- select the active character for continuation into gameplay

### 2. Authenticated World Entry and Session Bootstrap System

Problem:

- The current backend/runtime shape exposes scene runtime data, but there is no
  dedicated authenticated handoff from selected character to active world
  session, spawn context, or resume flow.

Bridge responsibility:

- accept an authenticated active character
- choose or validate target world/session/region context
- establish spawn, resume, or re-entry context
- hand authoritative session bootstrap data into scene/runtime consumers

### 3. Authoritative Character State, Inventory, and Resume System

Problem:

- The runtime has local player-state constructs, but the audit did not find a
  clearly authoritative service for durable character state, inventory,
  equipment, effects, checkpoints, or resume-safe restoration.

Bridge responsibility:

- persist canonical character state and checkpoints
- persist inventory and equipment truth
- restore state safely on world entry and resume
- separate local renderer state from durable authoritative state

### 4. Game Capabilities, Eligibility, and Unlocks System

Problem:

- The account/profile plane already uses capability and rollout surfaces, but
  the game side lacks an equivalent service layer for stage-gated character
  unlocks, institution eligibility, and runtime surface access.

Bridge responsibility:

- answer what the current character may access now
- express stage unlocks, institution readiness, and authority eligibility
- support Player System preflight and UI discoverability
- keep reversible rollout and player-state gating distinct

### 5. Party Membership, Presence, and Friendly-Tracking System

Problem:

- The game canon defines party membership, friendly tracking, and allied alerts,
  but the surrounding service plane does not yet provide party truth, party
  presence, or cooperative-state delivery.

Bridge responsibility:

- own party membership truth
- publish party presence and separation state
- expose allied status needed by Party/System overlays
- support shared-objective routing and cooperative visibility

### 6. External Authority Services for Guild, Institution, and Commerce

Problem:

- The Player System properly does not own guild, school, barracks, academy, or
  shop authority, but the service-plane bridge into those authorities is still
  incomplete and uneven.

Bridge responsibility:

- keep guild quests externally authoritative
- model admission and readiness into schools, barracks, academies, and
  apprenticeships
- provide shop and commerce authority surfaces
- keep Player System orchestration separate from institutional authority truth

### 7. Identity Card Projection and Runtime Status System

Problem:

- Canon expects runtime-visible Identity Card projections for players and world
  objects, but there is no clearly named surrounding service that owns the
  authoritative projection feed into runtime/UI consumers.

Bridge responsibility:

- project authoritative character and world-object status into runtime-friendly
  identity-card shapes
- support self-status, target inspection, and bounded disclosure
- keep projection separate from underlying world truth sources

### 8. Observed-Event Projection, Achievement, and Gossip Pipeline

Problem:

- The canon clearly describes a blob-backed observed-event lake and projected
  read models, but the surrounding implemented service plane is still much more
  mature for account/profile traffic than for gameplay event projection traffic.

Bridge responsibility:

- ingest observed gameplay events
- normalize and compact them in storage-backed processing flows
- project Event Log, achievement, and gossip-facing read models
- expose player-safe reads without leaking server-only truth

### 9. AI Dialogue, NPC Action, and GM Authority Bridge System

Problem:

- AI packages and chatbot surfaces exist, but there is no clearly bounded bridge
  that mediates AI-generated NPC dialogue, AI-suggested NPC actions, or
  GM-style world interventions before runtime-authoritative systems accept them.

Bridge responsibility:

- accept bounded AI outputs from chatbot and `ai-game` style workflows
- classify which outputs are advisory, deterministic-checkable, or
  operator-gated
- translate valid outputs into runtime-safe authority requests
- prevent generic AI surfaces from becoming de facto world authority

## Priority Order

Recommended first delivery order:

1. Character Lifecycle System
2. Authenticated World Entry and Session Bootstrap System
3. Authoritative Character State, Inventory, and Resume System
4. Game Capabilities, Eligibility, and Unlocks System
5. Party Membership, Presence, and Friendly-Tracking System
6. External Authority Services for Guild, Institution, and Commerce
7. Identity Card Projection and Runtime Status System
8. Observed-Event Projection, Achievement, and Gossip Pipeline
9. AI Dialogue, NPC Action, and GM Authority Bridge System

## Ticket Mapping

Central bridge epic:

- `Plasius-LTD/plasius-ltd-site#555` `[EPIC] Service-to-game bridge systems between account identity and gameplay runtime`

| System | Coverage type | Issue mapping |
| --- | --- | --- |
| Character Lifecycle System | new | `Plasius-LTD/plasius-ltd-site#559`, `Plasius-LTD/plasius-ltd-site#563`, `Plasius-LTD/plasius-ltd-site#567` |
| Authenticated World Entry and Session Bootstrap System | new | `Plasius-LTD/plasius-ltd-site#571`, `Plasius-LTD/plasius-ltd-site#574`, `Plasius-LTD/plasius-ltd-site#578` |
| Authoritative Character State, Inventory, and Resume System | new | `Plasius-LTD/plasius-ltd-site#582`, `Plasius-LTD/plasius-ltd-site#586`, `Plasius-LTD/plasius-ltd-site#591` |
| Game Capabilities, Eligibility, and Unlocks System | new plus related existing training-state coverage | `Plasius-LTD/plasius-ltd-site#595`, `Plasius-LTD/plasius-ltd-site#599`, `Plasius-LTD/plasius-ltd-site#602`, related `Plasius-LTD/plasius-ltd-site#408` |
| Party Membership, Presence, and Friendly-Tracking System | new plus related existing overlay coverage | `Plasius-LTD/plasius-ltd-site#606`, `Plasius-LTD/plasius-ltd-site#610`, `Plasius-LTD/plasius-ltd-site#614`, related `Plasius-LTD/plasius-ltd-site#416` |
| External Authority Services for Guild, Institution, and Commerce | new commerce bridge coverage plus reused guild and institution coverage | new `Plasius-LTD/plasius-ltd-site#617`, `Plasius-LTD/plasius-ltd-site#621`, `Plasius-LTD/plasius-ltd-site#625`; reused `Plasius-LTD/plasius-ltd-site#382`, `Plasius-LTD/plasius-ltd-site#390`, `Plasius-LTD/plasius-ltd-site#398`, `Plasius-LTD/plasius-ltd-site#421`, `Plasius-LTD/plasius-ltd-site#422`, `Plasius-LTD/plasius-ltd-site#423`, `Plasius-LTD/plasius-ltd-site#424`, `Plasius-LTD/plasius-ltd-site#425`, `Plasius-LTD/plasius-ltd-site#426`, `Plasius-LTD/plasius-ltd-site#427`, `Plasius-LTD/plasius-ltd-site#431` |
| Identity Card Projection and Runtime Status System | new authority-bridge coverage plus reused downstream overlay coverage | new `Plasius-LTD/plasius-ltd-site#628`, `Plasius-LTD/plasius-ltd-site#632`, `Plasius-LTD/plasius-ltd-site#636`; reused `Plasius-LTD/plasius-ltd-site#388`, `Plasius-LTD/plasius-ltd-site#396` |
| Observed-Event Projection, Achievement, and Gossip Pipeline | reused existing open coverage | `Plasius-LTD/plasius-ltd-site#383`, `Plasius-LTD/plasius-ltd-site#391`, `Plasius-LTD/plasius-ltd-site#399`, `Plasius-LTD/plasius-ltd-site#445` |
| AI Dialogue, NPC Action, and GM Authority Bridge System | new bridge coverage plus related prior AI-contract coverage | new `Plasius-LTD/plasius-ltd-site#640`, `Plasius-LTD/plasius-ltd-site#644`, `Plasius-LTD/plasius-ltd-site#648`; related `Plasius-LTD/plasius-ltd-site#266` |
