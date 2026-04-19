---
title: LLM Wiki Pattern
type: source
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - source
  - second-brain
  - knowledge-management
sources:
  - raw/sources/2026-04-19-llm-wiki-pattern.md
---

# LLM Wiki Pattern

## Summary
This source argues that a personal knowledge system works better when an LLM incrementally maintains a persistent wiki instead of repeatedly doing retrieval against raw documents. The central gain is accumulated synthesis: cross-links, contradictions, and summaries are built once and updated over time.

## Core Claims
- Retrieval-only workflows do not compound knowledge.
- The useful artifact is a maintained markdown wiki that sits between the human and the raw source corpus.
- The wiki should be governed by a schema file that defines structure and workflows.
- Every ingest can update multiple derived pages rather than producing a single isolated note.
- Durable query outputs should also be filed back into the wiki.

## Structural Implications For This Vault
- `CLAUDE.md` should define behavior, not just formatting.
- `index.md` should be the first navigation surface for future sessions.
- `log.md` should be append-only and machine-parseable.
- Raw sources should remain immutable after capture.
- Topic and synthesis pages should absorb meaning from multiple sources over time.

## Open Questions
- When the vault grows, what search tooling should be added beyond `index.md`?
- Which personal domains should get their own area pages first: health, work, learning, finance, or relationships?
- How strict should the vault be about filing durable query outputs back into `pages/queries/`?

## Related
- [../topics/llm-wiki.md](../topics/llm-wiki.md)
- [../topics/second-brain.md](../topics/second-brain.md)
- [../syntheses/2026-04-19-second-brain-operating-model.md](../syntheses/2026-04-19-second-brain-operating-model.md)
- [../../raw/sources/2026-04-19-llm-wiki-pattern.md](../../raw/sources/2026-04-19-llm-wiki-pattern.md)
