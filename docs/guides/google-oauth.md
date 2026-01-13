# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth for the Lighthouse SEO Dashboard, starting from account creation.

**Estimated Time**: 20 minutes

**What You'll Need**:
- A Google account (personal or business)
- Credit card for Google Cloud verification (no charges for this setup)

**Why Google Cloud?**
Google Cloud Console is where you configure OAuth authentication (Sign in with Google) for your dashboard. Even though it's called "Google Cloud," you're just creating API credentials - you won't be using any paid cloud services.

---

## Part 1: Create Google Cloud Account (If Needed)

### If You Already Have a Google Account

Skip to [Part 2: Create Google Cloud Project](#part-2-create-google-cloud-project)

### If You Need to Create a Google Account

1. Go to [accounts.google.com](https://accounts.google.com/signup)
2. Click **Create account** → **For my personal use** (or **For work or my business** if preferred)
3. Fill in your information:
   - First and last name
   - Email address (choose your Gmail address)
   - Password (strong password recommended)
   - Phone number (for account recovery)
4. Click **Next**
5. Verify your phone number via SMS or call
6. Accept Google's Terms of Service and Privacy Policy
7. Click **Create account**

**You now have a Google account** - this same account works for Gmail, Google Cloud, Google Analytics, and all Google services.

---

## Part 2: Create Google Cloud Project

### First Time at Google Cloud Console?

If this is your first time visiting Google Cloud Console, you may be prompted to:

1. **Accept Terms of Service**:
   - Read and accept Google Cloud Platform Terms of Service
   - Click **Agree and Continue**

2. **Verify Your Account** (sometimes required):
   - You may be asked to add a credit card for identity verification
   - Google requires this to prevent abuse, but you won't be charged
   - Enter credit card information if prompted
   - Click **Start my free trial** or **Verify**

**Note**: You're using free Google Cloud APIs only. No charges will occur for OAuth, Analytics API, or Search Console API usage.

### Create Your Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. If you see a welcome screen, click **Select a project** at the top
3. In the project selector dropdown, click **New Project**
4. Fill in project details:
   - **Project name**: Enter a descriptive name (e.g., "Lighthouse Dashboard" or "SEO Monitoring")
   - **Organization**: Leave as "No organization" (unless you have Google Workspace)
   - **Location**: Leave as "No organization"
5. Click **Create**
6. Wait 10-30 seconds for project creation
7. You'll be redirected to your new project dashboard

**Project Created!** You should see your project name at the top of the screen.

---

## Part 3: Configure OAuth Consent Screen

**What is this?** The OAuth consent screen is what users see when they click "Sign in with Google" on your dashboard. You're configuring the branding and information displayed.

1. In the left sidebar, click the menu icon (☰) if needed
2. Navigate to **APIs & Services** → **OAuth consent screen**
3. You'll see two options:
   - **Internal**: Only for Google Workspace organizations (you probably don't have this)
   - **External**: For anyone with a Google account
4. Select **External**
5. Click **Create**

### Fill in OAuth Consent Screen

1. **App Information**:
   - **App name**: Enter your dashboard name (e.g., "Lighthouse SEO Dashboard" or "My Company SEO Monitor")
   - **User support email**: Select your email from dropdown
   - **App logo** (optional): You can skip this for now

2. **App Domain** (optional):
   - You can leave these blank for now
   - Add later once you have a custom domain

3. **Authorized domains** (optional):
   - Leave blank for now

4. **Developer contact information**:
   - **Email addresses**: Enter your email address
   - This is where Google will contact you about the app

5. Click **Save and Continue**

### Scopes Configuration

1. You'll see the "Scopes" page
2. Click **Save and Continue** (no additional scopes needed - default scopes are sufficient)

### Test Users (Optional)

1. You'll see the "Test users" page
2. You can skip this - your app is "external" so any Google account can sign in
3. Click **Save and Continue**

### Review and Confirm

1. Review your OAuth consent screen configuration
2. Click **Back to Dashboard**

**OAuth Consent Screen Configured!** You should see "Publishing status: Testing" - this is normal and fine for your use case.

---

## Part 4: Create OAuth Credentials

**What are OAuth credentials?** These are the Client ID and Client Secret that allow your dashboard to authenticate users via Google.

1. In the left sidebar, navigate to **APIs & Services** → **Credentials**
2. At the top of the page, click **+ Create Credentials**
3. Select **OAuth client ID** from the dropdown
4. If you see a message about configuring consent screen, you need to complete Part 3 first

### Configure OAuth Client

1. **Application type**: Select **Web application**

2. **Name**: Enter a descriptive name (e.g., "Lighthouse Dashboard Web Client" or "SEO Dashboard OAuth")

3. **Authorized JavaScript origins**:
   - Click **+ Add URI**
   - You'll add your dashboard URL here AFTER deploying to Vercel
   - **For now, you can skip this section** - come back after Step 11 in the main README

   **Example** (add later):
   - `https://your-project-abc123.vercel.app`
   - Or `https://lighthouse.yourdomain.com` (if using custom domain)

4. **Authorized redirect URIs** ⚠️ **CRITICAL**:
   - Click **+ Add URI**
   - This MUST match your dashboard URL exactly
   - **For now, enter a placeholder** - you'll update this after deployment

   **Placeholder** (use this for now):
   - `https://PLACEHOLDER.vercel.app/api/auth/callback/google`

   **After deployment** (Step 11 in README), you'll come back and update this to:
   - `https://your-actual-project.vercel.app/api/auth/callback/google`
   - Or `https://lighthouse.yourdomain.com/api/auth/callback/google` (custom domain)

   **⚠️ Common Mistakes**:
   - ✅ Correct: `https://my-dashboard.vercel.app/api/auth/callback/google`
   - ❌ Wrong: `https://my-dashboard.vercel.app` (missing path)
   - ❌ Wrong: `https://my-dashboard.vercel.app/api/auth/callback/google/` (trailing slash)
   - ❌ Wrong: `http://` instead of `https://`

5. Click **Create**

### Save Your Credentials

A popup will appear with your OAuth credentials:

1. **Client ID**:
   - Long string ending in `.apps.googleusercontent.com`
   - Example: `123456789-abc123xyz.apps.googleusercontent.com`
   - Copy this to your `.env` file

2. **Client secret**:
   - Starts with `GOCSPX-`
   - Example: `GOCSPX-AbC123XyZ789...`
   - Copy this to your `.env` file

3. Click **OK** to close the popup

**Important**: If you lose these credentials, you can always find them again:
- Go to **APIs & Services** → **Credentials**
- Click on your OAuth 2.0 Client ID name
- View Client ID and Client Secret

### Add to Your .env File

Open your `.env` file and add these lines:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

**Save the file** - you'll upload these to Vercel in Step 10 of the main README.

---

## Part 5: Update Redirect URI After Deployment

**⚠️ IMPORTANT**: After you deploy to Vercel (Step 11 in main README), you MUST come back and update the redirect URI.

1. Deploy your dashboard to Vercel (follow main README)
2. Note your Vercel URL (e.g., `your-project-abc123.vercel.app`)
3. Return to [Google Cloud Console](https://console.cloud.google.com/)
4. Go to **APIs & Services** → **Credentials**
5. Click on your OAuth 2.0 Client ID name
6. Under **Authorized redirect URIs**, remove the placeholder
7. Click **+ Add URI** and enter your actual URL:
   - `https://your-actual-project.vercel.app/api/auth/callback/google`
8. Click **Save**
9. Wait 1-2 minutes for changes to propagate

**If using custom domain** (optional):
- After setting up custom domain, add another redirect URI
- Keep both Vercel URL and custom domain URL active
- Example: Both `https://project.vercel.app/api/auth/callback/google` AND `https://lighthouse.company.com/api/auth/callback/google`

---

## Part 6: Verify Setup

After deploying to Vercel and updating the redirect URI, test your OAuth setup:

1. Visit your dashboard URL (e.g., `https://your-project.vercel.app`)
2. You should see a **Sign in with Google** button
3. Click the button
4. You should be redirected to Google's consent screen showing your app name
5. Sign in with your Google account
6. Grant permissions when prompted
7. You should be redirected back to your dashboard
8. You should now be signed in and see your email/profile

**If you see "redirect_uri_mismatch" error**:
- Go back to Part 5 and verify the redirect URI matches exactly
- Check for typos, trailing slashes, or http vs https
- Wait 1-2 minutes after making changes

**If you see "This app isn't verified" warning**:
- This is normal for apps in "Testing" mode
- Click **Advanced** → **Go to [Your App Name] (unsafe)**
- This warning only appears for external users - won't show for you after first sign-in
- To remove this warning, you'd need to verify your app with Google (not necessary for private use)

## Restricting Access to Your Domain

To limit access to users from your organization:

1. Add to your environment variables:

   ```bash
   ALLOWED_EMAIL_DOMAIN=yourcompany.com
   ```

2. Only Google accounts with `@yourcompany.com` emails will be able to sign in

## Troubleshooting

### "redirect_uri_mismatch" Error

- Verify the redirect URI in Google Cloud Console exactly matches your Vercel URL
- Check for trailing slashes or protocol mismatches (http vs https)
- After adding/changing URIs, wait a few minutes for changes to propagate

### "Access blocked: This app's request is invalid"

- Ensure OAuth consent screen is properly configured
- For production, you may need to verify your app with Google

### Sign-in works but immediately signs out

- Check that `NEXTAUTH_SECRET` is set and is at least 32 characters
- Verify `NEXTAUTH_URL` matches your dashboard URL

### "Sign in with Google" button not showing

- Confirm both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check Vercel logs for any configuration errors

## Security Notes

- Never commit OAuth credentials to version control
- Use different credentials for development and production
- Regularly rotate your client secret if you suspect it's been compromised
- Consider restricting access by email domain in production
