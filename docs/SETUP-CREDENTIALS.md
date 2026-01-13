# Setup Credentials Tracker

Use this document to track your progress through the setup process. Check off each item as you complete it.

**Estimated Total Time**: 2 hours
**Estimated Total Cost**: $50 one-time + ~$5/month

---

## Phase 1: Account Creation (~30 minutes)

Track which accounts you've created:

| Service | Account Created? | Login Email | Notes |
|---------|-----------------|-------------|-------|
| GitHub | ☐ | | For repository and CI/CD |
| Google Cloud | ☐ | | For OAuth + APIs |
| Anthropic | ☐ | | For AI insights (~$5/month) |
| DataForSEO | ☐ | | For competitor analysis ($50 minimum) |
| Vercel | ☐ | | For hosting (free) |
| Google Analytics 4 | ☐ | | For traffic metrics (free, may already have) |

**✅ Checkpoint**: All 6 accounts created

---

## Phase 2: Generate Secrets (~5 minutes)

**Run Command:**
```bash
# Mac/Linux
bash scripts/generate-secrets.sh

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File scripts/generate-secrets.ps1
```

**Generated Values:**

| Secret | Generated? | Value Saved? | Notes |
|--------|------------|--------------|-------|
| NEXTAUTH_SECRET | ☐ | ☐ | Base64, 32 bytes |
| CI_UPLOAD_SIGNING_KEY | ☐ | ☐ | Hex, 32 bytes (⚠️ Two-location) |

**⚠️ CRITICAL**: Save these values securely. You'll need them multiple times.

**✅ Checkpoint**: Both secrets generated and saved

---

## Phase 3: Configure Google Cloud (~20 minutes)

### OAuth 2.0 Credentials

**Guide**: [docs/guides/google-oauth.md](guides/google-oauth.md)

**Steps:**

- [ ] Create Google Cloud project
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Note: Will add redirect URI after Vercel deployment
- [ ] Copy Client ID to .env
- [ ] Copy Client Secret to .env

| Credential | Created? | Copied to .env? |
|------------|----------|-----------------|
| GOOGLE_CLIENT_ID | ☐ | ☐ |
| GOOGLE_CLIENT_SECRET | ☐ | ☐ |

### Google Analytics API

**Guide**: [docs/guides/google-analytics.md](guides/google-analytics.md)

**Steps:**

- [ ] Enable Google Analytics Data API
- [ ] Enable Google Search Console API
- [ ] Create service account
- [ ] Download service account JSON key
- [ ] Grant service account access to Analytics property
- [ ] Copy Property ID to .env
- [ ] Copy full JSON to .env (as GOOGLE_SERVICE_ACCOUNT_JSON)

| Credential | Created? | Copied to .env? |
|------------|----------|-----------------|
| GOOGLE_ANALYTICS_PROPERTY_ID | ☐ | ☐ |
| GOOGLE_SERVICE_ACCOUNT_JSON | ☐ | ☐ |

**✅ Checkpoint**: Google Cloud fully configured

---

## Phase 4: Get API Keys (~10 minutes)

### Anthropic API Key

**Guide**: Create account at https://console.anthropic.com/

**Steps:**

- [ ] Create Anthropic account
- [ ] Add payment method
- [ ] Generate API key (Settings → API Keys → Create Key)
- [ ] Copy to .env

| Key | Created? | Copied to .env? | Cost |
|-----|----------|-----------------|------|
| ANTHROPIC_API_KEY | ☐ | ☐ | ~$5/month |

### DataForSEO Credentials

**Guide**: [docs/guides/dataforseo.md](guides/dataforseo.md)

**Steps:**

- [ ] Create DataForSEO account
- [ ] Add $50 credit (minimum deposit)
- [ ] Get API credentials (Dashboard → API Access)
- [ ] Copy login to .env
- [ ] Copy password to .env

| Credential | Created? | Copied to .env? | Cost |
|------------|----------|-----------------|------|
| DATAFORSEO_LOGIN | ☐ | ☐ | $50 one-time |
| DATAFORSEO_PASSWORD | ☐ | ☐ | (lasts months) |

**✅ Checkpoint**: All API keys obtained

---

## Phase 5: Complete .env File (~5 minutes)

**Steps:**

```bash
# Copy template
cp .env.example .env

# Edit with your values
# Use your preferred editor
```

**All Required Variables:**

