# Log

Append-only operational timeline for the wiki.

## [2026-04-19] bootstrap | initialize wiki schema
- Created `CLAUDE.md`, `index.md`, `log.md`, folder structure, and folder conventions.
- Set the repository root as the wiki and Obsidian vault root.
- Established the default workflow for ingest, query, and lint operations.

## [2026-04-19] ingest | LLM Wiki idea file
- Captured the user's idea file as the first raw source.
- Created a source summary page for the idea.
- Created initial topic pages for `llm-wiki` and `second-brain`.
- Created an initial synthesis page translating the idea into this vault's operating model.

## [2026-04-19] query | codebase project map
- Created a codebase hub note and linked architecture notes so Obsidian graph can show relationships through markdown notes.
- Added links from the new notes to important code files in `app/`, `components/`, `src/`, `prisma/`, and `scripts/`.
- Updated `index.md` to catalog the new project and synthesis pages.

## [2026-04-19] query | domain-level code maps
- Added domain maps for `finance`, `kpi`, `settings/admin`, and `api surface`.
- Linked each domain note back to the codebase hub and across related domains so the graph has more structure.
- Extended `index.md` and the project hub to expose the new domain-level navigation layer.
