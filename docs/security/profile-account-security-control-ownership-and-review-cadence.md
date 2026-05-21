# Profile/account security control ownership and review cadence

This document records security control ownership for profile/account flows covered by Story `#177` and Feature `#169`.

## Scope and governance model

All security controls below apply to the profile/account auth, profile, identity-linking, and logout surfaces described in
`docs/security/profile-account-threat-model.md`.

- Primary governance owner: Security + Platform Engineering leadership in `plasius-ltd-site` delivery.
- Control stewardship rotates only through explicit update in this document.
- Any unresolved Critical/High security gaps block release unless explicitly risk-accepted.

## Control ownership matrix

| Control area | Primary owner | Backup owner | Review cadence | Evidence artifact |
| --- | --- | --- | --- | --- |
| OAuth callback validation (state, nonce, PKCE, redirect hardening) | Security Engineering | Platform Team | Weekly automated checks + monthly manual verification | Threat-model matrix and callback test plan |
| API authorization and privilege boundaries | Backend Platform | Identity/Directory Owner | Weekly review of authz policy changes + monthly audit sample | API ownership and threat coverage notes |
| Session lifecycle and revocation controls | Backend Platform | Platform Security | Weekly synthetic checks + monthly review | Logout/session flow evidence in threat model |
| Profile input validation and schema conformance | Platform App Owners (`dashboard`, `frontend`) | Backend Platform | Per-PR static check + monthly schema regression review | Profile schema test suite references in tasks `#203` |
| Sensitive data redaction and masking controls | Security Engineering | Observability Team | Weekly log policy sweep + monthly log sampling | DSAR/compliance evidence and redaction checklist |
| External dependency hardening (library/runtime/runtime configs) | Security Engineering | SRE | Weekly dependency feed review + monthly patch window | Dependency and scanning evidence in `NFR` controls |
| Incident and alert response playbook alignment | SRE | Platform Incident Lead | Weekly operational triage + quarterly tabletop | Incident runbook and alert routing docs |

## Review cadence

| Cadence | Participants | Deliverable |
| --- | --- | --- |
| Weekly | Platform security lead + feature code owners | Checklist for high-risk controls and open P1/P0 findings |
| Monthly | Security Engineering + product delivery lead | Evidence summary for controls tied to `plasius-ltd-site` profile/account NFR checklist |
| Quarterly | Product, Security, SRE leadership | Gate decision on whether current control posture meets release risk budget |

## Escalation and rework policy

- If any high-risk gap is identified, it is logged as a linked blocker issue in the
  `Plasius-LTD-site` project and moved to the top of the project queue.
- Ownership changes require PR evidence and a project comment referencing updated control matrix entries.

## NFR alignment

- Satisfies the Story `#177` acceptance requirement for explicit ownership and review cadence.
- Supports the `NFR-Security` control gate by making release ownership and periodic review explicit.