| Variable | Set in .env? | Source | Notes |
|----------|-------------|--------|-------|
| TARGET_BASE_URL | ☐ | Your website | e.g., https://example.com |
| TARGET_DOMAIN | ☐ | Your website | e.g., example.com |
| DASHBOARD_URL | ☐ | (Fill after Vercel deploy) | |
| NEXTAUTH_URL | ☐ | (Same as DASHBOARD_URL) | |
| NEXTAUTH_SECRET | ☐ | Phase 2 (generated) | |
| CI_UPLOAD_SIGNING_KEY | ☐ | Phase 2 (generated) | ⚠️ Two-location |
| GOOGLE_CLIENT_ID | ☐ | Phase 3 (OAuth) | |
| GOOGLE_CLIENT_SECRET | ☐ | Phase 3 (OAuth) | |
| GOOGLE_ANALYTICS_PROPERTY_ID | ☐ | Phase 3 (Analytics) | |
| GOOGLE_SERVICE_ACCOUNT_JSON | ☐ | Phase 3 (Service Account) | |
| ANTHROPIC_API_KEY | ☐ | Phase 4 | |
| DATAFORSEO_LOGIN | ☐ | Phase 4 | |
| DATAFORSEO_PASSWORD | ☐ | Phase 4 | |

**Validation:**

```bash
node scripts/validate-setup.mjs
```

**Expected output**: `✅ VALIDATION PASSED`

**✅ Checkpoint**: All variables set in .env and validated

---

## Phase 6: Deploy to Vercel (~20 minutes)

**Guide**: [docs/guides/vercel-kv-setup.md](guides/vercel-kv-setup.md)

### Initial Deployment

- [ ] Go to https://vercel.com/new
- [ ] Import forked repository
- [ ] Click Deploy (will fail - expected)
- [ ] Copy Vercel URL: `https://your-project-abc123.vercel.app`
- [ ] Update DASHBOARD_URL and NEXTAUTH_URL in .env

**Your Vercel URL**: `____________________________________`

### Add Vercel KV Storage

- [ ] In Vercel project, click Storage tab
- [ ] Create Database → KV → Upstash for Redis
- [ ] Database name: `lighthouse-kv`
- [ ] Choose region (closest to users)
- [ ] Link to project
- [ ] Verify KV_REST_API_URL and KV_REST_API_TOKEN auto-added

### Upload Environment Variables to Vercel

**All variables from .env must be added to Vercel:**

| Variable | Added to Vercel? | Environment | Notes |
|----------|------------------|-------------|-------|
| TARGET_BASE_URL | ☐ | All | |
| TARGET_DOMAIN | ☐ | All | |
| DASHBOARD_URL | ☐ | All | Your Vercel URL |
| NEXTAUTH_URL | ☐ | All | Same as DASHBOARD_URL |
| NEXTAUTH_SECRET | ☐ | All | |
| CI_UPLOAD_SIGNING_KEY | ☐ | All | ⚠️ MUST match GitHub |
| GOOGLE_CLIENT_ID | ☐ | All | |
| GOOGLE_CLIENT_SECRET | ☐ | All | |
| GOOGLE_ANALYTICS_PROPERTY_ID | ☐ | All | |
| GOOGLE_SERVICE_ACCOUNT_JSON | ☐ | All | |
| ANTHROPIC_API_KEY | ☐ | All | |
| DATAFORSEO_LOGIN | ☐ | All | |
| DATAFORSEO_PASSWORD | ☐ | All | |

**After adding all variables:**

- [ ] Go to Deployments
- [ ] Click "..." → Redeploy
- [ ] Wait for successful deployment

**✅ Checkpoint**: Dashboard deployed with all env vars

---

## Phase 7: Update Google OAuth Redirect URI (~5 minutes)

Now that you have your Vercel URL:

- [ ] Go to Google Cloud Console → APIs & Services → Credentials
- [ ] Click your OAuth 2.0 Client ID
- [ ] Authorized redirect URIs → Add URI
- [ ] Enter: `https://YOUR-VERCEL-URL/api/auth/callback/google`
- [ ] Save

**Redirect URI added**: `____________________________________`

**✅ Checkpoint**: OAuth redirect URI configured

---

## Phase 8: Configure GitHub Actions (~15 minutes)

**⚠️ CRITICAL TWO-LOCATION CHECK**

