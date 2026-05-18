# Game Systems Hierarchy

## Purpose

This is the compact tree/table view of the primary game systems currently in
active development.

- Audit basis: [`game-systems-inventory.md`](./game-systems-inventory.md)
- Scope: primary game systems only
- Excluded from this quick view: supporting packages previously reviewed but not
  counted as primary game systems, such as `environment`, `sharedassets`,
  `sharedcomponents`, and `video`

## Completion Rule

Bold system names indicate systems considered complete for the current game
implementation scope.

Under the current audit threshold, no active-development system is fully
complete yet. Every system below still has at least one material documentation,
tracking, ownership, or integration gap, so no entries are bolded.

## Tree

- Game Runtime
  - Player Guidance and Authority Systems
    - `player-system`
      - `ai-game`
      - `spellcraft`
      - `item-crafting`
      - `dungeon-crafting`
      - `player-system-interface`
        - `player-system-demo-viewer`
        - `voice`
  - World and Scene Composition Systems
    - `gpu-world-generator`
      - `entity-manager`
      - `scene-layout`
      - `scene-object`
      - `scene-animation`
      - `scene-runtime`
  - Rendering and Runtime Infrastructure
    - `renderer`
      - `shadow`
      - `gpu-renderer`
      - `gpu-camera`
      - `gpu-physics`
      - `gpu-lighting`
      - `gpu-fluid`
      - `gpu-cloth`
      - `gpu-particles`
      - `gpu-performance`
      - `gpu-worker`
      - `gpu-xr`
      - `gpu-shared`

## Table

| System | Parent | Direct children | Complete | Notes |
| --- | --- | --- | --- | --- |
| `player-system` | Player Guidance and Authority Systems | `ai-game`, `spellcraft`, `item-crafting`, `dungeon-crafting`, `player-system-interface` | No | Core orchestration boundary for player guidance and external authority handoffs |
| `ai-game` | `player-system` | None | No | AI event, gossip, and feedback contracts feeding the gameplay layer |
| `spellcraft` | `player-system` | None | No | External spellcraft authority boundary guided by the Player System |
| `item-crafting` | `player-system` | None | No | External item-crafting authority boundary guided by the Player System |
| `dungeon-crafting` | `player-system` | None | No | External dungeon-crafting authority boundary guided by the Player System |
| `player-system-interface` | `player-system` | `player-system-demo-viewer`, `voice` | No | Interface-facing overlay and focus-pane contract layer |
| `player-system-demo-viewer` | `player-system-interface` | None | No | Validation and scenario surface for Player System flows |
| `voice` | `player-system-interface` | None | No | Voice intent and narrated interaction surface for gameplay/runtime targets |
| `gpu-world-generator` | World and Scene Composition Systems | `entity-manager`, `scene-layout`, `scene-object`, `scene-animation`, `scene-runtime` | No | Upstream generated world data source for runtime composition |
| `entity-manager` | `gpu-world-generator` | None | No | Canonical schema ownership for generated and runtime-owned entities |
| `scene-layout` | `gpu-world-generator` | None | No | Zone and anchor layout contracts for runtime composition |
| `scene-object` | `gpu-world-generator` | None | No | Object transform, bounds, and attachment contracts |
| `scene-animation` | `gpu-world-generator` | None | No | Animation palette and playback contracts used by runtime composition |
| `scene-runtime` | `gpu-world-generator` | None | No | Runtime composition layer combining scene manifests and palette resolution |
| `renderer` | Rendering and Runtime Infrastructure | `shadow`, `gpu-renderer`, `gpu-camera`, `gpu-physics`, `gpu-lighting`, `gpu-fluid`, `gpu-cloth`, `gpu-particles`, `gpu-performance`, `gpu-worker`, `gpu-xr`, `gpu-shared` | No | Product-facing rendering host that binds scene/runtime inputs |
| `shadow` | `renderer` | None | No | Rendering support utility layer with unresolved ownership/tracking lineage |
| `gpu-renderer` | `renderer` | None | No | Framework-agnostic WebGPU renderer runtime seam beneath the product renderer |
| `gpu-camera` | `renderer` | None | No | Camera planning and multiview control aligned to runtime focus state |
| `gpu-physics` | `renderer` | None | No | Physics bridge feeding GPU runtime and scene motion surfaces |
| `gpu-lighting` | `renderer` | None | No | Lighting kernels and planning profiles used by the GPU runtime |
| `gpu-fluid` | `renderer` | None | No | Fluid representation, worker, and quality adaptation contracts |
| `gpu-cloth` | `renderer` | None | No | Cloth representation, worker, and quality adaptation contracts |
| `gpu-particles` | `renderer` | None | No | Particle effect bundles and worker manifests for gameplay and scene feedback |
| `gpu-performance` | `renderer` | None | No | Performance governor coordinating quality ladders across GPU subsystems |
| `gpu-worker` | `renderer` | None | No | Worker runtime and scheduling foundation for GPU jobs |
| `gpu-xr` | `renderer` | None | No | XR session lifecycle and frame-rate negotiation layer |
| `gpu-shared` | `renderer` | None | No | Shared validation/demo runtime and assets used by the GPU package family |

## Notes on Parent/Child Semantics

- These parent/child relationships reflect runtime and architectural ownership
  direction for planning purposes, not strict npm dependency declarations.
- `player-system-interface` is nested under `player-system` because it is the
  outward presentation layer for Player System state.
- `player-system-demo-viewer` and `voice` are nested under
  `player-system-interface` because they are current interface-facing validation
  and interaction surfaces.
- `gpu-world-generator` is shown above the `scene-*` and `entity-manager`
  family because the current planning gap is the world-to-scene handoff path.
- `renderer` is shown above the `gpu-*` runtime family because the current
  product-facing rendering host must bind the lower-level GPU runtimes into one
  live scene.
