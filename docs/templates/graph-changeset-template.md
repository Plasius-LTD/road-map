# Graph Changeset Template

Use this structure when preparing release-impact summaries across graph repos.

## Packages

- `@plasius/<package-a>`: `<patch|minor|major>`
- `@plasius/<package-b>`: `<patch|minor|major>`

## Summary

`<short description of what changed and why>`

## Compatibility Notes

- Contract impact: `<none | detail>`
- Runtime impact: `<none | detail>`
- Rollout order constraints: `<detail>`

## Verification

- [ ] Lint/type/tests/build passed
- [ ] Changelog updated
- [ ] ADR updated (if required)
- [ ] Road-map issue updated with evidence
