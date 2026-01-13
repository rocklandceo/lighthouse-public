# Environment Variables Reference

This is the complete reference for all environment variables used in the Lighthouse SEO Dashboard.

## Quick Reference: Where to Set Variables

| Variable Type | Set in Vercel | Set in GitHub Secrets | Set in .env.local (local dev) |
|---------------|---------------|----------------------|-------------------------------|
| **Required for app** | ✅ Yes | ❌ No | ✅ Yes |
| **Required for CI** | Some | ✅ Yes | ❌ No |
| **Optional integrations** | ✅ Yes | ❌ No | ✅ Yes (for testing) |

## Complete Variable List

### Required - Application Core

These must be set in Vercel environment variables for the dashboard to work:

| Variable | Required | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `TARGET_BASE_URL` | ✅ Yes | `https://example.com` | Vercel **AND** GitHub Secrets | Website you're monitoring (no trailing slash) |
| `DASHBOARD_URL` | ✅ Yes | `https://my-dashboard.vercel.app` | Vercel only | URL where this dashboard is deployed |
| `NEXTAUTH_URL` | ✅ Yes | `https://my-dashboard.vercel.app` | Vercel only | NextAuth URL (usually same as DASHBOARD_URL) |
| `NEXTAUTH_SECRET` | ✅ Yes | Generated string | Vercel only | Random secret for JWT signing. Generate: `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | ✅ Yes | `xxx.apps.googleusercontent.com` | Vercel only | Google OAuth client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | ✅ Yes | `GOCSPX-xxx` | Vercel only | Google OAuth client secret from Google Cloud Console |
| `KV_REST_API_URL` | ✅ Auto-set | `https://xxx.upstash.io` | Vercel (auto) | Vercel KV REST API URL (auto-configured when you add KV storage) |
| `KV_REST_API_TOKEN` | ✅ Auto-set | Token string | Vercel (auto) | Vercel KV REST API token (auto-configured when you add KV storage) |

### Required - CI/CD

These must be set in GitHub repository secrets for automated scans:

| Variable | Required | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `TARGET_BASE_URL` | ✅ Yes | `https://example.com` | GitHub Secrets **AND** Vercel | Website to scan - **must match Vercel value exactly** |
| `DASHBOARD_URL` | ✅ Yes | `https://my-dashboard.vercel.app` | GitHub Secrets only | Where to upload scan results |
| `CI_UPLOAD_SIGNING_KEY` | ✅ Yes | 64-char hex string | GitHub Secrets **AND** Vercel | HMAC signing key - **must match Vercel value exactly**. Generate: `openssl rand -hex 32` |

### Optional - Site Configuration

| Variable | Optional | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `APP_NAME` | ⚪ Optional | `My SEO Dashboard` | Vercel | Custom dashboard title (default: "Lighthouse Dashboard") |
| `SITE_DESCRIPTION` | ⚪ Optional | `A SaaS platform for project management` | Vercel | Context for AI to generate better recommendations |
| `SITEMAP_URL` | ⚪ Optional | `https://example.com/sitemap_index.xml` | GitHub Secrets | Custom sitemap URL (default: `${TARGET_BASE_URL}/sitemap.xml`) |
| `TARGET_DOMAIN` | ⚪ Optional | `example.com` | Vercel | Domain without protocol (auto-extracted from TARGET_BASE_URL if not set) |

### Optional - Authentication

| Variable | Optional | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `ALLOWED_EMAIL_DOMAIN` | ⚪ Optional | `yourcompany.com` | Vercel | Restrict sign-in to specific email domain (no `@` symbol) |

### Optional - AI Insights

| Variable | Optional | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `ANTHROPIC_API_KEY` | ⚪ Optional | `sk-ant-api03-...` | Vercel | Anthropic API key for AI-powered SEO insights |
| `AI_MODEL` | ⚪ Optional | `claude-3-5-haiku-20241022` | Vercel | Claude model to use (default: claude-3-5-haiku-20241022) |

### Optional - Competitor Analysis

| Variable | Optional | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `DATAFORSEO_LOGIN` | ⚪ Optional | `your-email@example.com` | Vercel | DataForSEO API login (enables competitor analysis) |
| `DATAFORSEO_PASSWORD` | ⚪ Optional | API password string | Vercel | DataForSEO API password (NOT your account password) |
| `DATAFORSEO_LOCATION_CODE` | ⚪ Optional | `2840` | Vercel | Location code for SERP queries (default: 2840 = USA) |
| `DATAFORSEO_LANGUAGE_CODE` | ⚪ Optional | `en` | Vercel | Language code for SERP queries (default: en = English) |

### Optional - Google Analytics

| Variable | Optional | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `GOOGLE_ANALYTICS_PROPERTY_ID` | ⚪ Optional | `properties/123456789` | Vercel | GA4 property ID for traffic metrics |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ⚪ Optional | Full JSON object | Vercel | Complete service account credentials (preferred method) |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | ⚪ Optional | `service-account@project.iam.gserviceaccount.com` | Vercel | Service account email (alternative to JSON) |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | ⚪ Optional | Private key string | Vercel | Service account private key (alternative to JSON) |

### Optional - Notifications

| Variable | Optional | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `SLACK_WEBHOOK_URL` | ⚪ Optional | `https://hooks.slack.com/services/...` | GitHub Secrets | Slack webhook for scan notifications and alerts |

### Optional - Operational Settings

| Variable | Optional | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `REGRESSION_THRESHOLD` | ⚪ Optional | `10` | GitHub Secrets | Score drop threshold for regression alerts (default: 10 points) |
| `KEEP_RUNS` | ⚪ Optional | `14` | GitHub Secrets | Number of local historical runs to keep in public/reports/runs/ (default: 14) |

