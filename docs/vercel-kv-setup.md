# Vercel KV Storage Setup Guide

## When to Use This Guide

**From the main README**: You're here from Step 13 (Deploy to Vercel, Part B).

**Purpose**: This guide provides detailed walkthrough for setting up Vercel KV database storage. The README has quick steps in Step 13 Part B - this guide has the full details and troubleshooting.

**Prerequisites**:

- ✅ You've completed Steps 1-12 of the README (accounts created, .env configured, validation passed)
- ✅ You've started Step 13 Part A (Initial Vercel deployment)
- ✅ You have a Vercel project (even if deployment failed)

**After completing this guide**: Return to README Step 13 Part C to verify environment variables, then continue with Step 14.

---

This guide shows how to add Vercel KV (powered by Upstash Redis) to your project using the Vercel Marketplace.

---

## What is Vercel KV?

Vercel KV is a durable Redis database built for the Edge. It stores:
- Lighthouse scan results (last 30 runs, 60-day retention)
- AI insights cache (4-hour cache, 30-day history)
- Competitor analysis data
- Upload security (nonce replay protection)

**Cost:** Free tier includes 256 MB storage and 10k commands/day (sufficient for most use cases).

---

## Prerequisites

- Vercel project already created and deployed
- Admin access to your Vercel account

---

## Setup Steps

### Step 1: Access Vercel Storage

1. Go to your Vercel project dashboard
2. Click the **Storage** tab in the top navigation
3. Click **Create Database**

### Step 2: Select KV Database

1. In the "Create New Database" screen, select **KV** (Key-Value Store)
2. You'll see "Powered by Upstash for Redis"
3. Click **Continue**

### Step 3: Configure Database

**Database Name:**
- Enter a descriptive name (e.g., `lighthouse-kv` or `production-kv`)
- This helps identify the database if you have multiple projects

**Region:**
- Choose the region closest to your users
- **Recommended**: Same region as your Vercel deployment
- **Common choices**:
  - `US East (N. Virginia)` - For US-based users
  - `EU West (Ireland)` - For European users
  - `Asia Pacific (Singapore)` - For Asian users

**Tip**: Check your Vercel deployment region in Settings → General → Region

Click **Create**

### Step 4: Link to Project

1. You'll be prompted to select which Vercel projects should have access
2. Check the box next to your Lighthouse dashboard project
3. Click **Connect**

**What this does:**
- Automatically adds KV environment variables to your project
- Grants your deployment access to the database
- Makes the database available in all environments (Production, Preview, Development)

### Step 5: Verify Environment Variables

Vercel automatically adds these environment variables to your project:

- `KV_REST_API_URL` - The Upstash Redis REST endpoint
- `KV_REST_API_TOKEN` - Authentication token for the database
- `KV_REST_API_READ_ONLY_TOKEN` - Read-only token (not used by this app)

**To verify:**

1. Go to your project **Settings**
2. Click **Environment Variables**
3. Confirm you see `KV_REST_API_URL` and `KV_REST_API_TOKEN`
4. Both should be set for all environments (Production, Preview, Development)

**Example values:**
```
KV_REST_API_URL=https://your-database-name-12345.upstash.io
KV_REST_API_TOKEN=AbC123XyZ... (long token string)
```

### Step 6: Redeploy Your Application

After adding KV storage, trigger a new deployment to ensure your app picks up the new environment variables:

1. Go to **Deployments** tab
2. Click the **⋮** menu on the latest deployment
3. Click **Redeploy**
4. Confirm redeployment

**Why this is necessary:**
- Environment variables are only loaded during deployment
- Your running application won't see new variables until redeployed

---

## Verification

After redeployment completes:

1. Visit your dashboard URL
2. Sign in with Google
3. Trigger a scan or wait for scheduled scan
4. Verify data appears in the dashboard

**If data appears**, your KV storage is working correctly!

---

## How to Reconnect KV (If Disconnected)

If your KV database becomes disconnected or environment variables are missing, follow these steps:

1. Go to your Vercel project dashboard
2. Click the **Storage** tab
3. Click on your KV database (e.g., `lighthouse-kv`)
4. Look for **Environment Variables** or **Connection** section
5. Click **Connect** or **Link to Project**
6. Select your project if prompted
7. Click **Connect** to confirm
8. Go to **Settings** → **Environment Variables**
9. Verify these variables now appear:
   - `KV_REST_API_URL` - starts with `https://`
   - `KV_REST_API_TOKEN` - long alphanumeric string
10. **Redeploy** your application (required for new env vars to take effect)

**Tip**: After reconnecting, allow 1-2 minutes for environment variables to propagate before redeploying.

---

## Troubleshooting

### "KV_REST_API_URL is not defined" Error

**Cause:** Environment variables not loaded in deployment.

