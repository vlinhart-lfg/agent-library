# Epic: Make.com Scenario Auto-Upload Integration

## Background

We have an agent library built in Next.js (https://github.com/vlinhart-lfg/agent-library) that displays Make.com automation scenarios. Currently, agents are manually added to `/data/templates.json`. We need to enable random users to submit their Make.com scenarios by pasting a shared scenario URL.

## Problem Statement

**Current Process** (Manual, Slow):
1. User creates Make.com scenario
2. Shares it publicly
3. Manually extracts scenario details (title, description, apps used, iframe)
4. Manually creates JSON entry in templates.json
5. Commits and deploys

**Issues**:
- Friction prevents user contributions
- Manual work doesn't scale
- Error-prone copy-paste
- Delays time-to-publish by hours/days

## User Story

As a Make.com user,
I want to submit my shared scenario URL to the agent library,
So that it automatically appears in the public catalog without manual intervention.

**Acceptance Criteria**:
1. User visits `/submit` page on agent-library site
2. Pastes Make.com shared scenario URL (e.g., `https://eu2.make.com/public/shared-scenario/8MrnUpeVs8c/create-linked-in-content-from-articles`)
3. System extracts: title, description, apps used (with logos), iframe embed, "Use Scenario" button
4. System validates extracted data
5. System commits to GitHub repository
6. New agent appears on site within 5 minutes
7. Handles spam/invalid submissions gracefully

## Proposed Solution

### Architecture

**Tech Stack**:
- Existing: Next.js 14 (app router), TypeScript, Vercel hosting
- New: Playwright (JS rendering for scraping), GitHub API, Vercel KV (rate limiting)

**Components**:

1. **Submit Page** (`/app/submit/page.tsx`)
   - Form with URL input
   - Real-time validation (valid Make.com URL format)
   - Preview of extracted data before publishing
   - Success/error states

2. **Extract API** (`/app/api/extract/route.ts`)
   - Accepts Make.com URL
   - Launches Playwright to render JS-heavy page
   - Scrapes: title, description, app list, iframe URL, button URL
   - Returns structured JSON
   - Rate limit: 5 requests/hour per IP

3. **Publish API** (`/app/api/publish/route.ts`)
   - Validates extracted data against schema
   - Generates unique slug from title
   - Appends to `/data/templates.json`
   - Commits to GitHub via API (requires PAT)
   - Triggers Vercel redeployment
   - Returns published agent URL

4. **Scraper Library** (`/lib/make-scraper.ts`)
   - Playwright browser automation
   - Extracts scenario metadata from DOM
   - Handles Make.com page structure changes
   - Error handling for failed scrapes

### Data Flow

```
User → Submit Form → Extract API (Playwright) → Preview
                                                    ↓
                                         User Confirms
                                                    ↓
                                         Publish API
                                                    ↓
                     GitHub Commit → Vercel Deploy → Live
```

### JSON Schema Extension

Add new fields to templates.json:
```json
{
  "makeScenarioUrl": "https://eu2.make.com/public/shared-scenario/...",
  "makeScenarioId": "8MrnUpeVs8c",
  "makeIframeUrl": "https://eu2.make.com/embed/...",
  "makeApps": ["LinkedIn", "RSS", "OpenAI GPT-4", "Notion"],
  "makeAppLogos": ["https://...", "https://...", ...],
  "submittedBy": "github-username",
  "submittedAt": "2025-11-19T17:00:00Z",
  "status": "published"
}
```

## Technical Considerations

### 1. Scraping Reliability
**Risk**: Make.com changes page structure → scraper breaks
**Mitigation**:
- Version scraper logic with date stamps
- Fall back to manual entry form if scraping fails
- Monitor scrape success rate

### 2. Spam Prevention
**Risk**: Bots flood submission form
**Mitigation**:
- Vercel KV rate limiting (5/hour per IP)
- GitHub OAuth required before submit
- Moderation queue (optional approval step)

### 3. Cost Control
**Risk**: Playwright runs are expensive (CPU/memory)
**Mitigation**:
- Cache scraped data for 24 hours (same URL = cached result)
- Timeout after 30 seconds
- Kill zombie browsers
- Budget: 100 scrapes/day max

### 4. GitHub API Limits
**Risk**: 5000 requests/hour limit for authenticated API
**Mitigation**:
- One commit per submission (not a bottleneck)
- Batch multiple submissions if needed
- Monitor API usage

### 5. Vercel Deployment
**Risk**: Too many deployments trigger rate limits
**Mitigation**:
- Vercel auto-deploys on git push
- No artificial limits for hobby tier
- Consider manual deploy trigger if >50 submissions/day

## Timeline

**Phase 1: Core Functionality** (Day 1, 8 hours)
- Submit form UI
- Extract API with Playwright
- Basic scraper for Make.com pages
- Append to templates.json (local testing)

**Phase 2: GitHub Integration** (Day 2, 4 hours)
- GitHub API authentication
- Auto-commit functionality
- Vercel deployment trigger
- Error handling

**Phase 3: Polish** (Day 2, 4 hours)
- Rate limiting with Vercel KV
- Better error messages
- Preview before publish
- Basic spam detection

## Success Metrics

**Launch Goals** (Month 1):
- 20+ user-submitted scenarios
- <5% scraping failure rate
- <2 minute average time from submit to live
- Zero spam/malicious submissions
- 95% uptime

**Quality Metrics**:
- All extracted data accurate (title, description, apps)
- Iframe embeds work on 100% of submissions
- "Use Scenario" button redirects correctly

## Risks & Dependencies

### Critical Risks
1. **Make.com blocks Playwright** → Use proxies or manual entry fallback
2. **GitHub PAT exposed** → Store in Vercel env vars, rotate regularly
3. **Scraper breaks after Make.com redesign** → Monitor and fix within 24h
4. **Spam submissions** → Add OAuth requirement

### Dependencies
- **Playwright**: Required for JS rendering (~150MB docker image on Vercel)
- **GitHub PAT**: Personal access token with repo write permissions
- **Vercel KV**: Rate limiting (optional, can use in-memory initially)
- **Make.com page stability**: Assume structure won't change for 3+ months

### Open Questions
1. Do we approve submissions before publish? (Yes = safer, No = faster)
2. How to handle duplicate scenario submissions? (Detect by URL, reject)
3. Who owns the GitHub PAT? (You initially, migrate to GitHub App later)
4. What if Make.com scenario is deleted? (Scrape fails, show error)

## Alternatives Considered

### Option A: GitHub Issues as Upload (Rejected)
**Pros**: No frontend work, GitHub handles auth
**Cons**: Terrible UX, doesn't fit existing Next.js app

### Option B: Manual Submission Form (Rejected)
**Pros**: No scraping, simpler
**Cons**: User has to extract data manually (defeats purpose)

### Option C: Make.com Webhook (Ideal but unavailable)
**Pros**: Real-time, no scraping
**Cons**: Make.com doesn't offer public webhooks for shared scenarios

## Post-Launch Improvements

**Month 2**:
- Moderation dashboard for reviewing submissions
- Edit/delete functionality for scenario owners
- Upvotes/ratings for scenarios
- Search by apps used

**Month 3**:
- Auto-categorization using LLM
- Duplicate detection with fuzzy matching
- Analytics: views per scenario, clicks to "Use Scenario"

**Future**:
- Make.com official partnership for API access
- Browser extension for one-click submit
- Scenario versioning support

---

**Estimated Effort**: 2 days (16 hours)
**Complexity**: Medium-High (scraping + GitHub API + deployment)
**Value**: High (enables community contributions, scales agent library)
**Priority**: P0 (unblocks user submissions)
