# Game Systems Inventory

## Purpose

This document records the current state of Plasius game-related systems across
documentation, GitHub tracking, and local implementation.

- Audit date: `2026-05-15`
- Scope: package repos in `/Users/philliphounslow/plasius` that directly
  participate in gameplay, scene runtime, rendering/GPU runtime, or player
  interaction for the current game implementation effort
- Source types reviewed:
  - repo-local `README.md`, ADR, TDR, and design docs
  - package-repo GitHub issues
  - obvious matching Epic/Feature/Story issues in
    `Plasius-LTD/plasius-ltd-site`
  - local source files to assess implementation depth

This is a planning artifact. GitHub Project linkage and issue parent/child
relationships still need final verification in GitHub before work execution.

## Status Legend

- `Strong`: active system-specific ticket coverage exists in the package repo
  and/or the central planning repo
- `Partial`: some ticket coverage exists, but it is thin, maintenance-heavy, or
  missing on one side
- `Weak`: ticket coverage is missing, unclear, or mostly maintenance-only
- `Contract-first`: implementation is mostly types, factories, manifests, or
  package boundary contracts
- `Validation/composition`: validation and composition logic exist, but there is
  no clear live runtime host integration yet
- `Runtime shell`: executable adapters or loops exist, but end-to-end product
  binding is still thin
- `Runtime`: meaningful executable behavior exists beyond contracts or
  validation
- `Demo runtime`: meaningful executable behavior exists primarily in demos or
  shared validation scenes

## Core Gameplay Systems

| System | Primary role | Documentation | Ticket coverage | Implementation depth | Current gap |
| --- | --- | --- | --- | --- | --- |
| `ai-game` | Game-domain AI events, gossip, and feedback contracts | README, 8 ADRs | Repo: Strong, Central: Partial | Contract-first | Needs real handoff and consumption paths from `player-system` and external authority packages |
| `player-system` | Non-rendering guidance/orchestration boundary | README, ADR, TDR, design note | Repo: Strong, Central: Strong | Contract-first | Needs actual session orchestration, state transitions, and authority handoff behavior |
| `player-system-interface` | Overlay and focus-pane interface contracts | README, ADR, TDR, design note | Repo: Partial, Central: Partial | Contract-first | Needs live 3D overlay host and runtime binding into scene/runtime surfaces |
| `player-system-demo-viewer` | Demo scenario manifest surface | README, ADR, TDR, design note | Repo: Partial, Central: Partial | Contract-first | Needs end-to-end scenarios that exercise real system integration rather than bootstrap manifests only |
| `spellcraft` | Academy-gated external authority boundary | README, ADR, TDR, design note | Repo: Partial, Central: Partial | Contract-first | Needs runtime authority workflow, Player System handoff, and gameplay-facing consumers |
| `item-crafting` | Apprenticeship-gated external authority boundary | README, ADR, TDR, design note | Repo: Partial, Central: Partial | Contract-first | Needs runtime authority workflow, Player System handoff, and gameplay-facing consumers |
| `dungeon-crafting` | DIS-gated external authority boundary | README, ADR, TDR, design note | Repo: Partial, Central: Partial | Contract-first | Needs runtime authority workflow, Player System handoff, and gameplay-facing consumers |

## Scene and Runtime Systems

| System | Primary role | Documentation | Ticket coverage | Implementation depth | Current gap |
| --- | --- | --- | --- | --- | --- |
| `entity-manager` | Canonical entity and asset schema library | README, 3 ADRs | Repo: Weak, Central: Weak | Runtime | Needs game-specific planning coverage for generated world entities and runtime-owned scene objects |
| `scene-layout` | Layout zones, anchors, and placement contracts | README, ADR | Repo: Partial, Central: Partial | Validation/composition | Needs live consumption by scene runtime and renderer hosts |
| `scene-object` | Object transforms, bounds, and attachment contracts | README, ADR | Repo: Partial, Central: Partial | Validation/composition | Needs live consumption by world generation, runtime composition, and renderer hosts |
| `scene-animation` | Animation palette manifests and playback state | README, ADR | Repo: Weak, Central: Partial | Validation/composition | Needs active implementation planning beyond package bootstrap and validation |
| `scene-runtime` | Runtime composition and palette resolution | README, ADR | Repo: Partial, Central: Partial | Validation/composition | Needs a live host that composes real layout, object, palette, and overlay inputs together |
| `renderer` | Product-facing renderer package | README, 2 ADRs, TDR, design note | Repo: Partial, Central: Partial | Runtime | Needs binding to scene runtime composition and Player System overlays |
| `shadow` | Lighting and shadow utilities | README, 2 ADRs | Repo: Weak or unclear, Central: Weak | Runtime shell | GitHub repo ownership is unclear; needs explicit ownership and tracking alignment |
| `voice` | Voice intent routing and controls | README, 2 ADRs | Repo: Partial, Central: Partial | Runtime | Needs combat-safe runtime integration with Player System focus panes and scene targets |

