# TDR-0008: Observed-event projection pipeline first implementation slice

## Status

Proposed

## Goal

Define the first service slice for observed-event ingestion, projected Event Log
reads, achievements, and gossip-facing summaries.

## First Slice

- ingest observed gameplay events in an append-friendly shape
- normalize and compact events in storage-backed processing
- project curated player-facing Event Log and Achievement read models
- emit player-safe gossip-relevant summaries derived from the same canonical
  observed-event basis

## Out of Scope

- full real-time streaming guarantees
- hidden server-only truth disclosure
- replacing generic analytics ingestion

## Delivery Notes

- first implementation home should be `plasius-ltd-site`
- existing event-log, achievement, and gossip feature coverage should be reused
  and extended where possible
