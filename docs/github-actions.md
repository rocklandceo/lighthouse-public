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

This signing key secures uploads from GitHub Actions to your dashboard. Think of it as a password that only your GitHub Actions and dashboard know.

### What You'll Do

Generate a random 64-character string using your computer's built-in security tools.

### On Your Computer

1. **Open your terminal or command prompt**:
   - **Mac**: Press `Cmd + Space`, type "Terminal", press Enter
   - **Windows**: Press `Win + R`, type "cmd", press Enter (or use Git Bash if installed)
   - **Linux**: Press `Ctrl + Alt + T`

2. **Navigate to your project folder** (where you cloned the repo):

   ```bash
   cd /path/to/lighthouse-public
   ```

   Replace `/path/to/lighthouse-public` with your actual path.

3. **Run this command** (copy and paste the whole line):

   ```bash
   openssl rand -hex 32
   ```

   **What is openssl?** It's a security tool built into Mac/Linux/Git Bash that generates random strings. This ensures your key is unpredictable and secure.

<details>
<summary><strong>Windows users: Click here for alternative methods</strong></summary>

**Option A: Use the provided PowerShell script (Recommended)**

```powershell
cd lighthouse-public
powershell -ExecutionPolicy Bypass -File scripts/generate-secrets.ps1
```

This script generates both `NEXTAUTH_SECRET` and `CI_UPLOAD_SIGNING_KEY` for you.

**Option B: Use PowerShell directly**

If you prefer to generate just the signing key:

```powershell
[System.BitConverter]::ToString((1..32 | ForEach-Object { Get-Random -Maximum 256 })).Replace('-','').ToLower()
```

**Option C: Install Git Bash**

