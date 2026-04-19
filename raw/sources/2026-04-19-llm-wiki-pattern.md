# Source Capture: LLM Wiki

## Provenance
- Captured from the user's chat message on 2026-04-19.
- Purpose: define a persistent LLM-maintained personal wiki / second brain pattern.

## Source Text

### Core Idea
Most people use LLMs with documents in a retrieval-first workflow. The model repeatedly rediscovers knowledge from raw documents at query time. The proposed alternative is a persistent, interlinked wiki that the LLM continuously maintains. New sources are read once, integrated into the wiki, and used to update summaries, entity pages, topic pages, contradictions, and synthesis.

### Key Points
- The wiki is a persistent, compounding artifact rather than an ephemeral retrieval result.
- The LLM handles summarizing, cross-referencing, filing, bookkeeping, and consistency maintenance.
- The human focuses on sourcing, direction, and questions.
- The architecture has three layers: raw sources, wiki pages, and a schema file that governs behavior.
- Core operations are ingest, query, and lint.
- `index.md` is the content catalog.
- `log.md` is the chronological operational history.
- Optional CLI tooling can be added later if search at larger scale becomes necessary.

### Example Use Cases
- Personal second brain
- Research workflow
- Book companion wiki
- Team or business wiki
- Competitive analysis and due diligence

### Why It Works
- The maintenance burden is the part humans abandon.
- LLMs can cheaply handle repetitive wiki maintenance across many files.
- The result is a growing knowledge base whose synthesis improves over time.

## Notes
- This source is foundational for the vault and should remain immutable.
- Derived pages should cite this file until enough additional sources exist to support stronger synthesis.
