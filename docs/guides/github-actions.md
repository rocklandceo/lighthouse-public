# GitHub Actions Setup Guide

This guide explains how to configure the automated Lighthouse scanning workflow.

## Overview

The included GitHub Actions workflow:

- Runs daily at 2 AM UTC
- Scans both mobile and desktop
- Uploads results to your dashboard
- Detects score regressions
- Sends Slack notifications (optional)

## Step 1: Add Repository Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**.

Add these secrets:

| Secret | Description | Example |
|--------|-------------|---------|
| `TARGET_BASE_URL` | Website to scan | `https://example.com` |
| `DASHBOARD_URL` | Your dashboard URL | `https://my-dashboard.vercel.app` |
| `CI_UPLOAD_SIGNING_KEY` | HMAC key for secure uploads | Generate with `openssl rand -hex 32` |

### Generating the Signing Key

Run this command in your terminal:

```bash
openssl rand -hex 32
```

Copy the output and add it as `CI_UPLOAD_SIGNING_KEY` to:

1. GitHub repository secrets
2. Vercel environment variables

Both must match exactly.

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

Set up these additional environment variables in Vercel:

```bash
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_REPO_OWNER=your-username-or-org
GITHUB_REPO_NAME=your-repo-name
```

Then you can trigger scans from the dashboard UI.

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
