# CLAUDE.md

## Purpose
This vault is a personal LLM-maintained wiki. The human curates sources and asks questions. The agent maintains the markdown knowledge base.

## Operating Mode
- Treat the repository root as the wiki root and Obsidian vault root.
- Use the wiki as the primary working memory, not chat history.
- Prefer updating persistent markdown files over giving one-off answers that disappear.
- Keep raw sources immutable.
- Make small, traceable edits across the wiki rather than rewriting everything.

## Three Layers
1. `raw/`: immutable source material captured from the user, the web, files, transcripts, screenshots, exports, and attachments.
2. `pages/`: LLM-authored wiki pages derived from sources and prior synthesis.
3. `CLAUDE.md`: the schema and workflow contract for every future interaction.

## Canonical Files
- [index.md](./index.md): content-oriented catalog of the wiki.
- [log.md](./log.md): append-only chronological record.
- [meta/folder-conventions.md](./meta/folder-conventions.md): storage rules and naming conventions.

## Folder Map
- `raw/inbox/`: unprocessed drops waiting for ingest.
- `raw/sources/`: processed raw sources, one file per source.
- `raw/assets/`: local images and attachments referenced by raw sources.
- `pages/areas/`: stable life domains such as health, work, finance, relationships, learning.
- `pages/people/`: person pages.
- `pages/projects/`: active or archived projects.
- `pages/topics/`: concept and subject pages.
- `pages/sources/`: source summary pages that translate raw material into wiki-native form.
- `pages/syntheses/`: higher-order analyses, comparisons, plans, and operating models.
- `pages/queries/`: durable answers created from user questions.
- `pages/daily/`: optional daily notes or session notes.
- `meta/`: wiki governance pages.
- `templates/`: optional templates for future automation.

## Naming Rules
- Use lowercase kebab-case filenames.
- Prefix source-derived pages with the source date when chronology matters, for example `2026-04-19-llm-wiki-pattern.md`.
- One page per durable concept. Do not create duplicates with slightly different names.
- Prefer renaming ambiguous pages early instead of letting duplicates accumulate.

## Required Frontmatter
All `pages/` files should start with YAML frontmatter using this shape when possible:

```yaml
---
title: Example Title
type: topic
status: active
created: 2026-04-19
updated: 2026-04-19
tags:
  - second-brain
sources:
  - raw/sources/2026-04-19-llm-wiki-pattern.md
---
```

Valid `type` values:
- `area`
- `person`
- `project`
- `topic`
- `source`
- `synthesis`
- `query`
- `daily`
- `meta`

## Link Rules
- Use relative markdown links between pages.
- Link every new page from `index.md`.
- Add at least one outbound link from a new page to an existing relevant page.
- Avoid orphan pages unless the page is intentionally a raw source.

## Citation Rules
- Cite claims to wiki pages first, raw sources second.
- When summarizing evidence, point to the relevant source summary page and raw source.
- If a claim is uncertain or contested, say so explicitly.
- If a newer source contradicts an older one, preserve both and record the contradiction instead of silently overwriting history.

## Default Workflows

### Ingest
When the user provides a new source:
1. Capture the raw source in `raw/inbox/` or `raw/sources/`.
2. Read the source fully enough to extract key claims, entities, concepts, open questions, and contradictions.
3. Create or update a source summary page in `pages/sources/`.
4. Update any affected `pages/areas/`, `pages/people/`, `pages/projects/`, `pages/topics/`, or `pages/syntheses/`.
5. Update `index.md`.
6. Append a log entry to `log.md`.
7. Tell the user what changed and what new questions or gaps were found.

### Query
When the user asks a question:
1. Read `index.md` first.
2. Read the most relevant wiki pages.
3. Synthesize the answer from the wiki.
4. If the answer is durable, save it to `pages/queries/` or `pages/syntheses/`.
5. Append a query entry to `log.md` if durable work was added.

### Lint
When the user asks for cleanup or health check:
1. Look for orphan pages, duplicate concepts, stale claims, broken links, weak summaries, and missing cross-references.
2. Propose the smallest high-value fixes.
3. Apply the fixes directly.
4. Append a lint entry to `log.md`.

## Interaction Rules
- Every meaningful interaction should either:
  - ingest a source,
  - answer from the wiki,
  - improve the wiki structure,
  - or identify a gap that should become a new page.
- Do not answer as if the wiki does not exist.
- Before major edits, explain what part of the wiki will be changed.
- After edits, summarize the changed files and the resulting new state.

## Content Style
- Write compact, high-signal markdown.
- Prefer factual synthesis over motivational prose.
- Separate observations, interpretations, and open questions.
- Preserve chronology where it matters.
- Use bullets for dense facts and short paragraphs for synthesis.

## Encoding Safety
- Treat all repo text files as UTF-8.
- Assume Thai and other non-ASCII text is high-risk for accidental corruption during edits.
- Do not rewrite a file containing Thai text unless the edit path preserves UTF-8 exactly.
- Before editing a file with Thai or other non-ASCII text, inspect the file carefully and avoid touching unrelated lines.
- Prefer minimal patches over full-file rewrites for files containing Thai text.
- If a command-line readout shows mojibake or unreadable Thai text, do not trust that terminal rendering as source text.
- When Thai text is present, do not retype or normalize it from garbled terminal output.
- After editing a file that contains Thai text, verify the diff and confirm the Thai text was preserved.
- If safe preservation cannot be verified, stop and warn the user instead of making a risky edit.

## Thai-Safe Edit Protocol

### Before Editing
- Check whether the target file contains Thai or other non-ASCII text.
- Decide whether the change can be done without touching Thai strings.
- Prefer a narrowly scoped patch that changes logic around the text, not the text itself.
- If terminal output renders Thai incorrectly, avoid using that output as the source for edits.

### During Editing
- Do not rewrite the whole file just to change a small section.
- Do not manually retype Thai text from garbled terminal output.
- Do not normalize spacing, punctuation, or line endings in unrelated Thai-containing sections.
- Keep edits local to the exact lines required for the task.

### After Editing
- Inspect the diff for the edited file.
- Confirm Thai strings that were not part of the task remain unchanged.
- If Thai text had to be edited intentionally, verify the final file still reads correctly in the editor.
- If the diff shows widespread character changes, stop and treat it as an encoding incident.

### Escalation Rule
- If Thai text cannot be preserved confidently, do not proceed with a risky save. Report the risk and ask for a safer path.

## Human / Agent Division of Labor
- Human responsibilities: curate sources, decide priorities, challenge interpretations, ask questions.
- Agent responsibilities: summarize, cross-link, maintain consistency, update derived pages, log operations, surface gaps.

## Initial Default Domain
Until the user says otherwise, treat this vault as a general-purpose personal second brain with emphasis on health, work, learning, projects, and decision support.
