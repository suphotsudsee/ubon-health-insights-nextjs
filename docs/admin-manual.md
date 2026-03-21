# Admin Manual - Ubon Health Insights

## Table of Contents
1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Running Locally](#running-locally)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## System Overview

**Ubon Health Insights** is a Next.js 14+ application that provides health data visualization and analytics dashboard. It connects to a PostgreSQL database to store and retrieve health-related metrics.

### Technology Stack
- **Frontend:** Next.js 14+, React 18+, TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (via Supabase recommended)
- **ORM:** Prisma
- **Authentication:** NextAuth.js or Supabase Auth
- **Deployment:** Vercel (recommended)

---

## Prerequisites

### Required Software
| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or 20.x LTS | Runtime environment |
| npm | 9.x+ | Package manager |
| Git | 2.x+ | Version control |
| PostgreSQL | 14.x+ | Database (if running locally) |

### Verify Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version

# Check PostgreSQL (if local)
psql --version
```

---

## Environment Setup

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd ubon-health-insights-nextjs
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
# Application
NEXT_PUBLIC_APP_NAME="Ubon Health Insights"
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/ubon_health?schema=public"

# If using Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Authentication (NextAuth.js)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key

# OAuth Providers (if applicable)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email (optional - for notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password

# API Keys
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

---

## Database Setup

### Option A: Local PostgreSQL

#### 1. Install PostgreSQL
- **Windows:** Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **macOS:** `brew install postgresql`
- **Linux:** `sudo apt-get install postgresql`

#### 2. Create Database
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create database
CREATE DATABASE ubon_health;

# Create user (optional but recommended)
CREATE USER ubon_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ubon_health TO ubon_user;

# Exit
\q
```

#### 3. Run Migrations
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Or deploy to production
npx prisma migrate deploy
```

#### 4. Seed Database (Optional)
```bash
npx prisma db seed
```

### Option B: Supabase (Recommended for Production)

#### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up / Sign in
3. Create new project
4. Choose region closest to your users
5. Save the project URL and anon key

#### 2. Update Environment Variables
Add Supabase credentials to `.env.local`:
```env
DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
```

#### 3. Push Schema
```bash
npx prisma db push
```

### Database Schema Overview

Key tables:
- `users` - User accounts and profiles
- `health_metrics` - Health data records
- `dashboards` - Saved dashboard configurations
- `reports` - Generated reports

---

## Running Locally

### Development Mode
```bash
npm run dev
```
- URL: http://localhost:3000
- Hot reload enabled
- Debug mode active

### Production Build (Local Testing)
```bash
# Build application
npm run build

# Start production server
npm start
```

### Useful Development Commands
```bash
# Run Prisma Studio (database GUI)
npx prisma studio

# Lint code
npm run lint

# Type check
npm run type-check

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

---

## Deployment

### Option 1: Vercel (Recommended)

#### 1. Prepare for Deployment
```bash
# Ensure build succeeds locally
npm run build
```

#### 2. Deploy to Vercel

**Via CLI:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Via Git Integration:**
1. Push code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Configure environment variables
4. Deploy

#### 3. Configure Environment Variables in Vercel
In Vercel Dashboard → Project Settings → Environment Variables:
- Add all variables from `.env.local`
- Mark sensitive variables as "Secret"

#### 4. Configure Database Connection
- Use production database URL
- Ensure database allows Vercel IP ranges (if restricted)

### Option 2: Self-Hosted (Docker)

#### 1. Build Docker Image
```bash
docker build -t ubon-health-insights .
```

#### 2. Run Container
```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e NEXTAUTH_SECRET="your_secret" \
  ubon-health-insights
```

### Option 3: Traditional Server (Linux)

#### 1. Build Application
```bash
npm ci
npm run build
```

#### 2. Setup PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'ubon-health-insights',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 3. Configure Nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
**Error:** `P1001: Can't reach database server`

**Solutions:**
- Verify DATABASE_URL is correct
- Check if database server is running
- Confirm network access (firewall rules)
- For Supabase: ensure connection string uses correct format

```bash
# Test database connection
npx prisma db pull
```

#### 2. Prisma Migration Failures
**Error:** Migration fails to apply

**Solutions:**
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or mark migration as applied
npx prisma migrate resolve --applied [migration_name]
```

#### 3. Build Errors
**Error:** `Module not found` or build fails

**Solutions:**
```bash
# Clear caches
rm -rf node_modules .next
npm install
npm run build
```

#### 4. Environment Variable Issues
**Error:** Variables not loading

**Solutions:**
- Verify `.env.local` exists in project root
- Restart development server after changes
- Check variable names match exactly (case-sensitive)
- Ensure no spaces around `=` in `.env.local`

#### 5. Port Already in Use
**Error:** `Port 3000 is already in use`

**Solutions:**
```bash
# Use different port
npm run dev -- --port 3001

# Or kill process using port
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

#### 6. Authentication Issues
**Error:** Login not working

**Solutions:**
- Verify NEXTAUTH_SECRET is set
- Check OAuth provider credentials
- Ensure NEXTAUTH_URL matches your domain
- Check browser console for errors

### Getting Help

1. Check application logs:
   ```bash
   # Vercel
   vercel logs --all
   
   # PM2
   pm2 logs
   ```

2. Enable debug mode:
   ```env
   DEBUG=*
   ```

3. Contact support with:
   - Error message
   - Steps to reproduce
   - Environment details (Node version, OS)
   - Recent changes

---

## Maintenance

### Regular Tasks

| Task | Frequency | Command/Action |
|------|-----------|----------------|
| Dependency updates | Weekly | `npm audit fix` |
| Database backups | Daily | Automated via Supabase/cron |
| Log rotation | Weekly | Configure logrotate |
| Security patches | As needed | Update dependencies |
| Performance review | Monthly | Check Vercel analytics |

### Database Maintenance
```bash
# Connect to database
psql $DATABASE_URL

# Check table sizes
\dt+

# Analyze tables for query optimization
ANALYZE;

# Check for long-running queries
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### Backup Procedures

#### Database Backup
```bash
# Using pg_dump
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore from backup
psql $DATABASE_URL < backup_YYYYMMDD.sql
```

#### Vercel Project Backup
- Git repository serves as code backup
- Export environment variables:
  ```bash
  vercel env pull
  ```

---

## Security Checklist

- [ ] NEXTAUTH_SECRET is a secure random string (min 32 chars)
- [ ] Database credentials use strong passwords
- [ ] Production environment variables marked as secret
- [ ] API routes have proper authentication checks
- [ ] CORS configured appropriately
- [ ] Rate limiting implemented on API endpoints
- [ ] Regular security audits with `npm audit`

---

## Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Start production server | `npm start` |
| Run database migrations | `npx prisma migrate dev` |
| Open database GUI | `npx prisma studio` |
| Check types | `npx tsc --noEmit` |
| Lint code | `npm run lint` |
| Run tests | `npm run test` |

---

**Last Updated:** 2026-03-21  
**Document Version:** 1.0
