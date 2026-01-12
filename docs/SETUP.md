# Lighthouse SEO Dashboard - Setup Guide

This guide walks you through deploying your own Lighthouse SEO Dashboard on Vercel.

## Prerequisites

- A Vercel account (free tier works)
- A Google Cloud account (for OAuth)
- Your target website URL
- Node.js 18+ installed locally

## Quick Start

### 1. Fork or Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/lighthouse-seo-dashboard.git
cd lighthouse-seo-dashboard
npm install
```

### 2. Create a Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your repository
4. Don't deploy yet - we need to configure environment variables first

### 3. Set Up Vercel KV Storage

1. In your Vercel project, go to **Storage** tab
2. Click **Create Database** → **KV**
3. Name it (e.g., "lighthouse-kv")
4. Click **Create**
5. The KV environment variables will be automatically added to your project

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the **Google+ API** (for OAuth)
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth client ID**
6. Select **Web application**
7. Add authorized redirect URIs:
   - `https://YOUR-DOMAIN.vercel.app/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (for local dev)
8. Save the **Client ID** and **Client Secret**

### 5. Configure Environment Variables

In Vercel Project Settings → Environment Variables, add:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TARGET_BASE_URL` | Your target website URL | `https://example.com` |
| `TARGET_DOMAIN` | Domain only (no protocol) | `example.com` |
| `DASHBOARD_URL` | This dashboard's URL | `https://lighthouse.example.com` |
| `NEXTAUTH_URL` | Same as DASHBOARD_URL | `https://lighthouse.example.com` |
| `NEXTAUTH_SECRET` | Random 32+ char secret | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console | `GOCSPX-xxx` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Dashboard title | `Lighthouse Dashboard` |
| `SITE_DESCRIPTION` | Context for AI insights | (none) |
| `ALLOWED_EMAIL_DOMAIN` | Restrict login to domain | (all emails allowed) |
| `ANTHROPIC_API_KEY` | For AI insights | (AI features disabled) |
| `DATAFORSEO_LOGIN` | For competitor analysis | (competitor features disabled) |
| `DATAFORSEO_PASSWORD` | For competitor analysis | (competitor features disabled) |

### 6. Deploy

1. Click **Deploy** in Vercel
2. Wait for the build to complete
3. Visit your dashboard URL

## Setting Up CI/CD for Automated Scans

### GitHub Actions Setup

1. In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**

2. Add these secrets:

| Secret | Description |
|--------|-------------|
| `TARGET_BASE_URL` | Your target website URL |
| `DASHBOARD_URL` | Your dashboard URL |
| `CI_UPLOAD_SIGNING_KEY` | HMAC key for secure uploads (generate with `openssl rand -hex 32`) |

3. The included workflow (`.github/workflows/unlighthouse.yml`) runs daily at 2 AM UTC

### Manual Scan Trigger

You can trigger scans manually:
- From GitHub Actions → Run workflow
- Or set up `GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME` for in-dashboard trigger

## Optional Integrations

### AI Insights (Anthropic)

1. Get an API key from [Anthropic Console](https://console.anthropic.com/)
2. Add `ANTHROPIC_API_KEY` to Vercel environment variables
3. AI-powered SEO recommendations will appear in the dashboard

### Competitor Analysis (DataForSEO)

1. Create account at [DataForSEO](https://dataforseo.com/)
2. Add `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`
3. Configure competitors and keywords in the dashboard UI

### Google Analytics

1. Enable Google Analytics Data API in Google Cloud
2. Create a service account with viewer access
3. Add the service account to your GA property
4. Set `GOOGLE_ANALYTICS_PROPERTY_ID` and `GOOGLE_SERVICE_ACCOUNT_JSON`

### Slack Notifications

1. Create a Slack webhook URL
2. Add `SLACK_WEBHOOK_URL` to GitHub Actions secrets
3. Get notifications for score regressions and threshold breaches

## Local Development

```bash
# Copy environment template
cp .env.example .env.local

# Edit with your values
nano .env.local

# Start dev server
npm run dev

# Run a local scan
npm run scan:desktop
npm run scan:mobile
```

## Troubleshooting

### "Unauthorized" on Dashboard

- Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are correct
- Verify redirect URIs in Google Cloud Console
- If using `ALLOWED_EMAIL_DOMAIN`, ensure your email matches

### CI Upload Fails

- Verify `CI_UPLOAD_SIGNING_KEY` matches in GitHub Secrets and Vercel
- Check the timestamp - uploads must be within 5 minutes
- Look at the API response in GitHub Actions logs

### No AI Insights

- Confirm `ANTHROPIC_API_KEY` is set
- Check Vercel logs for API errors
- Ensure KV storage is working (test with a manual API call)

### Scores Not Updating

- Check GitHub Actions logs for scan errors
- Verify `TARGET_BASE_URL` is accessible
- Ensure Puppeteer can access the site (no blocking)

## Customizing Branding

The dashboard supports white-label branding via environment variables and asset replacement.

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BRAND_NAME` | Brand name in header and title | `Lighthouse Dashboard` |
| `NEXT_PUBLIC_BRAND_LOGO_PATH` | Logo path (relative to public/) | `/brand/logo.svg` |
| `NEXT_PUBLIC_BRAND_FAVICON_PATH` | Favicon path | `/brand/favicon.svg` |
| `NEXT_PUBLIC_BRAND_PRIMARY` | Primary/header color | `#0B3D91` |
| `NEXT_PUBLIC_BRAND_ACCENT` | Accent/highlight color | `#B45309` |
| `NEXT_PUBLIC_BRAND_BACKGROUND` | Page background color | `#FAF7F2` |
| `NEXT_PUBLIC_BRAND_TEXT` | Primary text color | `#0B3D91` |

### Custom Logo

1. Create your logo as SVG (40x40px recommended for header)
2. Place it in `public/brand/logo.svg`
3. Or set `NEXT_PUBLIC_BRAND_LOGO_PATH` to a different path

### Quick Example

```bash
# .env.local
NEXT_PUBLIC_BRAND_NAME="Acme Performance Dashboard"
NEXT_PUBLIC_BRAND_PRIMARY="#1a365d"
NEXT_PUBLIC_BRAND_ACCENT="#d97706"
```

For more branding options, see [guides/branding.md](guides/branding.md).

## Additional Guides

- [Google OAuth Setup](guides/google-oauth.md) - Detailed OAuth configuration
- [GitHub Actions Setup](guides/github-actions.md) - CI/CD workflow configuration
- [Branding Customization](guides/branding.md) - Colors, logos, and theming

## Environment Variables Reference

See `.env.example` for a complete list with descriptions.
