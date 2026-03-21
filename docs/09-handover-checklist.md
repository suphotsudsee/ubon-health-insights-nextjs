# Handover Checklist - Ubon Health Insights

## Project Overview
**Project:** Ubon Health Insights Dashboard  
**Platform:** Next.js 14+ (App Router)  
**Database:** PostgreSQL (via Supabase/PostgreSQL)  
**Deployment:** Vercel (Recommended) / Self-hosted  
**Last Updated:** 2026-03-21

---

## Pre-Handover Checklist

### Code & Repository
- [ ] All source code committed to repository
- [ ] No hardcoded secrets or credentials in code
- [ ] `.env.example` file updated with all required variables
- [ ] README.md is current and accurate
- [ ] License file included (if applicable)

### Documentation
- [ ] Admin Manual completed
- [ ] Developer Guide completed
- [ ] API documentation available
- [ ] Database schema documented
- [ ] Environment variables documented

### Database
- [ ] Database schema migrations created
- [ ] Seed data scripts ready
- [ ] Database backup procedure documented
- [ ] Connection strings verified

### Dependencies
- [ ] `package.json` dependencies locked
- [ ] `package-lock.json` committed
- [ ] Node.js version specified (preferably in `.nvmrc`)

### Testing
- [ ] Unit tests passing
- [ ] Integration tests passing (if applicable)
- [ ] Manual QA completed
- [ ] Known issues documented

### Deployment
- [ ] Production build tested locally
- [ ] Environment variables configured for production
- [ ] Domain/DNS settings documented
- [ ] SSL certificate configured

---

## Handover Items

### 1. Repository Access
| Item | Status | Notes |
|------|--------|-------|
| Git repository URL | ⬜ | Provide GitHub/GitLab/Bitbucket link |
| Access credentials | ⬜ | Ensure recipient has access |
| Branch protection rules | ⬜ | Document if applicable |

### 2. Environment Setup
| Item | Status | Notes |
|------|--------|-------|
| `.env.local` (development) | ⬜ | Hand over securely |
| `.env.production` | ⬜ | Hand over securely |
| API keys & tokens | ⬜ | List all external services |

### 3. Database
| Item | Status | Notes |
|------|--------|-------|
| Database host/credentials | ⬜ | Hand over securely |
| Migration scripts | ⬜ | Located in `/migrations` |
| Seed data | ⬜ | Located in `/seeds` |
| Backup schedule | ⬜ | Documented |

### 4. External Services
| Service | Purpose | Access Method |
|---------|---------|---------------|
| Supabase | Database/Auth | Account credentials |
| Vercel | Hosting | Team access |
| SendGrid/Resend | Email | API key |
| Sentry | Error tracking | Project access |

### 5. Deployment
| Item | Status | Notes |
|------|--------|-------|
| Production URL | ⬜ | Live site |
| Staging URL | ⬜ | If applicable |
| Build pipeline | ⬜ | CI/CD documented |
| Rollback procedure | ⬜ | Documented |

---

## Recipient Checklist

### For New Developers
- [ ] Repository cloned successfully
- [ ] `npm install` completed without errors
- [ ] Local development server runs (`npm run dev`)
- [ ] Environment variables configured
- [ ] Database connection established
- [ ] Can view application locally
- [ ] Can run tests successfully

### For System Administrators
- [ ] Production server access confirmed
- [ ] Can access database directly
- [ ] Can view logs
- [ ] Can restart services
- [ ] Backup/restore tested
- [ ] Monitoring dashboards accessible

---

## Post-Handover Support

| Item | Details |
|------|---------|
| Support Contact | [Name, Email, Phone] |
| Available Until | [Date] |
| Preferred Contact Method | [Email/Slack/etc] |
| Escalation Path | [Name/Contact for urgent issues] |

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Handing Over | | | |
| Receiving | | | |
| Witness (optional) | | | |

---

## Notes

Add any additional notes, caveats, or special instructions here:

- 
- 
- 
