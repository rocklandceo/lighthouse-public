# Slack Notifications Setup Guide

## When to Use This Guide

**From the main README**: You're here from the "Suggested Enhancements" section or the Documentation index.

**Purpose**: This guide provides a detailed walkthrough for setting up Slack notifications to receive automated alerts when Lighthouse scans complete, scores drop, or performance thresholds are breached.

**Prerequisites**:
- You've completed the main setup (deployed dashboard to Vercel)
- GitHub Actions workflow is configured and running scans
- You have access to a Slack workspace (free or paid)

**After completing this guide**: Your GitHub Actions workflow will automatically send notifications to your chosen Slack channel after each scan.

---

## What You'll Get

The Lighthouse dashboard sends three types of Slack notifications:

1. **Scan Completion**: Summary of your latest scores with comparison to the previous run
2. **Regression Alerts**: Warning when any score drops by more than 5 points
3. **Threshold Breach Alerts**: Critical alert when scores fall below these thresholds:
   - Performance: below 80
   - Accessibility: below 85
   - Best Practices: below 85
   - SEO: below 90

**Example Notification**:
```
Lighthouse Scan Complete

Performance: 95 (+2)
Accessibility: 98 (0)
Best Practices: 92 (-3)
SEO: 100 (0)

Target: https://your-site.com
Dashboard: https://your-dashboard.vercel.app
```

**Estimated Time**: 10-15 minutes

**Cost**: Free (Slack webhooks are included in all Slack plans)

---

## Part 1: Create Slack Workspace (If Needed)

<details>
<summary><strong>Don't have a Slack workspace yet? Click here for step-by-step instructions</strong></summary>

### Create a New Slack Workspace

If you don't already have a Slack workspace, follow these steps:

