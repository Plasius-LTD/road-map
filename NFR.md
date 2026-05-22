# Non-Functional Requirements for `road-map`

## 1. Purpose

This document records non-functional expectations for the planning repository.

## 2. Security and Privacy

- No secrets, credentials, private credentials, or operational tokens are allowed in
  tracked documentation.
- Ensure links to external governance resources are reviewed for trust and integrity.

## 3. Reliability

- Governance documents must remain deterministic and versionable.
- Templates and release notes should stay consistent and reproducible across
  iterations.
- Changes should preserve existing template compatibility unless explicitly
  versioned.
- Timeout and deadline budgets for profile/account reliability controls are defined in
  [`docs/security/profile-account-timeout-deadline-budgets.md`](./docs/security/profile-account-timeout-deadline-budgets.md),
  including propagation and fallback behavior.

## 4. Accessibility and Comprehensibility

- Docs should remain readable, structured, and navigable.
- ADRs should include a decision context and consequence notes for traceability.

## 5. Rollout Control

- Repository baseline work aligns to parent feature governance:
  `platform.repo-hardening-sweep.enabled`.
