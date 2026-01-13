# Lighthouse SEO Dashboard

A comprehensive performance monitoring and SEO analytics platform with AI-powered insights, competitor intelligence, and Google Analytics integration.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**Estimated Setup Time**: 2 hours | **Track Progress**: [docs/SETUP-CREDENTIALS.md](docs/SETUP-CREDENTIALS.md)

---

## What You Get

Full-featured performance monitoring with:

- ✅ **Daily Lighthouse Scans** - Automated mobile + desktop performance audits
- ✅ **AI-Powered SEO Insights** - Claude-generated recommendations and content suggestions
- ✅ **Competitor SERP Tracking** - Monitor your position vs competitors for key terms
- ✅ **Google Analytics Integration** - Traffic metrics alongside performance data
- ✅ **Historical Trends** - Track score changes over time with regression detection
- ✅ **Slack Notifications** - Automated alerts for performance drops
- ✅ **Custom Domain Support** - Professional URL like `lighthouse.yourcompany.com`

---

## Cost Breakdown

**Be informed about costs upfront:**

### One-Time Costs
- **DataForSEO**: $50 minimum deposit (lasts months for typical usage)

### Monthly Recurring
- **Anthropic API**: ~$5/month for daily scans
- **Vercel**: Free (hobby tier sufficient)
- **Vercel KV**: Free (free tier sufficient)
- **GitHub Actions**: Free (within limits)
- **Google Cloud**: Free (within limits)

### Total
**~$55 first month, ~$5/month ongoing**

All features are included for this cost. No hidden fees or surprise charges.

---

## Prerequisites

### What You Need Before Starting

- **Your business website** with a public sitemap
- **2 hours of focused time** to complete setup
- **Credit card** for Anthropic (~$5/month) + DataForSEO ($50 one-time)
- **Admin access** to your website's Google Analytics

### Technical Requirements

- Basic familiarity with terminal/command line
- Ability to access DNS settings for your domain (for custom domain setup)
- Admin access to create accounts and API keys

**No coding required** - just follow the step-by-step instructions.

---

## Complete Setup Guide

Follow these steps in order. Use [docs/SETUP-CREDENTIALS.md](docs/SETUP-CREDENTIALS.md) to track your progress.

### Part 1: Create Accounts (30 minutes)

Create accounts for all required services before configuring anything.

#### Step 1: GitHub Account

**Why needed**: Host your repository and run automated scans via GitHub Actions

**If you already have GitHub**:
- Skip to Step 2

**If you need to create an account**:
1. Go to https://github.com/signup
2. Enter your email address
3. Create a password
4. Choose a username
5. Verify your account (check email)
6. Choose Free plan

**Fork this repository**:
1. Go to https://github.com/YOUR-USERNAME/lighthouse-public (this repo)
2. Click **Fork** button (top right)
3. This creates your own copy at `github.com/YOUR-USERNAME/lighthouse-public`

✅ **Checkpoint**: You have a GitHub account and forked repository

---

#### Step 2: Google Cloud Account

**Why needed**: OAuth login + Google Analytics API + Search Console API

**Steps**:
1. Go to https://console.cloud.google.com/
2. Sign in with your Google account (or create one)
3. Accept Terms of Service
4. Create a new project:
   - Click project dropdown (top bar)
   - Click "New Project"
   - Project name: **Lighthouse Dashboard**
   - Click **Create**
5. Wait for project creation (5-10 seconds)

**What you'll configure later**:
- OAuth 2.0 credentials (for dashboard sign-in)
- Service account (for Analytics API access)

✅ **Checkpoint**: Google Cloud project created

---

#### Step 3: Anthropic Account

**Why needed**: AI-powered SEO insights (core feature)

**Cost**: ~$5/month for daily scans

**Steps**:
1. Go to https://console.anthropic.com/
2. Click **Sign Up**
3. Enter your email and create password
4. Verify email
5. Sign in to console
6. Click **Settings** (gear icon)
7. Click **API Keys**
8. Click **Create Key**
9. Name: "Lighthouse Dashboard"
10. Copy the API key: `sk-ant-api03-...`

