# GitHub Actions Setup Guide

This guide explains how to configure the automated Lighthouse scanning workflow.

## Overview

The included GitHub Actions workflow:

- Runs daily at 2 AM UTC
- Scans both mobile and desktop
- Uploads results to your dashboard
- Detects score regressions
- Sends Slack notifications (optional)

**Prerequisites**: You must have:
- Deployed your dashboard to Vercel
- Forked this repository to your GitHub account
- Admin access to your forked repository

---

## Step 1: Generate CI Upload Signing Key

The signing key secures uploads from GitHub Actions to your dashboard.

### Generate the Key

Run this command in your terminal (Mac/Linux/Git Bash):

```bash
openssl rand -hex 32
```

This will output a 64-character hex string. Example:
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**⚠️ CRITICAL**: Save this value - you'll need to add it to **TWO** locations with the **EXACT** same value:
1. Vercel environment variables
2. GitHub repository secrets

If they don't match, uploads will fail with 401 Unauthorized errors.

### Add to Vercel First

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Variable name: `CI_UPLOAD_SIGNING_KEY`
5. Value: Paste the 64-character hex string
6. Click **Save**

### Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CI_UPLOAD_SIGNING_KEY`
5. Value: Paste the **SAME** 64-character hex string
6. Click **Add secret**

---

## Step 2: Add Required GitHub Secrets

In addition to `CI_UPLOAD_SIGNING_KEY`, add these required secrets:

### DASHBOARD_URL (Required)

- Name: `DASHBOARD_URL`
- Value: Your Vercel URL (e.g., `https://my-dashboard.vercel.app`)
- **Important**: No trailing slash

### TARGET_BASE_URL (Required)

- Name: `TARGET_BASE_URL`
- Value: `https://your-website.com` (the site you're monitoring)
- **Important**: No trailing slash

### SITEMAP_URL (Optional)

- Name: `SITEMAP_URL`
- Value: `https://your-website.com/sitemap.xml` (custom sitemap location)
- **Default**: If not set, defaults to `${TARGET_BASE_URL}/sitemap.xml`
- Only needed if your sitemap is at a non-standard location

**Summary of GitHub Secrets**:

| Secret | Required | Example | Notes |
|--------|----------|---------|-------|
| `DASHBOARD_URL` | ✅ Yes | `https://my-dashboard.vercel.app` | Where to upload scan results |
| `CI_UPLOAD_SIGNING_KEY` | ✅ Yes | `a1b2c3d4e5...` (64 chars) | HMAC signing key - **Must match Vercel env var** |
| `TARGET_BASE_URL` | ✅ Yes | `https://example.com` | Website you're monitoring |
| `SITEMAP_URL` | ⚪ Optional | `https://example.com/sitemap_index.xml` | Defaults to `${TARGET_BASE_URL}/sitemap.xml` |

**Note**: These are **GitHub repository secrets** used by the CI workflow. They are separate from Vercel environment variables (except `CI_UPLOAD_SIGNING_KEY` and `TARGET_BASE_URL` which must be set in both locations with identical values).

## Step 2: Enable the Workflow

The workflow file is already included at `.github/workflows/unlighthouse.yml`.

To verify it's enabled:

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. You should see "Lighthouse Scan" in the list
4. If it shows "Workflows aren't being run", click the button to enable them

## Step 3: Run Your First Scan

### Option A: Wait for Scheduled Run

The workflow runs automatically at 2 AM UTC every day.

### Option B: Manual Trigger

1. Go to **Actions** → **Lighthouse Scan**
2. Click **Run workflow**
3. Optionally enable competitor analysis
4. Click the green **Run workflow** button

### Option C: Trigger from Dashboard

To enable the "Trigger Scan" button in your dashboard UI, add these **Vercel environment variables**:

**In Vercel Project Settings → Environment Variables**:

| Variable               | Example             | Purpose                                         |
|------------------------|---------------------|-------------------------------------------------|
| `GITHUB_TOKEN`         | `ghp_...`           | Personal Access Token with `repo` scope         |
| `GITHUB_REPO_OWNER`    | `your-username`     | Your GitHub username or organization            |
| `GITHUB_REPO_NAME`     | `lighthouse-public` | Your forked repository name                     |

**Important**: These are Vercel env vars, NOT GitHub Secrets. They enable manual scan triggering from the dashboard.

Then you can trigger scans from the dashboard UI using the "Trigger Scan" button.

## Optional: Slack Notifications

To receive Slack alerts:

1. Create a Slack incoming webhook:
   - Go to [api.slack.com/apps](https://api.slack.com/apps)
   - Create a new app or select existing
   - Enable **Incoming Webhooks**
   - Create a webhook for your channel
   - Copy the webhook URL

2. Add to GitHub secrets:

   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/xxx/xxx
   ```

You'll receive notifications for:

- Scan completion with scores
- Score regressions (drops below threshold)
- Threshold breaches

## Optional: Auto-Redeploy Dashboard

To automatically update your dashboard after each scan:

1. In Vercel, go to **Settings** → **Git** → **Deploy Hooks**
2. Create a new hook (name it "Lighthouse Scan")
3. Copy the URL
4. Add to GitHub secrets:

   ```
   VERCEL_DEPLOY_HOOK=https://api.vercel.com/v1/integrations/deploy/xxx
   ```

## Customizing the Schedule

Edit `.github/workflows/unlighthouse.yml`:

```yaml
on:
  schedule:
    # Default: 2 AM UTC daily
    - cron: '0 2 * * *'

    # Examples:
    # Every 6 hours: '0 */6 * * *'
    # Weekdays only: '0 2 * * 1-5'
    # Every Monday: '0 2 * * 1'
```

## Troubleshooting

### Workflow not running

- Check the Actions tab is enabled
- Verify you have repository write access
- Look for errors in the Actions log

### Upload fails with 401

- Verify `CI_UPLOAD_SIGNING_KEY` matches in GitHub and Vercel
- Check that `DASHBOARD_URL` is correct
- Ensure your dashboard is deployed and accessible

### Upload fails with 429

- You're being rate limited (10 requests/minute)
- Wait a minute and retry
- Check for duplicate workflow runs

### Scans time out

- Your target site may be slow or have many pages
- Reduce `max_routes` in unlighthouse config files
- Check target site is accessible from GitHub's servers

### Slack notifications not working

- Verify webhook URL is correct
- Test the webhook URL directly with curl
- Check Slack app permissions

## Viewing Results

After a successful scan:

1. Visit your dashboard URL
2. Sign in with Google
3. View the latest scores and trends
4. Check the AI insights for recommendations

Historical data is stored for 60 days.
