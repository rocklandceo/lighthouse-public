# Setup Progress Tracker

**Purpose**: Track your progress through the [main setup guide](../README.md). Each section below corresponds to a step in the README.

**How to Use**:
1. Keep this file open alongside the README
2. Check off items as you complete them
3. Use the .env tracking to verify credentials are added
4. Reference the troubleshooting tips if you get stuck

---

## Prerequisites Checklist

- [ ] GitHub account created
- [ ] Node.js 18+ installed (run: `node --version`)
- [ ] Vercel account created
- [ ] Google account available

---

## Part 1: Repository Setup

### Step 1: Fork and Clone Repository

- [ ] Forked repository on GitHub
- [ ] Cloned to local machine: `git clone https://github.com/YOUR-USERNAME/lighthouse-public.git`
- [ ] Opened project in code editor

### Step 2: Create .env File ⚠️ CRITICAL

- [ ] Navigated to project: `cd lighthouse-public`
- [ ] Ran: `cp .env.example .env`
- [ ] Confirmed `.env` file exists
- [ ] Opened `.env` in editor (KEEP OPEN)
- [ ] Verified gitignore: `cat .gitignore | grep "\.env$"`

**Why This Matters**: You'll add credentials to this file in every remaining step.

---

## Part 2: Account Creation (30 minutes)

### Step 3: Google Cloud Account

- [ ] Went to console.cloud.google.com
- [ ] Signed in with Google account
- [ ] Accepted Terms of Service
- [ ] Created new project: "Lighthouse Dashboard"
- [ ] Project creation completed

### Step 4: Anthropic Account (Optional - $5/month)

**Skip if not using AI insights**

- [ ] Account created at console.anthropic.com
- [ ] Email verified
- [ ] API key generated
- [ ] Payment method added
- [ ] **Added to .env**:
  ```bash
  ANTHROPIC_API_KEY=sk-ant-________________________
  ```

**Cost**: ~$5/month for daily AI insights

### Step 5: DataForSEO Account (Optional - $50 deposit)

**Skip if not using competitor analysis**

- [ ] Account created at dataforseo.com
- [ ] Email verified
- [ ] $50 minimum deposit added
- [ ] API credentials retrieved (Login + Password)
- [ ] **Added to .env**:
  ```bash
  DATAFORSEO_LOGIN=your-email@example.com
  DATAFORSEO_PASSWORD=________________________
  ```

**Cost**: $50 one-time (lasts 2-6 months)

### Step 6: Vercel Account

- [ ] Account created at vercel.com/signup
- [ ] Connected with GitHub (recommended)
- [ ] Email verified

---

## Part 3: Configure Services (45 minutes)

### Step 7: Configure Target Site

- [ ] Determined target website URL
- [ ] **Added to .env**:
  ```bash
  TARGET_BASE_URL=https://your-site.com
  TARGET_DOMAIN=your-site.com
  ```

### Step 8: Generate Secrets

- [ ] Ran secret generation script:
  - Mac/Linux: `bash scripts/generate-secrets.sh`
  - Windows: `powershell -ExecutionPolicy Bypass -File scripts/generate-secrets.ps1`
- [ ] **Added to .env**:
  ```bash
  NEXTAUTH_SECRET=________________________
  CI_UPLOAD_SIGNING_KEY=________________________
  ```
- [ ] **Saved CI_UPLOAD_SIGNING_KEY separately** (Notepad/TextEdit) for later use

**CRITICAL**: You'll need this EXACT value for:
1. Vercel environment variables (Step 12)
2. GitHub repository secrets (Step 15)

**Common Mistake**: Keys don't match between locations → CI uploads fail

### Step 9: Set Up Google OAuth

**Refer to**: [google-oauth.md](./guides/google-oauth.md)

- [ ] Went to Google Cloud Console → APIs & Services → Credentials
- [ ] Selected "Lighthouse Dashboard" project
- [ ] Created OAuth 2.0 Client ID
- [ ] Configured consent screen (if prompted)
- [ ] Set application type: Web application
- [ ] Left redirect URIs blank for now
- [ ] Copied Client ID and Client Secret
- [ ] **Added to .env**:
  ```bash
  GOOGLE_CLIENT_ID=____________.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=GOCSPX-____________
  ```

**Note**: You'll update redirect URI after deployment (Step 14)

### Step 10: Set Up Google Analytics + Search Console (Optional)

**Refer to**: [google-analytics.md](./guides/google-analytics.md)

**Skip if not tracking analytics**

- [ ] Enabled Google Analytics Data API
- [ ] Enabled Google Search Console API
- [ ] Created service account: "Lighthouse Analytics"
- [ ] Generated JSON key and downloaded
- [ ] Granted service account access to Analytics property
- [ ] **Added to .env**:
  ```bash
  GOOGLE_ANALYTICS_PROPERTY_ID=properties/123456789
  GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
  ```

**Note**: Paste entire JSON on one line

### Step 11: Validate Configuration

- [ ] Ran: `npm install`
- [ ] Ran: `npm run setup:validate`
- [ ] ✅ All required variables validated
- [ ] ✅ No errors reported

**If you see errors**: Return to the step that generated that credential and verify it's in your `.env` file.

---

## Part 4: Deployment

### Step 12: Deploy to Vercel

