# DataForSEO Setup Guide

This guide walks you through setting up DataForSEO integration for competitor analysis and content gap identification, starting from account creation.

**Estimated Time**: 15 minutes

**What You'll Need**:

- Credit card or PayPal account
- $50 minimum for initial deposit (one-time)
- Your target website domain

**Why DataForSEO?**

DataForSEO provides competitor intelligence and SERP tracking that makes your dashboard a complete SEO monitoring solution. This is a **core feature** that enables:

- **Competitor Analysis**: Track how competitors rank for your target keywords
- **SERP Position Tracking**: Monitor your rankings vs. competitors over time
- **Keyword Research**: Discover new keyword opportunities based on competitor data
- **Content Gap Analysis**: Find keywords your competitors rank for that you don't
- **Organic Traffic Estimates**: See estimated traffic for competitor domains
- **Backlink Analysis**: Understand competitor link profiles

**Cost**: $50 minimum deposit (one-time). This typically lasts **2-6 months** for daily competitor monitoring depending on the number of keywords and competitors tracked.

**Usage Estimate**:

- Tracking 5 competitors with 10 keywords: ~$15-25/month
- Tracking 10 competitors with 20 keywords: ~$30-50/month
- Data refreshed once per day (cached for 4 hours in dashboard)

**Cost Optimization**: The dashboard automatically caches results to minimize API calls. Most users find the $50 deposit lasts 2-3 months.

---

## Part 1: Create DataForSEO Account

### Sign Up for DataForSEO