**⚠️ CRITICAL**: Save this key immediately - it's only shown once!

**Add payment method**:
1. Click **Billing** in settings
2. Add credit/debit card
3. No charges until you use the API

✅ **Checkpoint**: Anthropic API key obtained and saved

---

#### Step 4: DataForSEO Account

**Why needed**: Competitor analysis and SERP tracking (core feature)

**Cost**: $50 minimum deposit (lasts months)

**Steps**:
1. Go to https://dataforseo.com/
2. Click **Sign Up**
3. Fill in registration form
4. Verify your email
5. Sign in to dashboard
6. Click **Billing** in sidebar
7. Add $50 credit:
   - Click **Top Up Balance**
   - Enter amount: $50
   - Add payment method
   - Complete payment
8. Get API credentials:
   - Click **Dashboard** → **API Access**
   - Copy your **Login** (username)
   - Copy your **Password** (API password)

**⚠️ CRITICAL**: Save these credentials - you'll need them in .env file

**Usage estimate**: $50 lasts ~3-6 months for typical daily scans (depends on number of keywords tracked)

✅ **Checkpoint**: DataForSEO account created with $50 credit

---

#### Step 5: Vercel Account

**Why needed**: Host the dashboard

**Cost**: Free

**Steps**:
1. Go to https://vercel.com/signup
2. Click **Continue with GitHub** (recommended)
3. Authorize Vercel to access your GitHub account
4. Confirm email if prompted

That's it! Vercel account is ready.

✅ **Checkpoint**: Vercel account created

---

#### Step 6: Verify Google Analytics Setup

**Why needed**: Traffic metrics alongside performance data

**Cost**: Free

**If you already have Google Analytics 4**:
- Note your Property ID (format: `properties/123456789`)
- Skip to Part 2

**If you need to set up GA4**:
1. Go to https://analytics.google.com/
2. Sign in with Google account
3. Click **Admin** (gear icon)
4. Click **Create Property**
5. Property name: Your website name
6. Choose timezone and currency
7. Click **Next** → **Create**
8. Add data stream for your website
9. Note your **Property ID**: `properties/123456789`

**Guide**: See [docs/guides/google-analytics.md](docs/guides/google-analytics.md) for detailed setup

✅ **Checkpoint**: All 6 accounts created

---

### Part 2: Configure Services (45 minutes)

Now configure the services you created.

#### Step 7: Generate Secrets

Generate required security secrets locally.

**Mac/Linux users**:
```bash
cd lighthouse-public
bash scripts/generate-secrets.sh
```

**Windows users**:
```powershell
cd lighthouse-public
powershell -ExecutionPolicy Bypass -File scripts/generate-secrets.ps1
```

**Output example**:
```
1. NEXTAUTH_SECRET
   Value: xyz123abc456...

2. CI_UPLOAD_SIGNING_KEY
   Value: abc123def456...
```

**⚠️ ACTION**: Copy these values to a text file. You'll need them multiple times.

**✅ Checkpoint**: Secrets generated and saved

---

#### Step 8: Set Up Google OAuth

**Why needed**: Allow users to sign in to the dashboard

**Detailed guide**: [docs/guides/google-oauth.md](docs/guides/google-oauth.md)

**Quick steps**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Select your "Lighthouse Dashboard" project
3. Click **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. If prompted, configure consent screen:
   - User Type: **External**
   - App name: **Lighthouse Dashboard**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue** through all screens
6. Back to Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **Lighthouse Dashboard**
   - Authorized redirect URIs: **Leave blank for now** (we'll add after Vercel deployment)
   - Click **Create**
7. Copy **Client ID** and **Client Secret**

**⚠️ Note**: We'll add the redirect URI in Step 15 after getting your Vercel URL

**✅ Checkpoint**: OAuth credentials created

---

#### Step 9: Set Up Google Analytics + Search Console

**Why needed**: Fetch traffic metrics and search performance data

**Detailed guide**: [docs/guides/google-analytics.md](docs/guides/google-analytics.md)

**Quick steps**:

1. Enable APIs:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/library)
   - Search "Google Analytics Data API" → **Enable**
   - Search "Google Search Console API" → **Enable**

