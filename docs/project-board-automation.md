# Project Board Automation

This runbook documents the low-cost GitHub Project access path used by backlog
automation such as `HW2`.

## Problem

The `Plasius-LTD-site` organisation Project is large enough that broad
`gh project item-list` or full-detail GraphQL scans can exhaust the per-user
GraphQL budget before the automation reaches the item-selection and status-write
steps.

## Decision

Use the `road-map` helper CLI to split Project work into thin, targeted steps:

1. Resolve the Project id, Status field id, and Status option ids once.
2. Scan only small item pages with minimal fields until a candidate is found.
3. Persist the returned `nextCursor` in automation memory so the next run
   resumes instead of rescanning the top of the board.
4. Spend the remaining GraphQL budget only on the selected item's targeted
   status updates.
5. Keep issue comments on the linked issue path via REST.

This keeps discovery cheap and leaves the expensive GraphQL budget for the
small number of write operations that cannot avoid ProjectV2 APIs.

## Commands

From the `road-map` repo root:

```sh
npm run project:board -- fields --owner Plasius-LTD --project-number 1
```

```sh
npm run project:board -- find-next \
  --owner Plasius-LTD \
  --project-number 1 \
  --self-login zephod111r \
  --page-size 25 \
  --max-pages 4 \
  --cursor '<saved endCursor>'
```

The `find-next` command returns:

- `candidate`: the next eligible item in the scanned window
- `pagesScanned`: the number of thin GraphQL pages consumed
- `itemsExamined`: the number of normalized items considered
- `nextCursor`: the next page cursor to persist in automation memory

To look up a known linked issue cheaply and recover its Project item id:

```sh
npm run project:board -- find-item \
  --owner Plasius-LTD \
  --project-number 1 \
  --repo Plasius-LTD/road-map \
  --issue-number 524 \
  --page-size 25 \
  --max-pages 8
```

To move a selected item to `In progress` after assignment:

```sh
npm run project:board -- claim \
  --owner Plasius-LTD \
  --project-number 1 \
  --item-id '<project item id>' \
  --status 'In progress' \
  --repo Plasius-LTD/road-map \
  --issue-number 524 \
  --assignee zephod111r
```

To update only the Project status:

```sh
npm run project:board -- set-status \
  --owner Plasius-LTD \
  --project-number 1 \
  --item-id '<project item id>' \
  --status Done
```

To add an evidence or blocker comment without touching Project GraphQL writes:

```sh
npm run project:board -- comment \
  --repo Plasius-LTD/road-map \
  --issue-number 524 \
  --body 'Evidence goes here'
```

## Operating notes

- Treat Project order as the primary signal.
- Use Priority as a tiebreaker within the scanned window rather than paying to
  re-rank the entire board on every run.
- Prefer a small `max-pages` budget and resume on the next run when needed.
- Keep the saved cursor in `$CODEX_HOME/automations/<automation_id>/memory.md`.
- Check `gh api rate_limit` before wide scans and after any write-heavy sequence.
