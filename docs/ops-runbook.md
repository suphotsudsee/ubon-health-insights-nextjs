# Operations Runbook

## Overview

This runbook provides operational procedures for Ubon Health Insights deployment.

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Database Management](#database-management)
3. [Backup & Recovery](#backup--recovery)
4. [Troubleshooting](#troubleshooting)
5. [Incident Response](#incident-response)
6. [Maintenance](#maintenance)

---

## Daily Operations

### Starting Services

```bash
# Start all services
docker compose up -d

# Verify all containers are running
docker compose ps

# Expected output: 2-3 containers (app, db, optional adminer)
```

### Stopping Services

```bash
# Graceful stop
docker compose stop

# Stop and remove containers
docker compose down

# ⚠️ Stop and remove all data (including database)
docker compose down -v
```

### Viewing Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f db

# Last 100 lines
docker compose logs --tail=100 app
```

### Health Check

```bash
# Application health
curl http://localhost:3000/api/health

# Database connectivity (from app container)
docker compose exec app npx prisma db execute --stdin <<< "SELECT 1"

# Direct database check
docker compose exec db mysql -u ubon -p'${DB_PASSWORD}' -e "SELECT 1"
```

---

## Database Management

### Accessing MariaDB

```bash
# Interactive shell
docker compose exec db mysql -u ubon -p

# Run a query directly
docker compose exec db mysql -u ubon -p'${DB_PASSWORD}' ubon_health -e "SHOW TABLES;"

# Root access
docker compose exec db mysql -u root -p'${DB_ROOT_PASSWORD}'
```

### Running Migrations

```bash
# Deploy pending migrations
docker compose exec app npx prisma migrate deploy

# Create new migration (development)
npx prisma migrate dev --name description_of_change

# Check migration status
docker compose exec app npx prisma migrate status
```

### Database Reset

```bash
# ⚠️ WARNING: This deletes all data!
# Development only!

# Reset database
docker compose exec app npx prisma migrate reset

# Or complete reset
docker compose down -v
docker compose up -d
docker compose exec app npx prisma migrate deploy
```

### Connection Pooling

For production scaling, consider connection pooling:

```yaml
# Add to docker-compose.yml
services:
  db-proxy:
    image: ghcr.io/db-proxy/mariadb-proxy
    environment:
      - DB_HOST=db
      - DB_PORT=3306
    networks:
      - ubon-network
```

---

## Backup & Recovery

### Creating Backups

#### Manual Backup

```bash
# Full database backup
docker compose exec db mysqldump -u root -p'${DB_ROOT_PASSWORD}' \
  --single-transaction \
  --routines \
  --triggers \
  ubon_health > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
docker compose exec db mysqldump -u root -p'${DB_ROOT_PASSWORD}' \
  --single-transaction \
  ubon_health | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Automated Backup Script

Create `scripts/backup-db.sh`:

```bash
#!/bin/bash
# Automated MariaDB backup script

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/ubon_health_${DATE}.sql.gz"
RETENTION_DAYS=30

# Create backup
mkdir -p "$BACKUP_DIR"
docker compose exec -T db mysqldump -u root -p"${DB_ROOT_PASSWORD}" \
  --single-transaction \
  ubon_health | gzip > "$BACKUP_FILE"

# Rotate old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup created: $BACKUP_FILE"
```

#### Schedule with Cron

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/scripts/backup-db.sh >> /var/log/backup.log 2>&1
```

### Restoring from Backup

```bash
# Stop the app to prevent data conflicts
docker compose stop app

# Restore from SQL file
docker compose exec -T db mysql -u root -p'${DB_ROOT_PASSWORD}' ubon_health < backup_20250101_120000.sql

# Or from compressed backup
gunzip -c backup_20250101_120000.sql.gz | docker compose exec -T db mysql -u root -p'${DB_ROOT_PASSWORD}' ubon_health

# Restart the app
docker compose start app
```

### Verify Backup Integrity

```bash
# Check backup file contents
zcat backup_file.sql.gz | head -n 20

# Verify backup can be restored (test environment only!)
# Create test database and restore
docker compose exec db mysql -u root -p'${DB_ROOT_PASSWORD}' -e "CREATE DATABASE test_restore;"
gunzip -c backup_file.sql.gz | docker compose exec -T db mysql -u root -p'${DB_ROOT_PASSWORD}' test_restore
docker compose exec db mysql -u root -p'${DB_ROOT_PASSWORD}' -e "DROP DATABASE test_restore;"
```

---

## Troubleshooting

### Application Won't Start

**Symptoms:** Container exits immediately or keeps restarting.

**Steps:**

```bash
# 1. Check logs
docker compose logs app

# 2. Verify environment
docker compose config

# 3. Check if ports are in use
netstat -tlnp | grep 3000

# 4. Verify database connection
docker compose exec db mysql -u ubon -p'${DB_PASSWORD}' -e "SELECT 1"
```

**Common Issues:**

| Issue | Solution |
|-------|----------|
| `NEXTAUTH_SECRET` missing | Generate and set in `.env` |
| `DATABASE_URL` invalid | Check format: `mysql://user:pass@host:port/db` |
| Port conflict | Change `APP_PORT` in `.env` |
| Database not ready | Increase `start_period` in healthcheck |

### Database Connection Errors

**Symptoms:** `Can't reach database server` or `Connection refused`.

**Steps:**

```bash
# 1. Verify MariaDB is running
docker compose ps db

# 2. Check MariaDB logs
docker compose logs db

# 3. Test connection manually
docker compose exec db mysql -u ubon -p'${DB_PASSWORD}' -e "SELECT 1"

# 4. Verify network
docker compose exec app ping db
```

**Solutions:**

- Wait for database health check to pass
- Verify `DATABASE_URL` uses container name (`db`, not `localhost`)
- Check if database was created: `SHOW DATABASES;`

### Performance Issues

**Symptoms:** Slow page loads, timeouts.

**Steps:**

```bash
# 1. Check resource usage
docker stats

# 2. Check database connections
docker compose exec db mysql -e "SHOW PROCESSLIST;"

# 3. Check slow queries
docker compose exec db mysql -e "SHOW VARIABLES LIKE 'slow_query%';"

# 4. Review application logs
docker compose logs app | grep -i "error\|timeout\|slow"
```

**Solutions:**

- Increase memory limits in docker-compose
- Add database indexes for slow queries
- Enable query logging temporarily

### Memory Issues

**Symptoms:** Container OOM killed, unresponsive.

**Steps:**

```bash
# Check memory limits
docker compose exec app cat /sys/fs/cgroup/memory/memory.limit_in_bytes

# Monitor memory
docker stats --no-stream

# Check Node.js memory
docker compose exec app node -e "console.log(process.memoryUsage())"
```

**Solutions:**

```yaml
# Add to docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

---

## Incident Response

### Incident Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| P1 | Production down | 5 minutes |
| P2 | Degraded performance | 30 minutes |
| P3 | Non-critical issues | 2 hours |
| P4 | Minor issues | Next business day |

### P1: Application Down

```bash
# 1. Diagnose
docker compose ps
docker compose logs --tail=100 app

# 2. Quick restart attempt
docker compose restart app

# 3. If restart fails, full restart
docker compose down && docker compose up -d

# 4. If still failing, check database
docker compose logs db

# 5. Last resort: restore from backup
# (See Backup & Recovery section)
```

### P1: Database Corruption

```bash
# 1. Stop application immediately
docker compose stop app

# 2. Assess damage
docker compose exec db mysql -e "CHECK TABLE users;"

# 3. If recoverable, run repairs
docker compose exec db mysql -e "REPAIR TABLE affected_table;"

# 4. If not recoverable, restore from backup
# (See Backup & Recovery section)

# 5. Restart application
docker compose start app
```

---

## Maintenance

### Regular Maintenance Tasks

| Task | Frequency | Command |
|------|-----------|---------|
| Check disk space | Weekly | `df -h` |
| Review logs for errors | Weekly | `docker compose logs --grep=error` |
| Update dependencies | Monthly | `npm update` |
| Security audit | Monthly | `npm audit` |
| Rotate backups | Daily | Automatic via script |
| Test restore | Quarterly | See backup section |

### Updating the Application

```bash
# 1. Pull latest code
git pull origin main

# 2. Backup database (before update!)
docker compose exec db mysqldump ... > pre_update_backup.sql

# 3. Rebuild and restart
docker compose build app
docker compose up -d app

# 4. Run migrations
docker compose exec app npx prisma migrate deploy

# 5. Verify
curl http://localhost:3000/api/health
```

### Updating MariaDB

```bash
# 1. Full backup first
docker compose exec db mysqldump ... > pre_upgrade_backup.sql

# 2. Check MariaDB version
docker compose exec db mysql --version

# 3. Update image version in docker-compose.yml
# image: mariadb:10.11 -> image: mariadb:11.x

# 4. Recreate database container
docker compose down db
docker compose up -d db

# 5. Verify
docker compose exec db mysql -e "SELECT VERSION();"
```

### Security Updates

```bash
# Check for container vulnerabilities
docker compose pull
docker compose build --no-cache

# Update npm packages
npm audit fix
npm update

# Regenerate Prisma client
npx prisma generate
```

---

## Emergency Contacts

| Role | Contact |
|------|---------|
| Primary On-Call | [Set by team] |
| Database Admin | [Set by team] |
| DevOps Lead | [Set by team] |

---

## Runbook Version

- **Version:** 1.0.0
- **Last Updated:** 2025-01-18
- **Maintained By:** DevOps Team