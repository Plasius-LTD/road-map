# Game Systems Missing Issue Drafts

## Purpose

This document drafts the missing issue set required to close the main planning
gaps identified in [`game-systems-inventory.md`](./game-systems-inventory.md).

Some central issue families described here may already have been created in
GitHub after the initial draft was written. The document is retained as the
original package/runtime draft set for broader follow-on work beyond the
service-bridge planning slice captured in
[`game-service-bridge-gaps.md`](./game-service-bridge-gaps.md).

## Drafting Rules Applied

- Central planning issues belong in `Plasius-LTD/plasius-ltd-site`
- Repo implementation tasks belong in the repo where the code change will land
- No standalone implementation task is proposed without a parent Feature
- Existing coverage is reused where possible; this draft only fills the most
  obvious missing gaps

## Central Planning Issues for `Plasius-LTD/plasius-ltd-site`

### 1. Epic

- Title: `[EPIC] Integrated game runtime vertical slices across gameplay, scene, and GPU systems`
- Why:
  - The current game package family is documented and partially implemented, but
    it is still split across contracts, validation layers, and demo runtimes.
  - There is no single central Epic tying gameplay authorities, scene runtime,
    and GPU runtime integration together.
- Acceptance criteria:
  - All child Features and Stories for the integration path are created and
    linked
  - The Epic clearly names the target vertical slices to deliver
  - The Epic references the canonical inventory and follow-on design work

### 2. Feature

- Parent: `[EPIC] Integrated game runtime vertical slices across gameplay, scene, and GPU systems`
- Title: `[FEATURE] Player System authority handoffs across AI, spellcraft, item-crafting, and dungeon-crafting`
- Proposed feature flag: `isekai.player-system.authority-handoffs.enabled`
- Why:
  - `player-system`, `ai-game`, `spellcraft`, `item-crafting`, and
    `dungeon-crafting` exist, but they are not yet planned as one integrated
    authority-handoff feature.
- Acceptance criteria:
  - The Player System handoff model is defined at the feature level
  - External authority boundaries and responsibilities are explicit
  - Repo tasks exist for each affected package

### 3. Story

- Parent: `[FEATURE] Player System authority handoffs across AI, spellcraft, item-crafting, and dungeon-crafting`
- Title: `[STORY] Define and validate Player System handoff contracts across external authority packages`
- Why:
  - The current contracts exist per package, but the cross-package handshake is
    not planned as one Story.
- Acceptance criteria:
  - Inputs and outputs across the five packages are enumerated
  - Required state transitions and readiness descriptors are identified
  - Repo tasks exist for `player-system`, `ai-game`, `spellcraft`,
    `item-crafting`, and `dungeon-crafting`

### 4. Story

- Parent: `[FEATURE] Player System authority handoffs across AI, spellcraft, item-crafting, and dungeon-crafting`
- Title: `[STORY] Present authority handoff state through Player System interface, demo validation, and voice surfaces`
- Why:
  - The interface and validation packages exist, but the integration plan for
    runtime surfaces is still missing.
- Acceptance criteria:
  - Required overlay, demo, and voice surfaces are defined
  - Combat-safe interaction constraints are explicit
  - Repo tasks exist for `player-system-interface`,
    `player-system-demo-viewer`, and `voice`

### 5. Feature

- Parent: `[EPIC] Integrated game runtime vertical slices across gameplay, scene, and GPU systems`
- Title: `[FEATURE] World generation to scene runtime pipeline`
- Proposed feature flag: `isekai.world-runtime-pipeline.enabled`
- Why:
  - `gpu-world-generator`, `entity-manager`, `scene-*`, and renderer packages
    exist, but there is no central Feature that treats them as one pipeline.
- Acceptance criteria:
  - The world-to-scene pipeline boundaries are defined
  - Manifest ownership is explicit across packages
  - Repo tasks exist for each affected package

### 6. Story

- Parent: `[FEATURE] World generation to scene runtime pipeline`
- Title: `[STORY] Bind generated world data into entity-manager and scene-runtime manifests`
- Why:
  - World generation has implementation depth, but the downstream scene/entity
    handoff is not centrally planned.
- Acceptance criteria:
  - Generated terrain/object outputs are mapped to entity/runtime contracts
  - Schema ownership is explicit
  - Repo tasks exist for `gpu-world-generator`, `entity-manager`,
    `scene-layout`, `scene-object`, `scene-animation`, and `scene-runtime`

