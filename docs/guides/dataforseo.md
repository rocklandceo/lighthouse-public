# DataForSEO Setup Guide

This guide walks you through setting up DataForSEO integration for competitor analysis and content gap identification.

---

## What DataForSEO Provides

With DataForSEO configured, your dashboard gains these powerful features:

- **Competitor Analysis**: Track how competitors rank for your target keywords
- **SERP Position Tracking**: Monitor your rankings vs. competitors over time
- **Keyword Research**: Discover new keyword opportunities
- **Content Gap Analysis**: Find keywords your competitors rank for that you don't
- **Organic Traffic Estimates**: See estimated traffic for competitor domains

**Without DataForSEO**: Performance monitoring still works perfectly, but competitor and content gap features will be disabled in the dashboard.

---

## Pricing Overview

DataForSEO is a paid API service with usage-based pricing:

- **Sandbox Mode**: Free testing environment with limited data (good for development)
- **Standard Plan**: Pay-as-you-go, typically **~$40/month** for basic monitoring
- **Minimum deposit**: $10 to activate account
- **Billing**: Charged per API request (prices vary by endpoint)

Visit [dataforseo.com/pricing](https://dataforseo.com/pricing) for current rates.

---

## Step 1: Create DataForSEO Account

1. Go to [app.dataforseo.com/register](https://app.dataforseo.com/register)
2. Fill out the registration form:
   - Email address
   - Password
   - Company name (can be personal name)
3. Click **Sign Up**
4. Verify your email address (check inbox for verification link)
5. Log in to your new account

---

## Step 2: Add Funds to Your Account

**Important**: You must add funds before using the API.

1. After logging in, click **Billing** in the left sidebar
2. Click **Add Funds** or **Top Up**
3. Enter amount (minimum $10, recommended $25-50 for testing)
4. Choose payment method (credit card, PayPal, etc.)
5. Complete payment

Your balance will appear in the top-right corner of the dashboard.

---

## Step 3: Get API Credentials

**⚠️ Critical**: DataForSEO API credentials are **not** your account login credentials.

1. In the DataForSEO dashboard, click **API Access** in the left sidebar
2. You'll see the **API Access** section with:
   - **API Login**: Usually your email address or an auto-generated username
   - **API Password**: A unique API key (click **Show** to reveal it)

3. **Copy both values carefully**:
   - API Login: `your-email@example.com` (or generated username)
   - API Password: A long random string (e.g., `a1b2c3d4e5f6...`)

**Important Notes**:
- The **API Password** is different from your account password
- The API Password is only shown once after generation - save it securely
- If you lose it, you'll need to regenerate it (which invalidates the old one)

---

## Step 4: Add Credentials to Vercel

Now add your DataForSEO credentials to your Vercel project:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add two new environment variables:

| Variable | Value | Example |
|----------|-------|---------|
| `DATAFORSEO_LOGIN` | Your API Login from DataForSEO | `your-email@example.com` |
| `DATAFORSEO_PASSWORD` | Your API Password from DataForSEO | `a1b2c3d4e5f6g7h8i9j0...` |

4. Click **Save** for each variable
5. **Important**: Redeploy your application
   - Go to **Deployments** tab
   - Click **...** on latest deployment → **Redeploy**
   - Wait for redeployment to complete

---

## Step 5: Configure Competitors in Dashboard

After deployment, configure which competitors to track:

1. Visit your dashboard and sign in
2. Click the **Competitors** tab
3. Click **Configure** or **Settings** (gear icon)
4. Add competitor domains (e.g., `competitor.com`)
5. Add target keywords you want to track
6. Click **Save**
7. Click **Refresh Data** to fetch initial competitor data

The dashboard will now show:
- Competitor rankings for your keywords
- Content gaps (keywords they rank for that you don't)
- SERP position changes over time

---

## Step 7: Verify Setup

Test that your DataForSEO integration is working:

### Option A: Test from Dashboard

1. Go to your dashboard → **Competitors** tab
2. If you see competitor data populate, setup is successful
3. If you see errors, check Vercel function logs

### Option B: Test Locally (Developers)

Run the API test script:

```bash
npm run test:apis
```

This will test:
- DataForSEO API connectivity
- Credential validity
- Account balance
- Available endpoints

**Expected output**:
```
✓ DataForSEO login successful
✓ Account balance: $25.00
✓ SERP endpoint accessible
```

If you see errors:
- Check that credentials match exactly (no extra spaces)
- Verify account has funds
- Check that API Login and API Password are correct (not account password)

---

## Troubleshooting

### "Authentication failed" or 401 errors

- **Check credentials**: Ensure you're using API Login and API Password, not account login credentials
- **Verify in DataForSEO**: Go to API Access page and confirm credentials
- **Check for typos**: Credentials are case-sensitive and must match exactly
- **Regenerate**: If lost, regenerate API Password in DataForSEO dashboard

### "Insufficient funds" errors

- Check your account balance in DataForSEO dashboard (top-right corner)
- Add funds via **Billing** → **Add Funds**
- Minimum deposit: $10

### Competitor data not showing

- **Allow time**: First fetch can take 30-60 seconds
- **Check configuration**: Ensure competitors and keywords are configured in dashboard
- **Review logs**: Check Vercel function logs for API errors
- **API limits**: Free tier has strict rate limits; consider upgrading

### API rate limits

DataForSEO has rate limits based on your plan:
- Sandbox: Very limited requests
- Pay-as-you-go: Higher limits based on account balance
- Enterprise: Custom limits

If hitting limits:
- Reduce refresh frequency in dashboard
- Upgrade to higher tier
- Cache results longer

### Wrong data or outdated results

- **Regional settings**: Check `DATAFORSEO_LOCATION_CODE` in env vars (default: 2840 = USA)
- **Language**: Check `DATAFORSEO_LANGUAGE_CODE` (default: en)
- **Refresh**: Click "Refresh Data" in dashboard to fetch new results

---

## Advanced Configuration

### Custom Location and Language

By default, DataForSEO uses USA location (2840) and English (en). To change:

**In Vercel environment variables:**

```bash
# Location code for SERP results (default: 2840 = USA)
DATAFORSEO_LOCATION_CODE=2826  # UK
# or 2124 (Canada), 2036 (Australia), etc.

# Language code (default: en)
DATAFORSEO_LANGUAGE_CODE=es  # Spanish
# or de (German), fr (French), etc.
```

Find location codes: [docs.dataforseo.com/v3/appendix/locations_and_languages](https://docs.dataforseo.com/v3/appendix/locations_and_languages/)

### Monitoring Multiple Locations

For multiple regions, deploy separate dashboard instances with different `DATAFORSEO_LOCATION_CODE` values.

---

## What Happens Without DataForSEO

If you don't configure DataForSEO, the dashboard still works fully for:

✅ **Available Features**:
- Lighthouse performance monitoring (mobile + desktop)
- Historical score tracking
- Regression alerts
- AI insights (if Anthropic API configured)
- Google Analytics integration
- Slack notifications

❌ **Disabled Features**:
- Competitor analysis tab (hidden or shows "Configure DataForSEO")
- Content gap identification
- SERP position tracking
- Keyword research suggestions

---

## Cost Optimization Tips

1. **Use Sandbox for Development**
   - Test integration with free sandbox data
   - Switch to production for live monitoring

2. **Limit Refresh Frequency**
   - Don't refresh competitor data more than once per day
   - SERP data doesn't change that frequently

3. **Track Essential Keywords Only**
   - Start with 5-10 high-priority keywords
   - Expand as budget allows

4. **Monitor Account Balance**
   - Set up balance alerts in DataForSEO dashboard
   - Budget ~$1-2 per day for basic monitoring

5. **Use Caching**
   - Dashboard caches competitor data for 4 hours by default
   - Reduces API calls significantly

---

## Related Documentation

- [Complete Setup Guide](../SETUP.md)
- [Environment Variables](.env.example)
- [GitHub Actions Setup](github-actions.md)
- [DataForSEO Official Docs](https://docs.dataforseo.com/)

---

## Need Help?

- **DataForSEO Support**: [dataforseo.com/support](https://dataforseo.com/support)
- **Dashboard Issues**: [github.com/rocklandceo/lighthouse-public/issues](https://github.com/rocklandceo/lighthouse-public/issues)
- **Questions**: [github.com/rocklandceo/lighthouse-public/discussions](https://github.com/rocklandceo/lighthouse-public/discussions)
