# Profile/account legal and control mapping (GDPR / UK GDPR / CCPA / SOC 2)

## Objective

This document maps profile/account workstreams in the Plasius estate to
applicable legal and control frameworks:

- GDPR / UK GDPR
- CCPA / California CPRA
- SOC 2 Trust Services Criteria (security, availability, confidentiality, privacy where applicable)

It supports Story `#182` (`F22.S3`) and operational evidence requirements for
Feature `#170`.

## Scope of evidence

- Profile and identity account creation
- Linked identity and primary-account-switch operations
- Profile read/update and avatar storage flows
- Session management and token lifecycle
- Data-subject requests and retention behavior
- Audit, monitoring, and incident evidence for identity/profile changes

## Control mapping

| Framework control touchpoint | Profile/account control area | Current design evidence | Gap / next action |
| --- | --- | --- | --- |
| **GDPR art. 5(1)(c) / UK GDPR principle of data minimisation** | Collect only required profile fields (`email`, identity claims, avatar reference, linked identity metadata) via schema-level contract checks | [`@plasius/schema`](https://github.com/Plasius-LTD/schema) field boundaries + backend validation + frontend schema reuse | Verify end-to-end minimization in new UI/API touchpoints before any further form expansion |
| **GDPR art. 32 / UK GDPR technical and organisational security** | OAuth/session/profile flows protected by strong auth validation, token lifecycle, and ownership checks | `docs/security/owasp-asvs-profile-account-controls.md`; `docs/security/profile-account-threat-model.md`; secure logout and callback work linked to Tasks `#203`/`#203`-adjacent | Publish updated control test evidence when callback and logout hardening updates complete |
| **GDPR art. 15 / CCPA right of access** | DSAR read/export workflows and retention snapshots | Task `#227` and operational runbooks planned under Story `#182` | Keep access/export evidence bundle in the DSAR tooling when exported data artifacts are enabled |
| **GDPR art. 17 / CCPA deletion right** | Data lifecycle and retention actions for profile/account records | Retention and soft-delete controls in Task `#227` and deletion path updates | Track deletion confirmation and restoration-window behavior in a retention audit evidence pack |
| **SOC 2 CC6 / P2, CC7** | Identity and least-privilege review of profile mutation paths | Ownership model and policy ownership in `docs/security/profile-account-security-control-ownership-and-review-cadence.md` | Add ownership sign-off for every merged profile/account PR via project evidence comments |
| **SOC 2 CC8 / CC9** | Change management and incident traceability for high-impact account operations | Role checks + redaction/masking strategy references in `docs/security/owasp-asvs-profile-account-controls.md` and audit trails (`task`-linked evidence) | Attach review artifacts for merge decisions tied to high-risk mutations and profile deletion actions |
| **CCPA/CPRA deletion and transparency** | Identity/profile visibility controls and deletion workflows | Operational retention policy work from Task `#227` and platform DSAR planning in Story `#182` | Confirm disclosure copy and deletion completion evidence for user-facing journeys |

## Evidence owners and cadence

| Control stream | Primary owner | Backup owner | Review artifact |
| --- | --- | --- | --- |
| Data-subject request handling (access/delete rights) | Privacy Compliance Lead | Platform Security | Story `#182` task evidence + DSAR completion pack |
| Data retention / deletion execution | Backend Platform | Product Security | Retention controls (`#227`), config/docs in this repo |
| Identity and auth lifecycle controls | Security Engineering | Backend Platform | Threat model and ASVS mapping docs |
| Logging and redaction controls | Observability + Backend | Site QA | Security ownership cadence doc + log redaction verification tickets |

## Legal/compliance touchpoint index

- `docs/security/profile-account-threat-model.md`
- `docs/security/owasp-asvs-profile-account-controls.md`
- `docs/security/profile-account-security-control-ownership-and-review-cadence.md`
- `docs/security/profile-account-timeout-deadline-budgets.md`
- Story `#182` acceptance and linked roadmap tasks `#228`, `#229`, `#230`, and `#227`

## Verification checklist

- [ ] Confirm all profile/account controls above have current evidence links to concrete PRs/issues.
- [ ] Add a compliance review timestamp in the story evidence thread after each milestone.
- [ ] Publish a concise legal-control matrix export for `NFR-Compliance` review.
- [ ] Record remaining gaps and owners for unresolved evidence against each mapping row.
- [ ] Keep the explicit criteria matrix in
  [`docs/security/profile-account-compliance-criteria-matrix.md`](./profile-account-compliance-criteria-matrix.md) aligned whenever controls evolve.
