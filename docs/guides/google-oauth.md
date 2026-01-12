# Google OAuth Setup Guide

This guide walks you through setting up Google OAuth for the Lighthouse SEO Dashboard.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top of the page
3. Click **New Project**
4. Enter a project name (e.g., "Lighthouse Dashboard")
5. Click **Create**

## Step 2: Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace organization)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Your dashboard name
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **Save and Continue**
6. On the Scopes page, click **Save and Continue** (no additional scopes needed)
7. On the Test Users page, click **Save and Continue**
8. Review and click **Back to Dashboard**

## Step 3: Create OAuth Credentials

1. In the left sidebar, go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application** as the application type
4. Enter a name (e.g., "Lighthouse Dashboard Web Client")
5. Under **Authorized redirect URIs**, add:
   - `https://YOUR-VERCEL-URL/api/auth/callback/google` (production)
   - `http://localhost:3000/api/auth/callback/google` (local development)
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

## Step 4: Add to Environment Variables

Add these to your Vercel project (Settings → Environment Variables):

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

For local development, add them to `.env.local`:

```bash
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
```

## Step 5: Verify Setup

1. Deploy your application or run `npm run dev`
2. Visit your dashboard URL
3. Click **Sign in with Google**
4. You should be redirected to Google's sign-in page
5. After signing in, you should be redirected back to the dashboard

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
