# Project Architecture and Integrations

This document provides a comprehensive technical overview of the Lighthouse SEO Dashboard architecture, including data storage, integrations, security model, and deployment patterns.

---

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Background and Automation Model](#background-and-automation-model)
3. [Third-Party Integrations](#third-party-integrations)
4. [Feature Gates and Graceful Degradation](#feature-gates-and-graceful-degradation)
5. [Operational Costs and Rate Limiting](#operational-costs-and-rate-limiting)
6. [Known Warnings and Build Output](#known-warnings-and-build-output)
7. [Security Model](#security-model)

---

## High-Level Architecture

### Technology Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | Next.js with App Router | 16.0.10 |
| **Runtime** | React | 19.2.0 |
| **Language** | TypeScript (strict mode) | ^5 |
| **Authentication** | NextAuth.js with Google OAuth | 4.24.13 |
| **Data Storage** | Vercel KV (Upstash Redis) | 1.0.1 |
| **AI Integration** | Anthropic Claude API | 0.71.2 (uses claude-3-5-haiku-20241022) |
| **Charts** | Recharts | 3.6.0 |
| **Styling** | Tailwind CSS | ^4 |
| **CI/CD** | GitHub Actions | - |
| **Hosting** | Vercel (serverless) | - |

### Deployment Model

- **Serverless Functions**: Next.js API routes run as Vercel serverless functions
- **Edge Middleware**: Authentication middleware runs on Vercel Edge Network
- **Static Generation**: Dashboard UI is server-rendered with client-side hydration
- **Database**: Vercel KV (Redis-compatible) for all persistent data
- **CDN**: Vercel's global edge network for static assets and edge functions

### Configuration System

The application uses a centralized, fail-fast configuration system in [lib/config.ts](../lib/config.ts):

**Key Features**:
- Single source of truth for all environment variables
- Validates required variables at startup and throws clear errors if missing
- Provides feature availability checks (`isAIEnabled()`, `isCompetitorAnalysisEnabled()`, etc.)
- Supports both Vercel environment and local `.env.local` files
- Freezes config object to prevent runtime modifications

**Usage Example**:
```typescript
import { getConfig, isAIEnabled } from '@/lib/config';

const config = getConfig();
console.log(config.app.targetBaseUrl);  // "https://example.com"

if (isAIEnabled()) {
  // Use Anthropic API
}
```

### Data Storage Architecture

All persistent data is stored in **Vercel KV** (Upstash Redis) with structured key-value patterns:

#### Cache Key Structure

```
AI Insights:
  ai-insights:latest                      → Current AI analysis
  ai-insights:timestamp                   → Cache timestamp (Unix time)
  ai-insights:generating                  → Lock flag (5 min TTL)
  ai-insights:history:list                → Array of historical timestamps
  ai-insights:history:{timestamp}         → Historical entry (30 day TTL)

Lighthouse Reports:
  reports:latest                          → Latest scan aggregate
  reports:runs:list                       → Array of run timestamps
  reports:runs:{timestamp}                → Historical run data (60 day TTL, last 30 runs)

Competitor Data:
  competitor:data                         → Cached competitor analysis
  competitor:timestamp                    → When fetched (Unix time)
  competitor:config                       → User-configured competitors/keywords
  competitor:keywords:{domain}            → Ranked keywords per competitor (1h TTL)
  competitor:pages:{domain}               → Domain pages summary (4h TTL)
  competitor:ideas:{keyword}              → Keyword ideas (1h TTL)

Security:
  nonce:{value}                           → Used nonces (5 min TTL) - replay protection
  ratelimit:upload:{ip-hash}              → Rate limit counters (1 min TTL)

User Preferences:
  quick-wins:completed:{userId}           → User's completed quick wins
```

#### TTL Settings

| Data Type | TTL | Stale After | Notes |
|-----------|-----|-------------|-------|
| AI Insights | 4 hours | 2 hours | Stale status shown in UI after 2h |
| Competitor Data | 4 hours | - | Refreshable via dashboard |
| Competitor Keywords | 1 hour | - | Per-domain cache |
| Historical Insights | 30 days | - | Last 10 entries kept |
| Historical Reports | 60 days | - | Last 30 runs kept |
| Nonces | 5 minutes | - | Replay protection |
| Rate Limit | 1 minute | - | IP-based upload throttling |

#### Data Management

All KV operations are centralized in [lib/cache.ts](../lib/cache.ts):
- `getCachedInsights()` - Retrieve AI insights with staleness info
- `storeInsights()` - Store AI insights with history tracking
- `storeLatestReport()` - Store latest Lighthouse scan aggregate
- `storeReportRun()` - Store historical run (pruned to last 30)
- `checkAndStoreNonce()` - Validate and store nonce for replay protection
- `checkRateLimit()` - IP-based rate limiting for uploads

---

## Background and Automation Model

### GitHub Actions Workflow

The [.github/workflows/unlighthouse.yml](../.github/workflows/unlighthouse.yml) workflow automates daily Lighthouse scans.

#### Trigger Mechanisms

| Trigger | Schedule | Description |
|---------|----------|-------------|
| **Scheduled** | Daily at 2 AM UTC | Automatic daily scans |
| **Manual** | `workflow_dispatch` | Trigger from GitHub Actions UI |
| **Programmatic** | `repository_dispatch` | Trigger via API for integrations |

#### Workflow Steps

1. **Setup Environment** (3-4 minutes)
   - Checkout repository
   - Setup Node.js 20
   - Install dependencies (`npm ci`)
   - Install Chrome for Puppeteer

2. **URL Extraction** (<1 minute)
   - Fetch sitemap from `TARGET_BASE_URL/sitemap.xml`
   - Extract URLs to `urls.txt`

3. **Mobile Scan** (3-5 minutes)
   - Run Unlighthouse with mobile device emulation
   - Generate `ci-result-mobile.json`

4. **Desktop Scan** (3-5 minutes)
   - Run Unlighthouse with desktop device
   - Generate `ci-result-desktop.json`

5. **Publish Reports** (<1 minute)
   - Copy HTML reports to `public/reports/`
   - Generate human-readable output

6. **Upload to Dashboard** (<1 minute)
   - Aggregate mobile + desktop scores
   - Sign request with HMAC-SHA256
   - POST to `/api/reports/upload` endpoint

7. **Regression Check** (<1 minute)
   - Compare scores against previous run
   - Detect drops > threshold (default: 5 points)

8. **Slack Notification** (<1 minute, optional)
   - Send summary of scores
   - Alert if regression detected

9. **Trigger Vercel Redeploy** (<1 minute, optional)
   - POST to Vercel deploy hook
   - Ensures latest reports visible in dashboard

**Total Duration**: 10-15 minutes per run

#### Required GitHub Secrets

| Secret | Purpose | Required |
|--------|---------|----------|
| `DASHBOARD_URL` | Dashboard endpoint for uploads | Yes |
| `CI_UPLOAD_SIGNING_KEY` | HMAC signing key (must match Vercel env var) | Yes |
| `SLACK_WEBHOOK_URL` | Slack notifications | Optional |
| `VERCEL_DEPLOY_HOOK` | Trigger redeploy after scan | Optional |
| `KEEP_RUNS` | Number of local historical runs to keep in public/reports/runs/ (default: 14) | Optional |
| `REGRESSION_THRESHOLD` | Score drop threshold (default: 10) | Optional |

### Upload Security Model

The `/api/reports/upload` endpoint in [app/api/reports/upload/route.ts](../app/api/reports/upload/route.ts) uses **HMAC-SHA256 signatures** for secure CI uploads.

#### HMAC Signature Process

**Signature Generation (CI side)**:
```javascript
const timestamp = Math.floor(Date.now() / 1000).toString();
const nonce = crypto.randomUUID();
const bodyHash = crypto.createHash('sha256').update(body).digest('hex');
const signatureBase = `${timestamp}.${nonce}.${bodyHash}`;
const signature = crypto.createHmac('sha256', signingKey).update(signatureBase).digest('hex');
```

**Required Headers**:
```
X-Timestamp: 1705075200
X-Nonce: 550e8400-e29b-41d4-a716-446655440000
X-Signature: a1b2c3d4e5f6...
```

**Signature Verification (Dashboard side)**:
1. Extract `CI_UPLOAD_SIGNING_KEY` from environment
2. Validate timestamp is within 5 minutes of current time
3. Check nonce hasn't been used before (stored in KV with 5 min TTL)
4. Recompute signature and compare using timing-safe comparison
5. Reject if signature doesn't match

#### Security Features

| Feature | Implementation | Purpose |
|---------|----------------|---------|
| **HMAC-SHA256 Signatures** | Request signing with shared secret | Prevent unauthorized uploads |
| **Replay Protection** | Nonce validation (5 min TTL) | Prevent request reuse |
| **Timestamp Validation** | ±5 minute tolerance | Reject old/future requests |
| **Rate Limiting** | 10 requests/minute per IP | Prevent abuse |
| **Payload Size Limits** | Hard: 4MB, Soft: 1MB | Prevent resource exhaustion |
| **Forbidden Content Detection** | Regex patterns | Block XSS, prototype pollution |
| **Timing-Safe Comparison** | `crypto.timingSafeEqual()` | Prevent timing attacks |

#### Backward Compatibility

If `CI_UPLOAD_SIGNING_KEY` is not set, the endpoint falls back to **Bearer token authentication** using `CI_UPLOAD_SECRET`:

```
Authorization: Bearer your-secret-token
```

**Warning**: This fallback is deprecated and logs a warning. HMAC signing is strongly recommended.

---

## Third-Party Integrations

### 1. Google OAuth (NextAuth) - Authentication

**Purpose**: Secure user authentication via Google accounts

**Configuration Location**: Vercel environment variables

**Required Variables**:
- `GOOGLE_CLIENT_ID` - OAuth client ID (ends with `.apps.googleusercontent.com`)
- `GOOGLE_CLIENT_SECRET` - OAuth client secret (starts with `GOCSPX-`)
- `NEXTAUTH_URL` - Dashboard URL (e.g., `https://my-dashboard.vercel.app`)
- `NEXTAUTH_SECRET` - Random secret for JWT signing (generate with `openssl rand -base64 32`)
- `ALLOWED_EMAIL_DOMAIN` (optional) - Restrict to domain (e.g., `yourcompany.com`)

**Code Usage**:
- [lib/auth.ts](../lib/auth.ts) - NextAuth configuration with Google provider
- [app/api/auth/[...nextauth]/route.ts](../app/api/auth/[...nextauth]/route.ts) - NextAuth route handler
- [middleware.ts](../middleware.ts) - Auth protection for all routes except public endpoints

**Setup Guide**: [docs/guides/google-oauth.md](guides/google-oauth.md)

### 2. Vercel KV - Data Persistence

**Purpose**: Redis-compatible storage for all dashboard data

**Configuration Location**: Auto-injected by Vercel when KV database is created

**Required Variables**:
- `KV_REST_API_URL` - Upstash Redis REST API endpoint
- `KV_REST_API_TOKEN` - Authentication token

**Code Usage**:
- [lib/cache.ts](../lib/cache.ts) - All KV operations (get, set, del)
- All API routes read/write through this centralized cache module

**Operational Notes**:
- Data persists across deployments (unlike filesystem)
- TTL-based expiration manages storage usage
- Storage and bandwidth limits vary by Vercel plan - check current [Vercel KV documentation](https://vercel.com/docs/storage/vercel-kv) for your plan

### 3. DataForSEO - Competitor Analysis

**Purpose**: SERP tracking, keyword research, and competitor intelligence

**Configuration Location**: Vercel environment variables

**Required Variables**:
- `DATAFORSEO_LOGIN` - API Login (usually email or generated username)
- `DATAFORSEO_PASSWORD` - API Password (NOT account password - get from API Access page)

**Optional Variables**:
- `DATAFORSEO_LOCATION_CODE` - Default: 2840 (USA)
- `DATAFORSEO_LANGUAGE_CODE` - Default: `en` (English)

**Code Usage**:
- [lib/dataforseo.ts](../lib/dataforseo.ts) - API client for SERP, keywords, domain analysis
- [app/api/competitors/route.ts](../app/api/competitors/route.ts) - Competitor analysis endpoint

**Endpoints Used**:
- `GET /serp` - SERP rankings for keywords
- `GET /keywords` - Keyword research and suggestions
- `GET /competitors/domain` - Content gap analysis
- `GET /domain/rank/overview` - Domain authority metrics

**Setup Guide**: [docs/guides/dataforseo.md](guides/dataforseo.md)

### 4. Anthropic (Claude API) - AI Insights

**Purpose**: AI-powered SEO recommendations and content suggestions

**Configuration Location**: Vercel environment variables

**Required Variables**:
- `ANTHROPIC_API_KEY` - API key from Anthropic Console (starts with `sk-ant-`)

**Optional Variables**:
- `AI_MODEL` - Default: `claude-3-5-haiku-20241022`
- `SITE_DESCRIPTION` - Context for better AI recommendations

**Code Usage**:
- [app/api/ai-insights/refresh/route.ts](../app/api/ai-insights/refresh/route.ts) - AI insight generation

**Features Provided**:
- Executive summary with health score
- 5-7 categorized insights with implementation steps
- Content suggestions with outlines and word counts
- Schema markup recommendations (JSON-LD)
- Copy improvements with before/after examples
- Quick wins with code examples
- Competitor insights (if DataForSEO configured)

**Rate Limits**: Standard Anthropic API limits apply (tier-based)

### 5. Google Analytics 4 - Traffic Metrics

**Purpose**: Traffic and engagement metrics integration

**Configuration Location**: Vercel environment variables

**Required Variables**:
- `GOOGLE_ANALYTICS_PROPERTY_ID` - Format: `properties/123456789`
- **Option 1 (Recommended)**: `GOOGLE_SERVICE_ACCOUNT_JSON` - Full JSON object
- **Option 2**: `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

**Code Usage**:
- [lib/google-analytics.ts](../lib/google-analytics.ts) - GA4 Data API client
- [app/api/analytics/route.ts](../app/api/analytics/route.ts) - Analytics data endpoint

**Data Fetched**:
- User/session counts
- Traffic sources
- Top pages
- Device breakdown
- Trend data over time

**Setup Requirements**:
- Google Cloud service account with Analytics Data API access
- Grant service account read access to GA4 property

### 6. Google Search Console - Search Traffic (Optional)

**Purpose**: Keyword rankings and click-through rates

**Configuration Location**: Not explicitly configured in environment variables

**Code Usage**:
- [app/api/search-console/route.ts](../app/api/search-console/route.ts) - Search Console API endpoint

**Note**: Implementation present but may require additional setup. Check code for current status.

### 7. Slack Webhook - Notifications

**Purpose**: Automated alerts for scan completion and score regressions

**Configuration Location**: GitHub Secrets (for CI notifications)

**Required Variables**:
- `SLACK_WEBHOOK_URL` - Incoming webhook URL from Slack

**Code Usage**:
- [scripts/notify-slack.mjs](../scripts/notify-slack.mjs) - Notification sender

**Notification Triggers**:
- Scan completion with scores
- Regression alerts (score drops > threshold)
- Threshold breach alerts

**Default Thresholds** (configurable in script):
- Performance: 80
- Accessibility: 85
- Best Practices: 85
- SEO: 90

### 8. GitHub Actions Upload - CI Security

**Purpose**: Secure upload authentication for CI pipeline

**Configuration Location**: **Both** Vercel environment variables **and** GitHub Secrets (must match)

**Required Variables**:
- `CI_UPLOAD_SIGNING_KEY` - HMAC signing key (64-character hex string)

**Generation Command**:
```bash
openssl rand -hex 32
```

**Code Usage**:
- [scripts/upload-reports.mjs](../scripts/upload-reports.mjs) - CI upload script with HMAC signing
- [app/api/reports/upload/route.ts](../app/api/reports/upload/route.ts) - Upload endpoint with signature verification

**Setup Guide**: [docs/guides/github-actions.md](guides/github-actions.md)

---

## Feature Gates and Graceful Degradation

The dashboard implements feature detection to gracefully handle missing integrations. All checks are centralized in [lib/config.ts](../lib/config.ts).

### Feature Availability Matrix

| Feature | Requires | Without Integration | Code Check |
|---------|----------|---------------------|------------|
| **Core Lighthouse Monitoring** | Vercel KV, GitHub Actions | N/A (required) | - |
| **AI Insights** | `ANTHROPIC_API_KEY` | No AI tab, refresh button hidden | `isAIEnabled()` |
| **Competitor Analysis** | `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD` | Competitor tab hidden or shows "Configure DataForSEO" | `isCompetitorAnalysisEnabled()` |
| **Google Analytics** | `GOOGLE_ANALYTICS_PROPERTY_ID`, service account | No traffic metrics in dashboard | `isAnalyticsEnabled()` |
| **Search Console** | (Check code for requirements) | No search traffic data | - |
| **Slack Notifications** | `SLACK_WEBHOOK_URL` | Silent operation, no alerts | `isSlackEnabled()` |
| **Automated Scans** | GitHub Actions configured | Manual scans via `npm run` commands | - |

### What Works Without Each Integration

#### Without DataForSEO
✅ **Available**:
- Lighthouse performance monitoring (mobile + desktop)
- Historical score tracking
- Score trend charts
- AI insights (if Anthropic configured)
- Google Analytics integration (if configured)
- Slack notifications (if configured)

❌ **Unavailable**:
- Competitor analysis tab
- Content gap identification
- SERP position tracking
- Keyword research suggestions

#### Without Anthropic API
✅ **Available**:
- All Lighthouse monitoring features
- Competitor analysis (if DataForSEO configured)
- Google Analytics integration
- Manual insights and tracking

❌ **Unavailable**:
- AI-generated SEO insights
- Automated content suggestions
- Schema markup recommendations
- AI-powered copy improvements
- Quick wins generation

#### Without Slack
✅ **Available**:
- All dashboard features
- Scan execution and data storage

❌ **Unavailable**:
- Automated notifications
- Regression alerts
- Scan completion messages

#### Without GitHub Actions
✅ **Available**:
- Dashboard UI and authentication
- Manual scans via local commands
- View historical data (if previously populated)

❌ **Unavailable**:
- Automated daily scans
- Scheduled monitoring
- CI/CD integration

**Manual Scan Alternative**:
```bash
npm run urls          # Extract URLs from sitemap
npm run scan:mobile   # Run mobile scan
npm run scan:desktop  # Run desktop scan
npm run publish       # Publish reports locally
```

---

## Operational Costs and Rate Limiting

### Service Costs (Estimated Monthly)

| Service | Tier | Cost | Notes |
|---------|------|------|-------|
| **Vercel** | Hobby or Pro | Variable | Check [Vercel pricing](https://vercel.com/pricing) for current plans |
| **Vercel KV** | Included in plan | Variable | Costs depend on usage and plan tier |
| **DataForSEO** | Pay-as-you-go | ~$40/month | Typical usage for basic monitoring |
| **Anthropic API** | Standard | ~$5-10/month | Using Haiku model (~$0.01 per insight) |
| **Google OAuth** | Free | $0 | Always free |
| **GitHub Actions** | Public repos | $0 | Free for public repos |
| **GitHub Actions** | Private repos | Included | 2000 minutes/month free |
| **Slack** | Free | $0 | Webhook notifications always free |

**Total Estimated Cost**: $45-70/month (for full features, varies based on usage and plan)
**Minimum Cost**: Variable (core monitoring only)

**Note**: Vercel and Vercel KV pricing may change. Always check current pricing at [vercel.com/pricing](https://vercel.com/pricing) for the most accurate cost estimates.

### Rate Limits

#### Upload Endpoint
- **Limit**: 10 requests per minute per IP
- **Window**: 1 minute rolling window
- **Enforced by**: [app/api/reports/upload/route.ts](../app/api/reports/upload/route.ts)
- **Storage**: `ratelimit:upload:{ip-hash}` key in KV (1 min TTL)
- **Response**: 429 Too Many Requests with `Retry-After` header

#### DataForSEO API
- **Sandbox Mode**: Very limited requests (testing only)
- **Standard Plan**: Higher limits based on account balance
- **Enterprise**: Custom limits per contract
- **Cost per request**: Varies by endpoint ($0.01-$1 typical)
- **Not specified in repository**: Check [DataForSEO pricing](https://dataforseo.com/pricing) for current rates

#### Anthropic API
- **Rate limits**: Tier-based (1000-10000 RPM depending on tier)
- **Token limits**: Per-minute and per-day limits based on tier
- **Cost**: ~$0.25 per 1M input tokens, ~$1.25 per 1M output tokens (Haiku model)
- **Not specified in repository**: Check [Anthropic pricing](https://www.anthropic.com/pricing) for current rates

#### Vercel KV Limits

- Connection limits, storage capacity, and bandwidth vary by plan (Hobby, Pro, Enterprise)
- Check current [Vercel KV pricing](https://vercel.com/docs/storage/vercel-kv/usage-and-pricing) for your plan's specific limits
- TTL-based expiration in this project helps manage storage within plan limits

### Cost Optimization Tips

1. **DataForSEO**:
   - Use sandbox mode for development
   - Limit refresh frequency (once per day recommended)
   - Track only essential keywords (5-10 high-priority)
   - Monitor account balance alerts

2. **Anthropic API**:
   - Use Haiku model (fastest/cheapest)
   - Cache insights for 4 hours (default)
   - Only generate when user clicks "Refresh"

3. **Vercel KV**:
   - TTL-based expiration prevents unbounded growth
   - Last 30 runs kept in KV storage (controlled by `REPORTS_MAX_RUNS` constant in lib/cache.ts)
   - Local public/reports/runs/ directory keeps last 14 runs (configurable via `KEEP_RUNS` env var)
   - Prune old data automatically

4. **GitHub Actions**:
   - Use scheduled runs (not on every push)
   - Self-hosted runners for heavy usage (advanced)

---

## Known Warnings and Build Output

### Multiple Lockfiles Warning

**Warning Message**:
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles and selected the directory of /Users/olivermarler/package-lock.json as the root directory.
To silence this warning, set `turbopack.root` in your Next.js config, or consider removing one of the lockfiles if it's not needed.
  See https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack#root-directory for more information.
Detected additional lockfiles:
  * /Users/olivermarler/WORK/projects/__PUBLIC-REPOS__/lighthouse-public/package-lock.json
```

**Cause**: Next.js detected a lockfile in a parent directory outside the repository

**Mitigation**:
1. Ignore this warning if you don't have control over parent directory lockfiles
2. Or set `turbopack.root` in `next.config.ts` to explicitly specify the repository root:
   ```typescript
   const config: NextConfig = {
     experimental: {
       turbopack: {
         root: __dirname,
       },
     },
   };
   ```

**Impact**: None on functionality. This is a Next.js workspace detection warning that doesn't affect the build.

### Middleware Deprecation Warning

**Warning Message**:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

**Status**: The `middleware.ts` file at the repository root triggers this warning

**Expected Behavior**: Middleware continues to work in Next.js 16.0.10. This is a deprecation notice for a future breaking change.

**Action Needed**: Monitor Next.js release notes for when the "proxy" convention becomes stable. The middleware file currently exists and functions correctly despite the warning.

### TypeScript Lint Warnings

**Status**: As of the latest check, `npm run lint` produces no warnings or errors.

**Output**:
```
> nextjs@0.1.0 lint
> eslint
```

**Impact**: No linting issues present in the codebase.

### Build Warnings Summary

Run these commands to check for warnings:

```bash
npm run build     # Check build output
npm run lint      # Check linting warnings
npm run typecheck # Check type errors
```

**Expected**: Build succeeds with warnings noted above. No errors should block deployment.

---

## Security Model

### Authentication Flow

1. **User Access**: User visits dashboard URL
2. **Middleware Check**: [middleware.ts](../middleware.ts) checks for valid session
3. **Redirect to Sign-In**: If no session, redirect to `/auth/signin`
4. **Google OAuth**: NextAuth initiates Google OAuth flow
5. **Callback**: Google redirects to `/api/auth/callback/google`
6. **Domain Restriction** (optional): Check email domain if `ALLOWED_EMAIL_DOMAIN` set
7. **Session Creation**: JWT session created with 30-day expiration
8. **Dashboard Access**: User redirected to dashboard with valid session

### Protected vs Public Routes

**Protected Routes** (require authentication):
- All routes except those explicitly excluded in middleware

**Public Routes** (no authentication required):
- `/api/auth/*` - NextAuth internal routes
- `/api/reports/upload` - CI upload (HMAC authenticated)
- `/auth/*` - Sign-in and error pages
- `/_next/*` - Next.js internals
- `/reports/*` - Public Lighthouse HTML reports
- Static files (`/favicon.ico`, `/robots.txt`)

### Data Security

| Layer | Security Measure | Implementation |
|-------|------------------|----------------|
| **Transport** | HTTPS only | Vercel enforces HTTPS |
| **Authentication** | OAuth 2.0 + JWT | NextAuth with Google provider |
| **Session** | Secure HTTP-only cookies | NextAuth default configuration |
| **Storage** | Encrypted at rest | Vercel KV (Upstash Redis) |
| **Upload** | HMAC-SHA256 signatures | Custom implementation in upload route |
| **Rate Limiting** | IP-based throttling | KV-backed rate limit counters |
| **Secrets** | Environment variables | Never committed to code |

### Environment Variable Security

**Best Practices**:
- Never commit `.env`, `.env.local`, or `.env.production`
- Use `.env.example` for documentation only (no real values)
- Rotate secrets regularly (especially `NEXTAUTH_SECRET` and `CI_UPLOAD_SIGNING_KEY`)
- Use Vercel's encrypted environment variable storage
- Separate development and production secrets

### Reporting Security Issues

See [CONTRIBUTING.md](../CONTRIBUTING.md#security) for responsible disclosure guidelines.

---

## Additional Resources

- [Complete Setup Guide](SETUP.md)
- [Google OAuth Setup](guides/google-oauth.md)
- [DataForSEO Setup](guides/dataforseo.md)
- [GitHub Actions Configuration](guides/github-actions.md)
- [Branding Customization](guides/branding.md)
- [Environment Variables Reference](../.env.example)
- [Main README](../README.md)

---

**Last Updated**: 2026-01-12
