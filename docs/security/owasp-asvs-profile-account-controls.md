# OWASP Top 10 + ASVS control mapping for profile/account surfaces

## Goal

Provide a traceable mapping between profile/account-related components and security
controls to support feature `#169` and related NFR items under epic
`#168`.

## Scope

- Profile account surfaces in web and API flows
- Identity login and OAuth callback handling
- Session, token, and logout handling
- Profile mutation paths (including avatar/profile field updates)

## Mapping matrix

| Surface | Component | OWASP Top 10 item | ASVS category/control | Current control evidence | Gap/next action |
| --- | --- | --- | --- | --- | --- |
| Authentication entry (`login` flows) | Public auth pages and API callback handlers | A01 - Broken Access Control / A07 - Identification and Authentication Failures | V4 (Authentication), V5 (Session management) | Existing auth middleware and OAuth callback validation in existing backend modules | Complete full negative-path test matrix for callback replay and stale code paths |
| Identity provider linking | Profile settings identity section, provider link endpoint | A04 - Insecure Design, A07 - Identification and Authentication Failures | V2 (Authentication design), V3 (Session management), V14 (Malicious code) | Existing linked-identity ownership model; threat model to be attached to this artifact | Validate link ownership transitions with automated integration tests |
| Profile read | Profile API GET handlers and public profile read path | A01, A03 - Injection, A06 - Security Misconfiguration | V5 (Validation), V9 (Output encoding), V12 (Error handling) | Input validation and output filtering should be confirmed via API contract review | Add contract-based tests for unauthorised read and field-shape minimisation |
| Profile write | Profile update API, avatar upload helpers | A01, A07, A08 - Software and Data Integrity Failures | V2, V5, V13 (API and state integrity) | Existing mutation checks and mutation payload schemas need explicit threat coverage | Add regression test for privilege escalation and malformed payload writes |
| Logout/session invalidation | Logout endpoint and token invalidation path | A02 - Cryptographic Failures | V10 (Network communication), V5 (Session management) | Versioned logout path and token lifecycle documented in `@plasius` account hardening backlog | Confirm cache and token-blacklist invalidation under outage and retry |
| Administrative profile actions | Admin profile workflows and destructive action paths | A01, A05 - Security Misconfiguration | V2, V5, V10, V13 | Action permission checks to be verified per workflow | Add audit assertions and role-boundary tests |

## Abuse case inventory

1. **Session fixation and privilege abuse**
   - Attackers attempt to reuse or force authenticated sessions via account ownership change.
   - Controls: session regeneration, token rotate-on-switch, audit and alerting.

2. **OAuth callback spoofing**
   - Attackers forge provider responses or replay stale authorization artifacts.
   - Controls: strict nonce/state validation, clock-skew checks, issuer/audience validation.

3. **Profile mutation abuse**
   - Attackers update restricted fields or mass mutate profile data for data poisoning.
   - Controls: schema-level allow/deny, ownership checks, rate limiting, idempotency.

4. **Sensitive-field leakage in responses/telemetry**
   - Sensitive tokens, identifiers, and email content appear in logs or UI.
   - Controls: log redaction, mask-at-presentation rules, and data minimisation.

## Ownership and verification

- **Product owner:** Identity & Profile Platform Lead
- **Control owner:** Security/Identity Engineering
- **Reviewer:** Architecture + platform NFR lead
- **Initial evidence status:** Documentation complete; code-level verification tasks remain in child tasks #201, #221, #222, #225, #229.

## Test hooks to implement

- [ ] Add API contract tests for token/session revocation edge cases.
- [ ] Add abuse-case tests for callback replay and privilege boundary flips.
- [ ] Add logging redaction tests for sensitive profile and identity identifiers.
- [ ] Add regression checks for unauthorized profile field reads and writes.

## Release traceability

- This matrix is evidence for:
  - Story `[STORY] F21.S1 OWASP/ASVS threat model and control mapping` (`#177`)
  - Task `[TASK] F21.S1.T2 Map endpoints/components to OWASP Top 10 and ASVS controls matrix` (`#202`)
