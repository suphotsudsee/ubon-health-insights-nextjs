# Deployment Guide

## Overview

This guide covers deploying Ubon Health Insights to production using Docker containers.

## Prerequisites

- Docker Engine 24.0+
- Docker Compose v2.20+
- 2GB+ RAM minimum (4GB+ recommended for production)
- SSL certificate for HTTPS (production)

## Quick Start

### 1. Clone and Configure

```bash
# Clone the repository
git clone <repository-url>
cd ubon-health-insights-nextjs

# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

### 2. Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Add the generated secret to .env.local
NEXTAUTH_SECRET=<your-generated-secret>
```

### 3. Run with Docker Compose

```bash
# Build and start all services
docker compose up -d

# Check container status
docker compose ps

# View logs
docker compose logs -f app
```

### 4. Initialize Database

```bash
# Run Prisma migrations
docker compose exec app npx prisma migrate deploy

# (Optional) Seed initial data
docker compose exec app npx prisma db seed
```

### 5. Verify Deployment

```bash
# Check application health
curl http://localhost:3000/api/health

# Expected response: {"status":"ok"}
```

## Production Deployment

### Environment Setup

1. **Create production `.env` file:**

```bash
# Database (use strong passwords!)
DATABASE_URL=mysql://ubon:STRONG_PASSWORD@db:3306/ubon_health
DB_ROOT_PASSWORD=STRONG_ROOT_PASSWORD
DB_PASSWORD=STRONG_PASSWORD

# NextAuth (generate new secret!)
NEXTAUTH_SECRET=GENERATE_NEW_SECRET
NEXTAUTH_URL=https://your-domain.com

# OAuth providers (if used)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

2. **Configure SSL/TLS:**

Use a reverse proxy (Traefik, Caddy, or Nginx) for SSL termination:

```yaml
# Add to docker-compose.yml under app service
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.app.rule=Host(`your-domain.com`)"
  - "traefik.http.routers.app.entrypoints=websecure"
  - "traefik.http.routers.app.tls.certresolver=letsencrypt"
```

### Running Production

```bash
# Build production image
docker compose -f docker-compose.yml build

# Start services
docker compose up -d

# Run database migrations
docker compose exec app npx prisma migrate deploy

# Monitor logs
docker compose logs -f
```

### Scaling (Optional)

For horizontal scaling, use an external load balancer and shared MariaDB:

```bash
# Scale app instances
docker compose up -d --scale app=3

# Note: Requires external MariaDB and session store
```

## Local Development

### Without Docker

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### With Docker (Development)

```bash
# Start MariaDB only
docker compose up -d db

# Run Next.js locally
npm run dev
```

## Configuration Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | MySQL connection string |
| `NEXTAUTH_SECRET` | Yes | Session encryption secret |
| `NEXTAUTH_URL` | Yes | Public URL of application |
| `NODE_ENV` | Yes | `development` or `production` |
| `DB_*` variables | No | Override default database settings |

### Docker Compose Profiles

```bash
# Run with Adminer (database UI)
docker compose --profile admin up -d

# Access Adminer at http://localhost:8080
```

## Health Check Endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Application health check |
| `GET /api/ready` | Readiness (DB connection) |

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker compose logs app

# Common issues:
# - Missing NEXTAUTH_SECRET
# - DATABASE_URL format incorrect
# - Database not ready yet
```

### Database Connection Issues

```bash
# Verify MariaDB is running
docker compose logs db

# Test connection
docker compose exec db mysql -u ubon -p
```

### Reset Everything

```bash
# ⚠️ WARNING: Deletes all data!
docker compose down -v
docker compose up -d
```

## Security Checklist

- [ ] Change default passwords in `.env`
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Configure HTTPS (not HTTP)
- [ ] Set `NODE_ENV=production`
- [ ] Review OAuth redirect URLs
- [ ] Enable firewall (ports 80, 443 only)
- [ ] Regular database backups
- [ ] Update dependencies regularly

## Monitoring

### Basic Monitoring

```bash
# Container resource usage
docker stats

# Container health
docker compose ps
```

### Recommended Tools

- **Prometheus + Grafana**: Metrics and dashboards
- **Loki**: Log aggregation
- **Uptime Kuma**: Uptime monitoring

## Next Steps

1. Review `docs/ops-runbook.md` for operational procedures
2. Configure automated backups
3. Set up monitoring and alerting
4. Document your specific deployment details