These variables MUST be IDENTICAL in both Vercel and GitHub:
- CI_UPLOAD_SIGNING_KEY
- TARGET_BASE_URL

### Add GitHub Secrets

**Go to**: Repository → Settings → Secrets and variables → Actions

| Secret Name | Added to GitHub? | Value Source | ⚠️ Match Vercel? |
|-------------|------------------|--------------|------------------|
| CI_UPLOAD_SIGNING_KEY | ☐ | From .env | ✅ MUST MATCH |
| TARGET_BASE_URL | ☐ | From .env | ✅ MUST MATCH |
| DASHBOARD_URL | ☐ | From .env | N/A |

**Verification Steps:**

1. Copy CI_UPLOAD_SIGNING_KEY from Vercel env vars
2. Paste into GitHub Secrets
3. Verify character-by-character match
4. Repeat for TARGET_BASE_URL

- [ ] CI_UPLOAD_SIGNING_KEY matches exactly
- [ ] TARGET_BASE_URL matches exactly

**✅ Checkpoint**: GitHub Secrets configured correctly

---

## Phase 9: (Optional) Custom Domain (~15 minutes)

**Guide**: [docs/guides/custom-domain.md](guides/custom-domain.md)

If you want `lighthouse.example.com` instead of `random-name.vercel.app`:

- [ ] Add domain in Vercel (Settings → Domains)
- [ ] Configure DNS CNAME record at registrar
- [ ] Wait for DNS propagation (5-10 min)
- [ ] Update OAuth redirect URI with custom domain
- [ ] Update DASHBOARD_URL and NEXTAUTH_URL in Vercel
- [ ] Update DASHBOARD_URL in GitHub Secrets
- [ ] Redeploy

**Custom domain**: `____________________________________`

**✅ Checkpoint**: Custom domain configured (optional)

---

## Phase 10: Verify Setup (~15 minutes)

### Run First Scan

- [ ] Go to GitHub repository → Actions tab
- [ ] Click "Lighthouse Scan" workflow
- [ ] Run workflow → Enable competitor analysis → Run
- [ ] Wait 5-10 minutes for completion
- [ ] Check for errors in workflow logs

### Verify Dashboard

- [ ] Visit your DASHBOARD_URL
- [ ] Sign in with Google
- [ ] Verify performance scores appear (mobile + desktop)
- [ ] Verify AI insights panel displays
- [ ] Verify competitor analysis data appears
- [ ] Verify Google Analytics metrics display
- [ ] Check historical trend charts

**All Features Working:**

| Feature | Working? | Notes |
|---------|----------|-------|
| Performance scores | ☐ | Mobile + desktop |
| AI insights | ☐ | Claude-generated recommendations |
| Competitor analysis | ☐ | SERP tracking |
| Google Analytics | ☐ | Traffic metrics |
| Historical trends | ☐ | Charts and graphs |

**✅ Checkpoint**: All features verified working

---

## Setup Complete! 🎉

**Final Checklist:**

- [ ] All accounts created
- [ ] All secrets generated
- [ ] All environment variables set (Vercel)
- [ ] GitHub Secrets configured (two-location check passed)
- [ ] First scan completed successfully
- [ ] Dashboard displays all features
- [ ] OAuth sign-in works
- [ ] AI insights generating
- [ ] Competitor data populating
- [ ] Analytics data showing

**What Happens Next:**

- GitHub Actions runs daily at 2 AM UTC
- Results automatically upload to dashboard
- AI insights refresh on demand
- Competitor data updates with each scan
- Historical data retained for 60 days

**Maintenance:**

- Review Anthropic usage monthly: https://console.anthropic.com/settings/usage
- Check DataForSEO balance monthly: https://dataforseo.com/billing
- Review and act on AI quick wins regularly

---

## Troubleshooting

If something isn't working, check:

1. **401 Errors in CI**: CI_UPLOAD_SIGNING_KEY doesn't match between Vercel and GitHub
2. **No AI Insights**: Verify ANTHROPIC_API_KEY in Vercel env vars
3. **No Competitor Data**: Verify DATAFORSEO credentials and account balance
4. **No Analytics**: Verify service account has access to Analytics property
5. **Can't Sign In**: Verify OAuth redirect URI matches DASHBOARD_URL exactly

See [README.md](../README.md#troubleshooting) for detailed troubleshooting steps.
