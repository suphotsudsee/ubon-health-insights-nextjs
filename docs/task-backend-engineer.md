# Task: Backend Engineer (Backend Agent)

## Project Paths

**Legacy:** `C:\fullstack\ubon-health-insights`
**Target:** `C:\fullstack\ubon-health-insights-nextjs`

## CRITICAL RULE

**DO NOT create separate backend** (Express/Nest/FastAPI forbidden)

Build server-side application layer WITHIN Next.js using:
- Route Handlers (`app/api/`)
- Server Actions
- `lib/db` for database client
- Services/repositories pattern
- Auth/session logic
- Validation and error handling

## Required Outputs

1. `src/lib/` - Database client, utilities
2. `src/actions/` - Server actions
3. `src/app/api/` - Route handlers
4. `docs/app-server-layer.md` - Architecture documentation

## Implementation Requirements

- Connect MariaDB on server-side only
- Implement proper error handling
- Input validation on all endpoints
- Authentication/authorization checks
- Logging for audit trail