## GPU and Rendering Runtime Systems

| System | Primary role | Documentation | Ticket coverage | Implementation depth | Current gap |
| --- | --- | --- | --- | --- | --- |
| `gpu-renderer` | Framework-agnostic WebGPU renderer runtime | README, 5 ADRs, 4 TDRs, 2 design notes | Repo: Partial, Central: Partial | Runtime shell | Needs explicit central planning for how it binds into the product runtime rather than demos and package shells |
| `gpu-world-generator` | GPU-assisted terrain/world generation | README, 5 ADRs, 2 TDRs, design note | Repo: Partial, Central: Weak | Runtime | Needs central feature/story coverage and a defined handoff into `entity-manager` and `scene-runtime` |
| `gpu-physics` | Physics bridge package | README, 5 ADRs, 3 TDRs, 2 design notes | Repo: Partial, Central: Partial | Runtime shell | Needs stronger live runtime planning beyond bridge and demo roles |
| `gpu-lighting` | Lighting WGSL kernels and planning profiles | README, 6 ADRs, 3 TDRs, design note | Repo: Partial, Central: Partial | Runtime | Needs final product-runtime integration planning, but core system planning exists |
| `gpu-camera` | Camera control and multiview planning | README, 2 ADRs | Repo: Weak, Central: Weak | Runtime shell | Needs central feature/story coverage and binding to focus/runtime state |
| `gpu-fluid` | Fluid continuity planning and worker contracts | README, 4 ADRs, 4 TDRs, 3 design notes | Repo: Partial, Central: Partial | Runtime shell | Needs live runtime adoption beyond planning contracts and validation demos |
| `gpu-cloth` | Cloth continuity planning and worker contracts | README, 4 ADRs, 4 TDRs, 3 design notes | Repo: Partial, Central: Partial | Runtime shell | Needs live runtime adoption beyond planning contracts and validation demos |
| `gpu-particles` | Particle WGSL bundles and manifests | README, 4 ADRs, 3 TDRs, 2 design notes | Repo: Weak, Central: Weak | Runtime shell | Needs central coverage and gameplay-facing effect integration plans |
| `gpu-performance` | GPU performance governor and quality ladders | README, 6 ADRs, 5 TDRs, 4 design notes | Repo: Partial, Central: Weak | Runtime | Needs central coverage and a live multi-system integration harness |
| `gpu-shared` | Shared browser-safe demo runtime and assets | README, 4 ADRs, 2 TDRs, 2 design notes | Repo: Strong, Central: Strong | Demo runtime | Needs a clear boundary between shared validation runtime and product runtime ownership |
| `gpu-worker` | Worker WGSL runtime and job scheduling | README, 7 ADRs, 5 TDRs, 2 design notes | Repo: Partial, Central: Partial | Runtime | Needs broader product integration planning, but the package scope is well established |
| `gpu-xr` | XR session lifecycle and frame-rate negotiation | README, 3 ADRs, TDR, design note | Repo: Weak, Central: Weak | Runtime shell | Needs central coverage and explicit integration with camera and performance governance |

## Supporting Packages Reviewed But Not Counted as Primary Game Systems

These packages were reviewed as supporting dependencies or adjacent surfaces, but
they are not the primary source of the current game-implementation gaps.

