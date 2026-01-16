# Lighthouse SEO Dashboard

A comprehensive performance monitoring and SEO analytics platform with AI-powered insights, competitor intelligence, and Google Analytics integration.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

**Estimated Setup Time**: 2 hours

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

### Quick Reference

| What You Need | For | Cost | Time |
|--------------|-----|------|------|
| GitHub account | Host code, run scans | Free | 5 min |
| Vercel account | Deploy dashboard | Free | 3 min |
| Google Cloud project | OAuth sign-in | Free | 10 min |
| Node.js 18+ | Run setup scripts | Free | 5 min |
| Your website (with sitemap) | Scanning target | - | - |
| **Anthropic account** | **AI insights** | **~$5/mo** | **5 min** |
| **DataForSEO account** | **Competitor tracking** | **$50 deposit** | **10 min** |
| Google Analytics 4 | Traffic metrics | Free | 5 min |

**Bold items** = Required for Core Features (what makes this dashboard valuable)

**Total setup time**: ~2 hours | **First month cost**: ~$55 | **Ongoing**: ~$5/month

---

## Clean-Room Setup (Beginner Friendly)

Use this path when you want a fresh, zero‑context setup from a clean clone. It focuses on the required integrations and the exact order of actions so you can validate and deploy without guessing. Follow the full step‑by‑step guide in [`docs/clean-room.md`](docs/clean-room.md:1).

**Clean‑room phases (short checklist):**
- [ ] Clone + install dependencies → verify local run
- [ ] Fill `.env` with all required values → run validation
- [ ] Deploy to Vercel + add KV → set env vars + redeploy
- [ ] Configure GitHub Actions secrets → run first scan → confirm data

**Required environment variables (complete setup):**

**Local/Vercel runtime**
`TARGET_BASE_URL`, `TARGET_DOMAIN`, `DASHBOARD_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `ANTHROPIC_API_KEY`, `AI_MODEL`, `DATAFORSEO_LOGIN`, `DATAFORSEO_PASSWORD`, `DATAFORSEO_LOCATION_CODE`, `DATAFORSEO_LANGUAGE_CODE`, `GOOGLE_ANALYTICS_PROPERTY_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON`

**GitHub Actions secrets**
`CI_UPLOAD_SIGNING_KEY`, `TARGET_BASE_URL`, `DASHBOARD_URL`, and `SITEMAP_URL` only if your sitemap is not at `/sitemap.xml`.

**Important**: CI uploads use `CI_UPLOAD_SIGNING_KEY` (signing key auth only). There is no legacy bearer‑token mode.

### What You'll Configure

During setup, you'll create and add these to your `.env` file:

| Credential | From | Format Example |
|-----------|------|----------------|
| `NEXTAUTH_SECRET` | Generated locally | `abc123xyz...` (32+ chars) |
| `CI_UPLOAD_SIGNING_KEY` | Generated locally | `def456uvw...` (64 chars) |
| `GOOGLE_CLIENT_ID` | Google Cloud | `123456.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud | `GOCSPX-...` |
| `ANTHROPIC_API_KEY` | Anthropic Console | `sk-ant-api03-...` |
| `AI_MODEL` | Anthropic (model name) | Set to the required model in `.env.example` |
| `DATAFORSEO_LOGIN` | DataForSEO | Your email |
| `DATAFORSEO_PASSWORD` | DataForSEO | API password |
| `DATAFORSEO_LOCATION_CODE` | DataForSEO | Location code for SERP tracking |
| `DATAFORSEO_LANGUAGE_CODE` | DataForSEO | Language code for SERP tracking |
| `GOOGLE_ANALYTICS_PROPERTY_ID` | Google Analytics | `properties/123456789` |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Google Cloud | Service account JSON (single line) |

Keep your `.env` file open throughout setup - you'll add each credential as you create it.

---

### Required for Minimum Setup

You need these to deploy the dashboard at all:

- **GitHub account** - Host repository and run automated scans
- **Node.js 18+** - Run validation and setup scripts

<details>
<summary><strong>How to check if you have Node.js installed</strong></summary>

**What is Node.js?** Node.js runs JavaScript outside of a browser. This dashboard uses it for validation scripts that check your configuration before deployment.

**Check if you have it:**

1. Open your terminal/command prompt
2. Run: `node --version`

**✅ You have Node.js if**: You see a version number like `v18.17.0` or `v20.10.0` (v18 or higher required)

**❌ You don't have Node.js if**: You see "command not found" or "not recognized"

**If you need to install it:**

