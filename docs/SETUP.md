# Lighthouse SEO Dashboard - Complete Setup Guide

This comprehensive guide walks you through deploying your own Lighthouse SEO Dashboard on Vercel, from account creation to your first scan.

**Time Required**: 45-60 minutes
**Technical Level**: Beginner-friendly (no coding required)
**Prerequisites**: A website you want to monitor

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Part 1: Fork and Prepare Repository](#part-1-fork-and-prepare-repository)
3. [Part 2: Deploy to Vercel](#part-2-deploy-to-vercel)
4. [Part 3: Create Vercel KV Storage](#part-3-create-vercel-kv-storage)
5. [Part 4: Configure Google OAuth](#part-4-configure-google-oauth)
6. [Part 5: Configure DataForSEO (Optional)](#part-5-configure-dataforseo-optional)
7. [Part 6: Set Vercel Environment Variables](#part-6-set-vercel-environment-variables)
8. [Part 7: Configure GitHub Actions](#part-7-configure-github-actions)
9. [Part 8: Run Your First Scan](#part-8-run-your-first-scan)
10. [Part 9: Local Development (Optional)](#part-9-local-development-optional)
11. [Troubleshooting](#troubleshooting)
12. [Next Steps](#next-steps)

---

## Prerequisites

### Required Accounts

Before starting, create accounts with these services (all offer free tiers or trials):

| Service | Purpose | Cost | Signup Link |
|---------|---------|------|-------------|
| **GitHub** | Code repository and automation | Free | [github.com/signup](https://github.com/signup) |
| **Vercel** | Hosting and database | Free (Hobby tier) | [vercel.com/signup](https://vercel.com/signup) |
| **Google Cloud** | Authentication (OAuth) | Free | [console.cloud.google.com](https://console.cloud.google.com) |

### Optional Integrations

| Service | Purpose | Cost | When to Add |
|---------|---------|------|-------------|
| **DataForSEO** | Competitor analysis | ~$40/month | For competitor tracking |
| **Anthropic** | AI insights | ~$5-10/month | For AI recommendations |
| **Slack** | Notifications | Free | For score alerts |

### What You'll Need

- **Your website URL** (e.g., `https://example.com`)
- **Email address** for account signups
- **Terminal access** (for generating secrets)
  - Mac/Linux: Built-in Terminal app
  - Windows: PowerShell or Git Bash

---

## Part 1: Fork and Prepare Repository

### Step 1.1: Fork the Repository

1. Go to [github.com/rocklandceo/lighthouse-public](https://github.com/rocklandceo/lighthouse-public)
2. Click the **Fork** button at the top right
3. Select your GitHub account as the destination
4. Wait for GitHub to create your fork

### Step 1.2: Rename Your Fork (Recommended)

To avoid name collisions and make it clearly yours:

1. In your forked repository, click **Settings** (top right)
2. In the "Repository name" field, change `lighthouse-public` to something unique:
   - Examples: `my-seo-dashboard`, `company-performance-monitor`, `website-lighthouse`
3. Click **Rename**

Your repository is now at: `https://github.com/YOUR-USERNAME/your-new-name`

---

## Part 2: Deploy to Vercel

### Step 2.1: Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (or create account)
2. Click **Add New...** → **Project**
3. In the "Import Git Repository" section:
   - Click **Import** next to your forked repository
   - If you don't see it, click **Adjust GitHub App Permissions** and grant access
4. Configure project:
   - **Project Name**: Use repository name or customize (e.g., `my-seo-dashboard`)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: ./  (leave as default)
   - **Build Command**: Leave default (`next build`)
   - **Output Directory**: Leave default (`.next`)

### Step 2.2: Initial Deploy (Will Fail - Expected)

1. Click **Deploy** (don't add environment variables yet)
2. Deployment will fail with an error - **this is expected**
3. We'll add environment variables next, then redeploy

**Why it fails**: The app requires environment variables (database URL, OAuth credentials, etc.) that we haven't configured yet.

---

## Part 3: Create Vercel KV Storage

Vercel KV is a Redis-compatible database that stores your Lighthouse scan results.

### Step 3.1: Create KV Database

1. In your Vercel project dashboard, click the **Storage** tab
2. Click **Create Database**
3. Select **KV** (Key-Value store)
4. Configure:
   - **Database Name**: `lighthouse-kv` (or any name you prefer)
   - **Region**: Choose closest to your users (e.g., US East, EU West)
5. Click **Create**

### Step 3.2: Connect to Project

1. After creation, you'll see "Connect to Project"
2. Select your project from the dropdown
3. Click **Connect**
4. Vercel automatically adds these environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_URL` (optional)
   - `KV_REST_API_READ_ONLY_TOKEN` (optional)

You can verify these were added in **Settings** → **Environment Variables**.

---

## Part 4: Configure Google OAuth

Google OAuth allows users to sign in with their Google accounts.

### Detailed Instructions

For complete step-by-step instructions with screenshots, see:
👉 **[guides/google-oauth.md](guides/google-oauth.md)**

### Quick Summary

1. **Create Google Cloud Project**:
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create new project (e.g., "Lighthouse Dashboard OAuth")

2. **Configure OAuth Consent Screen**:
   - APIs & Services → OAuth consent screen
   - Choose "External" user type
   - Fill in app name and support email

3. **Create OAuth Client**:
   - APIs & Services → Credentials
   - Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**

4. **Add Authorized URIs**:
   - **JavaScript origins**:
     - `https://your-project.vercel.app`
     - `http://localhost:3000` (for local development)
   - **Redirect URIs** (critical - must match exactly):
     - `https://your-project.vercel.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`

5. **Save Credentials**:
   - Copy **Client ID** (ends with `.apps.googleusercontent.com`)
   - Copy **Client Secret** (starts with `GOCSPX-`)
   - Keep these safe - you'll add them to Vercel next

**Replace** `your-project` with your actual Vercel project URL (e.g., `my-seo-dashboard.vercel.app`).

---

## Part 5: Configure DataForSEO (Optional)

DataForSEO enables competitor analysis and content gap features.

### Do I Need This?

**Skip this step if**:
- You only want performance monitoring
- Budget is tight (~$40/month)
- You don't care about competitor analysis

**Complete this step if**:
- You want to track competitors
- You need content gap analysis
- You want SERP position tracking

### Detailed Instructions

For complete DataForSEO setup, see:
👉 **[guides/dataforseo.md](guides/dataforseo.md)**

### Quick Summary

1. **Create Account**: Sign up at [app.dataforseo.com/register](https://app.dataforseo.com/register)
2. **Add Funds**: Minimum $10 deposit (via Billing → Add Funds)
3. **Get API Credentials**:
   - Go to **API Access** in sidebar
   - Copy **API Login** (usually your email)
   - Copy **API Password** (click "Show" - NOT your account password)
4. **Save Credentials**: You'll add these to Vercel next

---

## Part 6: Set Vercel Environment Variables

Now we'll add all the configuration settings to Vercel.

### Step 6.1: Open Environment Variables

1. In your Vercel project dashboard, click **Settings**
2. Click **Environment Variables** in the left sidebar

### Step 6.2: Add Required Variables

Add each variable below by clicking **Add New** for each entry:

| Variable | Value | Where to Find It |
|----------|-------|------------------|
| `TARGET_BASE_URL` | `https://your-website.com` | Your website URL (include https://) |
| `DASHBOARD_URL` | `https://your-project.vercel.app` | Your Vercel project URL |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Same as DASHBOARD_URL |
| `NEXTAUTH_SECRET` | *Generate this* | See below |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx...` | From Google Cloud Console |

#### Generate NEXTAUTH_SECRET

**On Mac/Linux**:
```bash
openssl rand -base64 32
```

**On Windows PowerShell**:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the output and paste it as the `NEXTAUTH_SECRET` value.

### Step 6.3: Add CI Upload Key

This key is required for GitHub Actions to upload scan results securely.

**Generate the key**:

```bash
openssl rand -hex 32
```

**Add to Vercel**:
- Variable name: `CI_UPLOAD_SIGNING_KEY`
- Value: Paste the generated hex string (64 characters)
- **Important**: Save this value - you'll need it for GitHub Secrets next

### Step 6.4: Add Optional Variables

If you configured DataForSEO in Part 5, add:

| Variable | Value |
|----------|-------|
| `DATAFORSEO_LOGIN` | Your DataForSEO API Login |
| `DATAFORSEO_PASSWORD` | Your DataForSEO API Password |

Other optional variables:

| Variable | Example | Purpose |
|----------|---------|---------|
| `APP_NAME` | `"My SEO Dashboard"` | Custom dashboard title |
| `SITE_DESCRIPTION` | `"A SaaS platform for project management"` | Helps AI give better recommendations |
| `ALLOWED_EMAIL_DOMAIN` | `yourcompany.com` | Restrict login to your company (no `@`, just domain) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Enable AI insights |

### Step 6.5: Save and Redeploy

1. After adding all variables, click **Save** for each
2. Go to **Deployments** tab
3. Find the latest deployment (should show "Failed" or "Error")
4. Click **...** → **Redeploy**
5. Wait for deployment to complete (~2-3 minutes)
6. Look for "Ready" status with green checkmark

---

## Part 7: Configure GitHub Actions

GitHub Actions automates daily Lighthouse scans and uploads results to your dashboard.

### Detailed Instructions

For complete GitHub Actions setup, see:
👉 **[guides/github-actions.md](guides/github-actions.md)**

### Step 7.1: Add GitHub Secrets

1. Go to your forked repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these two secrets:

#### Secret 1: DASHBOARD_URL

- Name: `DASHBOARD_URL`
- Value: `https://your-project.vercel.app` (your actual Vercel URL)
- Click **Add secret**

#### Secret 2: CI_UPLOAD_SIGNING_KEY

- Name: `CI_UPLOAD_SIGNING_KEY`
- Value: **Same value** you used in Vercel environment variables (the 64-character hex string)
- Click **Add secret**

**⚠️ Critical**: The `CI_UPLOAD_SIGNING_KEY` must match exactly in both locations:
- Vercel environment variables
- GitHub repository secrets

If they don't match, uploads will fail with 401 Unauthorized errors.

### Step 7.2: Enable GitHub Actions

1. In your repository, click the **Actions** tab
2. If you see "Workflows disabled", click **I understand my workflows, go ahead and enable them**
3. You should now see the "Unlighthouse CI" workflow listed

---

## Part 8: Run Your First Scan

Now everything is configured - let's run your first Lighthouse scan!

### Step 8.1: Trigger Manual Workflow

1. Go to your repository → **Actions** tab
2. Click **Unlighthouse CI** in the left sidebar
3. Click **Run workflow** (button on the right)
4. Leave defaults:
   - Branch: `main`
   - Run competitor analysis: Unchecked (unless you configured DataForSEO)
5. Click **Run workflow** (green button)

### Step 8.2: Monitor Progress

1. You'll see a new workflow run appear (yellow circle = running)
2. Click on the workflow run to see details
3. Expand each job to see logs
4. Expected duration: 5-10 minutes

**What it does**:
- Extracts URLs from your website's sitemap
- Runs Lighthouse scans on mobile device
- Runs Lighthouse scans on desktop device
- Uploads results to your dashboard
- (Optional) Runs competitor analysis if configured

### Step 8.3: Check for Success

Look for green checkmarks (✓) on all jobs:
- `lighthouse-scan-and-upload` - Main scanning job
- `competitor-analysis` (if enabled) - Competitor tracking

If you see red X marks, check the logs for error messages. See [Troubleshooting](#troubleshooting) below.

### Step 8.4: View Your Dashboard

1. Open your dashboard URL: `https://your-project.vercel.app`
2. Click **Sign in with Google**
3. Authorize the app
4. You should now see your Lighthouse data:
   - Performance, Accessibility, Best Practices, SEO scores
   - Mobile vs Desktop comparison
   - Per-page scores

**If you see "No data available"**:
- Wait 1-2 minutes and refresh (data may still be processing)
- Check GitHub Actions logs for errors
- See [Troubleshooting](#troubleshooting) below

---

## Part 9: Local Development (Optional)

Want to run the dashboard locally for development? Follow these steps.

### Step 9.1: Clone Your Fork

```bash
git clone https://github.com/YOUR-USERNAME/your-fork-name.git
cd your-fork-name
```

### Step 9.2: Install Dependencies

```bash
npm ci
```

This installs all required packages (~2-3 minutes).

### Step 9.3: Create Local Environment File

```bash
cp .env.example .env.local
```

This creates a local environment configuration file.

### Step 9.4: Get Vercel KV Credentials

You need to copy KV credentials from your Vercel project:

1. Go to Vercel project dashboard
2. Click **Storage** tab
3. Click your KV database
4. Click **.env.local** tab
5. Copy the two values:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

### Step 9.5: Edit .env.local

Open `.env.local` in a text editor and add:

```bash
# Required
TARGET_BASE_URL=https://your-website.com
DASHBOARD_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-from-vercel
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token

# Optional (if you want to test these features locally)
ANTHROPIC_API_KEY=sk-ant-...
DATAFORSEO_LOGIN=your-login
DATAFORSEO_PASSWORD=your-password
```

**Get values from**:
- Vercel environment variables (Settings → Environment Variables)
- Google Cloud Console (for OAuth credentials)
- KV credentials from step above

### Step 9.6: Start Development Server

```bash
npm run dev
```

The dashboard will start at [http://localhost:3000](http://localhost:3000).

**Available commands**:

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check code style
npm run typecheck    # Check TypeScript types
npm test             # Run tests
npm run scan:desktop # Run local Lighthouse scan (desktop)
npm run scan:mobile  # Run local Lighthouse scan (mobile)
```

---

## Troubleshooting

### Dashboard Issues

#### "Sign in failed" or OAuth redirect errors

**Symptoms**: Can't sign in, redirect loops, "Invalid credentials"

**Solutions**:
1. Verify redirect URI in Google Cloud Console matches exactly:
   - Production: `https://your-project.vercel.app/api/auth/callback/google`
   - Local: `http://localhost:3000/api/auth/callback/google`
2. Check `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel env vars
3. Ensure no extra spaces or quotes in credentials
4. If using `ALLOWED_EMAIL_DOMAIN`, verify your email domain matches

#### Dashboard shows "No data available"

**Symptoms**: Dashboard loads but says "No data available" or "Run your first scan"

**Solutions**:
1. Check if GitHub Actions workflow completed successfully:
   - Go to Actions tab → Look for green checkmark
   - If red X, check error logs
2. Verify `TARGET_BASE_URL` is accessible publicly (not localhost)
3. Wait 2-3 minutes and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Check Vercel function logs for errors:
   - Vercel dashboard → Project → Logs
   - Look for `/api/reports` errors

#### "Deployment failed" in Vercel

**Symptoms**: Build fails when deploying

**Solutions**:
1. Check build logs in Vercel → Deployments → Click failed deployment
2. Common issues:
   - Missing required environment variables
   - TypeScript type errors (should auto-fix)
   - Node.js version mismatch (Vercel uses Node 20 by default)
3. Try redeploying: Deployments → ... → Redeploy

### GitHub Actions Issues

#### Workflow fails with "401 Unauthorized" on upload

**Symptoms**: Scan completes but upload fails with 401 error

**Solutions**:
1. **Most common**: `CI_UPLOAD_SIGNING_KEY` doesn't match:
   - Check value in Vercel env vars
   - Check value in GitHub secrets
   - They must be **exactly identical**
   - Regenerate if needed: `openssl rand -hex 32`
   - Update in **both** places
2. Check `DASHBOARD_URL` is set in GitHub secrets
3. Verify URL format: `https://your-project.vercel.app` (no trailing slash)

#### Workflow fails with "429 Rate Limited"

**Symptoms**: Upload rejected with 429 error

**Solutions**:
- Wait 1 minute and retry
- Default limit: 10 uploads per minute per IP
- Shouldn't happen with daily scheduled runs

#### Scan fails: "Cannot access TARGET_BASE_URL"

**Symptoms**: Lighthouse scan fails early with network errors

**Solutions**:
1. Verify `TARGET_BASE_URL` is publicly accessible (not behind firewall/VPN)
2. Check if site blocks automated traffic (Cloudflare, bot protection)
3. Ensure sitemap exists at `TARGET_BASE_URL/sitemap.xml`
4. Check site doesn't require authentication

#### Competitor analysis job fails

**Symptoms**: Main job succeeds, competitor job fails

**Solutions**:
1. Check DataForSEO credentials in GitHub secrets:
   - `DATAFORSEO_LOGIN`
   - `DATAFORSEO_PASSWORD`
2. Verify DataForSEO account has funds (check balance)
3. Check API credentials are correct (not account password)
4. Review job logs for specific DataForSEO API errors

### Integration Issues

#### AI insights not appearing

**Symptoms**: Dashboard loads but AI tab is empty or disabled

**Solutions**:
1. Verify `ANTHROPIC_API_KEY` is set in Vercel environment variables
2. Check API key is valid (try in Anthropic Console)
3. Check Vercel function logs for Anthropic API errors
4. Verify KV storage is working (data must exist for AI to analyze)

#### DataForSEO competitor data not showing

**Symptoms**: Competitor tab empty or shows "Configure DataForSEO"

**Solutions**:
1. Verify credentials in Vercel env vars:
   - `DATAFORSEO_LOGIN`
   - `DATAFORSEO_PASSWORD`
2. Check DataForSEO account balance (must have funds)
3. Configure competitors in dashboard UI (Competitors → Configure)
4. Click "Refresh Data" and wait 30-60 seconds
5. Check Vercel function logs for DataForSEO API errors

#### Local development KV connection errors

**Symptoms**: Local dev server can't connect to KV storage

**Solutions**:
1. Verify KV credentials in `.env.local`:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
2. Ensure values are from Vercel (not example values)
3. Check KV database is created and connected to project
4. Try regenerating KV credentials in Vercel

### Getting More Help

If you're still stuck:

1. **Check documentation**:
   - [Google OAuth guide](guides/google-oauth.md)
   - [DataForSEO guide](guides/dataforseo.md)
   - [GitHub Actions guide](guides/github-actions.md)

2. **Review logs**:
   - GitHub Actions: Actions tab → Click workflow run
   - Vercel: Project → Logs (functions, builds, errors)

3. **Search issues**: [github.com/rocklandceo/lighthouse-public/issues](https://github.com/rocklandceo/lighthouse-public/issues)

4. **Ask for help**: [github.com/rocklandceo/lighthouse-public/discussions](https://github.com/rocklandceo/lighthouse-public/discussions)

---

## Next Steps

### Customize Your Dashboard

- **Branding**: See [guides/branding.md](guides/branding.md) to customize colors and logo
- **Score Thresholds**: Edit `scripts/notify-slack.mjs` to adjust alert thresholds
- **Scan Schedule**: Edit `.github/workflows/unlighthouse.yml` to change scan frequency

### Add Optional Integrations

- **AI Insights**: Get Anthropic API key at [console.anthropic.com](https://console.anthropic.com)
- **Slack Notifications**: Create webhook at [api.slack.com/messaging/webhooks](https://api.slack.com/messaging/webhooks)
- **Google Analytics**: Enable GA4 Data API and create service account

### Learn More

- **Architecture**: See [README.md](../README.md) for project structure
- **Contributing**: See [CONTRIBUTING.md](../CONTRIBUTING.md) to contribute
- **API Reference**: Check `.env.example` for all available configuration options

---

## Quick Reference

### Essential URLs

- **Your Dashboard**: `https://your-project.vercel.app`
- **Vercel Project**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Google Cloud Console**: [console.cloud.google.com](https://console.cloud.google.com)
- **GitHub Repository**: `https://github.com/YOUR-USERNAME/your-fork-name`
- **GitHub Actions**: `https://github.com/YOUR-USERNAME/your-fork-name/actions`

### Common Commands

```bash
# Generate secrets
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -hex 32     # CI_UPLOAD_SIGNING_KEY

# Local development
npm ci                   # Install dependencies
npm run dev              # Start dev server
npm run scan:mobile      # Run mobile scan
npm run scan:desktop     # Run desktop scan

# Deployment
git push                 # Triggers auto-deploy in Vercel
```

### Required Environment Variables Checklist

- [ ] `TARGET_BASE_URL`
- [ ] `DASHBOARD_URL`
- [ ] `NEXTAUTH_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `KV_REST_API_URL` (auto-set by Vercel KV)
- [ ] `KV_REST_API_TOKEN` (auto-set by Vercel KV)
- [ ] `CI_UPLOAD_SIGNING_KEY` (both Vercel and GitHub)

### Required GitHub Secrets Checklist

- [ ] `DASHBOARD_URL`
- [ ] `CI_UPLOAD_SIGNING_KEY` (matches Vercel env var exactly)

---

**Questions?** Open a [discussion](https://github.com/rocklandceo/lighthouse-public/discussions) or [issue](https://github.com/rocklandceo/lighthouse-public/issues).
