# Task: DevOps Engineer (DevOps Agent)

## Target Project

`C:\fullstack\ubon-health-insights-nextjs`

## Mission

Prepare deployment system for new project.

## Required Outputs

1. `Dockerfile` - Multi-stage build for Next.js
2. `docker-compose.yml` - Include MariaDB service
3. `docs/08-deployment-guide.md` - Deployment instructions
4. `docs/ops-runbook.md` - Operations runbook
5. `.env.example` - Environment variables template

## Dockerfile Requirements

- Multi-stage build (build + production)
- Optimized for Next.js
- Health check endpoint
- Proper signal handling

## docker-compose Requirements

- Next.js app service
- MariaDB service
- Volume persistence for DB
- Network configuration
- Environment variables

## Documentation Must Include

- How to run locally
- How to deploy to production
- Backup/restore procedures for MariaDB
- Environment variable descriptions
- Health check endpoints
