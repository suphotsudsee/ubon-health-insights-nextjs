---
title: Folder Conventions
type: meta
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - meta
  - structure
sources: []
---

# Folder Conventions

## Rule of Thumb
- `raw/` stores source truth.
- `pages/` stores synthesized knowledge.
- `meta/` stores governance.
- `templates/` stores reusable scaffolds.

## `raw/`
- `raw/inbox/`: newly dropped material that has not been processed yet.
- `raw/sources/`: immutable source captures after ingest.
- `raw/assets/`: images, PDFs, exports, screenshots, and other binary attachments.

## `pages/`
- `pages/areas/`: long-lived domains of life.
- `pages/people/`: person records and relationship context.
- `pages/projects/`: project state, goals, decisions, and outcomes.
- `pages/topics/`: concepts and subjects that recur across many sources.
- `pages/sources/`: a normalized summary page for each ingested source.
- `pages/syntheses/`: cross-source analyses and operational models.
- `pages/queries/`: durable answers created from user questions.
- `pages/daily/`: optional daily notes or time-bound session pages.

## Page Design Rules
- Each page should have one clear job.
- Source pages summarize one source.
- Topic pages merge evidence across many sources.
- Synthesis pages contain interpretation, comparison, or decision-ready output.
- Query pages are for answers worth keeping.

## Naming Conventions
- Use lowercase kebab-case.
- Start source-related filenames with `YYYY-MM-DD` when the date matters.
- Prefer stable concept names like `sleep-quality.md` over vague names like `thoughts-on-sleep.md`.

## Link Hygiene
- New pages must be linked from `index.md`.
- New topic, project, or synthesis pages should link to at least one related page.
- If a page remains isolated after creation, either cross-link it or delete it.