### 7. Story

- Parent: `[FEATURE] World generation to scene runtime pipeline`
- Title: `[STORY] Render composed runtime scenes through renderer and gpu-renderer integration seams`
- Why:
  - The composition and rendering packages exist, but the binding between them
    is not fully tracked as a central Story.
- Acceptance criteria:
  - Product-runtime ownership is explicit between `renderer`, `gpu-renderer`,
    and `gpu-shared`
  - A live scene composition path is planned
  - Repo tasks exist for `renderer`, `gpu-renderer`, and `gpu-shared`

### 8. Feature

- Parent: `[EPIC] Integrated game runtime vertical slices across gameplay, scene, and GPU systems`
- Title: `[FEATURE] Runtime camera, performance, particles, and XR adaptation loop`
- Proposed feature flag: `isekai.runtime.adaptation-loop.enabled`
- Why:
  - `gpu-camera`, `gpu-performance`, `gpu-particles`, and `gpu-xr` all exist,
    but central product planning for the live frame loop is still missing.
- Acceptance criteria:
  - The runtime loop responsibilities are defined across the participating
    packages
  - Frame-budget and adaptation ownership are explicit
  - Repo tasks exist for all affected packages

### 9. Story

- Parent: `[FEATURE] Runtime camera, performance, particles, and XR adaptation loop`
- Title: `[STORY] Bind camera, GPU performance, particles, and worker budgets into the live frame loop`
- Why:
  - The packages have meaningful internals, but the product integration plan is
    still thin.
- Acceptance criteria:
  - Runtime loop touchpoints are enumerated
  - Quality ladder and worker-budget hooks are defined
  - Repo tasks exist for `gpu-camera`, `gpu-performance`, `gpu-particles`,
    `gpu-worker`, `gpu-fluid`, and `gpu-cloth`

### 10. Story

- Parent: `[FEATURE] Runtime camera, performance, particles, and XR adaptation loop`
- Title: `[STORY] Negotiate XR sessions against camera and performance budgets`
- Why:
  - XR support is documented and partially implemented, but not centrally
    planned as part of the live runtime loop.
- Acceptance criteria:
  - XR session lifecycle responsibilities are explicit
  - Camera and performance budget interactions are defined
  - Repo tasks exist for `gpu-xr`, `gpu-camera`, and `gpu-performance`

### 11. Feature

- Parent: `[EPIC] Integrated game runtime vertical slices across gameplay, scene, and GPU systems`
- Title: `[FEATURE] Rendering support package ownership and tracking alignment`
- Proposed feature flag: `isekai.render-support-alignment.enabled`
- Why:
  - `shadow` is documented and implemented locally, but its repository ownership
    and planning lineage are unclear.
- Acceptance criteria:
  - `shadow` ownership is resolved
  - Its relationship to `renderer` and `gpu-lighting` is explicitly tracked
  - Follow-on repo task ownership is clear

### 12. Story

- Parent: `[FEATURE] Rendering support package ownership and tracking alignment`
- Title: `[STORY] Resolve shadow package ownership and its relationship to renderer and gpu-lighting`
- Why:
  - The package exists locally but the expected GitHub repo was not resolvable
    during audit.
- Acceptance criteria:
  - The package either has a tracked repo, or its scope is deliberately merged
    elsewhere
  - Documentation and issue ownership are aligned

## Repo Task Drafts

### Player guidance and authority handoffs

- Repository: `Plasius-LTD/player-system`
- Parent story: `[STORY] Define and validate Player System handoff contracts across external authority packages`
- Title: `[TASK] Implement authoritative handoff descriptors, readiness state, and transition helpers for external authority packages`
- Acceptance criteria:
  - Handoff descriptors exist for `ai-game`, `spellcraft`, `item-crafting`, and
    `dungeon-crafting`
  - Transition helpers cover readiness, dispatch, and return state
  - Tests cover the new transition and handoff surfaces

- Repository: `Plasius-LTD/ai-game`
- Parent story: `[STORY] Define and validate Player System handoff contracts across external authority packages`
- Title: `[TASK] Add Player System handoff event shapes and ingestion surfaces for external authority interactions`
- Acceptance criteria:
  - AI event contracts can represent inbound Player System handoffs
  - Event ingestion surfaces distinguish authority source and outcome
  - Tests cover the added contracts

