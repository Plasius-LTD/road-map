# ADR Search Index Tooling

## Purpose

The road-map repository owns the offline design-map index for Plasius-LTD ADRs.
The index supports review and inspection of current, proposed, and inactive
architecture decisions across local Plasius repository checkouts.

Tracked work:

- Feature: `Plasius-LTD/plasius-ltd-site#1131`
- Story: `Plasius-LTD/plasius-ltd-site#1132`
- Task: `Plasius-LTD/road-map#520`

## Commands

Run from the `road-map` repository root:

```sh
npm run adr:index
```

This writes:

- `docs/adr-search-index.json`
- `docs/adr-search-index.md`

Use the check command in review or CI contexts:

```sh
npm run adr:index:check
```

## Scan Rules

By default, the CLI treats the parent of `road-map` as the Plasius workspace and
discovers top-level Git repositories. Git worktrees are resolved back to their
common repository config and deduplicated by GitHub remote, so local task
worktrees do not produce duplicate ADR entries.

The scanner includes ADR files under canonical and legacy ADR folders:

- `docs/adrs`
- `docs/adr`
- `docs/ADR`
- `docs/ADRS`

It skips generated or dependency-heavy folders including `.git`, `.worktrees`,
`.codex-worktrees`, `node_modules`, `dist`, `coverage`, `playwright-report`, and
`tsp-output`.

Template files and local ADR `index.md` files are excluded from the search
index.

## Indexed Metadata

Each ADR entry includes:

- repository name, GitHub slug, remote, and workspace-relative path
- ADR number and normalized ADR id when present
- title, status, date, and canonical-versus-legacy path classification
- level-two headings and short heading summaries
- `Supersedes` and `Superseded by` references when documented
- generated tags and normalized `searchText` for structured search consumers

Unknown statuses are preserved as `unknown` rather than guessed. That keeps
metadata gaps visible during review.

## Limitations

The index reads local checkouts only; it does not call the GitHub API to fetch
repositories that are absent from the workspace. Regenerate after pulling or
cloning additional Plasius-LTD repositories.

The tool is offline repository tooling. It introduces no production runtime
surface, entitlement, or remotely evaluated feature flag.