1. Go to [nodejs.org](https://nodejs.org)
2. Download the **LTS** version (recommended for most users)
3. Run the installer
4. Restart your terminal
5. Run `node --version` again to verify

**Why v18+?** This project uses modern JavaScript features that require Node.js 18 or later. Older versions will cause build errors.

</details>

- **Vercel account** - Deploy dashboard (free tier works)
- **Google account** - OAuth authentication for sign-in
- **Your business website** - Must have a public sitemap for scanning

<details>
<summary><strong>How to verify your website has a sitemap</strong></summary>

**What is a sitemap?** A sitemap is an XML file that lists all the pages on your website. The dashboard uses it to know which pages to scan.

**Check if you have one:**

1. Open your browser
2. Go to: `https://yoursite.com/sitemap.xml`
3. Replace `yoursite.com` with your actual domain

**✅ You have a sitemap if**: You see an XML file with URLs listed

**❌ You don't have a sitemap if**: You see a 404 error or blank page

**If you don't have a sitemap:**

Most website frameworks can generate one automatically:

- **Next.js**: Add [next-sitemap](https://www.npmjs.com/package/next-sitemap) package
- **WordPress**: Install Yoast SEO or Google XML Sitemaps plugin
- **Shopify**: Automatically generated at `/sitemap.xml`
- **Static sites**: Use [sitemap-generator](https://www.npmjs.com/package/sitemap-generator-cli) CLI tool

**Alternative sitemap locations:**

Some sites use different paths. Try these if `/sitemap.xml` doesn't work:

- `https://yoursite.com/sitemap_index.xml`
- `https://yoursite.com/sitemap/sitemap.xml`
- `https://yoursite.com/page-sitemap.xml`

</details>

### Required for Core Features

**Why "Required"?** Without these, you'll only have basic Lighthouse scores (available free in Chrome DevTools). These integrations provide the dashboard's actual value: AI insights, competitor tracking, and traffic analytics.

- **Google Analytics 4** - Traffic metrics and user behavior data (free)
- **Google Search Console** - Search performance and SEO insights (free)
- **Anthropic account** - AI-powered SEO insights and recommendations (~$5/month)
- **DataForSEO account** - Competitor analysis and SERP tracking ($50 minimum deposit, lasts 2-6 months)

### Optional Enhancements

Nice-to-have features that improve workflow:

- **Slack webhook** - Automated notifications for performance regressions (free)
- **Custom domain** - Professional URL like `lighthouse.yourcompany.com`

### Time & Technical Requirements

- **2 hours of focused time** to complete setup
- Basic familiarity with terminal/command line
- Admin access to create accounts and API keys
- Credit card for Anthropic and DataForSEO (if using)

**No coding required** - just follow the step-by-step instructions.

<details>
<summary><strong>Account Security Best Practices</strong></summary>

### Email Not Arriving?

For any service (Google, GitHub, Anthropic, DataForSEO):

1. **Check spam/junk folder** - verification emails often get filtered
2. **Wait 5-10 minutes** - email delivery can be delayed
3. **Check email address** - ensure you typed it correctly during signup
4. **Resend verification** - look for "Resend verification email" button
5. **Try different email** - if all else fails, create account with different email address

### Password Best Practices

- **Use a password manager** (1Password, LastPass, Bitwarden) to generate and store strong passwords
- **Don't reuse passwords** - each service should have unique password
- **Minimum 12 characters** - mix uppercase, lowercase, numbers, symbols
- **Enable 2FA** (two-factor authentication) where available for extra security

### Account Security

After creating accounts:

1. **Enable two-factor authentication** (2FA) on GitHub, Google, and Vercel
2. **Save recovery codes** in secure location (password manager or encrypted file)
3. **Use strong, unique passwords** for each service
4. **Monitor account activity** - review login history periodically
5. **Set up billing alerts** - avoid surprise charges (especially for Anthropic and DataForSEO)

</details>

---

## Complete Guide Index

**Required for Basic Deployment** (covered in this README):
- Google OAuth (sign-in functionality)
- Vercel deployment and KV database
- GitHub Actions CI setup

**Required for Core Features** (what makes this dashboard valuable):

- [Anthropic Claude Guide](docs/anthropic.md) - AI-powered SEO insights (~$5/month)
- [DataForSEO Guide](docs/dataforseo.md) - Competitor analysis ($50 minimum deposit)
- [Google Analytics Guide](docs/google-analytics.md) - Traffic metrics and Search Console data

**Optional Integrations** (enhance workflow):

- Slack Notifications - Automated alerts for regressions

**Additional Guides**:
- [GitHub Actions Setup](docs/github-actions.md) - Detailed CI/CD configuration
- [Custom Domain](docs/custom-domain.md) - Professional URL setup
- [Branding Customization](docs/branding.md) - Personalize your dashboard

---

## Complete Setup Guide

Follow these steps in order.

### Part 1: Create Accounts [Steps 1-7] ⏱️ 30 minutes

Create accounts for all required services before configuring anything.

> **⚠️ CRITICAL: CI_UPLOAD_SIGNING_KEY Must Match Exactly**
>
> The `CI_UPLOAD_SIGNING_KEY` secret **must be identical** in two places:
>
> 1. **Vercel Environment Variables** (Step 14)
> 2. **GitHub Repository Secrets** (Step 17)
>
> This is the #1 cause of setup failures. When you generate this key in Step 3, save it somewhere safe. Copy-paste the exact same value to both locations - do not regenerate or retype it.

#### Step 1: Fork and Clone Repository

**Estimated time**: 5 minutes

**Why needed**: Host your repository and run automated scans via GitHub Actions

<details>
<summary><strong>Don't have a GitHub account? Click here for step-by-step instructions</strong></summary>

A GitHub account is required for:
- Forking the Lighthouse repository
- Running GitHub Actions (automated scans)
- Storing your code

**Estimated Time**: 5 minutes

### Instructions

1. Go to [github.com/signup](https://github.com/signup)

2. **Enter your email address**:
   - Use a personal or work email (not Gmail required)
   - Click **Continue**

3. **Create a password**:
   - At least 15 characters, or 8+ characters with a number and lowercase letter
   - Click **Continue**

4. **Choose a username**:
   - Must be unique across all of GitHub
   - Can contain letters, numbers, and hyphens
   - Example: `john-smith-dev`, `yourcompany-lighthouse`
   - Click **Continue**

5. **Email preferences**:
   - Choose whether to receive product updates and announcements
   - Type `y` (yes) or `n` (no)
   - Click **Continue**

6. **Verify your account**:
   - Solve the puzzle/CAPTCHA to prove you're human
   - Click **Create account**

7. **Verify your email**:
   - Check your email inbox
   - Find the email from GitHub
   - Click the verification link or enter the code
   - You'll be redirected back to GitHub

8. **Personalization questions** (optional):
   - Skip these by clicking **Skip personalization** at the bottom
   - Or answer them to get personalized recommendations

9. **Choose a plan**:
   - Select **Free** (includes unlimited public/private repos and GitHub Actions)
   - Click **Continue for free**

10. **You now have a GitHub account!**

</details>

**Fork this repository**:
1. Go to https://github.com/YOUR-USERNAME/lighthouse-public (this repo)
2. Click **Fork** button (top right)
3. This creates your own copy at `github.com/YOUR-USERNAME/lighthouse-public`

**Clone to your computer**:
1. Open terminal/command prompt
2. Navigate to where you want the project:
   ```bash
   cd ~/projects  # or your preferred location
   ```
3. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/lighthouse-public.git
   cd lighthouse-public
   ```

**Checklist**:

- [ ] Forked repository on GitHub
- [ ] Cloned to local machine
- [ ] Opened project in terminal

✅ **Checkpoint**: Repository forked and cloned locally

---

#### Step 2: Create Your .env File

**Estimated time**: 2 minutes

**Why now?** You'll be generating credentials in the next steps. Having your `.env` file ready means you can add each credential immediately after generating it.

**Actions**:

1. Make sure you're in the project directory:
   ```bash
   cd lighthouse-public
   ```

2. Copy the example file:
   ```bash
   cp .env.example .env
   ```

3. Open `.env` in your code editor (keep it open throughout setup):
   ```bash
   # Mac
   open .env

   # Or use your preferred editor:
   code .env      # VSCode
   nano .env      # Terminal editor
   vim .env       # Vim
   ```

4. **Verify** `.env` is gitignored:
   ```bash
   cat .gitignore | grep "\.env$"
   ```
   You should see: `.env`

**⚠️ Security**: Never commit your `.env` file. It contains secrets and is automatically excluded by `.gitignore`.

**Checklist**:

- [ ] Copied `.env.example` to `.env`
- [ ] Opened `.env` file in code editor
- [ ] Verified `.env` is in `.gitignore`

✅ **Checkpoint**: `.env` file created and open in editor

---

#### Step 3: Google Cloud Account

**Estimated time**: 5 minutes

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

**Checklist**:

- [ ] Signed in to Google Cloud Console
- [ ] Accepted Terms of Service
- [ ] Created new project named "Lighthouse Dashboard"
- [ ] Project creation completed successfully

**✅ Verify Success**:

- Go to [console.cloud.google.com](https://console.cloud.google.com)
- You should see your project name ("Lighthouse Dashboard") at the top of the screen
- If you see "Select a project" dropdown, click it and confirm your project is listed
- If you don't see your project, wait 30 seconds and refresh the page

**❌ If verification fails**:

- Check that you completed the project creation (don't close the dialog early)
- Try logging out and back in to Google Cloud Console
- Clear browser cache and try again

✅ **Checkpoint**: Google Cloud project created

> **⚠️ CRITICAL: Save All Credentials Immediately**
>
> API keys are often shown only once. If you close the window without saving, you'll need to regenerate the key.
>
> **Action**: Have your `.env` file open. Add each key immediately after generating it.

---

#### Step 4: Anthropic Account (Required for AI Features - ~$5/month)

**Why needed**: AI-powered SEO insights, content suggestions, and actionable recommendations

**Cost**: ~$5/month for daily scans (pay-as-you-go, no minimum)

**Why is this required for core features?** The Anthropic Claude API powers the AI Insights panel - arguably the most valuable feature of this dashboard. Without it, you'll only see raw Lighthouse scores (which you can get from Chrome DevTools for free). With it, you get:

- Executive summaries explaining what your scores mean
- Prioritized action items with step-by-step implementation
- Content suggestions with detailed outlines
- Schema markup recommendations with ready-to-use JSON-LD
- Copy improvements with before/after comparisons

**Detailed guide**: [docs/anthropic.md](docs/anthropic.md)

<details>
<summary><strong>Don't have an Anthropic account? Click here for step-by-step instructions</strong></summary>

An Anthropic account is required for:
- AI-powered SEO insights
- Content suggestions
- Competitor analysis (AI summaries)

**Estimated Time**: 5 minutes

**Cost**: Pay-as-you-go (~$5-15/month for typical usage)

### Instructions

1. Go to [console.anthropic.com](https://console.anthropic.com)

2. Click **Sign Up** (top right)

3. **Sign up with Google** (recommended):
   - Click **Continue with Google**
   - Select your Google account
   - Allow Anthropic to access basic profile info
   - **This is the easiest method** - uses your Google account

**Alternative**: Sign up with email and password

4. **Verify your email** (if using email signup):
   - Check your inbox for verification email
   - Click the verification link
   - You'll be redirected back to Anthropic Console

5. **Add payment method** (required for API access):
   - Click **Billing** in left sidebar
   - Click **Add payment method**
   - Enter credit card details:
     - Card number
     - Expiration date
     - CVC
     - Billing ZIP code
   - Click **Add card**

6. **Set up budget alerts** (recommended):
   - Stay in **Billing** section
   - Scroll to **Budget alerts**
   - Click **Create alert**
   - Set threshold: `$20.00` (warns you before overspending)
   - Enter your email for notifications
   - Click **Save**

7. **Generate API key**:
   - Click **API Keys** in left sidebar
   - Click **Create Key**
   - Name: `Lighthouse Dashboard` (descriptive name)
   - Click **Create Key**
   - **Copy the key immediately** - you won't see it again
   - Save it to a text file (you'll add it to `.env` file later)

8. **You now have an Anthropic account with API access!**

**Important**: Keep your API key secure. Never commit it to version control or share it publicly.

</details>

**Quick steps** (if you already know how):
1. Go to https://console.anthropic.com/
2. Click **Sign Up**
3. Enter your email and create password
4. Verify email
5. Sign in to console
6. Click **API Keys** → **Create Key**
7. Name: "Lighthouse Dashboard"
8. Copy the API key: `sk-ant-api03-...`

**⚠️ CRITICAL**: Save this key immediately - it's only shown once!

**Add payment method**:
1. Click **Billing** in settings
2. Add credit/debit card
3. No charges until you use the API

**Add to .env immediately**:

```bash
ANTHROPIC_API_KEY=sk-ant-________________________
AI_MODEL=<required-model-from-.env.example>
```

Save the file (Ctrl+S / Cmd+S).

**Checklist**:

- [ ] Created Anthropic account
- [ ] Verified email address
- [ ] Added payment method
- [ ] Created API key named "Lighthouse Dashboard"
- [ ] Copied API key to `.env` file
- [ ] Saved `.env` file

✅ **Checkpoint**: Anthropic API key obtained and added to .env

---

#### Step 5: DataForSEO Account (Required - $50 deposit)

**Why needed**: Competitor analysis and SERP tracking

**Cost**: $50 minimum deposit (lasts 2-6 months)

**Why DataForSEO?** DataForSEO was chosen for this dashboard because:

- **Pay-as-you-go pricing**: No monthly subscription required (alternatives like SEMrush, Ahrefs, Moz cost $99+/month)
- **Reliable API uptime**: Enterprise-grade infrastructure with 99.9% uptime
- **Comprehensive SERP tracking**: Monitor rankings across 100+ countries and languages
- **Developer-friendly**: Easy REST API integration with detailed documentation
- **Cost-effective**: $50 deposit typically lasts 2-6 months for daily monitoring

**Are there alternatives?** Yes (SEMrush, Ahrefs, Moz), but they require expensive monthly subscriptions. DataForSEO's pay-per-use model keeps costs low for individual developers and small teams.

**Detailed guide**: [docs/dataforseo.md](docs/dataforseo.md)

**Quick steps**:
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

**Add to .env immediately**:

```bash
DATAFORSEO_LOGIN=your-email@example.com
DATAFORSEO_PASSWORD=________________________
DATAFORSEO_LOCATION_CODE=<required-location-code>
DATAFORSEO_LANGUAGE_CODE=<required-language-code>
```

Save the file (Ctrl+S / Cmd+S).

**Usage estimate**: $50 lasts ~3-6 months for typical daily scans (depends on number of keywords tracked)

**Checklist**:

- [ ] Created DataForSEO account
- [ ] Verified email address
- [ ] Added $50 credit to account
- [ ] Found API credentials in Dashboard → API Access
- [ ] Copied API Login to `.env` file
- [ ] Copied API Password to `.env` file
- [ ] Saved `.env` file

✅ **Checkpoint**: DataForSEO account created and credentials added to .env

---

#### Step 6: Vercel Account

**Why needed**: Host the dashboard

**Cost**: Free

<details>
<summary><strong>Need help creating a Vercel account? Click here for step-by-step instructions</strong></summary>

A Vercel account is required for:
- Deploying your dashboard
- Hosting the web application
- Vercel KV (data storage)

**Estimated Time**: 3 minutes

### Instructions

1. Go to [vercel.com/signup](https://vercel.com/signup)

2. **Sign up with GitHub** (recommended):
   - Click **Continue with GitHub**
   - Authorize Vercel to access your GitHub account
   - Click **Authorize Vercel**
   - **This is the easiest method** - your GitHub account becomes your Vercel login

**Alternative**: Sign up with GitLab, Bitbucket, or Email

3. **Choose your account type**:
   - **Hobby**: Free tier (recommended for personal use)
   - **Pro**: $20/month (for production/commercial use)
   - Select **Hobby** → Click **Continue**

4. **Complete your profile**:
   - Enter your name
   - Optionally add profile photo
   - Click **Continue**

5. **You now have a Vercel account!**

**Note**: Vercel Hobby plan includes:
- Unlimited projects
- 100 GB bandwidth/month
- 100 build execution hours/month
- Vercel KV (Redis) with 256 MB storage
- Custom domains (bring your own domain)

</details>

**Quick steps** (if you already know how):
1. Go to https://vercel.com/signup
2. Click **Continue with GitHub** (recommended)
3. Authorize Vercel to access your GitHub account
4. Confirm email if prompted

That's it! Vercel account is ready.

**Checklist**:

- [ ] Created Vercel account
- [ ] Connected to GitHub account
- [ ] Confirmed email address

✅ **Checkpoint**: Vercel account created

---

#### Step 7: Verify Google Analytics Setup

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

**Guide**: See [docs/google-analytics.md](docs/google-analytics.md) for detailed setup

**Checklist**:

- [ ] Verified Google Analytics 4 setup
- [ ] Noted Property ID
- [ ] Completed detailed setup from guide

✅ **Checkpoint**: All 7 accounts created

---

**✅ Part 1 Complete**: All accounts created

**What you've done**: Created accounts for GitHub, Vercel, Google Cloud, Anthropic, and DataForSEO

**What's next**: Part 2 configures these accounts and generates your credentials

**Time remaining**: ~75 minutes

---

### Part 2: Configure Services [Steps 8-12] ⏱️ 45 minutes

Now configure the services you created.

#### Step 8: Configure Target Site

Add your website's information to `.env`.

**Open your `.env` file** (you created this in Step 2) and add:

```bash
# Target Site
TARGET_BASE_URL=https://your-website.com
TARGET_DOMAIN=your-website.com
SITEMAP_URL=https://your-website.com/sitemap.xml
```

Replace with your actual website URL.

Save the file (Ctrl+S / Cmd+S).

**Checklist**:

- [ ] Added `TARGET_BASE_URL` to `.env`
- [ ] Added `TARGET_DOMAIN` to `.env`
- [ ] Added `SITEMAP_URL` to `.env` (required if your sitemap is not at `/sitemap.xml`)
- [ ] Saved `.env` file

✅ **Checkpoint**: Target site configured in .env

---

#### Step 9: Generate Secrets

**Estimated time**: 3 minutes

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

**Add to .env immediately**:

```bash
NEXTAUTH_SECRET=<paste from output above>
CI_UPLOAD_SIGNING_KEY=<paste from output above>
```

Save the file (Ctrl+S / Cmd+S).

**⚠️ CRITICAL - Understanding CI_UPLOAD_SIGNING_KEY**

This key acts like a shared password between GitHub Actions (which runs scans) and your Vercel dashboard (which displays results).

**How it works:**

1. GitHub Actions completes a Lighthouse scan
2. It tries to upload results to your dashboard
3. Your dashboard asks: "Do you have the secret password?"
4. GitHub Actions responds with the signing key
5. If the keys match → Upload succeeds ✅
6. If the keys don't match → Upload rejected (401 error) ❌

**Why it must be IDENTICAL in TWO places:**

- **Vercel** (your dashboard): Checks incoming uploads
- **GitHub** (your CI): Signs outgoing uploads

If they don't match, GitHub Actions will run successfully, but your dashboard won't receive any data. You'll see "No data available" even though scans are completing.

**If they don't match:**

- ❌ GitHub Actions will run successfully
- ❌ But your dashboard won't receive any data
- ❌ You'll see "No data available" even though scans are running
- ❌ Hard to debug because both systems think they're working correctly

**Action Required:**

Copy this key to a temporary notepad/text file. You'll paste it into:

1. Vercel environment variables (Step 14)
2. GitHub repository secrets (Step 16)

Triple-check they're identical - even one wrong character breaks everything.

**⚠️ This is the #1 cause of CI upload failures.**

**Checklist**:

- [ ] Ran secrets generation script
- [ ] Added `NEXTAUTH_SECRET` to `.env`
- [ ] Added `CI_UPLOAD_SIGNING_KEY` to `.env`
- [ ] Saved `CI_UPLOAD_SIGNING_KEY` to temporary notepad
- [ ] Saved `.env` file

**✅ Verify Success**:

1. Open your `.env` file
2. You should see both secrets with values (not empty):

   ```text
   NEXTAUTH_SECRET=abc123xyz...  (32+ characters)
   CI_UPLOAD_SIGNING_KEY=def456uvw...  (64 characters)
   ```

3. Check that `CI_UPLOAD_SIGNING_KEY` is also saved in a temporary notepad

**❌ If verification fails**:

- **Script didn't run**: Make sure you're in the `lighthouse-public` directory
- **Permission denied**: Try running with `sudo` (Mac/Linux) or as Administrator (Windows)
- **Values are empty**: Re-run the script and copy the output immediately
- **Script not found**: Verify the `scripts/` folder exists with `generate-secrets.sh` inside

✅ **Checkpoint**: Secrets generated and added to .env

---

#### Step 10: Set Up Google OAuth

**Estimated time**: 10 minutes

**Why needed**: Allow users to sign in to the dashboard

**Detailed guide**: [docs/google-oauth.md](docs/google-oauth.md)

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

**Add to .env immediately**:

```bash
GOOGLE_CLIENT_ID=____________.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-____________
```

Save the file (Ctrl+S / Cmd+S).

**⏰ Timing Note - Two-Step Process**:

You'll come back to update the OAuth redirect URI in Step 15 (after Vercel deployment). This is a normal two-step process:

1. **NOW (Step 10)**: Create OAuth credentials with redirect URIs left blank
2. **LATER (Step 15)**: Update with actual Vercel URL

**Why the delay?** You can't add the real redirect URL yet because you don't have a Vercel URL until Step 13. Don't worry - this is expected and normal.

**Checklist**:

- [ ] Configured OAuth consent screen
- [ ] Created OAuth 2.0 Client ID
- [ ] Copied `GOOGLE_CLIENT_ID` to `.env`
- [ ] Copied `GOOGLE_CLIENT_SECRET` to `.env`
- [ ] Saved `.env` file
- [ ] Left redirect URIs blank (will add later in Step 15)

**✅ Verify Success**:

1. Go back to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. You should see your OAuth 2.0 Client ID listed
3. Click on it
4. Confirm:
   - Client ID ends with `.apps.googleusercontent.com`
   - Client Secret starts with `GOCSPX-`
   - Authorized redirect URIs is empty or has placeholder (that's OK for now)

**❌ If verification fails**:

- Make sure you selected "Web application" as application type
- If you don't see the credentials, try refreshing the page
- If Client Secret is not visible, you can click "Show" to reveal it

✅ **Checkpoint**: OAuth credentials created and added to .env

---

#### Step 11: Set Up Google Analytics + Search Console (Required)

**Why needed**: Fetch traffic metrics and search performance data

**Cost**: Free

**Detailed guide**: [docs/google-analytics.md](docs/google-analytics.md)

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

5. Grant access to Analytics:
   - Go to [Google Analytics](https://analytics.google.com/)
   - Click **Admin** → **Property Access Management**
   - Click **+** → **Add users**
   - Email: `lighthouse-analytics@YOUR-PROJECT.iam.gserviceaccount.com` (from JSON file, `client_email` field)
   - Role: **Viewer**
   - Click **Add**

**Add to .env immediately**:

```bash
GOOGLE_ANALYTICS_PROPERTY_ID=properties/123456789
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

Paste the entire JSON content on one line for `GOOGLE_SERVICE_ACCOUNT_JSON`.

Save the file (Ctrl+S / Cmd+S).

**Checklist**:

- [ ] Enabled Google Analytics Data API
- [ ] Enabled Google Search Console API
- [ ] Created service account
- [ ] Generated JSON key file
- [ ] Granted service account access to Analytics property
- [ ] Added `GOOGLE_ANALYTICS_PROPERTY_ID` to `.env`
- [ ] Added `GOOGLE_SERVICE_ACCOUNT_JSON` to `.env`
- [ ] Saved `.env` file

✅ **Checkpoint**: Analytics API configured and credentials added to .env

---

#### Step 12: Validate Your Configuration

**You've created your `.env` file in Step 2** and added credentials in Steps 4-11. Now validate that all required variables are set correctly.

**Run the validation script**:

```bash
npm install
npm run setup:validate
```

**Expected output**:
```
✅ VALIDATION PASSED
   All required variables are set correctly:
   - TARGET_BASE_URL ✓
   - NEXTAUTH_SECRET ✓ (32+ characters)
   - GOOGLE_CLIENT_ID ✓
   - CI_UPLOAD_SIGNING_KEY ✓
   ...
```

**If validation fails**:
- Review error messages carefully
- Go back to the relevant step and check the variable
- Ensure no extra spaces or quotes around values
- Make sure you saved the `.env` file
- Re-run validation

**Checklist**:

- [ ] Ran `npm install`
- [ ] Ran `npm run setup:validate`
- [ ] Validation passed with no errors
- [ ] All required variables confirmed present

**✅ Verify Success**:

You should see output like this:

```text
✓ TARGET_BASE_URL is set
✓ TARGET_DOMAIN is set
✓ NEXTAUTH_SECRET is valid (32+ characters)
✓ CI_UPLOAD_SIGNING_KEY is set (64 characters)
✓ GOOGLE_CLIENT_ID is set
✓ GOOGLE_CLIENT_SECRET is set

All required variables validated successfully!
```

**✅ If you see this**: Continue to Step 13

**❌ If you see errors**:

1. Read the error message carefully - it will tell you which variable is missing or invalid
2. Open your `.env` file
3. Find the variable mentioned in the error
4. Check for:
   - Missing value (empty line)
   - Extra spaces before or after the value
   - Quotes around the value (remove them - values should not be quoted)
   - Wrong variable name (typo)
5. Fix the issue and run `npm run setup:validate` again
6. Repeat until all checks pass

✅ **Checkpoint**: All required credentials validated

---

### Troubleshooting: Account Setup

Before deploying, resolve any account creation issues:

#### Can't Find API Access Page in DataForSEO

**Problem**: Can't locate the API credentials section.

**Solution**:

1. Sign in to DataForSEO dashboard
2. Look for sidebar menu (left side)
3. Try these names:
   - "API"
   - "API Access"
   - "API Credentials"
   - "Credentials"
4. If still not found: Contact DataForSEO support (usually responds within 1 hour at [support@dataforseo.com](mailto:support@dataforseo.com))

#### Google Cloud Console Looks Different Than Screenshots

**Problem**: UI doesn't match the documentation.

**Solution**:

Google updates their UI frequently. Key landmarks to find:

- **Finding credentials**: Left sidebar → "APIs & Services" → "Credentials"
- **Creating OAuth client**: Click blue "+ CREATE CREDENTIALS" button at top
- **Finding project**: Top bar near Google Cloud logo → Click project name dropdown

If completely lost: Use Google Cloud Console search box (top bar) and search for "OAuth"

#### Lost My Anthropic API Key

**Problem**: Closed the window after creating the key.

**Solution**:

If you closed the window after creating the key:

1. Go to [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys)
2. You'll see your key name but the key value is hidden
3. You must create a NEW key (click "Create Key")
4. Copy the new key immediately
5. Update `.env` file with new key
6. Old key is automatically invalidated

**Prevention**: Always copy API keys immediately and save them in your `.env` file or a secure password manager.

#### Account Verification Email Not Arriving

**Problem**: Didn't receive verification email for Anthropic, DataForSEO, or Google.

**Solution**:

1. Check spam/junk folder (most common issue)
2. Wait 5-10 minutes (emails can be delayed)
3. Check that you typed email correctly during signup
4. Try "Resend verification email" button if available
5. If still not working: Create account with different email address

#### Can't Install Node.js or Git Commands Don't Work

**Problem**: `npm` command not found or `git` command not found.

**Solution**:

- **Mac**: Install [Homebrew](https://brew.sh), then run `brew install node git`
- **Windows**: Download installers:
  - Node.js: <https://nodejs.org> (LTS version)
  - Git: <https://git-scm.com/download/win>
- **Linux**: `sudo apt install nodejs npm git` (Ubuntu/Debian) or `sudo yum install nodejs git` (CentOS/RHEL)

After installing, restart your terminal and try again.

#### `.env` File Not Found or Variables Not Loading

**Problem**: Validation script says variables are missing.

**Solution**:

1. Verify file is named exactly `.env` (not `.env.txt` or `env`)
2. Confirm file is in project root directory (`lighthouse-public/`)
3. Run `ls -la` (Mac/Linux) or `dir /a` (Windows) to see hidden files
4. If using Windows Notepad, save as "All Files" type, not "Text Documents"
5. Make sure you ran `cp .env.example .env` in the correct directory

---

**✅ Part 2 Complete**: All credentials configured

**What you've done**: Generated secrets, configured OAuth, set up API access

**What's next**: Part 3 deploys to Vercel and connects everything

**Time remaining**: ~30 minutes

---

### Pre-Deployment Checklist

Before continuing, verify these critical items:

**Required credentials (must have all)**:

- [ ] `TARGET_BASE_URL` - Your website URL
- [ ] `TARGET_DOMAIN` - Your domain (no https://)
- [ ] `NEXTAUTH_SECRET` - Generated secret (32+ chars)
- [ ] `CI_UPLOAD_SIGNING_KEY` - Generated key (64 chars) ← **Save this separately - you'll need it twice**
- [ ] `GOOGLE_CLIENT_ID` - From Google Cloud
- [ ] `GOOGLE_CLIENT_SECRET` - From Google Cloud
- [ ] `ANTHROPIC_API_KEY` - For AI insights
- [ ] `AI_MODEL` - Anthropic model name
- [ ] `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD` - Competitor tracking credentials
- [ ] `DATAFORSEO_LOCATION_CODE` - Location code for SERP tracking
- [ ] `DATAFORSEO_LANGUAGE_CODE` - Language code for SERP tracking
- [ ] `GOOGLE_ANALYTICS_PROPERTY_ID` - Format: `properties/123456789`
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON` - Full JSON on single line

**Sitemap note**:

- [ ] If your sitemap is not at `/sitemap.xml`, set `SITEMAP_URL` in `.env` and in GitHub Secrets

Run `npm run setup:validate` to verify all required variables are set correctly.

---

### Part 3: Deploy to Vercel [Steps 13-16] ⏱️ 30 minutes

Deploy your dashboard to Vercel.

#### Step 13: Deploy to Vercel

**Estimated time**: 10 minutes

This step has three parts that must happen in order:

##### Part A: Initial Deployment

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

##### Part B: Add Vercel KV Storage

After deployment (even if it failed), add KV database:

**Detailed guide**: [docs/vercel-kv-setup.md](docs/vercel-kv-setup.md)

**Quick steps**:

1. In your Vercel project dashboard, click **Storage** tab
2. Click **Create Database**
3. Select **KV** (Upstash for Redis)
4. Database name: **lighthouse-kv**
5. Region: Choose closest to your users (e.g., `US East` for US)
6. Click **Create**
7. Select your project to link
8. Click **Connect**

##### Part C: Verify Environment Variables

After KV is linked:

1. Go to **Settings** → **Environment Variables**
2. Confirm `KV_REST_API_URL` and `KV_REST_API_TOKEN` were auto-added

**Checklist**:

- [ ] Imported repository to Vercel
- [ ] Started initial deployment
- [ ] Copied Vercel URL
- [ ] Updated `DASHBOARD_URL` and `NEXTAUTH_URL` in `.env`
- [ ] Created KV database
- [ ] Linked KV to project
- [ ] Verified KV environment variables added

**✅ Verify Success**:

1. Go to your Vercel project dashboard
2. Click **Storage** tab - you should see "lighthouse-kv" listed
3. Click **Settings** → **Environment Variables**
4. You should see these auto-populated:
   - `KV_REST_API_URL` - starts with `https://`
   - `KV_REST_API_TOKEN` - long string of characters
5. Your Vercel URL should look like: `https://your-project-abc123.vercel.app`

**❌ If verification fails**:

- **KV not showing**: Wait 30 seconds and refresh, or try creating again
- **KV variables missing**: Disconnect and reconnect KV to your project
- **Deployment still running**: Wait for it to complete (green checkmark)
- **Can't find Vercel URL**: Check the Deployments tab, click on the latest deployment

✅ **Checkpoint**: Vercel deployment complete and KV database linked

---

#### Step 14: Upload Environment Variables to Vercel

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
| `AI_MODEL` | From .env | Anthropic model name |
| `DATAFORSEO_LOGIN` | From .env | Competitor analysis |
| `DATAFORSEO_PASSWORD` | From .env | Competitor analysis |
| `DATAFORSEO_LOCATION_CODE` | From .env | Competitor analysis location |
| `DATAFORSEO_LANGUAGE_CODE` | From .env | Competitor analysis language |

3. For each variable:
   - Name: Exact variable name
   - Value: Paste from .env
   - Environment: **All** (Production, Preview, Development)
   - Click **Save**

**Optional variables** (add if you want these features):
- `APP_NAME` - Custom dashboard name
- `SITE_DESCRIPTION` - Your site description for AI context
- `SLACK_WEBHOOK_URL` - Slack notifications
- `SITEMAP_URL` - Only if your sitemap is not at `/sitemap.xml`

> **⚠️ CRITICAL: Copy from Vercel, Not Your Notes**
>
> When adding `CI_UPLOAD_SIGNING_KEY` to GitHub (Step 16), copy it directly from Vercel Environment Variables - not from your notes or `.env` file. This ensures exact character-by-character match.

**After adding all variables**:
1. Go to **Deployments** tab
2. Click **⋮** on latest deployment
3. Click **Redeploy**
4. Wait for successful deployment (~2 minutes)

**Checklist**:

- [ ] Added all required environment variables to Vercel
- [ ] Added optional variables (if using those features)
- [ ] Verified all values match `.env` file
- [ ] Confirmed `CI_UPLOAD_SIGNING_KEY` matches exactly
- [ ] Triggered redeploy
- [ ] Deployment succeeded (green checkmark)

**✅ Verify Success**:

1. Go to **Deployments** tab in your Vercel project
2. Latest deployment should show a green checkmark (not red X)
3. Click on the deployment URL
4. You should see the sign-in page (OAuth won't work yet - that's Step 15)
5. Check the browser console (F12) - no red errors about missing environment variables

**❌ If verification fails**:

- **Red X on deployment**: Click on it to see the error log
  - Missing variable: Add it in Settings → Environment Variables
  - Build error: Check the build log for specific issues
- **Page shows 500 error**: Redeploy after adding all variables
- **Blank page**: Check browser console for errors

✅ **Checkpoint**: All environment variables in Vercel, successful deployment

---

#### Step 15: Update Google OAuth Redirect URI

**⏰ Returning from Step 10**: Remember when you left the redirect URI blank? Now that you have your Vercel URL from Step 13, it's time to add it.

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, click **Add URI**
5. Enter: `https://your-project-abc123.vercel.app/api/auth/callback/google`
   - Replace with your actual Vercel URL
   - **Important**: No trailing slash
   - Must be exact URL from Step 13
6. Click **Save**

**Checklist**:

- [ ] Found OAuth 2.0 Client ID in Google Cloud Console
- [ ] Added redirect URI with correct Vercel URL
- [ ] Verified URL format (no trailing slash, HTTPS)
- [ ] Saved changes

**✅ Verify Success**:

1. Visit your dashboard URL: `https://your-project-abc123.vercel.app`
2. Click **Sign in with Google**
3. You should see Google's consent screen asking for permission
4. Sign in with your Google account
5. You should be redirected to the dashboard

**❌ If verification fails**:

- **"Error 400: redirect_uri_mismatch"**: The redirect URI doesn't match exactly
  1. Copy your Vercel URL from the browser address bar
  2. Go back to Google Cloud Console → Credentials
  3. Check the redirect URI is exactly: `https://YOUR-VERCEL-URL/api/auth/callback/google`
  4. No trailing slash, no http:// (must be https://)
  5. Save and wait 1-2 minutes for changes to propagate

- **Page shows "Try signing in with a different account"**:
  - If you set `ALLOWED_EMAIL_DOMAIN`, make sure you're signing in with that domain
  - Or remove the restriction by deleting the environment variable

✅ **Checkpoint**: OAuth redirect URI configured

---

#### Step 16: Configure GitHub Actions

**⚠️ CRITICAL: Two-Location Check**

These variables MUST be IDENTICAL in both Vercel and GitHub:
- `CI_UPLOAD_SIGNING_KEY`
- `TARGET_BASE_URL`

If they don't match exactly, you'll get 401 Unauthorized errors (the #1 setup failure).

**Detailed guide**: [docs/github-actions.md](docs/github-actions.md)

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
| `SITEMAP_URL` | Full sitemap URL (if not at `/sitemap.xml`) | No (only if needed) |

**How to ensure exact match**:
1. Open Vercel → Settings → Environment Variables
2. Find `CI_UPLOAD_SIGNING_KEY`
3. Click to reveal value
4. Select all and copy
5. Paste into GitHub Secret
6. Verify character-by-character
7. Repeat for `TARGET_BASE_URL`

**Checklist**:

- [ ] Added `CI_UPLOAD_SIGNING_KEY` secret to GitHub
- [ ] Added `TARGET_BASE_URL` secret to GitHub
- [ ] Added `DASHBOARD_URL` secret to GitHub
- [ ] Verified `CI_UPLOAD_SIGNING_KEY` matches Vercel exactly
- [ ] Verified `TARGET_BASE_URL` matches Vercel exactly

**✅ Verify Success**:

1. Go to GitHub → Settings → Secrets and variables → Actions
2. You should see 3 repository secrets listed:
   - `CI_UPLOAD_SIGNING_KEY`
   - `TARGET_BASE_URL`
   - `DASHBOARD_URL`
3. Values are hidden (showing as `***`) - this is expected

**❌ If verification fails**:

- **Can't find Settings**: Make sure you're the repository owner (not a collaborator)
- **Secrets not saving**: Try a different browser or clear cache
- **Key mismatch (causes 401 errors)**: Delete the secret and recreate by copying directly from Vercel

✅ **Checkpoint**: GitHub Secrets configured with matching values

---

**✅ Part 3 Complete**: Dashboard deployed

**What you've done**: Deployed to Vercel, added environment variables, configured GitHub Actions

**What's next**: Part 5 verifies everything works end-to-end

**Time remaining**: ~15 minutes

---

### Part 4: Custom Domain (Optional) ⏱️ 15 minutes

Want `lighthouse.yourcompany.com` instead of `random-name.vercel.app`?

**Detailed guide**: [docs/custom-domain.md](docs/custom-domain.md)

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

### Part 5: Verify Setup [Steps 17-18] ⏱️ 15 minutes

Verify everything works end-to-end.

#### Step 17: Run Your First Scan

**Estimated time**: 10 minutes (5 min setup + 5 min wait for scan)

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

**Checklist**:

- [ ] Enabled workflows in GitHub Actions
- [ ] Triggered "Lighthouse Scan" workflow
- [ ] Checked "Run competitor analysis" box
- [ ] Workflow completed successfully (green checkmark)
- [ ] Verified no errors in logs

**✅ Verify Success**:

1. Go to GitHub → Actions tab
2. Click on your "Lighthouse Scan" workflow run
3. You should see all jobs with green checkmarks:
   - `scan` job completed
   - "Upload to Dashboard" step shows success
4. Click on the job to expand logs
5. Look for: `✓ Upload successful` or `200 OK`

**❌ If verification fails**:

- **"401 Unauthorized" in upload step**: `CI_UPLOAD_SIGNING_KEY` doesn't match
  1. Go to Vercel → Settings → Environment Variables
  2. Copy the exact value of `CI_UPLOAD_SIGNING_KEY`
  3. Go to GitHub → Settings → Secrets → Delete and recreate the secret
  4. Paste the exact value (no extra spaces)
  5. Re-run the workflow

- **"Workflow not found"**: Enable workflows in Actions tab first

- **"Sitemap not found"**: Your target site doesn't have a sitemap at `/sitemap.xml`
  - Check `TARGET_BASE_URL` is correct
  - Verify sitemap exists at `https://yoursite.com/sitemap.xml`

✅ **Checkpoint**: First scan completed successfully

---

#### Step 18: Verify Dashboard Features

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

**Checklist**:

- [ ] Signed in to dashboard with Google account
- [ ] Verified performance scores display
- [ ] Verified AI Insights panel shows recommendations
- [ ] Verified Competitor Analysis section (if DataForSEO configured)
- [ ] Verified Google Analytics data (if configured)
- [ ] Verified historical trends charts display

**✅ Verify Success**:

1. Dashboard loads with performance scores at the top
2. AI Insights panel shows recommendations (click "Refresh Insights" if empty)
3. Each score card shows mobile and desktop values
4. Charts display (may be empty until more scans run)

**❌ If verification fails**:

- **"No data available"**: The scan hasn't completed or upload failed
  - Wait for GitHub Action to complete
  - Check GitHub Actions logs for errors
  - Re-run the workflow if needed

- **AI Insights not showing**: Check `ANTHROPIC_API_KEY` in Vercel
  - Verify the key is correct
  - Click "Refresh Insights" button

- **Competitor data missing**: Check DataForSEO credentials
  - Verify `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD` in Vercel
  - Ensure you have balance in your DataForSEO account

- **Analytics data missing**: Check Google Analytics setup
  - Verify `GOOGLE_ANALYTICS_PROPERTY_ID` format is `properties/123456789`
  - Verify `GOOGLE_SERVICE_ACCOUNT_JSON` is the complete JSON object

**Quick Troubleshooting Reference**:

| Problem | Most Likely Cause | Quick Fix |
|---------|------------------|-----------|
| Can't sign in | OAuth redirect URI mismatch | Step 15 - verify exact URL |
| No data showing | CI_UPLOAD_SIGNING_KEY mismatch | Step 16 - copy from Vercel |
| No AI insights | ANTHROPIC_API_KEY missing | Add key to Vercel, redeploy |
| No competitors | DataForSEO balance or credentials | Check account balance |
| No analytics | Service account access | Grant Viewer role in GA |

✅ **Checkpoint**: All features verified working

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

### Suggested Enhancements

Once your dashboard is running, consider these optional improvements:

| Enhancement | Benefit | Guide |
|-------------|---------|-------|
| **Add Slack notifications** | Get alerts when scans complete or scores drop | [Slack Setup](#slack-notifications) |
| **Configure custom domain** | Professional URL like `lighthouse.yourcompany.com` | [Custom Domain](docs/custom-domain.md) |
| **Customize branding** | Your logo and colors on the dashboard | [Branding Guide](docs/branding.md) |
| **Restrict access** | Limit sign-in to your company domain | [Email Domain Restriction](#email-domain-restriction) |
| **Adjust scan schedule** | Weekly scans instead of daily to reduce costs | [Adjusting Scan Schedule](#adjusting-scan-schedule) |
| **Add more competitors** | Track additional competitor domains | Dashboard → Competitors → Configure |

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

#### Vercel KV Not Working

**Symptoms**: Dashboard shows "No data available" even after scan completes

**Cause**: Vercel KV database not connected properly

**Fix**:

1. Go to Vercel → your project → **Storage** tab
2. Check if "lighthouse-kv" database is listed
3. If not listed:
   - Click **Create Database** → **KV**
   - Name: `lighthouse-kv`
   - Click **Create** → **Connect to Project**
4. If listed but not working:
   - Go to **Settings** → **Environment Variables**
   - Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` exist
   - If missing, disconnect and reconnect KV to your project
5. **Redeploy** after fixing (required for env var changes)

---

#### Invalid JSON in Environment Variable

**Symptoms**: Build fails with "JSON parse error" or "Unexpected token"

**Cause**: `GOOGLE_SERVICE_ACCOUNT_JSON` not properly formatted

**Fix**:

1. Open the JSON file you downloaded from Google Cloud
2. The entire content must be on a **single line** in Vercel
3. Remove all newlines:
   - Online: Use [jsonminifier.com](https://www.jsonminifier.com)
   - Mac/Linux: `cat keyfile.json | tr -d '\n'`
4. In Vercel Environment Variables:
   - Delete the current variable
   - Create new with minified JSON (no line breaks)
   - Value should start with `{"type":"service_account"`
   - Value should end with `}`
5. Redeploy

**Common mistakes**:

- ❌ Copying JSON with line breaks
- ❌ Wrapping value in extra quotes
- ❌ Missing opening or closing brace

---

#### Sitemap Not Found

**Symptoms**: GitHub Actions fails with "No URLs found" or "Sitemap not accessible"

**Cause**: Your target site doesn't have a sitemap at the expected location

**Fix**:

1. Verify sitemap exists:
   - Open browser: `https://yoursite.com/sitemap.xml`
   - Should show XML with URLs listed
2. If sitemap is at different location:
   - Edit `scripts/extract-urls.mjs`
   - Update sitemap path
3. If no sitemap exists:
   - **Next.js**: Add [next-sitemap](https://www.npmjs.com/package/next-sitemap) package
   - **WordPress**: Install Yoast SEO or XML Sitemaps plugin
   - **Static**: Use [sitemap-generator-cli](https://www.npmjs.com/package/sitemap-generator-cli)
4. Verify `TARGET_BASE_URL` in GitHub Secrets matches your actual domain

---

#### GitHub Actions Workflow Not Running

**Symptoms**: Workflow never triggers or shows "Disabled"

**Cause**: Workflows disabled or not enabled on fork

**Fix**:

1. Go to GitHub → your repository → **Actions** tab
2. If you see "Workflows aren't being run":
   - Click **I understand my workflows, go ahead and enable them**
3. If workflow is listed but disabled:
   - Click on the workflow name
   - Click **Enable workflow** (right side)
4. To run manually:
   - Click **Run workflow** dropdown
   - Select **main** branch
   - Click green **Run workflow** button
5. Check workflow file exists:
   - `.github/workflows/unlighthouse.yml` should be present
   - If missing, you may need to re-fork the repository

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
2. Reduce `scanner.maxRoutes` from 100 to 20:
   ```typescript
   scanner: {
      maxRoutes: 20,  // Reduced from 100
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

**Advanced**: See [docs/branding.md](docs/branding.md)

### Slack Notifications

Get automated alerts when scans complete, scores drop, or thresholds are breached.

**Quick Setup** (if you're familiar with Slack webhooks):

1. Create a Slack app with Incoming Webhook at [api.slack.com/apps](https://api.slack.com/apps)
2. Add `SLACK_WEBHOOK_URL` to GitHub repository secrets
3. Next scan will send notifications to your chosen channel

**Detailed Guide**: For step-by-step instructions including Slack account setup and troubleshooting, see [Slack Notifications Setup](docs/slack.md).

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

### Core Setup Guides

- [Google OAuth Setup](docs/google-oauth.md) - Authentication configuration
- [Google Analytics Setup](docs/google-analytics.md) - Analytics + Search Console
- [DataForSEO Setup](docs/dataforseo.md) - Competitor analysis
- [Vercel KV Setup](docs/vercel-kv-setup.md) - Database configuration
- [GitHub Actions](docs/github-actions.md) - Automated scanning CI/CD

### Optional Feature Guides

- [Slack Notifications](docs/slack.md) - Automated alerts to Slack
- [Custom Domain Setup](docs/custom-domain.md) - Subdomain configuration
- [Branding Guide](docs/branding.md) - Customize appearance

### Additional CI/CD Options

The [GitHub Actions guide](docs/github-actions.md) also covers:

- Manual scan triggers from dashboard (GITHUB_TOKEN)
- Auto-redeploy after scans (VERCEL_DEPLOY_HOOK)
- Custom scan schedules

---

## Glossary

<details>
<summary><strong>Click to expand common terms and acronyms</strong></summary>

| Term | Meaning |
|------|---------|
| **API** | Application Programming Interface - a way for programs to talk to each other. API keys are passwords that let your dashboard access services. |
| **CI/CD** | Continuous Integration/Continuous Deployment - automatic processes that run tests and deploy code. GitHub Actions is the CI/CD system used here. |
| **CLI** | Command Line Interface - a text-based way to interact with your computer (Terminal on Mac, Command Prompt/PowerShell on Windows). |
| **CNAME** | Canonical Name - a DNS record type that points your subdomain to another domain (like Vercel's servers). |
| **DNS** | Domain Name System - the internet's phone book that translates domain names (like example.com) to IP addresses. |
| **Environment Variable** | A setting stored outside your code (like API keys). Keeps secrets secure and lets you change settings without modifying code. |
| **Fork** | A copy of a GitHub repository under your own account. You can modify a fork without affecting the original. |
| **GitHub Actions** | GitHub's automation system. Runs workflows (like daily scans) automatically based on schedules or events. |
| **HMAC** | Hash-based Message Authentication Code - a security method that verifies requests are authentic using a shared secret key. |
| **JWT** | JSON Web Token - a secure way to represent user identity. Used for keeping you logged in to the dashboard. |
| **KV** | Key-Value store - a simple database where data is stored with a unique key (like a dictionary). Vercel KV stores your scan results. |
| **Lighthouse** | Google's open-source tool for measuring web page performance, accessibility, SEO, and best practices. |
| **NextAuth** | A library that handles authentication (sign-in) for Next.js applications. |
| **Next.js** | A React framework for building web applications. This dashboard is built with Next.js. |
| **OAuth** | Open Authorization - a secure way to sign in using another account (like "Sign in with Google") without sharing your password. |
| **Redis** | A fast in-memory database. Vercel KV uses Redis (via Upstash) to store your dashboard data. |
| **Repository (Repo)** | A project's folder and version history stored on GitHub. Contains all code, configuration, and history. |
| **SERP** | Search Engine Results Page - the page you see after searching on Google. DataForSEO tracks your position in SERPs. |
| **Service Account** | A special Google account for programs (not humans) to access Google APIs like Analytics. |
| **Sitemap** | An XML file listing all pages on your website. Helps search engines (and this dashboard) discover your content. |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security - encryption that makes websites secure (the "https://" and padlock icon). |
| **TTL** | Time To Live - how long data is cached before it expires and needs refreshing. |
| **Upstash** | The company that provides Redis databases for Vercel KV. Your data is stored on their servers. |
| **Webhook** | A way for apps to send real-time notifications. Slack webhooks let this dashboard send messages to your Slack channel. |
| **Workflow** | A GitHub Actions configuration file that defines automated tasks (like running scans). |

</details>

---

## If You Need to Start Over

<details>
<summary><strong>Click to expand cleanup instructions</strong></summary>

If you encounter issues and want to start fresh, follow these steps to clean up:

### Delete Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project
3. Go to **Settings** → **General**
4. Scroll to bottom → **Delete Project**
5. Type the project name to confirm
6. Click **Delete**

### Delete GitHub Fork

1. Go to your forked repository on GitHub
2. Click **Settings** (repository settings, not account)
3. Scroll to bottom → **Danger Zone**
4. Click **Delete this repository**
5. Type the repository name to confirm
6. Click **I understand, delete this repository**

### Delete Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project from the dropdown
3. Go to **IAM & Admin** → **Settings**
4. Click **Shut Down** or **Delete Project**
5. Enter the project ID to confirm
6. Click **Shut Down**

**Note**: Google Cloud projects are recoverable for 30 days after deletion.

### Delete Vercel KV Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Storage** tab
3. Select your KV database
4. Click **Settings** → **Delete Database**
5. Confirm deletion

### After Cleanup

1. Wait 5 minutes for deletions to propagate
2. Start fresh from [Part 1](#part-1-create-accounts-steps-1-7-️-30-minutes)
3. Use new project names to avoid conflicts

**Tip**: If only one component is broken, you usually don't need to delete everything. Check the Troubleshooting section first.

</details>

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

**Ready to get started?** Begin with [Part 1: Create Accounts](#part-1-create-accounts-steps-1-7-️-30-minutes) above.
