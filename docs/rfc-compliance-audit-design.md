# RFC Compliance Audit Design

## Purpose

Provide a reproducible, evidence-backed audit of RFC requirements that apply to
the supported Plasius repositories, and retain enough machine-readable state to
detect later standards or implementation drift.

## Authoritative inputs

- Remote default-branch commit for every primary repository in the workspace.
- RFC Editor `rfc-index.xml` and `errata.json` snapshots.
- Explicitly adopted Internet-Drafts, pinned by name and revision.
- Source, tests, public documentation, runtime configuration, and safe public
  endpoint observations.

Temporary clones, generated output, dependency trees, worktrees, and archived
repositories are excluded unless the repository manifest explicitly includes
them as supported products. Dirty local state is reported separately and never
silently blended into the default-branch baseline.

## Data model

The audit owns four versioned inputs/outputs:

1. `repositories.json` records repository name, owner, lifecycle, pinned commit,
   default branch, protocol roles, and local-delta metadata.
2. `standards.json` records RFC or draft identity, status, BCP membership,
   updates, obsoletions, errata, retrieval date, and source URL.
3. `applicability.json` records repository/standard/section pairings with role,
   requirement level, evidence, rationale, conformance state, owner, and any
   remediation or exception.
4. Generated Markdown and JSON reports present the repository matrix, standards
   matrix, gaps, delegated responsibilities, and exclusions.

Allowed conformance states are `conformant`, `partial`, `nonconformant`,
`delegated`, `not_applicable`, and `unverified`. A repository is complete only
when every discovered candidate is explicitly classified and every primary
repository appears in the report.

## Audit method

The inventory tool discovers primary Git repositories, resolves their remote
default branches, pins commit SHAs, and records local branch/dirty differences.
It then uses auditable source signals to propose protocol roles. Signals are
candidate evidence only: applicability is confirmed from actual wire-format or
validation ownership, not from keywords alone.

Published RFC metadata is resolved through update and obsoletion chains. Current
technical errata are attached to the affected standard. Internet-Drafts are kept
separate from published RFC claims and must be explicitly allowlisted by exact
revision.

Implementations delegated to Node.js, browsers, Azure, reverse proxies, or other
dependencies are classified at the integration boundary. The audit records the
responsible component and version assumption instead of duplicating protocol
internals.

Read-only production probes are limited to unauthenticated `GET`, `HEAD`, and
safe discovery requests against public Plasius endpoints. They must not create,
update, or delete data.

## Rollout and remediation

The parent feature flag is `governance.rfc-compliance-remediation.enabled`.
Audit generation remains read-only regardless of flag state. The flag controls
runtime-visible remediation rollout where a consumer can safely operate both old
and corrected behavior; package-only corrections use normal versioned consumer
rollout and record why runtime flag evaluation is not applicable.

Verified MUST/MUST-NOT gaps are fixed when backward compatible. Breaking public
API, provider compatibility, or infrastructure changes require a migration task
or a time-bounded exception containing risk, owner, and review date.

## Validation and maintenance

- Unit tests cover metadata parsing, successor resolution, applicability rules,
  deterministic rendering, repository coverage, and false-positive suppression.
- Package conformance tests cite exact RFC sections and cover positive and
  negative behavior.
- Generated files are checked for drift in CI.
- A monthly read-only workflow checks official metadata and repository inventory;
  changes require review and are never accepted automatically.
- Source changes retain at least 80% relevant coverage and every changed source
  file must appear in combined LCOV.

