---
title: LLM Wiki
type: topic
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - topic
  - knowledge-management
  - llm
sources:
  - raw/sources/2026-04-19-llm-wiki-pattern.md
---

# LLM Wiki

## Definition
An LLM wiki is a persistent, interlinked markdown knowledge base that an LLM incrementally maintains as new sources and questions arrive.

## Distinguishing Features
- Knowledge is compiled into pages instead of re-derived from raw documents each time.
- Cross-references and contradictions are part of the maintained artifact.
- The LLM is responsible for the maintenance burden humans usually abandon.
- The schema file defines disciplined behavior for ingest, query, and lint operations.

## Operating Loop
1. Capture a raw source.
2. Summarize it into a source page.
3. Update related topic, area, project, or person pages.
4. Record the action in the log.
5. Reuse the updated wiki for future questions.

## Risks
- Weak schema discipline leads back to generic-chat behavior.
- Duplicated topic pages will fragment synthesis.
- If source provenance is weak, later claims become hard to trust.

## Related
- [second-brain.md](./second-brain.md)
- [../sources/2026-04-19-llm-wiki-pattern.md](../sources/2026-04-19-llm-wiki-pattern.md)
- [../syntheses/2026-04-19-second-brain-operating-model.md](../syntheses/2026-04-19-second-brain-operating-model.md)