**Fix:**
1. Go to Settings → Environment Variables
2. Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` exist
3. If missing, reconnect the KV database:
   - Storage tab → Select your KV database → Environment Variables → Connect to project
4. Redeploy your application

### Database Connection Errors

**Cause:** Region mismatch or network latency.

**Fix:**
1. Check database region matches your Vercel deployment region:
   - Storage → KV database → Settings → Region
   - Settings → General → Deployment Region
2. If regions are far apart, consider creating a new database in the correct region
3. **Note**: You can't change a database's region after creation

### No Data in Dashboard

**Cause:** KV database is empty (no scans uploaded yet).

**Fix:**
1. Verify GitHub Actions workflow ran successfully:
   - Go to your GitHub repository
   - Click **Actions** tab
   - Check latest "Lighthouse Scan" workflow status
2. If workflow failed with 401 error, verify `CI_UPLOAD_SIGNING_KEY` matches in:
   - Vercel environment variables
   - GitHub repository secrets
3. Manually trigger a scan to test:
   - Actions → Lighthouse Scan → Run workflow

### Data Not Persisting

**Cause:** Using wrong KV credentials or database not linked.

**Fix:**
1. Verify environment variables are set in **Production** environment:
   - Settings → Environment Variables → Filter by "Production"
2. Ensure KV database is linked to your project:
   - Storage → Select KV database → Check which projects are connected
3. Redeploy to production

---

## Database Management

### Viewing Data

You can view your KV data in the Upstash Console:

1. Go to Storage → Select your KV database
2. Click **Upstash Console** button
3. Sign in to Upstash (uses your Vercel account)
4. Browse keys and values

**Common keys to check:**
- `reports:latest` - Latest scan results
- `reports:runs:list` - List of all run timestamps
- `ai-insights:latest` - Current AI analysis
- `competitor:data` - Competitor analysis cache

### Monitoring Usage

Track your KV usage:

1. Go to Storage → Select your KV database
2. View **Usage** tab
3. Monitor:
   - Storage used (out of 256 MB free tier)
   - Commands per day (out of 10k free tier)
   - Bandwidth (out of 1 GB/day free tier)

**Typical usage for daily scans:**
- Storage: ~5 MB for 30 scan results
- Commands: ~500 per day
- Bandwidth: ~100 MB per day

**Well within free tier limits!**

### Upgrading Storage

If you exceed free tier limits:

1. Go to Storage → Select your KV database
2. Click **Upgrade** button
3. Choose a plan:
   - **Pay as you go**: $0.40/GB storage, $0.20/100k commands
   - **Pro**: Higher limits for predictable pricing

**Most users never need to upgrade.**

---

## Alternative: Using Upstash Directly

If you prefer to manage your Redis database outside of Vercel:

### Why You Might Want This

- More control over database configuration
- Use the same database across multiple Vercel projects
- Access to advanced Upstash features
- Different billing preferences

### Setup Steps

1. **Create Upstash Account**
   - Go to https://upstash.com/
   - Sign up with email or GitHub

2. **Create Redis Database**
   - Click "Create Database"
   - Name: `lighthouse-dashboard`
   - Region: Choose closest to your users
   - Type: Regional (global costs more)
   - Click "Create"

3. **Get REST API Credentials**
   - Click on your database
   - Go to "REST API" tab
   - Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

4. **Add to Vercel Environment Variables**
   - Go to your Vercel project settings
   - Environment Variables
   - Add:
     ```
     KV_REST_API_URL=https://your-database.upstash.io
     KV_REST_API_TOKEN=your-token-here
     ```
   - Save for all environments

5. **Redeploy**

**Advantage**: Full control over database, can use CLI tools, access from anywhere

**Disadvantage**: Requires manual configuration, no automatic Vercel integration

---

## Cost Estimation

### Free Tier (Sufficient for Most Users)

- **256 MB storage** - Holds ~50 scan runs
- **10,000 commands/day** - ~100x typical usage
- **1 GB bandwidth/day** - ~10x typical usage

### Typical Monthly Usage

**Daily Scans (Mobile + Desktop):**
- Storage: ~5 MB (30 runs retained)
- Commands: ~500/day (read/write operations)
- Bandwidth: ~100 MB/day

**Estimated monthly cost: $0** (well within free tier)

### When You Might Need to Upgrade

- **100+ pages scanned daily** (storage exceeds 256 MB)
- **Multiple scans per day** (commands exceed 10k/day)
- **High traffic dashboard** (many concurrent users reading data)

For 99% of users, the free tier is sufficient.

---

## Security Considerations

### Access Control

- **Vercel deployments only**: KV credentials are only available to linked Vercel projects
- **Environment-specific**: Production, Preview, and Development each have isolated access
- **No public access**: Database is not accessible from the internet without credentials

### Data Retention

- **Automatic cleanup**: Old scan results are automatically deleted after 60 days
- **Run history cap**: The dashboard keeps the most recent runs in KV storage (default: 30). You can override this with `REPORTS_MAX_RUNS` (range: 1–365).
- **Manual cleanup**: You can manually delete keys in Upstash Console if needed

### Best Practices

1. **Never commit KV credentials** to version control
2. **Use environment variables only** (never hardcode)
3. **Rotate tokens periodically** (every 6-12 months)
4. **Monitor usage** to detect anomalies
5. **Use read-only tokens** for read-only operations (if needed)

---

## Next Steps

After setting up Vercel KV:

1. ✅ Verify environment variables are set
2. ✅ Redeploy your Vercel project
3. → Continue to [GitHub Actions Setup](github-actions.md)
4. → Trigger your first scan
5. → View results in your dashboard

---

## Additional Resources

- **Vercel KV Documentation**: https://vercel.com/docs/storage/vercel-kv
- **Upstash Documentation**: https://upstash.com/docs/redis
- **Redis Commands Reference**: https://redis.io/commands/
- **Vercel Support**: https://vercel.com/support