1. Go to [slack.com/get-started](https://slack.com/get-started#/createnew)

2. Click **Create a Workspace**

3. Enter your email address and click **Continue**

4. Check your email for a verification code (6 digits)

5. Enter the verification code

6. Fill in workspace details:
   - **Workspace name**: Your company or project name (e.g., "Acme Corp" or "My Projects")
   - **Workspace URL**: A short, memorable name (e.g., `acme-corp.slack.com`)

7. Skip the "Invite teammates" step for now (click **Skip this step**)

8. Skip the "What is your team working on?" step (click **Skip this step**)

9. You'll land on your new workspace

### Create a Channel for Notifications

1. In your Slack workspace, click the **+** next to "Channels" in the left sidebar

2. Click **Create a channel**

3. Fill in channel details:
   - **Name**: `lighthouse-alerts` (or any name you prefer)
   - **Description**: "Automated Lighthouse scan notifications"
   - **Visibility**: Private is fine (only you need to see it)

4. Click **Create**

**Verify Success**: You should see your new channel in the sidebar with a lock icon (if private) or hashtag (if public).

</details>

---

## Part 2: Create a Slack App

Slack requires you to create an "app" to receive webhook notifications. This sounds complex but only takes a few minutes.

### Step 2.1: Start Creating the App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
   - If prompted, sign in to your Slack workspace

2. Click the **Create New App** button (top-right, green button)

3. In the popup, select **From scratch**
   - Don't choose "From an app manifest" - that's for advanced users

### Step 2.2: Configure App Details

1. Fill in the app details:
   - **App Name**: `Lighthouse Scanner` (or any descriptive name)
   - **Pick a workspace**: Select your Slack workspace from the dropdown

2. Click **Create App**

3. You'll be taken to your app's settings page

**Verify Success**: You should see a "Basic Information" page with your app name and workspace listed.

---

## Part 3: Configure Incoming Webhook

### Step 3.1: Enable Incoming Webhooks

1. In the left sidebar, click **Incoming Webhooks**
   - If you don't see this, look under "Features" section

2. Find the toggle switch at the top labeled **Activate Incoming Webhooks**

3. Click the toggle to turn it **On** (it should turn green)

### Step 3.2: Add Webhook to Your Channel

1. Scroll down to the **Webhook URLs for Your Workspace** section

2. Click **Add New Webhook to Workspace**

3. In the popup:
   - Select the channel where you want notifications (e.g., `#lighthouse-alerts`)
   - Click **Allow**

4. You'll be redirected back to the Incoming Webhooks page

### Step 3.3: Copy Your Webhook URL

1. Scroll down to **Webhook URLs for Your Workspace**

2. You'll see a new entry with your channel name

3. **Copy the webhook URL** by clicking the **Copy** button
   - The URL format is: `https://hooks.slack.com/services/TXXXXX/BXXXXX/your-unique-token`

4. **Save this URL** somewhere secure temporarily (you'll need it in the next step)

**Security Warning**:
- Treat this webhook URL like a password
- Anyone with this URL can send messages to your channel
- Never commit it to version control (Git)
- If compromised, delete it and create a new one

**Verify Success**: You should have a webhook URL starting with `https://hooks.slack.com/services/`

---

## Part 4: Add Webhook to GitHub Secrets

The webhook URL needs to be added as a secret in your GitHub repository so the scan workflow can use it.

### Step 4.1: Navigate to Repository Secrets

1. Go to your GitHub repository (the fork of lighthouse-public)

2. Click the **Settings** tab (gear icon)
   - Note: You need admin/owner access to see Settings

3. In the left sidebar, scroll down to **Security** section

4. Click **Secrets and variables** to expand it

5. Click **Actions**

### Step 4.2: Add the Secret

1. Click the **New repository secret** button (green, top-right)

2. Fill in the secret details:
   - **Name**: `SLACK_WEBHOOK_URL`
     - Must be exactly this name (case-sensitive)
   - **Secret**: Paste your webhook URL from Part 3

3. Click **Add secret**

**Verify Success**: You should see `SLACK_WEBHOOK_URL` listed under "Repository secrets" with a green lock icon.

---

## Part 5: Verify Setup

### Option A: Run a Manual Scan

The easiest way to test is to trigger a scan:

1. Go to your repository's **Actions** tab

2. Click **Lighthouse Scan** in the left sidebar

3. Click **Run workflow** dropdown (right side)

4. Click the green **Run workflow** button

5. Wait for the workflow to complete (5-15 minutes)

6. Check your Slack channel for the notification

### Option B: Test Webhook Directly

Test that your webhook URL works before running a full scan:

**Mac/Linux** (Terminal):
```bash
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test notification from Lighthouse Dashboard setup!"}' \
  YOUR_WEBHOOK_URL_HERE
```

**Windows** (PowerShell):
```powershell
Invoke-RestMethod -Uri "YOUR_WEBHOOK_URL_HERE" -Method Post -ContentType "application/json" -Body '{"text":"Test notification from Lighthouse Dashboard setup!"}'
```

Replace `YOUR_WEBHOOK_URL_HERE` with your actual webhook URL.

**Expected Result**: You should see the test message appear in your Slack channel within seconds.

**Verify Success**: A message appears in your Slack channel (either test message or scan results).

---

## Troubleshooting

### Notifications Not Appearing After Scan

**Symptoms**:
- Scan completes successfully
- No notification in Slack channel
- No error in GitHub Actions logs

**Possible Causes & Fixes**:

1. **Secret not set correctly**
   - Go to GitHub → Settings → Secrets and variables → Actions
   - Verify `SLACK_WEBHOOK_URL` exists
   - Try deleting and re-adding it (copy webhook URL fresh from Slack)

2. **Workflow not configured**
   - Check `.github/workflows/unlighthouse.yml` includes the notify step
   - The workflow should have a "Notify Slack" or similar step

3. **Wrong channel selected**
   - Check the webhook was added to the correct channel in Slack
   - You can verify by looking at Slack app settings → Incoming Webhooks

### "invalid_payload" or "no_text" Error

**Symptoms**:
- GitHub Actions log shows webhook error
- Message mentions "invalid_payload" or "no_text"

**Fix**:
- This usually means the notification script has a bug
- Check that `scripts/notify-slack.mjs` exists and is not corrupted
- Try re-cloning the repository

### Webhook URL Invalid or Rejected

**Symptoms**:
- Test curl command returns an error
- GitHub Actions shows 400 or 404 error for webhook step

**Fix**:
1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Select your Lighthouse Scanner app
3. Go to **Incoming Webhooks**
4. Delete the old webhook
5. Click **Add New Webhook to Workspace**
6. Select your channel again
7. Copy the new URL
8. Update the `SLACK_WEBHOOK_URL` secret in GitHub

### Rate Limiting (429 Error)

**Symptoms**:
- Some notifications appear, others don't
- GitHub Actions log shows 429 status code

**Fix**:
- Slack has rate limits on webhooks (1 message per second)
- This shouldn't happen with normal use
- If it does, you may have duplicate workflows running
- Check for multiple workflow files in `.github/workflows/`

### Channel Not Found

**Symptoms**:
- Webhook test fails
- Error mentions "channel_not_found"

**Fix**:
- The channel may have been deleted or renamed
- Go to Slack → your app settings → Incoming Webhooks
- Add a new webhook to an existing channel
- Update the GitHub secret

---

## Customizing Notifications

### Change Alert Thresholds

To adjust when threshold breach alerts are sent, edit `scripts/notify-slack.mjs`:

```javascript
const SCORE_THRESHOLDS = {
  performance: 80,      // Alert if below 80
  accessibility: 85,    // Alert if below 85
  'best-practices': 85, // Alert if below 85
  seo: 90,              // Alert if below 90
};
```

**Recommended thresholds by site type**:

| Site Type | Performance | Accessibility | Best Practices | SEO |
|-----------|-------------|---------------|----------------|-----|
| E-commerce | 85 | 90 | 85 | 95 |
| Content/Blog | 80 | 90 | 85 | 95 |
| Web Application | 75 | 85 | 90 | 85 |
| Marketing Site | 85 | 85 | 85 | 95 |

### Change Regression Sensitivity

By default, you're alerted when any score drops by 5+ points. To change this:

1. Open `scripts/detect-regression.mjs`
2. Find the `REGRESSION_THRESHOLD` constant
3. Change the value (e.g., `10` for less sensitive alerts)

---

## Security Best Practices

1. **Rotate webhooks periodically**: Delete and recreate webhooks annually

2. **Use private channels**: Notifications may contain your site URL and scores

3. **Limit access**: Only admins need access to the webhook URL

4. **Monitor for abuse**: If you see unexpected messages in your channel, regenerate the webhook immediately

5. **Don't share webhook URLs**: Even internally, use GitHub Secrets rather than sharing URLs directly

---

## Next Steps

After completing Slack setup:

1. **Verify notifications work**: Run a manual scan and confirm you receive the notification

2. **Customize thresholds**: Adjust alert thresholds to match your site's performance targets

3. **Consider additional integrations**:
   - Auto-redeploy after scans (see [GitHub Actions guide](github-actions.md))
   - Manual scan triggers from dashboard (see [GitHub Actions guide](github-actions.md))

4. **Monitor over time**: Use notifications to track trends and catch regressions early

---

## Additional Resources

- **Slack Incoming Webhooks Documentation**: https://api.slack.com/messaging/webhooks
- **Slack App Management**: https://api.slack.com/apps
- **GitHub Actions Secrets**: https://docs.github.com/en/actions/security-guides/encrypted-secrets
- **GitHub Actions Guide**: [github-actions.md](github-actions.md)
- **Main Setup Guide**: [../README.md](../README.md)
