# Hotcache

Read this file first. It is a short rolling cache of the most recent high-value context, capped at about 500 words.

## 2026-04-19 Recent Context
- This repo is being used as both a Next.js app and an Obsidian-based LLM wiki. `CLAUDE.md` is the schema contract for future sessions.
- Obsidian was configured to behave more like a wiki plus file browser. `node_modules` is hidden from explorer/graph-related views, and project-map notes were created so the graph can visualize code relationships through markdown notes instead of raw source files.
- Encoding safety for Thai text is an active concern. The repo now has UTF-8 safeguards and `CLAUDE.md` includes `Encoding Safety` plus `Thai-Safe Edit Protocol`. Avoid broad rewrites of Thai-containing files.
- Finance import was extended to support multi-file and folder-based monthly expense imports. The importer now detects workbook types, aggregates expense documents by unit and month, and can import an entire folder for one unit/month.
- A preview flow was added for finance import. The settings finance screen now supports `Preview before import`, showing processed files, detected units, ready rows, issues, and whether a row will create or update a finance record.
- A monthly import dashboard was added in finance settings. It shows imported vs missing units for the selected month and overlays preview status when available. This is intended for recurring imports across many health units.
- Coolify deployment failed earlier because `next build` broke on a Next 16 type check in `app/login/page.tsx`. That was fixed by handling `useSearchParams()` as nullable. Local `npm run build` now passes.
- A fiscal-period issue blocked finance import: `Fiscal period for year 2569 month 4 not found`. The system already had backend support for fiscal years, but no visible UI entry point. Finance settings now includes a button to `Create or repair fiscal year <selectedYear>`.
- The fiscal-year creation backend was also improved: posting to `/api/fiscal-periods` now creates missing months for an existing fiscal year instead of failing if the year exists partially. This specifically addresses years that are present but incomplete.
- Finance edit dialogs were adjusted to fit smaller screens better: dialog height is capped to viewport and internal sections can scroll.

## Active Guidance
- Before answering or editing, check whether the task can be resolved from this file plus `index.md` without wider browsing through the vault.
- If the task touches finance import, fiscal periods, or Thai text, treat those as high-sensitivity areas and prefer minimal, verified patches.
