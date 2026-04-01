# AGENTS

## Task-to-Feature-Flag Policy Addendum
- Active rule: every implementation task must belong to a parent feature; do not create or execute standalone implementation tasks outside a feature.
- Active rule: every parent feature must have at least one named, remotely controllable feature flag before implementation starts.
- Active rule: the feature flag is part of the feature definition and must be recorded in the feature, its child stories/tasks, and any ADR/TDR or implementation notes.
- Inheritance rule: child stories and tasks inherit the parent feature flag unless there is an explicitly documented reason to add a second feature flag.
- Cross-repo rule: when a feature spans multiple repositories/packages, every linked task in every repository/package must reference the same parent feature and its associated feature flag.
- Capability compatibility rule: capabilities do not remove the feature-flag requirement; capability-led features must still have an associated feature flag for staged rollout, kill-switch, and rollback.
- Break-glass rule: if work must begin before the feature flag exists, the first task in the feature must create the feature flag and no downstream implementation task may be marked complete until that flag exists.
- Completion rule: do not mark a feature, story, or task done until the associated feature flag has documented enable/disable behavior, test coverage, and rollback instructions.
- Scope rule: non-implementation maintenance tasks should still be linked to a parent feature when they are part of delivery scope; if they are truly repository-operational work, document explicitly why no product feature flag applies.