1. Download [Git for Windows](https://git-scm.com/download/win)
2. During install, select "Git Bash Here" option
3. After install, right-click in your project folder → "Git Bash Here"
4. Now you can use the `openssl rand -hex 32` command

**Which option should I choose?**

- **Option A** is easiest - one command does everything
- **Option B** if you only need the signing key
- **Option C** if you want to use Linux-style commands in the future

</details>

4. **You'll see output like this**:

   ```text
   a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
   ```

5. **Copy this entire 64-character string** - you'll paste it in the next steps.

**⚠️ Save it to a text file**: Open Notepad (Windows) or TextEdit (Mac) and paste the key. You'll need it twice:

- Once for Vercel (Step 1.2 below)
- Once for GitHub (Step 2 below)

### What This Key Does

When GitHub Actions finishes a scan, it sends the results to your dashboard. Your dashboard asks: "Do you have the secret password?" If the password matches, the upload succeeds. If not, it's rejected.

This prevents random people on the internet from uploading fake data to your dashboard.

### Step 1.1: Add to Vercel First

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Click **Add New**
4. Variable name: `CI_UPLOAD_SIGNING_KEY`
5. Value: Paste the 64-character hex string
6. Click **Save**

### Step 1.2: Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `CI_UPLOAD_SIGNING_KEY`
5. Value: Paste the **SAME** 64-character hex string (verify character-by-character)
6. Click **Add secret**

**⚠️ CRITICAL**: These values MUST be identical. If they don't match, uploads will fail with 401 Unauthorized errors.

---

## Step 2: Add Required GitHub Secrets

In addition to `CI_UPLOAD_SIGNING_KEY`, add these required secrets:

### DASHBOARD_URL (Required)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `DASHBOARD_URL`
5. Value: Your Vercel URL (e.g., `https://my-dashboard.vercel.app`)
   - **Important**: No trailing slash
   - This is the same URL where you access your deployed dashboard
6. Click **Add secret**

### TARGET_BASE_URL (Required)

1. Click **New repository secret** again
2. Name: `TARGET_BASE_URL`
3. Value: `https://your-website.com` (the site you're monitoring)
   - **Important**: No trailing slash
   - This must be a publicly accessible URL
   - Example: `https://example.com`
4. Click **Add secret**

**⚠️ Important**: `TARGET_BASE_URL` must also be set in Vercel environment variables with the **exact same value**. This is required for the dashboard to work correctly.

### SITEMAP_URL (Conditionally Required)

Add this secret if your sitemap is NOT at the standard location (`/sitemap.xml`):

1. Click **New repository secret**
2. Name: `SITEMAP_URL`
3. Value: Full URL to your sitemap (e.g., `https://your-website.com/sitemap_index.xml`)
4. Click **Add secret**

**Default behavior**: If `SITEMAP_URL` is not set, the workflow will look for `${TARGET_BASE_URL}/sitemap.xml`.
If your sitemap lives elsewhere, `SITEMAP_URL` is required for URL generation to succeed.

---

**Summary of GitHub Secrets**:

| Secret | Required | Example | Where Else to Set |
|--------|----------|---------|-------------------|
| `DASHBOARD_URL` | ✅ Yes | `https://my-dashboard.vercel.app` | Nowhere else |
| `CI_UPLOAD_SIGNING_KEY` | ✅ Yes | `a1b2c3d4e5...` (64 chars) | **Vercel env vars** (must match!) |
| `TARGET_BASE_URL` | ✅ Yes | `https://example.com` | **Vercel env vars** (must match!) |
| `SITEMAP_URL` | ⚪ Conditional | `https://example.com/sitemap_index.xml` | Nowhere else |

**Critical**: `CI_UPLOAD_SIGNING_KEY` and `TARGET_BASE_URL` must be set in **TWO** places with identical values:
1. GitHub repository secrets (for the CI workflow)
2. Vercel environment variables (for the dashboard app)

---

## Step 3: Enable the Workflow

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

---

<details>
<summary><strong>Advanced Configuration: Auto-Redeploy, Custom Schedules, and Dashboard Trigger Button</strong></summary>

> **Note**: For Slack notification setup, see the dedicated [Slack Notifications Guide](slack.md).

---

## Slack Notifications

> **Standalone Guide Available**: For a complete walkthrough including Slack account setup, see [docs/slack.md](slack.md).

Get automated alerts when scans complete, scores drop, or thresholds are breached.

### What You'll Receive

The workflow sends three types of notifications:

1. **Scan Completion**: Summary of latest scores with comparison to previous run
2. **Regression Alerts**: When any score drops by more than 5 points
3. **Threshold Breaches**: When scores fall below critical thresholds:
   - Performance: < 80
   - Accessibility: < 85
   - Best Practices: < 85
   - SEO: < 90

### Setup Instructions

#### Step 1: Create Slack Incoming Webhook

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Enter app name (e.g., "Lighthouse Scanner")
4. Select your workspace
5. Click **Create App**

6. In the left sidebar, click **Incoming Webhooks**
7. Toggle **Activate Incoming Webhooks** to **On**
8. Scroll down and click **Add New Webhook to Workspace**
9. Select the channel where you want notifications (e.g., `#lighthouse-alerts`)
10. Click **Allow**

11. **Copy the webhook URL** - it looks like:
   ```
   https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
   ```

#### Step 2: Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SLACK_WEBHOOK_URL`
5. Value: Paste the webhook URL you copied
6. Click **Add secret**

#### Step 3: Verify Setup

Your workflow already includes Slack notification logic. After adding the secret:

1. Trigger a manual scan via **Actions** → **Lighthouse Scan** → **Run workflow**
2. Wait for the scan to complete
3. Check your Slack channel for the notification

**Expected Notification Format**:

```
🎯 Lighthouse Scan Complete

Performance: 95 (↑ +2)
Accessibility: 98 (→ 0)
Best Practices: 92 (↓ -3)
SEO: 100 (→ 0)

Target: https://your-site.com
Dashboard: https://your-dashboard.vercel.app
```

### Customizing Thresholds

To change alert thresholds, edit [scripts/notify-slack.mjs](../scripts/notify-slack.mjs):

```javascript
const SCORE_THRESHOLDS = {
  performance: 80,      // Change these values
  accessibility: 85,
  'best-practices': 85,
  seo: 90,
};
```

**Recommended thresholds based on site type**:
- **E-commerce**: Performance 85+, SEO 95+
- **Content sites**: Accessibility 90+, SEO 95+
- **Web apps**: Best Practices 90+, Performance 80+

---

## Auto-Redeploy Dashboard

Automatically trigger a Vercel redeployment after each scan completes, ensuring your dashboard always shows the latest data immediately.

### Why Use This?

- **Instant Updates**: New data appears without manual refresh or waiting for next deployment
- **User Experience**: Users always see current scores when they visit
- **Automated Pipeline**: Scan → Upload → Redeploy happens automatically

**Trade-off**: Uses Vercel build minutes (100 free per month on Hobby plan)

### Setup Instructions

#### Step 1: Create Vercel Deploy Hook

1. Go to your Vercel project dashboard
2. Click **Settings** → **Git**
3. Scroll to **Deploy Hooks** section
4. Click **Create Hook**
5. Fill in details:
   - **Hook Name**: `Lighthouse Scan` (or any descriptive name)
   - **Git Branch**: `main` (or your default branch)
6. Click **Create Hook**
7. **Copy the webhook URL** - it looks like:
   ```
   https://api.vercel.com/v1/integrations/deploy/prj_XXXX/XXXX
   ```

#### Step 2: Add to GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `VERCEL_DEPLOY_HOOK`
5. Value: Paste the webhook URL you copied
6. Click **Add secret**

#### Step 3: Verify Setup

Your workflow already includes redeploy logic. After adding the secret:

1. Trigger a manual scan
2. Wait for scan to complete
3. Check **Actions** log - you should see "Triggered Vercel redeploy"
4. Go to Vercel dashboard → **Deployments** - you should see a new "Hook" deployment

**Note**: Redeploy happens AFTER successful upload. If upload fails, redeploy is skipped.

---

## Custom Scan Schedules

The default workflow runs daily at 2 AM UTC. You can customize this schedule using cron syntax.

### Edit Workflow Schedule

Open [.github/workflows/unlighthouse.yml](../.github/workflows/unlighthouse.yml) and modify the `cron` value:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'  # Change this line
  workflow_dispatch:
```

### Common Schedule Patterns

```yaml
# Every 6 hours
- cron: '0 */6 * * *'

# Every hour
- cron: '0 * * * *'

# Weekdays only at 2 AM UTC
- cron: '0 2 * * 1-5'

# Every Monday at 8 AM UTC
- cron: '0 8 * * 1'

# Twice daily (6 AM and 6 PM UTC)
- cron: '0 6,18 * * *'

# Every 4 hours on weekdays
- cron: '0 */4 * * 1-5'
```

### Cron Syntax Reference

```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *
```

### Recommendations

- **Daily scans**: Good for most sites (default: `0 2 * * *`)
- **Hourly scans**: Only for rapidly changing sites (high API costs)
- **Weekdays only**: Good for business sites (`0 2 * * 1-5`)
- **Twice daily**: Balanced approach for active sites (`0 6,18 * * *`)

**Cost Consideration**: More frequent scans = higher DataForSEO and Anthropic API costs. Start with daily scans and increase frequency only if needed.

---

## Dashboard Trigger Button

Enable the "Trigger Scan" button in your dashboard UI to manually start scans without visiting GitHub Actions.

### Setup Instructions

#### Step 1: Create GitHub Personal Access Token

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Fill in details:
   - **Note**: `Lighthouse Dashboard Trigger` (descriptive name)
   - **Expiration**: 90 days (or custom - tokens should be rotated regularly)
   - **Select scopes**: Check **only** `repo` (full control of private repositories)
4. Click **Generate token**
5. **Copy the token immediately** - you won't see it again
   - Format: `ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

#### Step 2: Add to Vercel Environment Variables

These are **Vercel env vars**, NOT GitHub Secrets:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add three variables:

| Variable | Value | Example |
|----------|-------|---------|
| `GITHUB_TOKEN` | Your personal access token | `ghp_XXXX...` |
| `GITHUB_REPO_OWNER` | Your GitHub username or org | `johndoe` |
| `GITHUB_REPO_NAME` | Repository name | `lighthouse-public` |

4. Click **Save** after each
5. **Redeploy your dashboard** for changes to take effect

#### Step 3: Use the Trigger Button

1. Visit your dashboard
2. You should now see a **"Trigger Scan"** button
3. Click it to manually start a GitHub Actions workflow
4. Check **Actions** tab on GitHub to verify workflow started

**Note**: The button triggers the same workflow as the scheduled run, including both mobile and desktop scans.

---

## Advanced Troubleshooting

### Slack Notifications Not Appearing

**Verify webhook URL**:
```bash
curl -X POST -H 'Content-type: application/json' \
--data '{"text":"Test notification from Lighthouse Dashboard"}' \
YOUR_WEBHOOK_URL
```

If this doesn't appear in Slack, the webhook URL is invalid.

**Check workflow logs**:
- Go to **Actions** → Latest workflow run → **Notify Slack** step
- Look for error messages

**Common issues**:
- Webhook URL has typo or extra spaces
- Slack app was deleted or webhook was regenerated
- Channel was deleted or app was removed from channel

### Auto-Redeploy Not Working

**Verify deploy hook URL**:
```bash
curl -X POST YOUR_DEPLOY_HOOK_URL
```

This should trigger a deployment in Vercel.

**Check workflow logs**:
- Go to **Actions** → Latest workflow run → **Trigger Vercel redeploy** step
- Look for HTTP status code (should be 200 or 201)

**Common issues**:
- Deploy hook URL has typo
- Deploy hook was deleted in Vercel
- Vercel project was deleted or renamed

### Trigger Button Not Appearing

**Check Vercel environment variables**:
- All three variables (`GITHUB_TOKEN`, `GITHUB_REPO_OWNER`, `GITHUB_REPO_NAME`) must be set
- Variable names must match exactly (case-sensitive)
- After adding variables, you must redeploy

**Check browser console**:
- Open DevTools → Console tab
- Click the trigger button area
- Look for error messages

**Common issues**:
- GitHub token expired (regenerate and update in Vercel)
- Token doesn't have `repo` scope (recreate with correct permissions)
- Repository name or owner is incorrect

### Workflow Triggering Too Frequently

If scans are running multiple times per hour unexpectedly:

1. Check if multiple schedules are defined in `.github/workflows/unlighthouse.yml`
2. Look for duplicate workflow files in `.github/workflows/`
3. Verify no external services are calling your deploy hook
4. Check GitHub Actions logs for trigger source

---

## Security Best Practices

1. **Rotate tokens regularly**:
   - GitHub personal access tokens: Every 90 days
   - Regenerate Slack webhooks: Annually
   - Regenerate Vercel deploy hooks: Annually

2. **Use minimal permissions**:
   - GitHub token: Only `repo` scope needed
   - Slack webhook: Restrict to specific channel

3. **Monitor usage**:
   - Check GitHub Actions usage in **Settings** → **Billing**
   - Monitor Vercel deployments in project dashboard
   - Review Slack notification frequency

4. **Secure secrets**:
   - Never commit tokens to version control
   - Use GitHub Secrets and Vercel Environment Variables
   - Don't share webhook URLs publicly

---

## Additional Resources

- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Slack Incoming Webhooks**: https://api.slack.com/messaging/webhooks
- **Vercel Deploy Hooks**: https://vercel.com/docs/concepts/git/deploy-hooks
- **Cron Syntax**: https://crontab.guru/
- **GitHub Personal Access Tokens**: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

</details>

---

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
