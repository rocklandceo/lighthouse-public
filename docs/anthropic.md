# Anthropic API Setup Guide

## When to Use This Guide

**From the main README**: You're here from Step 4 of the main setup guide.

**Purpose**: This guide provides a detailed walkthrough for setting up the Anthropic Claude API, which powers the AI-generated SEO insights in your dashboard. The README has a quick summary - this guide has the full details.

**Prerequisites**:
- ✅ You've completed Steps 1-3 of the README (forked repo, created .env file, generated secrets)
- ✅ Your `.env` file is open in your editor
- ✅ Credit card for billing setup (you control spending with budget limits)

**After completing this guide**: Return to the README and continue with Step 5.

---

This guide walks you through setting up Anthropic's Claude API to enable AI-powered SEO insights, content suggestions, and recommendations in your dashboard.

**Estimated Time**: 5-10 minutes

**What You'll Need**:

- Email address
- Credit card (for pay-as-you-go billing)
- Your `.env` file open in an editor

**Why Anthropic Claude?**

Claude analyzes your Lighthouse scores, competitor data, and site metrics to provide actionable SEO recommendations. It generates:
- Executive summaries of your site's health
- Prioritized action items with implementation steps
- Content suggestions with detailed outlines
- Schema markup recommendations
- Copy improvements with before/after comparisons

**Cost**: Pay-as-you-go pricing. Typical usage: **$3-8/month** for daily dashboard use. The dashboard uses Claude 3.5 Haiku, Anthropic's fastest and most cost-effective model.

---

## Part 1: Create Anthropic Account

<details>
<summary><strong>Don't have an Anthropic account yet? Click here for step-by-step instructions</strong></summary>

### Create Your Account

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Click **Sign Up** or **Get Started**
3. Choose a sign-up method:
   - **Email**: Enter your email address and create a password
   - **Google**: Sign in with your Google account (recommended for convenience)
   - **GitHub**: Sign in with your GitHub account
4. If using email, check your inbox for a verification email
5. Click the verification link to activate your account
6. Complete any additional profile information if prompted

**✅ Verify Success**: You should see the Anthropic Console dashboard with your account email in the top-right corner.

</details>

### Sign In to Anthropic Console

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign in with your account credentials
3. You'll land on the Console dashboard

**✅ Verify Success**: You should see the main Console dashboard with navigation options like "API Keys", "Usage", and "Settings" in the sidebar.

---

## Part 2: Get Your API Key

### Generate a New API Key

1. In the Anthropic Console, click **API Keys** in the left sidebar
2. Click **Create Key** or **+ New Key**
3. Give your key a descriptive name:
   - **Recommended**: `lighthouse-dashboard` or `seo-dashboard`
   - This helps you identify the key's purpose later
4. Click **Create** or **Generate**
5. **Important**: Your API key will be displayed **only once**
   - It starts with `sk-ant-api03-...`
   - Copy it immediately and save it somewhere secure

### Copy Your API Key

1. Click the **Copy** button next to your new API key
2. The key format looks like: `sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **Save this key securely** - you won't be able to see it again after leaving this page

**⚠️ Security Warning**:
- Never share your API key publicly
- Never commit it to version control (Git)
- If you lose it, you'll need to generate a new one
- If compromised, delete it immediately and create a new one

### Add to Your .env File

Open your `.env` file and add this line:

```bash
# Anthropic API Key for AI Insights
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

Replace `sk-ant-api03-your-actual-key-here` with your actual API key.

**Save the file** - you'll upload this to Vercel in Step 14 of the main README.

**✅ Verify Success**: Your `.env` file should have a line starting with `ANTHROPIC_API_KEY=sk-ant-`

---

## Part 3: Set Up Billing

**⚠️ Important**: API calls won't work without billing set up. You must add a payment method before using the API.

### Why Billing is Required

- Anthropic uses pay-as-you-go pricing
- You're only charged for actual API usage
- No monthly minimums or commitments
- You control spending with budget limits (next section)

### Add Payment Method

1. In the Anthropic Console, click **Settings** in the left sidebar
2. Click **Billing** or **Plans & Billing**
3. Click **Add Payment Method** or **Set up billing**
4. Enter your credit card information:
   - Card number
   - Expiration date
   - CVV
   - Billing address
5. Click **Save** or **Add Card**

**✅ Verify Success**: You should see your card listed under Payment Methods with a green checkmark or "Active" status.

### Understanding Costs

The dashboard uses **Claude 3.5 Haiku** for fast, cost-effective analysis:

| Action | Approximate Cost |
|--------|------------------|
| Single AI insight refresh | $0.01-0.03 |
| Daily dashboard usage | $0.10-0.25 |
| Monthly (daily use) | $3-8 |
| Monthly (heavy use) | $10-15 |

**Cost factors**:
- Number of pages scanned (more pages = more context = slightly higher cost)
- Frequency of "Refresh Insights" clicks
- Amount of competitor data included

---

## Part 4: Set Up Budget Alerts (Recommended)

Protect yourself from unexpected charges by setting up spending limits.

### Configure Usage Limits

1. In the Anthropic Console, go to **Settings** → **Limits** or **Usage Limits**
2. Set a **Monthly Spending Limit**:
   - **Recommended for testing**: $10-20
   - **Recommended for production**: $25-50
   - This is a hard cap - API calls will fail if exceeded
3. Set a **Usage Alert Threshold** (optional):
   - Get email notifications at 50%, 75%, 90% of your limit
   - Helps you monitor spending before hitting the cap
