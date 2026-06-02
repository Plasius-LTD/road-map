# Profile/account explicit compliance criteria matrix

## Scope

This matrix maps implemented profile/account controls to explicit legal and control criteria for
Feature `#170` / Story `#182` and supports NFR `NFR-Compliance`.

## Implemented control evidence matrix

| Compliance criterion | Implemented control | Evidence source | Validation note |
| --- | --- | --- | --- |
| Data minimisation and purpose limitation | Profile/account schema scope and ownership fields are constrained to product-required data | `docs/security/owasp-asvs-profile-account-controls.md` + `docs/security/profile-account-compliance-control-mapping-gdpr-ccpa-soc2.md` | Validate new data fields through PR review and schema tests before merge |
| Access and deletion rights readiness | DSAR/delete workflow ownership and retention behavior coverage in progress and evidence in Story `#182` (`#227`) | `#227` implementation; Task `#228` legal/control mapping | Verify deletion/retention controls against recurring runbook checkpoints |
| Retention and archival controls | Retention and soft-delete behavior documented and planned in control mapping/runbook | `docs/security/profile-account-compliance-runbook.md` + `docs/security/profile-account-compliance-control-mapping-gdpr-ccpa-soc2.md` | Confirm runtime config and scheduled cleanup behavior when retention-related code changes land |
| Security ownership and review cadence | Role and periodic review responsibilities established | `docs/security/profile-account-security-control-ownership-and-review-cadence.md` | Review cadence is actively tracked in project/issue evidence threads |
| Recurring control-review and audit | Recurring checklist and evidence capture added | `docs/security/profile-account-compliance-runbook.md` | Execute checklist at each recurring cycle and close open gaps in story-level evidence |

## Verification checkpoints

- Link each implemented control update back to this matrix row.
- Keep evidence links current when control behavior or data paths change.
- Escalate any criterion with missing evidence as a blocker issue in the `Plasius-LTD-site` project.

## Current status

- This matrix is complete for Story `#182` documentation controls and is awaiting final Story-level sign-off after all planned compliance controls are implemented in-product paths.
