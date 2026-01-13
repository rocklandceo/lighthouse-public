# Lighthouse SEO Dashboard

Monitor your website's performance, accessibility, and SEO scores with automated daily scans and AI-powered recommendations.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-20%20passing-brightgreen.svg)](__tests__)

---

## Before You Begin

### Required Accounts

You'll need accounts with these services before deploying:

- **[GitHub](https://github.com)** (required) - Fork this repo and run GitHub Actions for automated scans
- **[Vercel](https://vercel.com)** (required) - Free hosting and KV storage
- **[Google Cloud](https://console.cloud.google.com)** (required) - OAuth authentication
- **[DataForSEO](https://dataforseo.com)** (required for full features) - Paid API service for competitor analysis

### Optional Integrations

- **[Anthropic](https://console.anthropic.com)** - AI-powered SEO insights ($5-10/month typical)
- **Google Analytics** - Traffic metrics integration
- **Google Search Console** - Keyword tracking
- **Slack** - Score drop notifications

> **Note**: Without DataForSEO, you won't have competitor analysis or content gap features. The dashboard will still work for Lighthouse performance monitoring. See [docs/guides/dataforseo.md](docs/guides/dataforseo.md) for setup instructions.

---

## Quick Start Guide

### Step 1: Fork and Rename This Repository

1. Click the **Fork** button at the top right of this page
2. This creates your own copy at `https://github.com/YOUR-USERNAME/lighthouse-public`
3. **Recommended**: Go to your fork's **Settings** → rename it to something unique (e.g., `my-seo-dashboard`)
   - This avoids name collisions and makes it clear it's your monitoring dashboard
   - The repo name can be anything you like

### Step 2: Deploy to Vercel

1. Click the **Deploy with Vercel** button at the top of this page
2. Sign in to Vercel (or create an account)
3. Select **Import Git Repository**
4. Find and import your forked repository (e.g., `YOUR-USERNAME/your-fork-name`)
5. Configure project settings:
   - **Project Name**: Use your repository name or customize
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (leave default)
6. Click **Deploy** (don't add environment variables yet)
7. The deployment will fail initially - this is expected (missing environment variables)

### Step 3: Add Vercel KV Storage

1. In your Vercel project dashboard, go to the **Storage** tab
2. Click **Create Database** → Select **KV**
3. Name it `lighthouse-kv` (or anything you prefer)
4. Click **Create**
5. Vercel automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your environment variables

### Step 4: Configure Google OAuth

**Create OAuth Credentials**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted (use "External" for personal use)
6. Choose **Web application** as application type
7. Add **Authorized JavaScript origins**:
   - `https://your-project-name.vercel.app` (your actual Vercel URL)
   - `http://localhost:3000` (for local development)
8. Add **Authorized redirect URIs**:
   - `https://your-project-name.vercel.app/api/auth/callback/google` (production)
   - `http://localhost:3000/api/auth/callback/google` (local development)
9. Click **Create** and copy your Client ID and Client Secret

See [docs/guides/google-oauth.md](docs/guides/google-oauth.md) for detailed instructions with screenshots.

**Add to Vercel**:

1. In your Vercel project, go to **Settings** → **Environment Variables**
2. Add these variables:

| Variable | Value | Where to Find It |
|----------|-------|------------------|
| `TARGET_BASE_URL` | `https://your-website.com` | The site you want to monitor |
| `DASHBOARD_URL` | `https://your-project.vercel.app` | Your Vercel deployment URL |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Same as DASHBOARD_URL |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | Run in terminal |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx...` | From Google Cloud Console |

3. Click **Save**

### Step 5: Redeploy

1. Go to **Deployments** tab in Vercel
2. Click **...** on the latest deployment → **Redeploy**
3. Your dashboard will now have all required environment variables

### Step 6: Verify Deployment

1. Visit your dashboard URL (`https://your-project.vercel.app`)
2. You should see a Google sign-in page
3. Sign in with your Google account
4. You'll see the dashboard (it will say "No data available" until first scan)

### Step 7: Configure GitHub Actions for Automated Scans

**⚠️ Important: This step is critical for automated daily scans**

1. In your forked repository, go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:

| Secret | Value | Purpose |
|--------|-------|---------|
| `DASHBOARD_URL` | Your Vercel URL (e.g., `https://my-dashboard.vercel.app`) | Where to upload results |
| `TARGET_BASE_URL` | The site you're monitoring (e.g., `https://example.com`) | **Required** - Website to scan |
| `CI_UPLOAD_SIGNING_KEY` | Generate with `openssl rand -hex 32` | Secure uploads - **MUST match Vercel env var** |

**Important Distinction:**

- **GitHub Secrets** (above): Used by GitHub Actions CI workflow to run scans and upload results
- **Vercel Environment Variables**: Used by the deployed dashboard application (set in Step 5)
- Only `CI_UPLOAD_SIGNING_KEY` and `TARGET_BASE_URL` need to be set in BOTH locations

3. **Critical**: Add `CI_UPLOAD_SIGNING_KEY` to **both**:
   - GitHub repository secrets (as shown above)
   - Vercel environment variables (Settings → Environment Variables)
   - **Both values must be identical**

4. **Optional**: Add `SITEMAP_URL` if your sitemap is at a non-standard location (defaults to `${TARGET_BASE_URL}/sitemap.xml`)

See [docs/guides/github-actions.md](docs/guides/github-actions.md) for detailed instructions.

### Step 8: Run Your First Scan

1. Go to **Actions** tab in your GitHub repository
2. Click **Unlighthouse CI** workflow
3. Click **Run workflow** → **Run workflow**
4. Wait 5-10 minutes for completion
5. Refresh your dashboard - you should now see data!

### First Run Checklist

After deployment, verify everything is working:

- [ ] Visit your dashboard URL - you should see the sign-in page
- [ ] Sign in with Google - you should be redirected to the dashboard
- [ ] If you see "No data available", that's expected before your first scan
- [ ] Go to GitHub Actions → run the "Unlighthouse CI" workflow manually to get immediate data
- [ ] After the scan completes (~5-10 minutes), refresh your dashboard
- [ ] Verify scores and data are displayed

---

## What You'll Get

### Performance Monitoring

- **Daily Lighthouse Scans**: Automated mobile and desktop scans
- **Score Tracking**: Historical trends with visual charts
- **Regression Alerts**: Slack notifications when scores drop

### SEO Insights

- **AI Recommendations**: Claude-powered SEO suggestions and quick wins (requires Anthropic API key)
- **Content Gap Analysis**: Keywords your competitors rank for that you don't (requires DataForSEO)
- **Schema Markup**: Auto-generated JSON-LD suggestions

### Analytics Integration

- **Google Analytics**: Traffic metrics alongside performance data
- **Search Console**: Keyword rankings and click-through rates
- **Competitor Tracking**: Monitor how competitors are performing (requires DataForSEO)

---

## Complete Setup Guide

For detailed instructions including:

- [Complete deployment walkthrough](docs/SETUP.md)
- [Google OAuth setup with screenshots](docs/guides/google-oauth.md)
- [DataForSEO setup and configuration](docs/guides/dataforseo.md)
- [GitHub Actions configuration](docs/guides/github-actions.md)
- [Branding and customization](docs/guides/branding.md)
- [Troubleshooting common issues](docs/SETUP.md#troubleshooting)

See **[docs/SETUP.md](docs/SETUP.md)** for the complete guide.

---

## Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `TARGET_BASE_URL` | Website to monitor | `https://example.com` |
| `DASHBOARD_URL` | This dashboard's URL | `https://my-dashboard.vercel.app` |
| `NEXTAUTH_URL` | NextAuth URL (usually same as DASHBOARD_URL) | `https://my-dashboard.vercel.app` |
| `NEXTAUTH_SECRET` | Auth encryption key | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | `GOCSPX-xxx` |

*Note: `KV_REST_API_URL` and `KV_REST_API_TOKEN` are auto-configured when you create Vercel KV storage.*

### For CI/CD (GitHub Actions)

| Variable | Description | Where to Set |
|----------|-------------|--------------|
| `CI_UPLOAD_SIGNING_KEY` | HMAC signing key for secure uploads | **Both** Vercel env vars **and** GitHub secrets (must match!) |

### Optional

| Variable | What It Enables |
|----------|-----------------|
| `APP_NAME` | Custom dashboard title |
| `SITE_DESCRIPTION` | Context for AI to give better recommendations |
| `ALLOWED_EMAIL_DOMAIN` | Restrict login to specific domain (e.g., `yourcompany.com`) |
| `ANTHROPIC_API_KEY` | AI-powered SEO insights and recommendations |
| `DATAFORSEO_LOGIN` | Competitor analysis and keyword tracking |
| `DATAFORSEO_PASSWORD` | (required with LOGIN) - See [dataforseo.md](docs/guides/dataforseo.md) |
| `SLACK_WEBHOOK_URL` | Notifications for score changes |

See [.env.example](.env.example) for the complete list with documentation.

---

## What Works Without DataForSEO

✅ **Available without DataForSEO:**
- Lighthouse performance monitoring (mobile + desktop)
- Score trends and historical data
- AI insights (if ANTHROPIC_API_KEY is set)
- Google Analytics integration
- Slack notifications

❌ **Requires DataForSEO:**
- Competitor analysis
- Content gap identification
- SERP position tracking
- Keyword research

For DataForSEO setup instructions, see [docs/guides/dataforseo.md](docs/guides/dataforseo.md).

---

## Customization

### Branding

Make the dashboard your own with environment variables:

```bash
NEXT_PUBLIC_BRAND_NAME="My Company Dashboard"
NEXT_PUBLIC_BRAND_PRIMARY="#1a365d"
NEXT_PUBLIC_BRAND_ACCENT="#d97706"
```

Replace `public/brand/logo.svg` with your logo (40x40px SVG recommended).

See [docs/guides/branding.md](docs/guides/branding.md) for all branding options.

### Score Thresholds

Adjust when you receive alerts by editing `scripts/notify-slack.mjs`:

```javascript
const SCORE_THRESHOLDS = {
  performance: 80,    // Alert if below 80
  accessibility: 85,
  'best-practices': 85,
  seo: 90,
};
```

---

## Local Development

### Prerequisites

- Node.js 18+ (20 recommended)
- A code editor (VS Code recommended)
- Terminal access

### Setup Steps

1. **Clone your forked repository**:

```bash
git clone https://github.com/YOUR-USERNAME/your-fork-name.git
cd your-fork-name
```

2. **Install dependencies**:

```bash
npm ci
```

3. **Copy environment template**:

```bash
cp .env.example .env.local
```

4. **Get Vercel KV credentials** (from your deployed Vercel project):
   - Go to your Vercel project dashboard
   - Click **Storage** tab → Click your KV database
   - Go to **.env.local** tab
   - Copy `KV_REST_API_URL` and `KV_REST_API_TOKEN`
   - Paste them into your `.env.local` file

5. **Edit `.env.local`** with required values:

```bash
# Required
TARGET_BASE_URL=https://your-site.com
DASHBOARD_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-from-vercel
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
KV_REST_API_URL=your-kv-url
KV_REST_API_TOKEN=your-kv-token

# Optional (for full local testing)
ANTHROPIC_API_KEY=sk-ant-...
DATAFORSEO_LOGIN=your-login
DATAFORSEO_PASSWORD=your-password
```

6. **Start development server**:

```bash
npm run dev
```

7. **Open browser** to [http://localhost:3000](http://localhost:3000)

For more details, see [docs/SETUP.md](docs/SETUP.md#local-development).

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run verify` | Run full verification (typecheck + lint + test + build) |
| `npm run scan:desktop` | Run Lighthouse scan (desktop) |
| `npm run scan:mobile` | Run Lighthouse scan (mobile) |
| `npm run urls` | Extract URLs from sitemap |

---

## Troubleshooting

### "Sign in failed" or redirect errors

- Verify your redirect URI in Google Cloud Console matches exactly: `https://YOUR-URL/api/auth/callback/google`
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
- Ensure both production and localhost redirect URIs are added

### Dashboard shows no data

- Scans run daily at 2 AM UTC - trigger manually from GitHub Actions for immediate results
- Check GitHub Actions logs for scan errors
- Verify `TARGET_BASE_URL` is publicly accessible

### AI insights not appearing

- Confirm `ANTHROPIC_API_KEY` is set in Vercel environment variables
- Check Vercel function logs for API errors

### CI upload fails with 401

- Ensure `CI_UPLOAD_SIGNING_KEY` matches in **both** GitHub Secrets **and** Vercel environment variables
- The values must be absolutely identical
- Uploads must occur within 5 minutes of signature generation
- Generate a new key with: `openssl rand -hex 32`

### GitHub Actions workflow fails

- Check that `DASHBOARD_URL` is set in GitHub repository secrets
- Verify `CI_UPLOAD_SIGNING_KEY` is set in both locations
- Review Actions logs for specific error messages
- Ensure your repository has Actions enabled

For more troubleshooting tips, see [docs/SETUP.md](docs/SETUP.md#troubleshooting).

---

## GitHub Actions (Automated Scans)

The included workflow (`.github/workflows/unlighthouse.yml`) automates Lighthouse scans and uploads results to your dashboard.

### What It Does

1. **Daily at 2 AM UTC**: Runs mobile and desktop Lighthouse scans
2. Uploads results to your dashboard's KV storage
3. Checks for score regressions
4. Sends Slack notification (if configured)
5. Triggers Vercel redeploy (if configured)
6. Optionally runs competitor analysis

### Required Secrets

Set these in your GitHub repository: **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Description | Required |
|--------|-------------|----------|
| `DASHBOARD_URL` | Your dashboard URL (e.g., `https://my-dashboard.vercel.app`) | Yes |
| `CI_UPLOAD_SIGNING_KEY` | Must match the key in Vercel environment. Generate with `openssl rand -hex 32` | Yes |

### Optional Secrets

| Secret | Description |
|--------|-------------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook for notifications |
| `VERCEL_DEPLOY_HOOK` | Vercel deploy hook URL to trigger redeploy after scan |
| `KEEP_RUNS` | Number of local historical runs to keep in public/reports/runs/ (default: 14) |
| `REGRESSION_THRESHOLD` | Score drop threshold for alerts (default: 10) |

### Manual Trigger

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Unlighthouse CI** workflow
4. Click **Run workflow**
5. Optionally check "Run competitor analysis"
6. Click **Run workflow** button

See [docs/guides/github-actions.md](docs/guides/github-actions.md) for detailed configuration instructions.

---

## Project Structure

```
app/
├── api/                    # API routes
│   ├── ai-insights/        # AI analysis endpoints
│   ├── competitors/        # Competitor analysis
│   ├── reports/            # Lighthouse report management
│   └── auth/               # NextAuth handlers
├── auth/                   # Auth pages (signin, error)
└── page.tsx                # Main dashboard

components/                 # React components
lib/                        # Utilities, types, and config
scripts/                    # CI/CD and scan scripts
docs/                       # Documentation
__tests__/                  # Test files
```

---

## FAQ

**Q: How often do scans run?**
A: By default, daily at 2 AM UTC. You can change this in `.github/workflows/unlighthouse.yml` or trigger manually.

**Q: Can I monitor multiple websites?**
A: Each deployment monitors one website. Deploy multiple instances for multiple sites.

**Q: Is there a cost?**
A: The dashboard itself is free on Vercel's hobby tier. Optional integrations (Anthropic ~$5-10/month, DataForSEO ~$40/month) have their own pricing.

**Q: How do I restrict access to my team?**
A: Set `ALLOWED_EMAIL_DOMAIN=yourcompany.com` to only allow Google accounts from your domain.

**Q: Where is the data stored?**
A: In Vercel KV (Upstash Redis). Data is retained for 60 days by default.

**Q: Do I need DataForSEO?**
A: No, but you'll miss competitor analysis and content gap features. Performance monitoring works without it.

---

## Security

### Upload Endpoint Authentication

The `/api/reports/upload` endpoint uses HMAC-SHA256 signatures for secure CI uploads:

- **Signature verification**: All uploads must include a valid HMAC signature
- **Replay protection**: Nonces prevent request replay attacks
- **Timestamp validation**: Requests expire after 5 minutes
- **Rate limiting**: 10 requests per minute per IP

### Authentication & Authorization

- **OAuth authentication**: Secure Google sign-in via NextAuth.js
- **Domain restriction**: Optional `ALLOWED_EMAIL_DOMAIN` to restrict access to your organization
- **Session management**: JWT-based sessions with 30-day expiration

### Data Security

- **Environment variables**: All secrets stored in environment variables, never in code
- **Vercel KV**: Data stored in encrypted Vercel KV (Upstash Redis)
- **HTTPS only**: All traffic encrypted in transit
- **No third-party tracking**: No analytics or tracking scripts

For security issues, please see [CONTRIBUTING.md](CONTRIBUTING.md#security) for responsible disclosure guidelines.

---

## Ownership and License

**Copyright 2026 Oliver Marler**

This project is licensed under the **Apache License 2.0** - see [LICENSE](LICENSE) for details.

Contributions are accepted under the CLA - see [CLA.md](CLA.md) for details.

### What This Means

- ✅ **Free to use** for commercial and non-commercial projects
- ✅ **Free to modify** and create derivative works
- ✅ **Free to distribute** original or modified versions
- ✅ **Patent grant** included for contributions
- ⚠️ **Trademark notice** required when redistributing
- ⚠️ **License and copyright notice** must be included

For more information, see <https://www.apache.org/licenses/LICENSE-2.0>

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:

- **Developer Certificate of Origin (DCO)** requirements
- **Contributor License Agreement (CLA)** - review [CLA.md](CLA.md)
- Development setup
- Code style guidelines
- Pull request process

**All commits must be signed off** with the `-s` flag:

```bash
git commit -s -m "Your commit message"
```

---

## Acknowledgments

Built with these excellent open source projects:

- [Unlighthouse](https://unlighthouse.dev) - Lighthouse CI scanning
- [Next.js](https://nextjs.org) - React framework
- [Recharts](https://recharts.org) - Data visualization
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

## Support

- **Documentation**: See [docs/SETUP.md](docs/SETUP.md) for detailed setup guides
- **Issues**: Report bugs at [github.com/rocklandceo/lighthouse-public/issues](https://github.com/rocklandceo/lighthouse-public/issues)
- **Discussions**: Ask questions at [github.com/rocklandceo/lighthouse-public/discussions](https://github.com/rocklandceo/lighthouse-public/discussions)

> **Note**: If you forked this repository, you can also use your fork's Issues tab for personal tracking.
