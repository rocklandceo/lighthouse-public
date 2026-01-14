# Google OAuth Setup Guide

## When to Use This Guide

**From the main README**: You're here from Step 9 of the main setup guide.

**Purpose**: This guide provides detailed walkthrough for Google OAuth setup, including account creation. The README has a quick summary - this guide has the full details.

**Prerequisites**:
- ✅ You've completed Steps 1-2 of the README (forked repo, created .env file)
- ✅ Your `.env` file is open in your editor
- ✅ Credit card available for Google Cloud verification (no charges - just verification)

**After completing this guide**: Return to the README and continue with Step 10.

---

This guide walks you through setting up Google OAuth for the Lighthouse SEO Dashboard, starting from account creation.

**Estimated Time**: 20 minutes

**What You'll Need**:
- A Google account (personal or business)
- Credit card for Google Cloud verification (no charges for this setup)

**Why Google Cloud?**
Google Cloud Console is where you configure OAuth authentication (Sign in with Google) for your dashboard. Even though it's called "Google Cloud," you're just creating API credentials - you won't be using any paid cloud services.

---

## ⏰ Timing Note - Two-Step Process

**This is a two-step process** - don't worry if you can't complete everything in one sitting:

| Step | When | What You'll Do |
|------|------|----------------|
| **Step 1** | NOW | Create OAuth credentials and leave redirect URIs blank |
| **Step 2** | AFTER Vercel deployment | Come back and add your actual Vercel URL |

**Why the delay?** You can't add the real redirect URL yet because you don't have a Vercel URL until you deploy (Step 13 in README). This is expected and normal. The credentials will work once you add the redirect URI after deployment.

---

<details>
<summary><strong>Don't have a Google account yet? Click here for step-by-step instructions</strong></summary>

A Google account is required for:
- Google OAuth (dashboard sign-in)
- Google Analytics 4
- Google Search Console
- Google Cloud Console (OAuth setup)

**Estimated Time**: 5 minutes

### Instructions

1. Go to [accounts.google.com/signup](https://accounts.google.com/signup)

2. Click **Create account** → Select:
   - **For my personal use** (personal dashboard)
   - **For work or my business** (company dashboard)

3. Fill in your information:
   - **First and last name**: Your real name (displayed in dashboard)
   - **Email address**: Choose your Gmail address (e.g., `yourname@gmail.com`)
   - **Password**: Create a strong password (at least 12 characters)

4. Click **Next**

5. **Verify your phone number** (required):
   - Enter your phone number
   - Choose verification method: **Text message (SMS)** or **Voice call**
   - Enter the 6-digit code you receive
   - Click **Verify**

6. **Optional information** (you can skip these):
   - Recovery email address (recommended for account recovery)
   - Date of birth
   - Gender

7. Click **Next**

8. **Accept Google's Terms of Service and Privacy Policy**:
   - Read the terms (or skim them)
   - Scroll to bottom
   - Click **I agree**

9. **You now have a Google account!**

**Important**: This same account works for Gmail, Google Cloud, Google Analytics, Google Search Console, and all Google services. You don't need separate accounts for each service.

</details>

---

## Part 1: Create Google Cloud Project

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

## Part 2: Configure OAuth Consent Screen

1. In the left sidebar, navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** → Click **Create**
3. Fill in required fields:
   - **App name**: Your dashboard name (e.g., "Lighthouse SEO Dashboard")
   - **User support email**: Your email
   - **Developer contact email**: Your email
   - Leave optional fields blank
4. Click **Save and Continue** through all screens (Scopes, Test Users, Review)
5. Click **Back to Dashboard**

You should see "Publishing status: Testing" - this is normal for private use.

---

## Part 3: Create OAuth Credentials

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
   - **Leave blank for now** - you don't have a Vercel URL yet
   - You'll come back and add this after deploying to Vercel (Step 15 in README)

   **After deployment** (Step 15 in README), you'll add:
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

**Open your `.env` file** (you created this in Step 2 of the README) and add these lines:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

**Save the file** (Ctrl+S / Cmd+S) - you'll upload these to Vercel in Step 14 of the main README.

---

## Part 4: Add Redirect URI After Deployment

**⚠️ RETURNING FROM STEP 10**: Remember when you left the redirect URI blank? Now that you have your Vercel URL from Step 13, it's time to add it.

1. Deploy your dashboard to Vercel (follow main README Steps 11-13)
2. Note your Vercel URL (e.g., `your-project-abc123.vercel.app`)
3. Return to [Google Cloud Console](https://console.cloud.google.com/)
4. Go to **APIs & Services** → **Credentials**
5. Click on your OAuth 2.0 Client ID name
6. Under **Authorized redirect URIs**, click **+ Add URI**
7. Enter your actual URL:
   - `https://your-actual-project.vercel.app/api/auth/callback/google`
   - **Important**: No trailing slash, must be exact match
8. Click **Save**
9. Wait 1-2 minutes for changes to propagate

**If using custom domain** (optional):
- After setting up custom domain, add another redirect URI
- Keep both Vercel URL and custom domain URL active
- Example: Both `https://project.vercel.app/api/auth/callback/google` AND `https://lighthouse.company.com/api/auth/callback/google`

---

## Part 5: Verify Setup

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
- Go back to Part 4 and verify the redirect URI matches exactly
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
