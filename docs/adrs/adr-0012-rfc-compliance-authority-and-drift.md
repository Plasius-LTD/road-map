# ADR 0012: RFC compliance uses pinned authorities and reviewed drift

- Status: Accepted
- Date: 2026-07-12
- Task: `Plasius-LTD/road-map#526`
- Feature: `Plasius-LTD/plasius-ltd-site#1477`
- Feature flag: `governance.rfc-compliance-remediation.enabled`

## Context

Plasius repositories implement different portions of OAuth, HTTP, structured
data, MIME, and related Internet protocols. A keyword inventory cannot establish
applicability or compliance, while an unpinned audit cannot be reproduced after
repository or standards metadata changes.

## Decision

The road-map repository owns the cross-repository audit manifest. Remote default
branches are authoritative and are pinned by commit. RFC status, BCP membership,
updates, obsoletions, and errata come from RFC Editor machine-readable sources.
Explicit Internet-Drafts remain separate and are pinned by revision.

The audit classifies implementation-role candidates and keeps `unverified`
distinct from a conformance claim. Verified entries require section-level
evidence. Delegated platform behavior is assessed at the integration boundary.
Dirty branches, worktrees, duplicates, and temporary clones are reported but do
not alter the authoritative baseline.

Monthly automation is read-only. It fails on drift and requires reviewed updates
to the committed standards lock, repository pins, classifications, or exceptions.
It never accepts upstream metadata automatically.

Runtime remediation inherits
`governance.rfc-compliance-remediation.enabled`. The evaluator is the existing
remote feature-flag service. Disabled behavior retains the pre-remediation path
only during a documented compatibility window; rollback disables the flag and
restores the last compatible package versions. Audit generation itself is always
read-only and ungated.

## Consequences

- Every primary repository is visible even when it owns no direct RFC role.
- Obsolete references remain traceable to current successors.
- `unverified` rows form an explicit evidence backlog rather than implied
  compliance.
- Breaking corrections require per-repository migration work or a time-bounded
  exception with an owner and review date.

