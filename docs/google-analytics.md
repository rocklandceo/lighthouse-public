# Google Analytics & Search Console Setup Guide

## When to Use This Guide

**From the main README**: You're here from Step 11 of the main setup guide.

**Purpose**: This guide provides detailed walkthrough for Google Analytics 4 and Search Console setup, including account creation. The README has a quick summary - this guide has the full details.

**Prerequisites**:
- ✅ You've completed Steps 1-2 of the README (forked repo, created .env file)
- ✅ Your `.env` file is open in your editor
- ✅ You've completed Step 9 (Google OAuth) - same Google account needed

**After completing this guide**: Return to the README and continue with Step 11.

---

This guide walks you through setting up Google Analytics 4 (GA4) and Google Search Console for your Lighthouse SEO Dashboard, starting from account creation.

**Estimated Time**: 30-40 minutes

**What You'll Need**:

- Google account (same one from OAuth setup)
- Access to your website (to verify ownership)
- Your target website URL

**Why These Services?**

- **Google Analytics 4**: Provides traffic metrics, user behavior data, and conversion tracking
- **Google Search Console**: Provides search performance data, indexing status, and SEO insights
- **Service Account**: Allows your dashboard to access both APIs programmatically

**Cost**: 100% free - no charges for GA4 or Search Console API usage

---

## Part 1: Set Up Google Analytics 4

### If You Already Have GA4 Set Up

