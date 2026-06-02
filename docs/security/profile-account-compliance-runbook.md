# Profile/account compliance runbook and recurring control-review checklist

## Scope

This runbook captures the operational and governance controls for profile/account
flows under Feature `#170` and Story `#182` (GDPR/CCPA/SOC2-aligned operations).

It complements:

- `docs/security/profile-account-security-control-ownership-and-review-cadence.md`
- `docs/security/profile-account-compliance-control-mapping-gdpr-ccpa-soc2.md`
- `docs/security/owasp-asvs-profile-account-controls.md`
- `docs/security/profile-account-threat-model.md`

## Pre-release compliance checks

Before any profile/account release:

1. Confirm the task-level evidence is updated for all merged changes in the current cycle.
2. Verify DSAR/export/delete flows remain in sync with retention policy changes from Task `#227`.
3. Confirm role and privilege boundaries for profile mutations and linked-identity operations are still covered by tests/PR evidence.
4. Confirm audit trail retention and redaction expectations are unchanged by the release.
5. Record a short compliance review note in the issue/ PR evidence trail.

## Recurring review schedule

| Cadence | Required actions | Owner | Evidence |
| --- | --- | --- | --- |
| Weekly | Review new profile/account PRs for data-boundary, retention, and access-control changes. | Profile/account feature owner + Security | Project row comments + PR evidence |
| Bi-weekly | Validate open compliance gaps for DSAR workflow quality and test coverage. | Privacy owner | Story `#182` checklist delta and docs snapshots |
| Monthly | Reconcile legal/control mapping artifact against implemented controls. | Security lead + SRE lead | Updated mapping row review + risk register entry |
| Quarterly | Conduct tabletop review for deletion, retention, and identity-control incidents. | Product, Security, SRE leadership | Incident postmortems + action tracker |

## Core operational runbooks

### 1. Data-subject request workflow

- Acknowledge request and confirm identity using existing profile/account identity controls.
- Resolve request type (access / delete / export) and route to the privacy coordinator.
- Validate all relevant datastore entries before data export or deletion.
- Log request lifecycle with timestamps and completion confirmation.

### 2. Deletion and retention validation

- Confirm retention policy in the current release branch matches Task `#227` evidence.
- Execute retention/deletion dry-runs in non-production where feasible.
- Capture whether soft-delete and recovery windows are still enforced.
- Document any accidental retention misses and escalate through issue tracking immediately.

### 3. Identity and auth integrity monitoring

- Monitor linked identity primary-switch and ownership transitions for unreviewed anomalies.
- Validate alerts for suspicious re-link or owner-change behavior.
- Ensure logout/session invalidation behavior remains safe when retrying or under partial outage.

### 4. Control evidence maintenance

- Update `docs/security/profile-account-compliance-control-mapping-gdpr-ccpa-soc2.md` when controls change.
- Confirm all mapped controls point to concrete evidence (tests, issues, threat model sections, or operations docs).
- Remove stale controls and add new mappings for introduced feature flags, endpoints, or data paths.

## Checklist template

When completing each review cycle, collect:

- [ ] Scope and change summary.
- [ ] Last review date and owner.
- [ ] Controls reviewed and evidence links added/updated.
- [ ] Open gaps with owner/target close date.
- [ ] Security/privacy sign-off for continued rollout.

## Escalation

- If high-risk control regressions are found, raise a linked blocker issue in the
  `Plasius-LTD-site` project immediately and pause profile/account rollout pending
  remediation.