- Repository: `Plasius-LTD/spellcraft`
- Parent story: `[STORY] Define and validate Player System handoff contracts across external authority packages`
- Title: `[TASK] Add Player System spellcraft handoff contracts for readiness, request, and result state`

- Repository: `Plasius-LTD/item-crafting`
- Parent story: `[STORY] Define and validate Player System handoff contracts across external authority packages`
- Title: `[TASK] Add Player System item-crafting handoff contracts for readiness, request, and result state`

- Repository: `Plasius-LTD/dungeon-crafting`
- Parent story: `[STORY] Define and validate Player System handoff contracts across external authority packages`
- Title: `[TASK] Add Player System dungeon-crafting handoff contracts for readiness, request, and result state`

### Interface, demo validation, and voice

- Repository: `Plasius-LTD/player-system-interface`
- Parent story: `[STORY] Present authority handoff state through Player System interface, demo validation, and voice surfaces`
- Title: `[TASK] Bind authority handoff, focus, and target state into overlay and pane contracts`
- Acceptance criteria:
  - Overlay contracts represent handoff readiness and result state
  - Focus and target bindings align with runtime scene anchors
  - Tests cover new overlay and pane shapes

- Repository: `Plasius-LTD/player-system-demo-viewer`
- Parent story: `[STORY] Present authority handoff state through Player System interface, demo validation, and voice surfaces`
- Title: `[TASK] Add end-to-end demo scenarios for authority handoffs, overlay updates, and combat-safe interaction flows`
- Acceptance criteria:
  - Demo scenarios exist for at least one handoff into each external authority
  - Demo scenarios exercise overlay and voice-state changes
  - Scenario manifests stay package-owned and testable

- Repository: `Plasius-LTD/voice`
- Parent story: `[STORY] Present authority handoff state through Player System interface, demo validation, and voice surfaces`
- Title: `[TASK] Route combat-safe voice intents into Player System focus panes and scene interaction targets`
- Acceptance criteria:
  - Voice intents map onto Player System focus surfaces
  - Combat-safe restrictions are explicit and testable
  - Runtime targets can be addressed by stable identifiers

### World generation to runtime composition

- Repository: `Plasius-LTD/gpu-world-generator`
- Parent story: `[STORY] Bind generated world data into entity-manager and scene-runtime manifests`
- Title: `[TASK] Emit generated terrain, object, and anchor outputs in entity-manager and scene-runtime compatible shapes`
- Acceptance criteria:
  - World outputs map cleanly into downstream schema and runtime contracts
  - Generated objects include stable identifiers and attachment anchors
  - Tests cover the published handoff shapes

- Repository: `Plasius-LTD/entity-manager`
- Parent story: `[STORY] Bind generated world data into entity-manager and scene-runtime manifests`
- Title: `[TASK] Add schemas for generated scene entities, anchors, and runtime-bound world objects`
- Acceptance criteria:
  - Generated scene entities and anchors have canonical schema ownership
  - Runtime-facing generated object shapes serialize consistently
  - Tests cover the new schemas

- Repository: `Plasius-LTD/scene-layout`
- Parent story: `[STORY] Bind generated world data into entity-manager and scene-runtime manifests`
- Title: `[TASK] Add world-generated zone and anchor layout contracts for runtime composition`

- Repository: `Plasius-LTD/scene-object`
- Parent story: `[STORY] Bind generated world data into entity-manager and scene-runtime manifests`
- Title: `[TASK] Add generated object, attachment, and target-anchor contracts for runtime composition`

- Repository: `Plasius-LTD/scene-animation`
- Parent story: `[STORY] Bind generated world data into entity-manager and scene-runtime manifests`
- Title: `[TASK] Add world-driven animation palette and playback state contracts for runtime composition`

- Repository: `Plasius-LTD/scene-runtime`
- Parent story: `[STORY] Bind generated world data into entity-manager and scene-runtime manifests`
- Title: `[TASK] Compose generated layout, object, animation, and overlay manifests into a live runtime composition contract`
- Acceptance criteria:
  - Runtime composition accepts generated scene inputs
  - Overlay and palette resolution seams are explicit
  - Validation covers the new composition path

### Renderer ownership and live scene hosting