4. Click **Save** or **Update Limits**

### Recommended Settings for This Dashboard

| Setting | Recommended Value | Notes |
|---------|-------------------|-------|
| Monthly Limit | $25 | Generous for typical use |
| Alert at 50% | $12.50 | Early warning |
| Alert at 90% | $22.50 | Time to review usage |

**✅ Verify Success**: You should see your limits displayed on the Usage or Limits page.

---

## Part 5: Verify Setup

Test that your Anthropic API key is working correctly.

### Option A: Test from Dashboard (After Deployment)

After deploying to Vercel (Step 14 in main README):

1. Visit your dashboard and sign in
2. Look for the **AI Insights** panel on the main dashboard
3. Click **Refresh Insights** or **Generate Insights**
4. Wait 10-30 seconds for Claude to analyze your data
5. If insights appear, your setup is working!

**Expected result**: You should see an executive summary, action items, and content suggestions generated by Claude.

### Option B: Test Locally (Developers)

If you're running the dashboard locally:

```bash
npm run test:apis
```

**Expected output**:
```
✓ Anthropic API connection successful
✓ API key valid
✓ Model access confirmed (claude-3-5-haiku)
```

### Option C: Quick API Test

Test the API key directly using curl:

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_API_KEY_HERE" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-haiku-20241022",
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Say hello"}]
  }'
```

Replace `YOUR_API_KEY_HERE` with your actual API key.

**Expected result**: A JSON response containing Claude's reply.

**✅ Verify Success**: Any of the above tests should confirm your API key is working.

---

## Troubleshooting

### "Invalid API Key" or 401 Authentication Error

**Symptoms**:
- Error message: "Invalid API key" or "Authentication failed"
- HTTP 401 status code

**Causes**:
- API key copied incorrectly (missing characters)
- Extra spaces before/after the key
- Using an old or revoked key

**Fix**:
1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. Verify your key exists and is active
3. If unsure, generate a new key
4. Copy the new key carefully (use the Copy button)
5. Update your `.env` file with the new key
6. Redeploy to Vercel if already deployed

### "Billing not set up" or 402 Payment Required

**Symptoms**:
- Error message: "Billing not configured" or "Payment required"
- HTTP 402 status code

**Causes**:
- No payment method added to account
- Payment method expired or declined

**Fix**:
1. Go to [console.anthropic.com/settings/billing](https://console.anthropic.com/settings/billing)
2. Add or update your payment method
3. Ensure card is valid and has available credit
4. Try the API call again

### "Rate limit exceeded" or 429 Too Many Requests

**Symptoms**:
- Error message: "Rate limit exceeded"
- HTTP 429 status code

**Causes**:
- Too many API requests in a short time
- New accounts have lower rate limits

**Fix**:
1. Wait 1-2 minutes before retrying
2. Avoid clicking "Refresh Insights" rapidly
3. The dashboard caches results for 4 hours - let the cache work
4. If persistent, contact Anthropic support to request higher limits

### "Monthly limit exceeded" or Budget Cap Reached

**Symptoms**:
- Error message: "Usage limit exceeded"
- AI insights stop generating mid-month

**Causes**:
- You've hit your configured monthly spending limit

**Fix**:
1. Go to [console.anthropic.com/settings/limits](https://console.anthropic.com/settings/limits)
2. Either:
   - Increase your monthly limit, OR
   - Wait until the next billing cycle (1st of month)
3. Review your usage to understand spending patterns

### AI Insights Not Appearing in Dashboard

**Symptoms**:
- "AI Insights" panel is empty or shows loading forever
- No error message displayed

**Causes**:
- `ANTHROPIC_API_KEY` not set in Vercel environment variables
- Dashboard not redeployed after adding the key
- API key invalid

**Fix**:
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Verify `ANTHROPIC_API_KEY` exists and has correct value
3. Redeploy: Vercel → Deployments → Redeploy (latest)
4. Clear browser cache and try again
5. Check Vercel function logs for specific errors

### Insights Are Generic or Low Quality

**Symptoms**:
- AI suggestions don't seem specific to your site
- Recommendations are too vague

**Causes**:
- Not enough Lighthouse data collected yet
- Competitor data not configured
- `SITE_DESCRIPTION` not set

**Fix**:
1. Run at least 2-3 Lighthouse scans first (more historical data helps)
2. Configure competitors in the dashboard (if using DataForSEO)
3. Add `SITE_DESCRIPTION` to your environment variables with a description of your business
4. Click "Refresh Insights" to regenerate with more context

---

## Next Steps

After completing Anthropic setup:

1. ✅ Verify `ANTHROPIC_API_KEY` is in your `.env` file
2. ✅ Verify billing is set up in Anthropic Console
3. ✅ Budget alerts configured (recommended)
4. → Continue with [main setup guide](../README.md) Step 5 (DataForSEO or skip to Step 6)
5. → After deployment, test AI insights in your dashboard
6. → Monitor your Anthropic usage periodically at [console.anthropic.com/usage](https://console.anthropic.com/usage)

---

## Additional Resources

- **Anthropic Console**: https://console.anthropic.com/
- **API Documentation**: https://docs.anthropic.com/
- **Pricing Details**: https://www.anthropic.com/pricing
- **Model Information**: https://docs.anthropic.com/en/docs/about-claude/models
- **Complete Setup Guide**: [../README.md](../README.md)
- **Environment Variables**: [../.env.example](../.env.example)