### Optional - GitHub Trigger Feature

These enable the "Trigger Scan" button in the dashboard UI:

| Variable | Optional | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `GITHUB_TOKEN` | ⚪ Optional | `ghp_...` | Vercel only | GitHub Personal Access Token with `repo` scope |
| `GITHUB_REPO_OWNER` | ⚪ Optional | `your-username` | Vercel only | Your GitHub username or organization |
| `GITHUB_REPO_NAME` | ⚪ Optional | `lighthouse-public` | Vercel only | Your forked repository name |
| `VERCEL_DEPLOY_HOOK` | ⚪ Optional | `https://api.vercel.com/v1/integrations/deploy/...` | GitHub Secrets | Vercel deploy hook URL to trigger redeploy after scans |

### Optional - Branding

These customize the dashboard appearance (all start with `NEXT_PUBLIC_`):

| Variable | Optional | Example | Where to Set | Description |
|----------|----------|---------|--------------|-------------|
| `NEXT_PUBLIC_BRAND_NAME` | ⚪ Optional | `My Performance Dashboard` | Vercel | Brand name shown in header and browser tab |
| `NEXT_PUBLIC_BRAND_LOGO_PATH` | ⚪ Optional | `/brand/logo.svg` | Vercel | Path to logo (relative to public/) |
| `NEXT_PUBLIC_BRAND_FAVICON_PATH` | ⚪ Optional | `/brand/favicon.svg` | Vercel | Path to favicon (relative to public/) |
| `NEXT_PUBLIC_BRAND_PRIMARY` | ⚪ Optional | `#0B3D91` | Vercel | Primary brand color (hex) |
| `NEXT_PUBLIC_BRAND_ACCENT` | ⚪ Optional | `#B45309` | Vercel | Accent color for highlights (hex) |
| `NEXT_PUBLIC_BRAND_BACKGROUND` | ⚪ Optional | `#FAF7F2` | Vercel | Page background color (hex) |
| `NEXT_PUBLIC_BRAND_TEXT` | ⚪ Optional | `#0B3D91` | Vercel | Main text color (hex) |

## Critical: Variables That Must Match in Multiple Places

These variables must be set in **TWO** locations with **IDENTICAL** values:

### 1. TARGET_BASE_URL

**Locations:**
- Vercel environment variables
- GitHub repository secrets

**Why:** The dashboard needs it to validate uploaded reports, and the CI workflow needs it to know which site to scan.

**How to verify they match:**
1. Check Vercel: Settings → Environment Variables → `TARGET_BASE_URL`
2. Check GitHub: Settings → Secrets and variables → Actions → `TARGET_BASE_URL`
3. Ensure both values are absolutely identical (including protocol, no trailing slash)

### 2. CI_UPLOAD_SIGNING_KEY

**Locations:**
- Vercel environment variables
- GitHub repository secrets

**Why:** The CI workflow signs upload requests with this key, and the dashboard verifies the signature.

**How to verify they match:**
1. Generate once: `openssl rand -hex 32`
2. Add to Vercel: Settings → Environment Variables → `CI_UPLOAD_SIGNING_KEY`
3. Add to GitHub: Settings → Secrets → `CI_UPLOAD_SIGNING_KEY`
4. Both must be the exact same 64-character hex string

**Common Error:** If these don't match, you'll see "401 Unauthorized" errors when GitHub Actions tries to upload scan results.

## Local Development Setup

For local development, create a `.env.local` file with these variables:

```bash
# Required
TARGET_BASE_URL=https://your-site.com
DASHBOARD_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-from-vercel
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token

# Optional (add if testing these features)
ANTHROPIC_API_KEY=sk-ant-...
DATAFORSEO_LOGIN=your-login
DATAFORSEO_PASSWORD=your-password
```

**Note:** For local dev, copy the `KV_REST_API_URL` and `KV_REST_API_TOKEN` from your Vercel project (Storage → KV → .env.local tab).

## Troubleshooting

### "CONFIGURATION ERROR: Missing required environment variables"

**Cause:** One or more required variables are not set in Vercel.

**Fix:** Check that all required variables in the "Required - Application Core" section are set in Vercel environment variables, then redeploy.

### "GitHub trigger not configured"

**Cause:** `GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, or `GITHUB_REPO_NAME` not set in Vercel.

**Fix:** This is normal if you haven't set up the optional GitHub trigger feature. The "Trigger Scan" button won't appear in the dashboard. To enable it, add all three variables to Vercel.

### "401 Unauthorized" on CI uploads

**Cause:** `CI_UPLOAD_SIGNING_KEY` doesn't match between GitHub and Vercel, or not set at all.

**Fix:**
1. Generate: `openssl rand -hex 32`
2. Add to Vercel: Settings → Environment Variables
3. Add to GitHub: Settings → Secrets and variables → Actions
4. Ensure both are absolutely identical

### "DataForSEO authentication failed"

**Cause:** Using account password instead of API password, or incorrect credentials.

**Fix:** Go to DataForSEO dashboard → API Access → copy the API Login and API Password (NOT your account login password).

## See Also

- [Complete Setup Guide](SETUP.md) - Step-by-step deployment instructions
- [.env.example](../.env.example) - Template file with all variables and comments
- [Google OAuth Setup](guides/google-oauth.md) - Detailed OAuth configuration
- [DataForSEO Setup](guides/dataforseo.md) - Competitor analysis configuration
- [GitHub Actions Setup](guides/github-actions.md) - CI/CD workflow configuration