Skip to [Part 2: Set Up Google Search Console](#part-2-set-up-google-search-console)

### Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account (same one from OAuth setup)
3. Click **Start measuring** (if this is your first time)
4. If you already have an Analytics account, click **Admin** (gear icon at bottom left) → **Create Account**

### Configure Analytics Account

1. **Account Setup**:
   - **Account name**: Enter your company or website name (e.g., "My Company")
   - **Account data sharing settings**: Check boxes based on your preference (optional)
   - Click **Next**

2. **Property Setup**:
   - **Property name**: Enter a descriptive name (e.g., "My Website" or "example.com")
   - **Reporting time zone**: Select your timezone
   - **Currency**: Select your currency (for e-commerce tracking)
   - Click **Next**

3. **Business Information**:
   - **Industry category**: Select the category that best matches your business
   - **Business size**: Select your company size
   - Click **Next**

4. **Business Objectives**:
   - Select objectives that match your goals (e.g., "Generate leads", "Examine user behavior")
   - Click **Create**

5. **Accept Terms of Service**:
   - Check boxes to accept GA4 Terms of Service and Data Processing Amendment
   - Click **Accept**

### Set Up Data Stream

1. You'll be prompted to set up a data stream
2. Select **Web** (for website tracking)
3. Fill in details:
   - **Website URL**: Enter your target site URL (e.g., `https://example.com`)
   - **Stream name**: Enter a name (e.g., "Main Website" or "example.com")
4. Click **Create stream**

### Get Your Property ID

1. After creating the stream, you'll see the **Web stream details** page
2. Look for **Property ID** near the top of the page (format: `properties/123456789`)
3. **Copy this Property ID** - you'll need it for your `.env` file
4. Example: `properties/123456789`

**Note**: Don't confuse Property ID with Measurement ID:
- ✅ Property ID: `properties/123456789` (what you need)
- ❌ Measurement ID: `G-XXXXXXXXXX` (not used by this dashboard)

### Install GA4 Tracking Code (If Not Already Installed)

If your website doesn't have GA4 tracking yet:

1. On the Web stream details page, find the **Measurement ID** (e.g., `G-XXXXXXXXXX`)
2. Click **View tag instructions**
3. Choose your installation method:
   - **Google Tag Manager** (recommended for flexibility)
   - **Install manually**: Copy the Global Site Tag code and add to your website's `<head>` section
   - **CMS Plugin**: Use a plugin if using WordPress, Shopify, etc.

4. Verify tracking is working:
   - Visit your website
   - Return to GA4 → **Reports** → **Realtime**
   - You should see your visit appear within 30 seconds

---

## Part 2: Set Up Google Search Console

### If You Already Have Search Console Set Up

Skip to [Part 3: Create Service Account](#part-3-create-service-account)

### Add Property to Search Console

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Sign in with your Google account
3. Click **Add property**

### Choose Property Type and Verify

We recommend **URL Prefix** verification - it's simpler and works for all users.

1. Select **URL prefix**
2. Enter your full URL (e.g., `https://example.com`)
3. Click **Continue**
4. Choose **HTML file upload** (recommended method):
   - Download the verification HTML file
   - Upload it to your website's root directory
   - Click **Verify**
5. If successful, you'll see "Ownership verified"
6. Click **Go to property**

**Alternative methods**: HTML tag, Google Analytics, Google Tag Manager, or DNS record. Use HTML file upload if unsure - it's the most universal.

**Important**: Keep your verification in place (don't remove HTML file, meta tag, or DNS record) - Search Console checks periodically.

### Wait for Data to Populate

- Search Console needs 1-2 days to start collecting data
- Performance reports show up to 16 months of historical data (if available)
- Don't worry if you see "Data processing" or "No data yet" initially

---

### Optional: Link Search Console to GA4

Linking Search Console to GA4 allows you to see search data directly in Google Analytics. This is optional but recommended.

<details>
<summary><strong>Click to expand linking instructions</strong></summary>

**Why link them?** Linking allows you to view Search Console data (queries, clicks, impressions) directly in Google Analytics reports.

**Steps**:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon at bottom left)
3. In the **Property** column, click **Search Console Links**
4. Click **Link**
5. Choose your Search Console property
6. Select the Web stream to link
7. Click **Submit**

**Verification**:

- In GA4, go to **Reports** → **Search Console** → **Queries**
- You should see search data (may take 24-48 hours to appear)

**Note**: This linking is for enhanced analytics within GA4. The Lighthouse dashboard accesses Search Console separately via the service account you'll create in Part 3.

</details>

---

## Part 3: Create Service Account

**What is a Service Account?**

A service account is a special Google account that allows your dashboard to access Google Analytics and Search Console APIs without requiring you to sign in each time.

### Create Service Account in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the same project you created for OAuth (see [Google OAuth Guide](./google-oauth.md))
3. In the left sidebar, navigate to **IAM & Admin** → **Service Accounts**
4. Click **+ Create Service Account** at the top

### Configure Service Account

1. **Service account details**:
   - **Service account name**: Enter a descriptive name (e.g., "Lighthouse Dashboard Service Account" or "Analytics API Access")
   - **Service account ID**: Auto-generated from name (e.g., `lighthouse-dashboard-sa`)
   - **Service account description** (optional): Enter "Service account for Lighthouse SEO Dashboard API access"
   - Click **Create and Continue**

2. **Grant this service account access to project** (optional):
   - You can skip this step - no project-level roles needed
   - Click **Continue**

3. **Grant users access to this service account** (optional):
   - Skip this step
   - Click **Done**

### Get Service Account Email

1. You'll see your new service account in the list
2. **Copy the email address** - it looks like: `lighthouse-dashboard-sa@your-project.iam.gserviceaccount.com`
3. You'll need this email to grant access in GA4 and Search Console

---

## Part 4: Generate Service Account Key

1. On the Service Accounts page, find your newly created service account
2. Click on the service account name (the email address)
3. Go to the **Keys** tab at the top
4. Click **Add Key** → **Create new key**
5. Select **JSON** as the key type
6. Click **Create**
7. A JSON file will download automatically (e.g., `your-project-abc123.json`)

**⚠️ Important Security Notes**:

- This JSON file contains credentials that grant access to your Google Analytics and Search Console data
- Keep it secure - never commit to version control
- Never share it publicly
- Store it safely on your local machine

### Prepare JSON for Environment Variable

The JSON file you downloaded needs to be formatted as a single line for your `.env` file:

**Option 1: Manual formatting** (Mac/Linux):

```bash
cat ~/Downloads/your-project-abc123.json | jq -c . | pbcopy
```

This copies the minified JSON to your clipboard.

**Option 2: Online JSON minifier** (Recommended - any OS):

1. Go to [jsonformatter.org/json-minify](https://jsonformatter.org/json-minify)
2. Open your downloaded JSON file in a text editor
3. Copy all contents and paste into the left panel
4. Click **Minify** button
5. Copy the result from the right panel
6. Paste into your `.env` file

**Option 3: Manual formatting** (any OS):

1. Open the downloaded JSON file in a text editor
2. Copy all contents
3. Remove all newlines and extra spaces (make it one line)
4. The format should look like: `{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}`

**Add to your `.env` file**:

```bash
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project-id","private_key":"-----BEGIN PRIVATE KEY-----\nYourPrivateKeyHere\n-----END PRIVATE KEY-----\n","client_email":"your-service-account@your-project.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com"}
```

**Important**: The entire JSON object must be on one line, and `\n` characters in the private key are correct - don't remove them.

---

## Part 5: Grant Service Account Access

Your service account needs permission to access both Google Analytics and Search Console data.

### Grant Access to Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** (gear icon at bottom left)
3. In the **Property** column, click **Property Access Management**
4. Click **+ Add users** (top right with "+" icon)
5. Enter your service account email:
   - Paste the email you copied earlier: `lighthouse-dashboard-sa@your-project.iam.gserviceaccount.com`
6. Uncheck **Notify new users by email** (service accounts don't read email)
7. Select role: **Viewer**
   - ✅ Viewer: Read-only access (recommended)
   - ❌ Don't use Administrator, Editor, or Analyst (unnecessary permissions)
8. Click **Add**

**Verify Access**:
- You should see the service account email in the user list with "Viewer" role
- Status should be "Active"

### Grant Access to Search Console

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Select your property (the one you verified earlier)
3. In the left sidebar, click **Settings** (gear icon)
4. Click **Users and permissions**
5. Click **Add user**
6. Enter your service account email: `lighthouse-dashboard-sa@your-project.iam.gserviceaccount.com`
7. Select permission: **Full** (despite the name, this is read-only for API access)
   - Search Console's "Full" permission allows read access via API
   - "Owner" would allow property management changes
8. Click **Add**

**Verify Access**:
- You should see the service account email in the user list with "Full" permission

---

## Part 6: Enable APIs

Your Google Cloud project needs to have the Analytics and Search Console APIs enabled.

### Enable Google Analytics Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project (top bar shows project name)
3. In the left sidebar, navigate to **APIs & Services** → **Library**
4. In the search bar, type: **Google Analytics Data API**
5. Click on **Google Analytics Data API** from results
6. Click **Enable**
7. Wait a few seconds for API to enable

### Enable Google Search Console API

1. Still in **APIs & Services** → **Library**
2. In the search bar, type: **Google Search Console API**
3. Click on **Google Search Console API** from results (also called "Search Console API")
4. Click **Enable**
5. Wait a few seconds for API to enable

**Verify APIs are Enabled**:

1. Go to **APIs & Services** → **Enabled APIs & services**
2. You should see both:
   - **Google Analytics Data API**
   - **Search Console API**

---

## Part 7: Add to Environment Variables

Now add your Google Analytics Property ID and Service Account JSON to your `.env` file:

```bash
# Google Analytics 4 Property ID (format: properties/123456789)
GOOGLE_ANALYTICS_PROPERTY_ID=properties/123456789

# Service Account JSON (entire JSON object on one line)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
```

**Save the file** - you'll upload these to Vercel in Step 10 of the main README.

---

## Part 8: Verify Setup

After deploying to Vercel (Step 11 in main README), verify your Analytics and Search Console integration is working:

1. Visit your dashboard
2. Sign in with Google
3. You should see:
   - **Analytics metrics** in the dashboard (sessions, users, pageviews)
   - **Search Console metrics** (clicks, impressions, CTR, position)

**If you see "No data available"**:

- **For Analytics**:
  - Verify GA4 tracking is installed on your website
  - Check that you're viewing the correct property
  - New properties take 24-48 hours to start showing data
  - Visit your website to generate test data
  - Check GA4 Realtime report to confirm tracking is working

- **For Search Console**:
  - New properties take 1-2 days to start collecting data
  - Search Console shows data for pages that appear in Google search
  - If your site is new, you may not have search data yet
  - Verify ownership verification is still active

**If you see permission errors**:

- Verify service account has "Viewer" access in GA4 Property Access Management
- Verify service account has "Full" permission in Search Console Users and permissions
- Check that both APIs are enabled in Google Cloud Console
- Wait 5-10 minutes after granting access for permissions to propagate

---

## Troubleshooting

### "Access Denied" or "Permission Denied" Errors

**Cause**: Service account doesn't have access to GA4 or Search Console property.

**Fix**:

1. Verify service account email is added to:
   - GA4: Admin → Property Access Management (Viewer role)
   - Search Console: Settings → Users and permissions (Full permission)
2. Double-check you added the correct service account email
3. Wait 5-10 minutes for permissions to propagate
4. Redeploy your Vercel application

### "API Not Enabled" Error

**Cause**: Google Analytics Data API or Search Console API not enabled in Google Cloud project.

**Fix**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Search for and enable both:
   - **Google Analytics Data API**
   - **Search Console API**
4. Wait 1-2 minutes for APIs to activate
5. Redeploy your Vercel application

### "Invalid Service Account JSON" Error

**Cause**: JSON is malformed or not properly formatted.

**Fix**:

1. Verify JSON is on a single line with no extra newlines
2. Check that `\n` characters in private_key are preserved (they're required)
3. Ensure no quotes are escaped incorrectly
4. Try re-downloading the service account key and reformatting
5. Use `jq` to validate JSON: `echo $GOOGLE_SERVICE_ACCOUNT_JSON | jq .`

### GA4 Shows "No Data" But Tracking Is Working

**Cause**: Property ID is incorrect or points to wrong property.

**Fix**:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** → **Property Settings**
3. Verify **Property ID** matches your `.env` file
4. Format must be `properties/123456789` (not just the number)
5. Update `.env` file if incorrect
6. Redeploy to Vercel

### Search Console Shows "Property Not Verified"

**Cause**: Verification method was removed or expired.

**Fix**:

1. Go to [Search Console](https://search.google.com/search-console/)
2. Click **Settings** → **Ownership verification**
3. Verify at least one verification method is still active
4. If expired, re-verify using any supported method
5. For DNS/HTML verification, ensure the record/file is still present

### "Wrong Property ID Format" Error

**Cause**: Property ID must start with `properties/`.

**Fix**:

1. ❌ Wrong: `123456789`
2. ❌ Wrong: `G-XXXXXXXXXX` (that's Measurement ID)
3. ✅ Correct: `properties/123456789`

Find the correct format:
- Go to GA4 → Admin → Property Settings
- Look for "Property ID" (not "Measurement ID")

---

## Security Best Practices

1. **Never commit service account JSON to Git**:
   - Always use environment variables
   - Add `*.json` to `.gitignore` for service account keys
   - Never share the JSON file publicly

2. **Use minimum required permissions**:
   - GA4: Viewer role (not Administrator)
   - Search Console: Full permission (read-only via API)

3. **Rotate service account keys periodically**:
   - Create new key every 90 days
   - Delete old keys after updating environment variables
   - Monitor key usage in Google Cloud Console

4. **Monitor API usage**:
   - Check **APIs & Services** → **Dashboard** for quota usage
   - Set up billing alerts (even though APIs are free)
   - Review service account activity logs

5. **Restrict service account scope**:
   - Only grant access to specific GA4 properties needed
   - Only grant access to specific Search Console properties needed
   - Don't give project-wide IAM roles

---

<details>
<summary><strong>Advanced Topics: Security, Multi-Property Tracking, and BigQuery Export</strong></summary>

---

## Domain Property vs URL Prefix Property

The main guide recommends URL Prefix verification for simplicity. This section explains when Domain property verification is worth the extra setup effort.

### Understanding the Difference

**URL Prefix Property**:
- Verifies **one specific URL** (e.g., `https://example.com`)
- Does NOT cover subdomains (`https://blog.example.com` = separate property)
- Does NOT cover protocol variants (`http://example.com` = separate property)
- Does NOT cover www variants (`https://www.example.com` = separate property)

**Domain Property**:
- Verifies **all URLs under the domain** (e.g., `example.com`)
- Covers all subdomains (`blog.example.com`, `shop.example.com`, etc.)
- Covers all protocols (`http://` and `https://`)
- Covers www and non-www variants
- **Requires DNS verification** (no HTML file option)

### When to Use Domain Property

Choose Domain property if your site uses:

1. **Multiple subdomains**: blog.example.com, shop.example.com, docs.example.com
2. **Protocol migration**: Migrating from HTTP to HTTPS and want unified data
3. **WWW/non-WWW variants**: Both www.example.com and example.com resolve
4. **Wildcard SSL certificates**: *.example.com (indicates subdomain usage)

### When URL Prefix is Sufficient

Choose URL Prefix if:

1. **Single domain**: Only `https://example.com` (no subdomains)
2. **No DNS access**: You can't add TXT records to your domain
3. **Quick setup**: Need to verify ownership fast
4. **Separate tracking**: Subdomains should have separate Search Console properties

### Setting Up Domain Property Verification

If you decide Domain property is right for you:

**Step 1: Add Domain Property**

1. Go to [Google Search Console](https://search.google.com/search-console/)
2. Click **Add property**
3. Select **Domain** (not URL prefix)
4. Enter your domain: `example.com` (no protocol, no www)
5. Click **Continue**

**Step 2: DNS Verification**

1. You'll see a **TXT record** like: `google-site-verification=abc123xyz789...`
2. Copy the entire record value
3. Log in to your **domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)
4. Go to **DNS Management** or **DNS Settings**
5. Add a new **TXT record**:
   - **Host/Name**: `@` (represents root domain)
   - **Type**: `TXT`
   - **Value**: Paste the verification string
   - **TTL**: Default (3600 or 1 hour)
6. Save the record
7. Wait 5-10 minutes for DNS propagation
8. Return to Search Console and click **Verify**

**Step 3: Verify Success**

1. If successful, you'll see "Ownership verified"
2. All subdomains are now verified automatically
3. Data from all subdomains will appear in one Search Console property

**Troubleshooting DNS Verification**:

If verification fails:
- Wait 24 hours (DNS can take time to propagate globally)
- Verify TXT record was added correctly: `dig TXT example.com` (Mac/Linux) or use [whatsmydns.net](https://www.whatsmydns.net/)
- Check for typos in verification string
- Ensure you didn't add quotes around the TXT value (some registrars add them automatically)

---

## Service Account Advanced Security

Beyond basic service account setup, implement these security best practices for production environments.

### Key Rotation Strategy

**Why rotate keys?**
- Compromised keys can be used to access your Analytics data
- Old keys may be stored in insecure locations (old laptops, repos)
- Regular rotation limits damage window

**Recommended schedule**: Every 90 days (quarterly)

**How to rotate**:

1. **Create new key** (do not delete old key yet):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Navigate to **IAM & Admin** → **Service Accounts**
   - Click on your service account
   - Go to **Keys** tab → **Add Key** → **Create new key**
   - Select **JSON** → **Create**
   - Download new JSON file

2. **Update Vercel environment variables**:
   - Go to Vercel → **Settings** → **Environment Variables**
   - Find `GOOGLE_SERVICE_ACCOUNT_JSON`
   - Click **Edit**
   - Replace with new JSON (minified on one line)
   - Click **Save**

3. **Redeploy dashboard**:
   - Vercel should auto-deploy after env var change
   - If not, trigger manual deployment

4. **Verify new key works**:
   - Visit your dashboard
   - Check Analytics and Search Console data loads
   - If data loads successfully, new key is working

5. **Delete old key** (after 24-hour grace period):
   - Go back to Google Cloud Console → Service Account → Keys tab
   - Find the old key (earlier creation date)
   - Click **⋮** (three dots) → **Delete**
   - Confirm deletion

**Important**: Keep the old key active for 24 hours after deploying new key to ensure smooth transition.

### Restricting Service Account Scope

By default, service accounts can access ALL GA4 properties you grant them access to. For multi-property setups, restrict access to specific properties only.

**Step 1: Create property-specific service accounts**

Instead of one service account with access to all properties:

1. Create **Service Account A** for Property 1 (Production site)
2. Create **Service Account B** for Property 2 (Staging site)
3. Create **Service Account C** for Property 3 (Regional site)

Each service account should only have Viewer access to its specific property.

**Step 2: Use separate dashboards**

Deploy separate Lighthouse dashboard instances:
- Dashboard A uses Service Account A credentials
- Dashboard B uses Service Account B credentials
- Dashboard C uses Service Account C credentials

**Benefit**: If one service account is compromised, attacker only accesses one property (not all properties).

### Monitoring Service Account Activity

Track service account API usage to detect unauthorized access:

**Enable Cloud Logging**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** → **Service Accounts**
3. Click on your service account
4. Go to **Logs** tab
5. Enable **Cloud Logging** if not already enabled

**What to monitor**:
- API call volume (sudden spikes may indicate compromise)
- API call sources (verify requests come from Vercel IPs)
- Failed authentication attempts
- Unusual time patterns (e.g., API calls at 3 AM when dashboard not in use)

**Set up alerts**:

1. Go to **Logging** → **Logs Explorer**
2. Create log-based metric for service account API calls
3. Set alert threshold (e.g., > 100 calls per hour)
4. Configure email notifications

---

## Tracking Multiple GA4 Properties

If you manage multiple websites or want to track production and staging separately, configure multiple GA4 properties in one dashboard.

### Use Case Examples

1. **Multi-site organizations**: Corporate site, blog, shop
2. **Multi-region sites**: example.com (USA), example.co.uk (UK), example.de (Germany)
3. **Environment separation**: Production vs Staging
4. **Brand portfolio**: Multiple brands under one company

### Option 1: Deploy Separate Dashboards (Recommended)

**Setup**:

1. Deploy one Lighthouse dashboard per GA4 property
2. Each dashboard has its own:
   - `GOOGLE_ANALYTICS_PROPERTY_ID` environment variable
   - Vercel KV database
   - Dashboard URL

**Example**:
- Dashboard 1: `lighthouse-main.vercel.app` → Property ID: `properties/111111111`
- Dashboard 2: `lighthouse-blog.vercel.app` → Property ID: `properties/222222222`
- Dashboard 3: `lighthouse-shop.vercel.app` → Property ID: `properties/333333333`

**Pros**:
- ✅ Simple configuration (no code changes)
- ✅ Isolated data (no cross-contamination)
- ✅ Independent scanning schedules

**Cons**:
- ❌ Multiple Vercel projects (still free on Hobby plan)
- ❌ Need to switch between dashboards to see all data

### Option 2: Multi-Property Dashboard (Custom Development)

Modify dashboard code to support multiple properties in one instance.

**Required changes**:

1. **Update `lib/config.ts`**:
   ```typescript
   // Instead of single property ID:
   GOOGLE_ANALYTICS_PROPERTY_ID: 'properties/123456789'

   // Support multiple property IDs:
   GOOGLE_ANALYTICS_PROPERTY_IDS: 'properties/111111111,properties/222222222,properties/333333333'
   ```

2. **Update `lib/google-analytics.ts`**:
   - Modify functions to accept `propertyId` parameter
   - Loop through all property IDs and aggregate data

3. **Update dashboard UI**:
   - Add property selector dropdown
   - Store selected property in React state
   - Display data for selected property

**Complexity**: Medium (requires TypeScript/React knowledge)

**Benefit**: Unified dashboard with all properties in one place

---

## Custom Data Streams

GA4 supports multiple data streams per property (web, iOS app, Android app). This section covers advanced web stream configurations.

### Multiple Web Streams for One Property

**Use case**: Track different subdomains or international versions as separate streams within one property.

**Example**:
- Stream 1: `example.com` (main site)
- Stream 2: `blog.example.com` (blog)
- Stream 3: `shop.example.com` (e-commerce)

**Setup**:

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Click **Admin** → **Data Streams**
4. Click **Add stream** → **Web**
5. Enter subdomain URL and stream name
6. Click **Create stream**
7. Repeat for each subdomain

**Dashboard integration**: Dashboard reads data from entire property (all streams combined). To see stream-specific data, use BigQuery export (see below).

### Stream-Level Configuration

Configure each stream independently:

**Enhanced Measurement** (auto-tracking without code changes):
- Page views (enabled by default)
- Scrolls (track 90% scroll depth)
- Outbound clicks (track external link clicks)
- Site search (track internal search queries)
- Video engagement (YouTube embeds)
- File downloads (PDF, ZIP, etc.)

**Setup**:

1. Click on a data stream
2. Scroll to **Enhanced measurement**
3. Toggle on/off features as needed
4. Click **Save**

**Recommendation for Lighthouse dashboard**:
- Enable **all** enhanced measurement features
- More data = better AI insights

---

## BigQuery Export for Advanced Analysis

Export GA4 data to BigQuery for custom SQL queries and advanced analysis beyond what the dashboard provides.

### Why Use BigQuery Export?

- **Custom queries**: Write SQL to analyze data in ways GA4 UI doesn't support
- **Historical data**: GA4 free tier has 14-month data retention; BigQuery stores data indefinitely
- **Data joins**: Combine GA4 data with other data sources (CRM, sales data, etc.)
- **Machine learning**: Use BigQuery ML for predictive analytics

### Setup Instructions

**Step 1: Enable BigQuery API**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Library**
3. Search for **BigQuery API**
4. Click **Enable**

**Step 2: Link GA4 to BigQuery**

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select your property
3. Click **Admin** → **BigQuery Linking**
4. Click **Link**
5. Choose your Google Cloud project (same project as service account)
6. Configure export settings:
   - **Frequency**: Daily (recommended) or Streaming (real-time, costs more)
   - **Include advertising identifiers**: Off (unless using Google Ads)
   - **Include user data**: On (for user-level analysis)
7. Click **Submit**

**Step 3: Wait for First Export**

- Daily export runs automatically at night (Pacific Time)
- First export may take 24-48 hours to appear
- Data appears in BigQuery dataset: `analytics_<property_id>`

**Step 4: Query GA4 Data in BigQuery**

Example query - Find top pages by traffic:

```sql
SELECT
  event_params.value.string_value AS page_path,
  COUNT(*) AS page_views
FROM `your-project.analytics_123456789.events_*`
CROSS JOIN UNNEST(event_params) AS event_params
WHERE
  _TABLE_SUFFIX BETWEEN '20240101' AND '20241231'
  AND event_name = 'page_view'
  AND event_params.key = 'page_location'
GROUP BY page_path
ORDER BY page_views DESC
LIMIT 20
```

**Cost**: BigQuery has a free tier (1 TB queries/month, 10 GB storage). GA4 export typically uses < 1 GB/month for most sites.

---

## Advanced Troubleshooting

### Service Account Shows "Permission Denied" After Working Previously

**Symptom**: Dashboard was working, but now shows "Permission Denied" for Analytics or Search Console.

**Common causes**:
1. **Service account key expired or was deleted**: Check Cloud Console → Service Accounts → Keys tab
2. **Service account access was revoked**: Check GA4 Property Access Management and Search Console Users
3. **Property was deleted or renamed**: Verify property still exists in GA4
4. **API quota exceeded**: Check Cloud Console → APIs & Services → Dashboard for quota usage

**Solution**:
1. Verify service account key exists in Cloud Console
2. Verify service account email appears in:
   - GA4: Admin → Property Access Management (Viewer role)
   - Search Console: Settings → Users and permissions (Full permission)
3. Generate new service account key and update Vercel env vars
4. Check API quotas and request increase if needed

### Data Mismatch Between GA4 UI and Dashboard

**Symptom**: Numbers shown in dashboard don't match numbers in GA4 interface.

**Common causes**:
1. **Date range mismatch**: Dashboard queries different date range than GA4 UI
2. **Time zone differences**: GA4 property timezone vs. server timezone
3. **Sampling**: GA4 may sample large datasets; API returns unsampled data
4. **Real-time vs. processed data**: GA4 UI shows real-time; API shows processed (24-hour delay)

**Solution**:
1. Check date range in dashboard vs. GA4 UI
2. Verify property timezone in GA4 Admin → Property Settings
3. Allow 24-48 hours for data processing
4. For exact matches, query same time period with same timezone

### BigQuery Export Not Appearing

**Symptom**: Linked GA4 to BigQuery but no data appearing.

**Common causes**:
1. **Export hasn't run yet**: Daily export runs once per day (usually at night Pacific Time)
2. **Insufficient permissions**: Service account needs BigQuery Data Editor role
3. **Billing not enabled**: BigQuery requires billing account (even for free tier)
4. **Property has no data**: No events recorded in GA4 to export

**Solution**:
1. Wait 24-48 hours after linking for first export
2. Check BigQuery → Datasets - dataset should be named `analytics_<property_id>`
3. Verify billing is enabled in Cloud Console → Billing
4. Check GA4 Realtime report to confirm events are being recorded

### Multiple Service Accounts Not Working

**Symptom**: Setup works with one service account but fails with multiple.

**Common causes**:
1. **Wrong service account JSON in wrong dashboard**: Dashboard A using Dashboard B's credentials
2. **Property ID mismatch**: Service Account A has access to Property 1, but dashboard is querying Property 2
3. **IAM permissions not propagated**: Can take 5-10 minutes for new service account access to activate

**Solution**:
1. Create a credential mapping document:
   ```
   Dashboard A (lighthouse-main.vercel.app):
   - Service Account: sa-main@project.iam.gserviceaccount.com
   - Property ID: properties/111111111

   Dashboard B (lighthouse-blog.vercel.app):
   - Service Account: sa-blog@project.iam.gserviceaccount.com
   - Property ID: properties/222222222
   ```
2. Verify each dashboard has correct service account JSON and property ID
3. Test each dashboard independently
4. Check service account access in GA4 Property Access Management

---

## Additional Advanced Resources

- **GA4 Property Settings**: https://support.google.com/analytics/answer/9304153
- **Service Account Best Practices**: https://cloud.google.com/iam/docs/best-practices-service-accounts
- **BigQuery GA4 Export Schema**: https://support.google.com/analytics/answer/7029846
- **Search Console Verification Methods**: https://support.google.com/webmasters/answer/9008080
- **GA4 API Documentation**: https://developers.google.com/analytics/devguides/reporting/data/v1

</details>

---

## Next Steps

After completing this setup:

1. ✅ Verify GA4 Property ID is in your `.env` file
2. ✅ Verify Service Account JSON is in your `.env` file (one line)
3. ✅ Verify service account has access to GA4 property
4. ✅ Verify service account has access to Search Console property
5. ✅ Verify both APIs are enabled in Google Cloud Console
6. → Continue with [main setup guide](../README.md) to deploy to Vercel
7. → After deployment, verify metrics appear in your dashboard

---

## Additional Resources

- **Google Analytics Help**: https://support.google.com/analytics/
- **Search Console Help**: https://support.google.com/webmasters/
- **Google Analytics Data API Docs**: https://developers.google.com/analytics/devguides/reporting/data/v1
- **Search Console API Docs**: https://developers.google.com/webmaster-tools/v1/how-tos/search-analytics
- **Service Account Best Practices**: https://cloud.google.com/iam/docs/best-practices-service-accounts