2. Create service account:
   - Go to [Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
   - Click **Create Service Account**
   - Name: **Lighthouse Analytics**
   - Click **Create and Continue**
   - Skip role assignment → Click **Done**

3. Generate key:
   - Click on the service account you just created
   - Click **Keys** tab → **Add Key** → **Create new key**
   - Key type: **JSON**
   - Click **Create**
   - JSON file downloads automatically

4. Copy JSON content:
   - Open the downloaded JSON file
   - Copy the **entire contents** (it's one long line)
   - Save for .env file

5. Grant access to Analytics:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Click **Admin** → **Property Access Management**
   - Click **+** → **Add users**
   - Email: `lighthouse-analytics@YOUR-PROJECT.iam.gserviceaccount.com` (from JSON file, `client_email` field)
   - Role: **Viewer**
   - Click **Add**

**✅ Checkpoint**: Analytics API configured

---

#### Step 10: Fill Out .env File

Create your environment file with all credentials.

**Steps**:

```bash
# Copy template
cp .env.example .env

# Edit with your favorite editor
# nano .env (or vim, VSCode, etc.)
```

**Fill in these variables**:

```bash
# Target Site
TARGET_BASE_URL=https://your-website.com
TARGET_DOMAIN=your-website.com

# Dashboard URLs (fill after Step 12)
DASHBOARD_URL=
NEXTAUTH_URL=

# Secrets (from Step 7)
NEXTAUTH_SECRET=<paste from generate-secrets output>
CI_UPLOAD_SIGNING_KEY=<paste from generate-secrets output>

# Google OAuth (from Step 8)
GOOGLE_CLIENT_ID=<paste Client ID>
GOOGLE_CLIENT_SECRET=<paste Client Secret>

# Google Analytics (from Step 9)
GOOGLE_ANALYTICS_PROPERTY_ID=properties/123456789
GOOGLE_SERVICE_ACCOUNT_JSON=<paste entire JSON object>

# Anthropic (from Step 3)
ANTHROPIC_API_KEY=sk-ant-api03-<your-key>

# DataForSEO (from Step 4)
DATAFORSEO_LOGIN=<your-login>
DATAFORSEO_PASSWORD=<your-password>

# Vercel KV (will be auto-added in Step 13)
# KV_REST_API_URL=
# KV_REST_API_TOKEN=
```

**Validate your configuration**:

```bash
node scripts/validate-setup.mjs
```

**Expected output**:
```
✅ VALIDATION PASSED
   All required variables are set.
```

**If validation fails**:
- Review error messages
- Check each variable is filled in
- Ensure no extra spaces or quotes
- Re-run validation

**✅ Checkpoint**: All credentials in .env file and validated

---

### Part 3: Deploy to Vercel (30 minutes)

Deploy your dashboard to Vercel.

#### Step 11: Initial Vercel Deployment

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Find your forked repository: `YOUR-USERNAME/lighthouse-public`
4. Click **Import**
5. Configure project:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - **Important**: Don't add environment variables yet
6. Click **Deploy**
7. Wait for deployment to complete (~2 minutes)
8. **Deployment will fail** - this is expected (environment variables not set yet)
9. Copy your Vercel URL: `https://your-project-abc123.vercel.app`

**Update your .env file**:
```bash
DASHBOARD_URL=https://your-project-abc123.vercel.app
NEXTAUTH_URL=https://your-project-abc123.vercel.app
```

**✅ Checkpoint**: Project deployed to Vercel (failed deployment is OK)

---

#### Step 12: Add Vercel KV Storage

**Detailed guide**: [docs/guides/vercel-kv-setup.md](docs/guides/vercel-kv-setup.md)

**Quick steps**:

1. In your Vercel project dashboard, click **Storage** tab
2. Click **Create Database**
3. Select **KV** (Upstash for Redis)
4. Database name: **lighthouse-kv**
5. Region: Choose closest to your users (e.g., `US East` for US)
6. Click **Create**
7. Select your project to link
8. Click **Connect**

**Verify**:
- Go to **Settings** → **Environment Variables**
- Confirm `KV_REST_API_URL` and `KV_REST_API_TOKEN` were auto-added

**✅ Checkpoint**: Vercel KV database created and linked

---

#### Step 13: Upload Environment Variables to Vercel

Add **all** your environment variables to Vercel.

**Variables to add** (from your .env file):

1. Go to **Settings** → **Environment Variables**
2. For each variable below, click **Add New**:

| Variable | Value | Notes |
|----------|-------|-------|
| `TARGET_BASE_URL` | From .env | Your website |
| `TARGET_DOMAIN` | From .env | Your domain |
| `DASHBOARD_URL` | From .env | Your Vercel URL |
| `NEXTAUTH_URL` | From .env | Same as DASHBOARD_URL |
| `NEXTAUTH_SECRET` | From .env | Generated secret |
| `CI_UPLOAD_SIGNING_KEY` | From .env | ⚠️ Must match GitHub exactly |
| `GOOGLE_CLIENT_ID` | From .env | OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | From .env | OAuth credentials |
| `GOOGLE_ANALYTICS_PROPERTY_ID` | From .env | Analytics property |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | From .env | Full JSON object |
| `ANTHROPIC_API_KEY` | From .env | AI insights |
| `DATAFORSEO_LOGIN` | From .env | Competitor analysis |
| `DATAFORSEO_PASSWORD` | From .env | Competitor analysis |

3. For each variable:
   - Name: Exact variable name
   - Value: Paste from .env
   - Environment: **All** (Production, Preview, Development)
   - Click **Save**

**Optional variables** (add if you want these features):
- `APP_NAME` - Custom dashboard name
- `SITE_DESCRIPTION` - Your site description for AI context
- `SLACK_WEBHOOK_URL` - Slack notifications

**After adding all variables**:
1. Go to **Deployments** tab
2. Click **⋮** on latest deployment
3. Click **Redeploy**
4. Wait for successful deployment (~2 minutes)

**✅ Checkpoint**: All environment variables in Vercel, successful deployment

---

#### Step 14: Update Google OAuth Redirect URI

Now that you have your Vercel URL, add the OAuth redirect:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, click **Add URI**
5. Enter: `https://your-project-abc123.vercel.app/api/auth/callback/google`
   - Replace with your actual Vercel URL
   - **Important**: No trailing slash
   - Must be exact URL from Step 11
6. Click **Save**

**✅ Checkpoint**: OAuth redirect URI configured

---

#### Step 15: Configure GitHub Actions

**⚠️ CRITICAL: Two-Location Check**

These variables MUST be IDENTICAL in both Vercel and GitHub:
- `CI_UPLOAD_SIGNING_KEY`
- `TARGET_BASE_URL`

If they don't match exactly, you'll get 401 Unauthorized errors (the #1 setup failure).

**Detailed guide**: [docs/guides/github-actions.md](docs/guides/github-actions.md)

**Quick steps**:

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

**Add these secrets**:

| Secret Name | Value | ⚠️ Must Match Vercel? |
|-------------|-------|----------------------|
| `CI_UPLOAD_SIGNING_KEY` | From Vercel env vars | ✅ YES - Copy exact value |
| `TARGET_BASE_URL` | From Vercel env vars | ✅ YES - Copy exact value |
| `DASHBOARD_URL` | From Vercel env vars | No (but still add it) |

**How to ensure exact match**:
1. Open Vercel → Settings → Environment Variables
2. Find `CI_UPLOAD_SIGNING_KEY`
3. Click to reveal value
4. Select all and copy
5. Paste into GitHub Secret
6. Verify character-by-character
7. Repeat for `TARGET_BASE_URL`

**✅ Checkpoint**: GitHub Secrets configured with matching values

---

### Part 4: (Optional) Custom Domain (15 minutes)

Want `lighthouse.yourcompany.com` instead of `random-name.vercel.app`?

**Detailed guide**: [docs/guides/custom-domain.md](docs/guides/custom-domain.md)

**Quick steps**:

1. In Vercel: Settings → Domains → Add `lighthouse.yourcompany.com`
2. Add CNAME record at your DNS provider:
   - Type: CNAME
   - Name: lighthouse
   - Value: cname.vercel-dns.com
3. Wait for DNS propagation (5-30 minutes)
4. Update OAuth redirect URI with custom domain
5. Update `DASHBOARD_URL` and `NEXTAUTH_URL` in Vercel to custom domain
6. Update `DASHBOARD_URL` in GitHub Secrets to custom domain
7. Redeploy

**✅ Checkpoint**: Custom domain working (optional)

---

### Part 5: Verification (15 minutes)

Verify everything works end-to-end.

#### Step 16: Run Your First Scan

1. Go to your GitHub repository
2. Click **Actions** tab
3. Enable workflows if prompted
4. Click **Lighthouse Scan** workflow (left sidebar)
5. Click **Run workflow** dropdown
6. Branch: **main**
7. Run competitor analysis: **✓** (check the box)
8. Click green **Run workflow** button

**Wait 5-10 minutes** for the workflow to complete.

**Monitor progress**:
- Workflow will show "Running" with spinning icon
- Click on the workflow run to see live logs
- Green checkmark = success
- Red X = failure (check logs for errors)

**✅ Checkpoint**: First scan completed successfully

---

#### Step 17: Verify Dashboard Features

1. Open your `DASHBOARD_URL` (or custom domain)
2. Click **Sign in with Google**
3. Authorize with your Google account
4. Dashboard should load with data

**Check all features are working**:

| Feature | Working? | How to Verify |
|---------|----------|---------------|
| Performance Scores | ✓ | See mobile + desktop scores at top |
| AI Insights | ✓ | "AI Insights" panel shows recommendations |
| Competitor Analysis | ✓ | "Competitor Analysis" section shows SERP data |
| Google Analytics | ✓ | "Traffic Metrics" shows visitor data |
| Historical Trends | ✓ | Charts show data over time |

**If any feature is missing**:
- Check that feature's environment variable in Vercel
- Verify API key is correct
- See Troubleshooting section below

**✅ Checkpoint**: All features verified working

---

## Setup Complete! 🎉

**Congratulations!** Your Lighthouse SEO Dashboard is fully operational.

**What happens next**:

- GitHub Actions runs automatically **daily at 2 AM UTC**
- Results upload to your dashboard automatically
- AI insights refresh on demand
- Competitor data updates with each scan
- Historical data retained for 60 days

**Bookmark your dashboard**: `https://lighthouse.yourcompany.com`

---

## What Happens Next

### Automated Daily Scans

Your GitHub Actions workflow runs daily at 2 AM UTC and:

1. Fetches your sitemap
2. Runs Lighthouse scans (mobile + desktop)
3. Checks for performance regressions
4. Uploads results to your dashboard
5. (Optional) Sends Slack notification if configured
6. (Optional) Triggers Vercel redeploy if configured

### Manual Scans

Trigger scans anytime:
- **From GitHub**: Actions tab → Lighthouse Scan → Run workflow
- **From Dashboard** (if `GITHUB_TOKEN` configured): Click "Trigger Scan" button

### Reviewing Results

Visit your dashboard to:
- View latest performance scores
- Read AI-generated SEO insights
- Check competitor SERP positions
- Review Google Analytics traffic data
- Track historical trends

---

## Troubleshooting

### Setup Issues

#### 401 Unauthorized Errors in GitHub Actions

**Symptoms**: Workflow fails with "Upload failed (401)"

**Cause**: `CI_UPLOAD_SIGNING_KEY` doesn't match between Vercel and GitHub

**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Find and copy exact value of `CI_UPLOAD_SIGNING_KEY`
3. Go to GitHub → Settings → Secrets → Actions
4. Edit `CI_UPLOAD_SIGNING_KEY` secret
5. Paste the EXACT value from Vercel (verify character-by-character)
6. Save
7. Re-run the workflow

This is the #1 setup failure - ensure values match exactly.

---

#### Can't Sign In / OAuth Fails

**Symptoms**: Clicking "Sign in with Google" shows error

**Cause**: OAuth redirect URI mismatch

**Fix**:
1. Check your exact dashboard URL (copy from browser)
2. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. APIs & Services → Credentials → Click your OAuth 2.0 Client ID
4. Verify **Authorized redirect URIs** contains:
   - `https://YOUR-EXACT-URL/api/auth/callback/google`
5. Must match exactly (no trailing slash, correct protocol https://)
6. Save if you made changes
7. Wait 1-2 minutes for changes to propagate
8. Try signing in again

---

#### No AI Insights Showing

**Symptoms**: AI Insights panel is empty or shows error

**Cause**: Missing or invalid `ANTHROPIC_API_KEY`

**Fix**:
1. Verify key in Vercel:
   - Settings → Environment Variables
   - Find `ANTHROPIC_API_KEY`
   - Verify it starts with `sk-ant-api03-`
2. Test the key:
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: YOUR_KEY" \
     -H "anthropic-version: 2023-06-01"
   ```
3. If key is invalid:
   - Go to https://console.anthropic.com/settings/keys
   - Create new API key
   - Update in Vercel
   - Redeploy
4. Check billing:
   - Ensure payment method is added
   - Verify account is active

---

#### No Competitor Data

**Symptoms**: Competitor Analysis section is empty

**Cause**: Missing DataForSEO credentials or insufficient balance

**Fix**:
1. Verify credentials in Vercel:
   - Settings → Environment Variables
   - Check `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`
2. Test credentials:
   - Go to https://dataforseo.com/
   - Try logging in with same credentials
3. Check account balance:
   - Sign in to DataForSEO dashboard
   - View balance (must be >$0)
   - Top up if needed
4. If still not working:
   - Check browser console for errors
   - Verify GitHub Actions ran with competitor analysis enabled

---

#### No Google Analytics Data

**Symptoms**: Traffic metrics don't show

**Cause**: Service account doesn't have access to Analytics property

**Fix**:
1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** → **Property Access Management**
3. Verify service account email is listed:
   - Format: `lighthouse-analytics@PROJECT.iam.gserviceaccount.com`
   - Find in `GOOGLE_SERVICE_ACCOUNT_JSON` → `client_email` field
4. If not listed:
   - Click **+** → **Add users**
   - Email: Service account email
   - Role: **Viewer**
   - Save
5. Wait 5 minutes for access to propagate
6. Refresh dashboard

---

### Runtime Issues

#### Scans Timing Out

**Symptoms**: GitHub Actions workflow fails with timeout

**Cause**: Too many pages in your sitemap

**Fix**:
1. Edit configuration files:
   - `unlighthouse-mobile.config.ts`
   - `unlighthouse-desktop.config.ts`
2. Reduce `scanner.maxRoutes` from 50 to 20:
   ```typescript
   scanner: {
     maxRoutes: 20,  // Reduced from 50
   }
   ```
3. Commit and push changes
4. Next scan will only audit 20 pages
5. Gradually increase if scans complete successfully

---

#### High API Costs

**Symptoms**: Unexpectedly high bills from Anthropic or DataForSEO

**Fix**:
1. Check usage:
   - Anthropic: https://console.anthropic.com/settings/usage
   - DataForSEO: https://dataforseo.com/billing
2. Reduce scan frequency:
   - Edit `.github/workflows/unlighthouse.yml`
   - Change schedule from daily to weekly:
     ```yaml
     schedule:
       - cron: '0 2 * * 0'  # Weekly on Sunday
     ```
3. Reduce pages scanned (see "Scans Timing Out" above)
4. For AI insights:
   - Refresh manually instead of automatically
   - Use cheaper model (already using cheapest: Haiku)

---

## Maintenance

### Monthly Tasks

- **Review Anthropic API usage**: https://console.anthropic.com/settings/usage
  - Typical: $3-7/month for daily scans
  - Alert if >$10/month
- **Check DataForSEO balance**: https://dataforseo.com/billing
  - Top up if balance <$5
  - Typical usage: $10-20/month
- **Review AI insights**: Action quick wins and recommendations
- **Update competitor list**: Add/remove competitors as needed

### Quarterly Tasks

- **Update dependencies**:
  ```bash
  npm update
  git add package.json package-lock.json
  git commit -m "Update dependencies"
  git push
  ```
- **Review audit**: Check which pages are being scanned
  - Adjust sitemap if needed
  - Update `maxRoutes` if pages increased
- **Review access**: Audit who has access to dashboard
  - Remove ex-employees if `ALLOWED_EMAIL_DOMAIN` used
  - Rotate API keys if team member left

---

## Advanced Configuration

### Adjusting Scan Schedule

Edit `.github/workflows/unlighthouse.yml`:

```yaml
on:
  schedule:
    # Default: 2 AM UTC daily
    - cron: '0 2 * * *'

    # Other examples:
    # Every 6 hours: '0 */6 * * *'
    # Weekdays only: '0 2 * * 1-5'
    # Weekly on Monday: '0 2 * * 1'
    # Twice daily: '0 2,14 * * *'
```

### Email Domain Restriction

Restrict sign-in to your company domain:

1. Add to Vercel environment variables:
   ```
   ALLOWED_EMAIL_DOMAIN=yourcompany.com
   ```
2. Redeploy
3. Only `@yourcompany.com` emails can sign in

### Custom Branding

Customize dashboard appearance:

**Simple**:
```
APP_NAME=Your Company Performance Dashboard
SITE_DESCRIPTION=Performance monitoring for yourcompany.com
```

**Advanced**: See [docs/guides/branding.md](docs/guides/branding.md)

### Slack Notifications

Get notified of scans and regressions:

1. Create Slack webhook: https://api.slack.com/messaging/webhooks
2. Add to Vercel and GitHub:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```
3. Next scan will send notification

---

## Cost Optimization

### Reduce Anthropic Costs

- Already using cheapest model (Claude 3.5 Haiku)
- Reduce insight refresh frequency (refresh manually)
- Reduce scan frequency (weekly instead of daily)

### Reduce DataForSEO Costs

- Track fewer keywords
- Reduce competitor count
- Scan less frequently
- Use cached results when possible

### Stay in Free Tiers

All these services stay free with normal usage:
- **Vercel**: 100 GB bandwidth/month (sufficient)
- **Vercel KV**: 256 MB storage (sufficient)
- **Google Cloud**: OAuth and Analytics API calls
- **GitHub Actions**: 2,000 minutes/month (sufficient)

**Estimated total free tier headroom**: 10x typical usage

---

## Documentation

- [SETUP-CREDENTIALS.md](docs/SETUP-CREDENTIALS.md) - Track your setup progress
- [Google OAuth Setup](docs/guides/google-oauth.md) - Detailed OAuth guide
- [Google Analytics Setup](docs/guides/google-analytics.md) - Analytics + Search Console
- [DataForSEO Setup](docs/guides/dataforseo.md) - Competitor analysis
- [Vercel KV Setup](docs/guides/vercel-kv-setup.md) - Database configuration
- [Custom Domain Setup](docs/guides/custom-domain.md) - Subdomain configuration
- [GitHub Actions](docs/guides/github-actions.md) - CI/CD details
- [Branding Guide](docs/guides/branding.md) - Customize appearance

---

## Getting Help

- **Issues**: https://github.com/YOUR-USERNAME/lighthouse-public/issues
- **Discussions**: https://github.com/YOUR-USERNAME/lighthouse-public/discussions
- **Vercel Support**: https://vercel.com/support
- **Google Cloud Support**: https://console.cloud.google.com/support

---

## Architecture

- **Framework**: Next.js 15 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript 5 (strict mode)
- **Authentication**: NextAuth.js (Google OAuth)
- **Database**: Vercel KV (Upstash Redis)
- **Lighthouse**: Unlighthouse CLI
- **AI**: Anthropic Claude API
- **SEO APIs**: DataForSEO
- **Analytics**: Google Analytics 4 Data API
- **Styling**: Tailwind CSS v4
- **Hosting**: Vercel
- **CI/CD**: GitHub Actions

---

## License

Apache License 2.0 - See [LICENSE](LICENSE) for details.

---

**Ready to get started?** Begin with [Part 1: Create Accounts](#part-1-create-accounts-30-minutes) above.