- Repository: `Plasius-LTD/renderer`
- Parent story: `[STORY] Render composed runtime scenes through renderer and gpu-renderer integration seams`
- Title: `[TASK] Mount scene-runtime composition and Player System overlays through renderer compositor helpers`
- Acceptance criteria:
  - Renderer consumes scene-runtime outputs without inventing new ownership
  - Overlay composition hooks are explicit
  - Tests or demos cover the scene-runtime binding path

- Repository: `Plasius-LTD/gpu-renderer`
- Parent story: `[STORY] Render composed runtime scenes through renderer and gpu-renderer integration seams`
- Title: `[TASK] Define and expose gpu-renderer integration seams required by the product runtime host`
- Acceptance criteria:
  - Product-runtime integration seams are published
  - Ownership boundaries with `renderer` are explicit
  - Package docs name the expected runtime hooks

- Repository: `Plasius-LTD/gpu-shared`
- Parent story: `[STORY] Render composed runtime scenes through renderer and gpu-renderer integration seams`
- Title: `[TASK] Isolate demo-runtime-only helpers from product-runtime integration seams`
- Acceptance criteria:
  - Demo-runtime helpers remain available
  - Product-runtime ownership is not hidden inside shared demo code
  - Docs make the distinction explicit

### Runtime adaptation loop

- Repository: `Plasius-LTD/gpu-camera`
- Parent story: `[STORY] Bind camera, GPU performance, particles, and worker budgets into the live frame loop`
- Title: `[TASK] Bind camera planning to runtime focus state, target anchors, and scene mode transitions`
- Acceptance criteria:
  - Camera planning responds to runtime focus and anchor changes
  - The contract between camera state and scene/runtime state is explicit
  - Tests or demos cover the live binding seam

- Repository: `Plasius-LTD/gpu-performance`
- Parent story: `[STORY] Bind camera, GPU performance, particles, and worker budgets into the live frame loop`
- Title: `[TASK] Integrate performance governor outputs across renderer, worker, particles, cloth, fluid, and XR adapters in one runtime harness`
- Acceptance criteria:
  - One runtime harness exercises the adapter set together
  - Budget and quality ownership stay explicit by domain
  - Tests or demos prove the integration path

- Repository: `Plasius-LTD/gpu-particles`
- Parent story: `[STORY] Bind camera, GPU performance, particles, and worker budgets into the live frame loop`
- Title: `[TASK] Add gameplay-facing particle bundles for spellcraft, combat, and world-event feedback`
- Acceptance criteria:
  - Published effect bundles map to gameplay/runtime events
  - Particle manifests expose the required budget hooks
  - Docs explain the gameplay-facing effect surface

- Repository: `Plasius-LTD/gpu-worker`
- Parent story: `[STORY] Bind camera, GPU performance, particles, and worker budgets into the live frame loop`
- Title: `[TASK] Publish the worker-budget and scheduling hooks required by the live runtime adaptation loop`

- Repository: `Plasius-LTD/gpu-fluid`
- Parent story: `[STORY] Bind camera, GPU performance, particles, and worker budgets into the live frame loop`
- Title: `[TASK] Expose live runtime quality and adaptation hooks for fluid representation changes`

- Repository: `Plasius-LTD/gpu-cloth`
- Parent story: `[STORY] Bind camera, GPU performance, particles, and worker budgets into the live frame loop`
- Title: `[TASK] Expose live runtime quality and adaptation hooks for cloth representation changes`

### XR negotiation

- Repository: `Plasius-LTD/gpu-xr`
- Parent story: `[STORY] Negotiate XR sessions against camera and performance budgets`
- Title: `[TASK] Bind XR session negotiation and frame-rate hints to camera and GPU performance governance`
- Acceptance criteria:
  - XR runtime hints flow into the shared adaptation loop
  - Session lifecycle hooks are stable and documented
  - Tests or demos cover the coordination path

## Deliberately Not Drafted Here as New Central Issues

These systems already have clearer central coverage or the main gap is no longer
"missing issues" but execution against existing issues. Some still appear above
as linked repo-task drafts where they need to participate in a broader
cross-system Story:

- `spellcraft`
- `item-crafting`
- `dungeon-crafting`
- `scene-layout`
- `scene-object`
- `scene-animation`
- `scene-runtime`
- `gpu-lighting`
- `gpu-fluid`
- `gpu-cloth`
- `gpu-shared`
- `gpu-worker`

They still appear in repo-task drafts where cross-system integration work needs
to be linked to a new parent Story.