| System | Note |
| --- | --- |
| `environment` | React environment context helpers; documented and implemented, but not a game system driver |
| `sharedassets` | Shared asset library; useful for packaging, but not the main gameplay/runtime planning gap |
| `sharedcomponents` | Shared React UI components; relevant to shell UX, but not the main game runtime gap |
| `video` | Video generation package; adjacent to media tooling rather than core game runtime delivery |

## Derived Views

### Documented Systems

Primary game systems with local documentation present:

- `ai-game`
- `player-system`
- `player-system-interface`
- `player-system-demo-viewer`
- `spellcraft`
- `item-crafting`
- `dungeon-crafting`
- `entity-manager`
- `scene-layout`
- `scene-object`
- `scene-animation`
- `scene-runtime`
- `renderer`
- `shadow`
- `voice`
- `gpu-renderer`
- `gpu-world-generator`
- `gpu-physics`
- `gpu-lighting`
- `gpu-camera`
- `gpu-fluid`
- `gpu-cloth`
- `gpu-particles`
- `gpu-performance`
- `gpu-shared`
- `gpu-worker`
- `gpu-xr`

### Systems With Active Package-Repo Tickets

- `ai-game`
- `player-system`
- `player-system-interface`
- `player-system-demo-viewer`
- `spellcraft`
- `item-crafting`
- `dungeon-crafting`
- `entity-manager`
- `scene-layout`
- `scene-object`
- `scene-runtime`
- `renderer`
- `voice`
- `gpu-renderer`
- `gpu-world-generator`
- `gpu-physics`
- `gpu-lighting`
- `gpu-camera`
- `gpu-fluid`
- `gpu-cloth`
- `gpu-particles`
- `gpu-performance`
- `gpu-shared`
- `gpu-worker`
- `gpu-xr`

Notable exceptions:

- `scene-animation` has package history, but no active open issue at the moment
- `shadow` package-repo tracking is unclear because the expected GitHub repo was
  not resolvable during the audit

### Systems With Clear Central Epic, Feature, or Story Coverage

- `ai-game`
- `player-system`
- `player-system-interface`
- `player-system-demo-viewer`
- `spellcraft`
- `item-crafting`
- `dungeon-crafting`
- `scene-layout`
- `scene-object`
- `scene-animation`
- `scene-runtime`
- `renderer`
- `voice`
- `gpu-renderer`
- `gpu-physics`
- `gpu-lighting`
- `gpu-fluid`
- `gpu-cloth`
- `gpu-shared`
- `gpu-worker`

Weak or missing central coverage:

- `entity-manager`
- `shadow`
- `gpu-world-generator`
- `gpu-camera`
- `gpu-particles`
- `gpu-performance`
- `gpu-xr`

### Systems Already Implemented

Implemented mostly as package boundaries or contracts:

- `ai-game`
- `player-system`
- `player-system-interface`
- `player-system-demo-viewer`
- `spellcraft`
- `item-crafting`
- `dungeon-crafting`

Implemented mostly as validation and composition layers:

- `scene-layout`
- `scene-object`
- `scene-animation`
- `scene-runtime`

Implemented as deeper runtime, demo runtime, or system utilities:

- `entity-manager`
- `renderer`
- `shadow`
- `voice`
- `gpu-renderer`
- `gpu-world-generator`
- `gpu-physics`
- `gpu-lighting`
- `gpu-camera`
- `gpu-fluid`
- `gpu-cloth`
- `gpu-particles`
- `gpu-performance`
- `gpu-shared`
- `gpu-worker`
- `gpu-xr`

## Gap Summary

- The documentation estate is broad, but it is mostly package-local and does
  not yet provide one canonical architecture view of the full game runtime.
- The core gameplay packages are real and documented, but they are still mostly
  boundary contracts instead of one connected gameplay loop.
- The scene package family exists, but it is still primarily a manifest
  validation and composition layer rather than a live integrated host runtime.
- The GPU stack is the deepest implementation area, but several important
  runtime systems still lack strong central planning coverage:
  `gpu-world-generator`, `gpu-camera`, `gpu-particles`, `gpu-performance`,
  `gpu-xr`, and likely `shadow`.
- `gpu-shared` currently carries a lot of practical runtime value through demos,
  which is useful for validation but risks hiding where product-runtime
  ownership should actually live.
