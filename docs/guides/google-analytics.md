# Google Analytics & Search Console Setup Guide

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

### Choose Property Type

You'll see two options:

**Option 1: Domain Property** (Recommended)
- Verifies all URLs across all subdomains and protocols (http/https, www/non-www)
- Requires DNS verification (you need access to your domain registrar)
- Example: `example.com` (covers https://example.com, https://www.example.com, http://example.com)

**Option 2: URL Prefix Property**
- Verifies only the specific URL you enter
- Multiple verification methods available
- Example: `https://example.com` (only covers exactly that URL)

**Recommendation**: Use **Domain property** if you have DNS access. Otherwise, use **URL prefix**.

### Verify Your Property

#### For Domain Property (DNS Verification):

1. Enter your domain (e.g., `example.com`) without http:// or https://
2. Click **Continue**
3. You'll see a **TXT record** to add to your DNS
4. Copy the TXT record value
5. Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
6. Add the TXT record to your DNS settings:
   - **Type**: TXT
   - **Name**: @ (or leave blank)
   - **Value**: (paste the value from Search Console)
   - **TTL**: 3600 or Auto
7. Wait 5-15 minutes for DNS propagation
8. Return to Search Console and click **Verify**

#### For URL Prefix Property (Multiple Methods):

1. Enter your full URL (e.g., `https://example.com`)
2. Click **Continue**
3. Choose a verification method:

**HTML File Upload**:
- Download the HTML verification file
- Upload it to your website's root directory
- Click **Verify**

**HTML Tag**:
- Copy the meta tag
- Add it to your website's `<head>` section
- Click **Verify**

**Google Analytics**:
- If you just set up GA4 (Part 1), this should work automatically
- Click **Verify**

**Google Tag Manager**:
- If you use GTM, this should work automatically
- Click **Verify**

**DNS Record** (same as domain property):
- Add TXT record to DNS
- Click **Verify**

### Verify Ownership

1. After choosing a method and completing the steps, click **Verify**
2. If successful, you'll see "Ownership verified"
3. Click **Go to property**

**Important**: Keep your verification in place (don't remove HTML file, meta tag, or DNS record) - Search Console checks periodically.

### Wait for Data to Populate

- Search Console needs 1-2 days to start collecting data
- Performance reports show up to 16 months of historical data (if available)
- Don't worry if you see "Data processing" or "No data yet" initially

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

**Option 2: Manual formatting** (any OS):

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

## Next Steps

After completing this setup:

1. ✅ Verify GA4 Property ID is in your `.env` file
2. ✅ Verify Service Account JSON is in your `.env` file (one line)
3. ✅ Verify service account has access to GA4 property
4. ✅ Verify service account has access to Search Console property
5. ✅ Verify both APIs are enabled in Google Cloud Console
6. → Continue with [main setup guide](../../README.md) to deploy to Vercel
7. → After deployment, verify metrics appear in your dashboard

---

## Additional Resources

- **Google Analytics Help**: https://support.google.com/analytics/
- **Search Console Help**: https://support.google.com/webmasters/
- **Google Analytics Data API Docs**: https://developers.google.com/analytics/devguides/reporting/data/v1
- **Search Console API Docs**: https://developers.google.com/webmaster-tools/v1/how-tos/search-analytics
- **Service Account Best Practices**: https://cloud.google.com/iam/docs/best-practices-service-accounts