1. Go to [app.dataforseo.com/register](https://app.dataforseo.com/register)
2. Fill out the registration form:
   - **Email address**: Your business or personal email
   - **Password**: Create a strong password (you'll need this to log in)
   - **Company name**: Enter your company name or personal name (e.g., "My Company LLC" or "John Smith")
   - **Country**: Select your country from the dropdown
3. Check the box to accept Terms of Service and Privacy Policy
4. Click **Sign Up** or **Create Account**

### Verify Your Email

1. Check your email inbox for a message from DataForSEO
2. Click the **Verify Email** link in the email
3. You'll be redirected to the DataForSEO dashboard
4. You're now logged in to your account

**Account Created!** You should see the DataForSEO dashboard with your email and $0.00 balance in the top-right corner.

---

## Part 2: Add Funds to Your Account

**⚠️ Important**: You must add funds before you can use the API. The minimum deposit is **$50**.

### Why $50 Minimum?

- DataForSEO requires a $50 minimum to activate API access
- This is a **one-time deposit** that stays in your account
- You're only charged for actual API usage (pay-as-you-go)
- $50 typically lasts 2-6 months for daily competitor monitoring
- Unused funds remain in your account - no expiration

### Add Funds

1. After logging in, look for **Billing** or **Add Funds** in the left sidebar
2. Click **Add Funds** or **Top Up Balance**
3. Enter the amount:
   - **Minimum**: $50 (required to activate API)
   - **Recommended for testing**: $50-100
   - **For production**: $100+ (avoids frequent top-ups)
4. Choose payment method:
   - **Credit Card** (Visa, Mastercard, Amex)
   - **PayPal**
   - **Wire Transfer** (for larger amounts)
5. Complete the payment process
6. Wait a few seconds for payment to process

**Verify Balance**:

- Your balance should appear in the top-right corner of the dashboard
- You should see **$50.00** (or the amount you deposited)
- If you don't see it immediately, refresh the page

**Now you're ready to get your API credentials!**

---

## Part 3: Get API Credentials

**⚠️ Critical**: DataForSEO API credentials are **not** your account login credentials. They're separate credentials specifically for API access.

### Find Your API Credentials

1. In the DataForSEO dashboard, look for **API Access** or **API** in the left sidebar
2. Click **API Access** or **API Credentials**
3. You'll see a section showing:
   - **API Login**: Usually your email address or an auto-generated username
   - **API Password**: A unique API key (may need to click **Show** or **Reveal** to see it)

### If You Don't See API Credentials Yet

Sometimes new accounts need to generate credentials:

1. Look for **Generate API Credentials** or **Create API Key** button
2. Click it to generate your credentials
3. The API Login and API Password will appear

### Copy Your Credentials

1. **API Login**:
   - Usually your email address: `your-email@example.com`
   - Or an auto-generated username: `api_user_12345`
   - **Copy this exactly** - you'll need it for your `.env` file

2. **API Password**:
   - A long random string: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - Click **Show** or **Reveal** if it's hidden
   - **Copy this exactly** - you'll need it for your `.env` file

**⚠️ Important Security Notes**:

- The **API Password** is different from your account password
- Save it securely - it's only shown once after generation
- If you lose it, you'll need to regenerate it (which invalidates the old one)
- Don't share these credentials publicly or commit them to version control

### Add to Your .env File

Open your `.env` file and add these lines:

```bash
# DataForSEO Credentials
DATAFORSEO_LOGIN=your-email@example.com
DATAFORSEO_PASSWORD=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Replace with your actual API Login and API Password.

**Save the file** - you'll upload these to Vercel in Step 10 of the main README.

---

## Part 4: Configure Competitors in Dashboard

After deploying to Vercel (Step 11 in main README), configure which competitors to track:

1. Visit your dashboard and sign in
2. Click the **Competitors** tab (or **Competitor Analysis**)
3. You may see a message like "Configure DataForSEO" or "Set up competitors"
4. Click **Configure**, **Settings**, or the gear icon (⚙️)
5. In the configuration panel:
   - **Add competitor domains**: Enter competitor websites (e.g., `competitor1.com`, `competitor2.com`)
   - **Add target keywords**: Enter keywords you want to track (e.g., "project management software", "team collaboration tool")
   - Start with 3-5 competitors and 5-10 keywords for testing
6. Click **Save** or **Save Configuration**
7. Click **Refresh Data** or **Fetch Competitor Data** to get initial results

**First data fetch may take 30-60 seconds** - be patient while DataForSEO retrieves SERP data.

### What You'll See

After the first data fetch completes, your dashboard will show:

- **Competitor Rankings**: Where competitors rank for your target keywords
- **Your Rankings**: Where your site ranks for the same keywords
- **Content Gaps**: Keywords competitors rank for that you don't (opportunity areas)
- **SERP Position Changes**: Track ranking improvements or declines over time
- **Estimated Traffic**: Organic traffic estimates for competitor domains

### Data Refresh Schedule

- **Manual refresh**: Click "Refresh Data" anytime (costs API credits)
- **Automatic refresh**: Dashboard caches data for 4 hours (reduces costs)
- **Recommended**: Refresh once per day maximum (SERP data doesn't change frequently)

---

## Part 5: Verify Setup

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
- Minimum deposit: $50
- Remember: You're only charged for actual API usage, so if balance is low, add more funds

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

## Cost Optimization Tips

**Good News**: The dashboard is designed to minimize API costs through intelligent caching.

1. **Start with $50 Deposit**
   - Minimum required deposit: $50
   - This typically lasts 2-6 months for daily monitoring
   - Unused funds never expire - stay in your account

2. **Limit Refresh Frequency**
   - Dashboard automatically caches results for 4 hours
   - Manual refresh only costs credits when cache is expired
   - Don't refresh more than once per day (SERP data changes slowly)
   - Best practice: Refresh once daily or let automatic schedule handle it

3. **Track Essential Keywords Only**
   - Start with 5-10 high-priority keywords (most impactful)
   - Each keyword costs ~$0.10-0.30 per check depending on location
   - Example: 10 keywords × 1 refresh/day × 30 days = ~$30-90/month
   - Expand keyword list as budget allows

4. **Limit Number of Competitors**
   - Track 3-5 key competitors initially
   - More competitors = more API calls
   - Focus on direct competitors who matter most

5. **Monitor Account Balance**
   - Check balance regularly in DataForSEO dashboard (top-right corner)
   - Set up low balance alerts if available
   - Add funds before running out to avoid service interruption
   - Typical usage: $15-50/month depending on configuration

6. **Use Caching Effectively**
   - Dashboard caches competitor data for 4 hours by default
   - Viewing the Competitors tab doesn't cost credits if cache is fresh
   - Only manual "Refresh Data" clicks or cache expiration trigger API calls

**Expected Costs by Usage**:

| Competitors | Keywords | Refresh Frequency | Monthly Cost |
|-------------|----------|-------------------|--------------|
| 3           | 5        | Daily             | $15-25       |
| 5           | 10       | Daily             | $25-40       |
| 10          | 20       | Daily             | $40-70       |

**$50 deposit lasts 2-3 months for typical usage** (5 competitors, 10 keywords, daily refresh).

---

## Next Steps

After completing DataForSEO setup:

1. ✅ Verify DataForSEO credentials are in your `.env` file
2. ✅ Verify $50 minimum deposit is in your DataForSEO account
3. ✅ API Login and API Password are copied correctly
4. → Continue with [main setup guide](../../README.md) to deploy to Vercel
5. → After deployment, configure competitors in dashboard
6. → Monitor your DataForSEO account balance periodically

---

## Additional Resources

- **DataForSEO Official Docs**: https://docs.dataforseo.com/
- **API Pricing Calculator**: https://dataforseo.com/pricing
- **Location Codes**: https://docs.dataforseo.com/v3/appendix/locations_and_languages/
- **DataForSEO Support**: https://dataforseo.com/support
- **Complete Setup Guide**: [../../README.md](../../README.md)
- **Environment Variables**: [../../.env.example](../../.env.example)