- [ ] Went to vercel.com/new
- [ ] Imported Git repository
- [ ] Found forked repo: `YOUR-USERNAME/lighthouse-public`
- [ ] Clicked Import
- [ ] Added Vercel KV database (Storage → Create Database → KV)
- [ ] Connected KV to project
- [ ] Added environment variables to Vercel:
  - [ ] `TARGET_BASE_URL`
  - [ ] `TARGET_DOMAIN`
  - [ ] `DASHBOARD_URL` (your Vercel URL)
  - [ ] `NEXTAUTH_URL` (same as DASHBOARD_URL)
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `CI_UPLOAD_SIGNING_KEY` ⚠️ (must match Step 8)
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] Optional: `ANTHROPIC_API_KEY`
  - [ ] Optional: `GOOGLE_ANALYTICS_PROPERTY_ID`
  - [ ] Optional: `GOOGLE_SERVICE_ACCOUNT_JSON`
  - [ ] Optional: `DATAFORSEO_LOGIN`
  - [ ] Optional: `DATAFORSEO_PASSWORD`
- [ ] Clicked Deploy
- [ ] Deployment succeeded
- [ ] Noted Vercel URL: `https://____________.vercel.app`

### Step 13: Add KV Environment Variables to .env

After creating Vercel KV, add to local `.env`:

- [ ] **Added to .env**:
  ```bash
  KV_REST_API_URL=<from Vercel KV settings>
  KV_REST_API_TOKEN=<from Vercel KV settings>
  ```

### Step 14: Update Google OAuth Redirect URI

- [ ] Returned to Google Cloud Console
- [ ] Went to APIs & Services → Credentials
- [ ] Clicked on OAuth 2.0 Client ID
- [ ] Added redirect URI: `https://your-vercel-url.vercel.app/api/auth/callback/google`
- [ ] Saved changes
- [ ] Waited 2 minutes for propagation

### Step 15: Configure GitHub Actions

- [ ] Went to GitHub repository → Settings → Secrets and variables → Actions
- [ ] Added repository secrets:
  - [ ] `CI_UPLOAD_SIGNING_KEY` ⚠️ (must match Step 8 and Vercel)
  - [ ] `TARGET_BASE_URL`
  - [ ] `DASHBOARD_URL`
  - [ ] Optional: `SLACK_WEBHOOK_URL`
  - [ ] Optional: `VERCEL_DEPLOY_HOOK`
- [ ] Went to Actions tab
- [ ] Selected "Unlighthouse CI" workflow
- [ ] Clicked "Run workflow"
- [ ] Selected branch: main
- [ ] Clicked "Run workflow"
- [ ] ✅ Workflow completed successfully

**Two-Location Verification**:

| Location | Value Matches |
|----------|---------------|
| Vercel `CI_UPLOAD_SIGNING_KEY` | ☐ |
| GitHub `CI_UPLOAD_SIGNING_KEY` | ☐ |

**Verify**: Both checkboxes above should be checked and values should match exactly.

---

## Complete .env Checklist

Use this to verify all credentials are in your `.env` file:

**Required (Minimum Viable Deployment)**:
- [ ] `TARGET_BASE_URL`
- [ ] `TARGET_DOMAIN`
- [ ] `DASHBOARD_URL`
- [ ] `NEXTAUTH_URL`
- [ ] `NEXTAUTH_SECRET`
- [ ] `CI_UPLOAD_SIGNING_KEY`
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `KV_REST_API_URL`
- [ ] `KV_REST_API_TOKEN`

**Optional (Enhanced Features)**:
- [ ] `ANTHROPIC_API_KEY`
- [ ] `GOOGLE_ANALYTICS_PROPERTY_ID`
- [ ] `GOOGLE_SERVICE_ACCOUNT_JSON`
- [ ] `DATAFORSEO_LOGIN`
- [ ] `DATAFORSEO_PASSWORD`
- [ ] `SLACK_WEBHOOK_URL`

---

## Troubleshooting Quick Reference

### .env File Issues
- **Can't find .env**: Make sure you ran `cp .env.example .env` in Step 2
- **Variables not loading**: Check file is named `.env` (not `.env.txt`)
- **Validation failing**: Open `.env` and verify no extra spaces or quotes

### Two-Location Mismatch
- **CI uploads failing**: Compare `CI_UPLOAD_SIGNING_KEY` in Vercel vs GitHub
- **How to fix**: Copy key from `.env` file → paste to both locations

### OAuth Issues
- **redirect_uri_mismatch**: Verify redirect URI in Google Cloud Console matches Vercel URL exactly
- **Still broken**: Wait 2-3 minutes after updating redirect URI

### Deployment Failures
- **Vercel build fails**: Check environment variables are set in Vercel dashboard
- **KV connection errors**: Verify KV database is linked to project

### GitHub Actions Failures
- **401 Upload Error**: Check `CI_UPLOAD_SIGNING_KEY` matches in Vercel and GitHub
- **404 Dashboard URL**: Verify `DASHBOARD_URL` in GitHub Secrets matches your actual Vercel URL

---

## You're Done! 🎉

All steps completed. Your dashboard should be:
- ✅ Deployed and accessible at your Vercel URL
- ✅ Sign-in with Google working
- ✅ GitHub Actions running daily scans
- ✅ Data persisting in Vercel KV

**Next Steps**:
- Visit your dashboard and sign in
- Wait for first CI scan (runs daily at 2 AM UTC, or trigger manually)
- Configure competitors (if using DataForSEO)
- Set up custom domain (optional): [custom-domain.md](./guides/custom-domain.md)
