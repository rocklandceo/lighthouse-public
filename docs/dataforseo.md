# DataForSEO Setup Guide

## When to Use This Guide

**From the main README**: You're here from Step 5 of the main setup guide.

**Purpose**: This guide provides detailed walkthrough for DataForSEO setup, including account creation. The README has a quick summary - this guide has the full details.

**Prerequisites**:
- ✅ You've completed Steps 1-2 of the README (forked repo, created .env file)
- ✅ Your `.env` file is open in your editor
- ✅ Credit card or PayPal account ready ($50 minimum deposit)

**After completing this guide**: Return to the README and continue with Step 6.

---

This guide walks you through setting up DataForSEO integration for competitor analysis and content gap identification, starting from account creation.

**Estimated Time**: 15 minutes

**What You'll Need**:

- Credit card or PayPal account
- $50 minimum for initial deposit (one-time)
- Your target website domain

**Why DataForSEO?**

DataForSEO provides competitor tracking and SERP analysis, showing you where competitors rank for your keywords and identifying content gaps. The $50 deposit typically lasts 2-6 months for daily monitoring.

**Cost**: $50 minimum deposit (one-time). Typical usage: $15-50/month depending on number of competitors and keywords tracked.

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

> **📍 Regional Settings (Required)**: `DATAFORSEO_LOCATION_CODE` and `DATAFORSEO_LANGUAGE_CODE` are required configuration values. Use the defaults shown in `.env.example` or set values for your target region and language. See the [Advanced Topics](#custom-location-and-language-codes) section for location codes and configuration details.

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

<details>
<summary><strong>Advanced Topics: Cost Optimization, Multi-Region Tracking, and Troubleshooting</strong></summary>

---

## Cost Optimization Strategies

DataForSEO charges per API request. Follow these strategies to minimize costs while maintaining comprehensive competitor monitoring.

### 1. Optimize Refresh Frequency

**Default behavior**: Dashboard caches competitor data for 4 hours

**Cost impact**: Each refresh costs ~$0.50-2.00 depending on number of keywords and competitors

**Recommendations**:

| Monitoring Need | Refresh Frequency | Monthly Cost |
|-----------------|-------------------|--------------|
| Passive tracking | Once per week | $2-8 |
| Normal monitoring | Once per day | $15-25 |
| Active campaigns | Twice per day | $30-50 |
| Real-time tracking | Every 4 hours | $90-150 |

**How to implement**:
- Don't click "Refresh Data" unless needed
- Let automatic 4-hour cache work
- SERP data rarely changes hourly - daily checks are sufficient

### 2. Limit Competitor and Keyword Count

**Cost formula**: `Cost per refresh ≈ (num_competitors + 1) × num_keywords × $0.05`

**Examples**:
- 3 competitors, 5 keywords: $1.00 per refresh
- 10 competitors, 20 keywords: $11.00 per refresh
- 20 competitors, 50 keywords: $52.50 per refresh

**Recommendations**:
- Start small: 3-5 competitors, 5-10 keywords
- Focus on top competitors (market leaders, closest rivals)
- Track high-value keywords only (target keywords that drive conversions)
- Remove low-priority keywords after testing

### 3. Use Tiered Monitoring

Monitor different competitor sets at different frequencies:

**Tier 1 (Daily)**: Top 3 direct competitors, 10 core keywords
**Tier 2 (Weekly)**: 5-10 secondary competitors, 20 broader keywords
**Tier 3 (Monthly)**: Industry leaders, 50+ informational keywords

**Implementation**: Create separate dashboard instances or manually switch competitor configs

### 4. Leverage Dashboard Caching

The dashboard automatically caches results. Avoid these cost-increasing behaviors:

- ❌ Clicking "Refresh Data" multiple times per day
- ❌ Opening competitor tab repeatedly (triggers background refresh)
- ❌ Clearing browser cache frequently
- ✅ Let the 4-hour cache expire naturally
- ✅ Bookmark specific competitor report URLs
- ✅ Save competitor data screenshots for historical reference

### 5. Batch Keyword Research

Instead of tracking 50 keywords continuously:

1. Track 5-10 core keywords daily
2. Monthly: Run one-time analysis of 50+ keywords
3. Identify top opportunities from monthly analysis
4. Add 2-3 new keywords to daily tracking
5. Remove underperforming keywords

**Cost savings**: $40-60/month compared to tracking all 50 keywords daily

### 6. Monitor Balance and Set Alerts

**Setup budget alerts**:

1. Log in to DataForSEO dashboard
2. Go to **Billing** → **Notifications**
3. Set alert thresholds:
   - Warning at 50% balance remaining
   - Critical at 25% balance remaining
4. Add email/SMS notifications

**Track monthly spending**:
- Export billing history monthly
- Calculate cost per competitor/keyword
- Identify high-cost queries
- Adjust tracking frequency based on budget

---

## Custom Location and Language Codes

Track SERP rankings in specific countries and languages beyond the default USA/English configuration.

### Why Use Custom Locations?

- **International SEO**: Monitor rankings in target markets (UK, Canada, Australia, etc.)
- **Local SEO**: Track city-specific results (New York, Los Angeles, etc.)
- **Competitor intelligence**: See how competitors rank in different regions
- **Content localization**: Identify regional keyword variations

### Available Location Codes

DataForSEO supports 100+ locations. Common examples:

| Location | Code | Use Case |
|----------|------|----------|
| United States | 2840 | Default |
| United Kingdom | 2826 | UK market |
| Canada | 2124 | Canadian market |
| Australia | 2036 | Australian market |
| New York, USA | 1023191 | Local NYC SEO |
| London, UK | 1006886 | Local London SEO |
| Germany | 2276 | German market |
| France | 2250 | French market |

**Full list**: [DataForSEO Location Codes](https://docs.dataforseo.com/v3/serp/google/organic/live/advanced/)

### Available Language Codes

| Language | Code | Use Case |
|----------|------|----------|
| English | en | Default |
| Spanish | es | Spanish-speaking markets |
| French | fr | French-speaking markets |
| German | de | German-speaking markets |
| Portuguese | pt | Brazilian/Portuguese markets |
| Japanese | ja | Japanese market |
| Chinese (Simplified) | zh-CN | Chinese market |

**Full list**: [DataForSEO Language Codes](https://docs.dataforseo.com/v3/appendix/languages/)

### How to Configure Custom Location/Language

Add to your `.env` file (and Vercel environment variables):

```bash
# Default: USA, English
DATAFORSEO_LOCATION_CODE=2840
DATAFORSEO_LANGUAGE_CODE=en

# Example: UK, English
DATAFORSEO_LOCATION_CODE=2826
DATAFORSEO_LANGUAGE_CODE=en

# Example: Germany, German
DATAFORSEO_LOCATION_CODE=2276
DATAFORSEO_LANGUAGE_CODE=de

# Example: New York City, English (local SEO)
DATAFORSEO_LOCATION_CODE=1023191
DATAFORSEO_LANGUAGE_CODE=en
```

**Important**: After changing these values, redeploy your dashboard in Vercel for changes to take effect.

### Verifying Location/Language

After redeployment:

1. Go to your dashboard → **Competitors** tab
2. Click **Refresh Data**
3. Check that SERP results match your target location
4. Look for regional variations in rankings (e.g., UK competitors ranking higher in UK results)

---

## Monitoring Multiple Regions

Track competitor performance across multiple geographic markets by deploying separate dashboard instances.

### Strategy 1: Multiple Vercel Projects

Deploy one dashboard instance per region:

**Dashboard 1**: USA market (main dashboard)
- Location: 2840 (United States)
- Language: en
- Competitors: US-based competitors
- URL: `lighthouse-us.vercel.app`

**Dashboard 2**: UK market
- Location: 2826 (United Kingdom)
- Language: en
- Competitors: UK-based competitors
- URL: `lighthouse-uk.vercel.app`

**Dashboard 3**: Germany market
- Location: 2276 (Germany)
- Language: de
- Competitors: German competitors
- URL: `lighthouse-de.vercel.app`

**Implementation**:

1. Fork the repository 3 times (or use one repo with 3 Vercel projects)
2. Configure each Vercel project with different environment variables
3. Each instance has separate Vercel KV database
4. Each instance has separate DataForSEO config (competitors, keywords)

**Cost**: Free on Vercel Hobby plan (unlimited projects). DataForSEO costs multiply (3× the API usage).

### Strategy 2: Manual Region Switching

Use a single dashboard and manually switch regions:

1. Go to Vercel → **Settings** → **Environment Variables**
2. Change `DATAFORSEO_LOCATION_CODE` and `DATAFORSEO_LANGUAGE_CODE`
3. Redeploy dashboard
4. Update competitor config for new region
5. Fetch new data

**Trade-off**: Cheaper (single dashboard), but requires manual switching and loses historical data when switching regions.

### Strategy 3: Multi-Region Dashboard (Custom Development)

Modify the dashboard code to support multiple regions in one instance:

**Required changes**:
- Add region selector to competitor config UI
- Store region-specific competitor configs in KV
- Modify DataForSEO API calls to accept location/language per request
- Display multi-region results in dashboard tabs

**Complexity**: Medium to High (requires TypeScript/React knowledge)

**Benefit**: Single dashboard, all regions in one place

---

## API Rate Limits and Caching

Understand DataForSEO rate limits and optimize caching to avoid hitting limits.

### DataForSEO Rate Limits

| Plan | Requests per Minute | Requests per Hour | Concurrent Requests |
|------|---------------------|-------------------|---------------------|
| Sandbox (Free) | 5 | 100 | 1 |
| Pay-as-you-go | 50 | 2000 | 10 |
| Enterprise | Custom | Custom | Custom |

**Most users use Pay-as-you-go** (activated by $50 deposit)

### Dashboard Caching Strategy

The dashboard caches competitor data to minimize API calls:

**Cache key**: `competitor:data` (stored in Vercel KV)
**Cache duration**: 4 hours
**Stale-while-revalidate**: 2 hours

**How it works**:

1. User visits Competitors tab
2. Dashboard checks `competitor:data` in KV
3. If data exists and < 4 hours old → Return cached data (no API call)
4. If data exists and 2-4 hours old → Return cached data + background refresh (1 API call)
5. If data > 4 hours old or doesn't exist → Fetch new data (1 API call)

### Extending Cache Duration

To reduce costs, extend cache duration:

Edit `lib/cache.ts`:

```typescript
// Current: 4 hour cache
const COMPETITOR_CACHE_TTL = 60 * 60 * 4;

// Extended: 24 hour cache (daily refresh)
const COMPETITOR_CACHE_TTL = 60 * 60 * 24;

// Extended: 7 day cache (weekly refresh)
const COMPETITOR_CACHE_TTL = 60 * 60 * 24 * 7;
```

**Trade-off**: Longer cache = less cost, but less fresh data

### Handling Rate Limit Errors

If you hit rate limits, the dashboard will show an error. To resolve:

1. **Wait 1 minute** before retrying (rate limits reset per minute)
2. **Check concurrent requests**: Ensure you're not running multiple scans simultaneously
3. **Verify plan**: Confirm you have Pay-as-you-go activated ($50 deposit)
4. **Contact DataForSEO**: Request rate limit increase if needed

**Prevention**:
- Don't click "Refresh Data" rapidly
- Don't run competitor analysis during scheduled Lighthouse scans
- Implement exponential backoff in custom integrations

---

## Advanced Troubleshooting

### High API Costs (Budget Overruns)

**Symptom**: DataForSEO balance draining faster than expected

**Diagnosis**:

1. Log in to DataForSEO dashboard
2. Go to **Usage** or **API Calls** section
3. Check recent API calls:
   - Identify high-cost endpoints
   - Look for duplicate requests
   - Check timestamps (are requests happening too frequently?)

**Common causes**:
- Too many competitors/keywords
- Refresh frequency too high
- Competitor analysis running in CI (if enabled in GitHub Actions)
- Browser auto-refresh or multiple tabs open

**Solutions**:
- Reduce competitor/keyword count (see Cost Optimization strategies above)
- Increase cache duration in `lib/cache.ts`
- Disable competitor analysis in GitHub Actions (`workflow_dispatch` input)
- Close unnecessary browser tabs

### Incorrect Regional Results

**Symptom**: Competitor rankings don't match what you see in Google

**Diagnosis**:

1. Verify `DATAFORSEO_LOCATION_CODE` matches your target region
2. Verify `DATAFORSEO_LANGUAGE_CODE` matches your target language
3. Check if you're using a VPN (can skew results)
4. Confirm competitors are actually ranking in that region

**Common causes**:
- Wrong location code (e.g., using USA code when targeting UK)
- Personalized Google results (logged in to Google account)
- VPN or proxy affecting results
- Competitor content is geo-restricted

**Solutions**:
- Double-check location/language codes in [DataForSEO docs](https://docs.dataforseo.com/v3/appendix/locations_and_languages/)
- Test with incognito/private browsing window
- Disable VPN when comparing results
- Use DataForSEO's "Organic Search" results (not personalized)

### Stale Competitor Data

**Symptom**: Competitor rankings haven't updated in days

**Diagnosis**:

1. Check `competitor:timestamp` in Vercel KV (via Vercel dashboard → Storage tab)
2. Check dashboard logs for failed API calls
3. Verify DataForSEO account balance > $0

**Common causes**:
- Cache duration too long
- API calls failing silently
- DataForSEO account balance depleted
- Dashboard not redeployed after changing configs

**Solutions**:
- Manually click "Refresh Data" in dashboard
- Check Vercel function logs for errors
- Add funds to DataForSEO account
- Verify API credentials are correct in Vercel env vars

### Missing Competitors in Results

**Symptom**: Some competitors don't appear in dashboard results

**Diagnosis**:

1. Verify competitor domains are correctly configured
2. Check if competitors actually rank for your keywords
3. Test with broader keywords
4. Check DataForSEO API response in Vercel logs

**Common causes**:
- Competitor doesn't rank in top 100 for target keywords
- Domain typo in competitor config (e.g., missing `www.` or `.com`)
- Competitor uses different domain in target region (e.g., `.co.uk` vs `.com`)
- Keywords too specific or niche

**Solutions**:
- Start with broader keywords (1-2 words) to verify setup
- Test competitor domain manually in Google search
- Check if competitor uses regional TLD (`.co.uk`, `.de`, etc.)
- Verify competitor is not blocking DataForSEO's crawler

</details>

---

## Next Steps

After completing DataForSEO setup:

1. ✅ Verify DataForSEO credentials are in your `.env` file
2. ✅ Verify $50 minimum deposit is in your DataForSEO account
3. ✅ API Login and API Password are copied correctly
4. → Continue with [main setup guide](../README.md) to deploy to Vercel
5. → After deployment, configure competitors in dashboard
6. → Monitor your DataForSEO account balance periodically

---

## Additional Resources

- **DataForSEO Official Docs**: https://docs.dataforseo.com/
- **API Pricing Calculator**: https://dataforseo.com/pricing
- **Location Codes**: https://docs.dataforseo.com/v3/appendix/locations_and_languages/
- **DataForSEO Support**: https://dataforseo.com/support
- **Complete Setup Guide**: [../README.md](../README.md)
- **Environment Variables**: [../.env.example](../.env.example)
