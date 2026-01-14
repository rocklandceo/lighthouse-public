# Custom Domain Setup Guide

## When to Use This Guide

**From the main README**: You're here from Part 4 (Optional Custom Domain) or the Additional Guides section.

**Purpose**: This guide provides detailed walkthrough for setting up a custom subdomain (e.g., `lighthouse.yourcompany.com`) instead of using the default Vercel URL. The README has a quick summary - this guide has the full details.

**Prerequisites**:

- ✅ You've completed Steps 1-18 of the README (dashboard deployed and working on Vercel)
- ✅ You own a domain and can add DNS records
- ✅ Your Vercel deployment is successful

**After completing this guide**: Your dashboard will be accessible at your custom subdomain (e.g., `https://lighthouse.yourcompany.com`).

---

This guide shows how to use a custom subdomain (e.g., `lighthouse.example.com`) instead of the default Vercel URL (`your-project-abc123.vercel.app`).

**Estimated Time**: 15-20 minutes (including DNS propagation)

---

## Why Use a Custom Domain?

**Benefits:**
- **Professional URL**: `lighthouse.example.com` vs `random-name-abc123.vercel.app`
- **Easier to remember**: Share with your team
- **Branding**: Matches your company domain
- **Trust**: Users recognize your domain
- **Stable URL**: Won't change if you redeploy

**Best Practice for Businesses**: Always use a custom subdomain for production dashboards.

---

## Prerequisites

- **Your domain's DNS must be accessible**
  - You own a domain (e.g., `example.com`)
  - You can add DNS records (via registrar or DNS provider)
  - Common providers: GoDaddy, Namecheap, Cloudflare, Google Domains, Route53

- **Vercel project already deployed**
  - Dashboard is live and accessible via Vercel URL
  - All environment variables configured

---

## Choosing Your Subdomain

**Recommended format**: `lighthouse.yourdomain.com`

**Other options:**
- `performance.yourdomain.com`
- `seo.yourdomain.com`
- `metrics.yourdomain.com`
- `dash.yourdomain.com`

**Avoid:**
- Using your root domain (`yourdomain.com`) - keep that for your main site
- Special characters or numbers
- Overly long names

---

<details>
<summary><strong>DNS Basics for Beginners</strong></summary>

**What is DNS?** DNS (Domain Name System) is like a phone book for the internet. It translates domain names (like `example.com`) into IP addresses that computers understand.

**What is a CNAME record?** A CNAME (Canonical Name) record points your subdomain to another domain. When you create a CNAME pointing `lighthouse.example.com` to `cname.vercel-dns.com`, you're telling the internet: "When someone visits `lighthouse.example.com`, send them to Vercel's servers."

**Why use a subdomain?** A subdomain is a prefix added to your domain (like `lighthouse.example.com`). This lets you have multiple sites on one domain:
- `www.example.com` → Your main website
- `lighthouse.example.com` → Your Lighthouse dashboard
- `blog.example.com` → Your blog

**What is DNS propagation?** When you add or change a DNS record, it takes time for the change to spread across all DNS servers worldwide. This is called "propagation" and typically takes 5-30 minutes, but can take up to 48 hours in rare cases.

**Where do I manage DNS?** Usually at your domain registrar (where you bought the domain) or your DNS provider (like Cloudflare). Common places:
- **GoDaddy**: My Products → Domains → DNS
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Cloudflare**: Select domain → DNS
- **Google Domains**: My Domains → Manage → DNS

</details>

---

## Step 1: Add Domain in Vercel

1. Go to your Vercel project dashboard
2. Click **Settings** → **Domains**
3. In the "Add Domain" field, enter your subdomain: `lighthouse.example.com`
4. Click **Add**

**Vercel will:**
- Verify you own the domain
- Show you DNS records to add
- Provide configuration instructions

**Note the DNS records** - you'll need them in Step 2.

---

## Step 2: Configure DNS Records

Vercel will show you which DNS record to add. There are two possible configurations:

### Option A: CNAME Record (Recommended)

**Most common and easiest:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | lighthouse | cname.vercel-dns.com | Auto or 3600 |

### Option B: A Records (If CNAME Not Supported)

**For some DNS providers:**

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | lighthouse | 76.76.21.21 | Auto or 3600 |

**Vercel will show you which one to use.**

---

## Step 3: Add DNS Record at Your Registrar

Instructions for common DNS providers:

### Cloudflare

1. Log in to Cloudflare
2. Select your domain
3. Click **DNS** tab
4. Click **Add record**
5. Type: **CNAME**
6. Name: **lighthouse** (not the full domain)
7. Target: **cname.vercel-dns.com**
8. Proxy status: **DNS only** (gray cloud)
9. TTL: **Auto**
10. Click **Save**

**Important**: Set proxy status to "DNS only" (gray cloud icon). Orange cloud (proxied) can cause issues with Vercel.

### GoDaddy

1. Log in to GoDaddy
2. Go to **My Products** → **Domains**
3. Click **DNS** next to your domain
4. Click **Add** in the Records section
5. Type: **CNAME**
6. Name: **lighthouse**
7. Value: **cname.vercel-dns.com**
8. TTL: **1 Hour** (or default)
9. Click **Save**

### Namecheap

1. Log in to Namecheap
2. Go to **Domain List** → Click **Manage**
3. Click **Advanced DNS** tab
4. Click **Add New Record**
5. Type: **CNAME Record**
6. Host: **lighthouse**
7. Value: **cname.vercel-dns.com**
8. TTL: **Automatic**
9. Click **Save**

### Google Domains

1. Log in to Google Domains
2. Select your domain
3. Click **DNS** in the sidebar
4. Scroll to **Custom resource records**
5. Name: **lighthouse**
6. Type: **CNAME**
7. TTL: **1H**
8. Data: **cname.vercel-dns.com**
9. Click **Add**

### AWS Route 53

1. Log in to AWS Console
2. Go to **Route 53** → **Hosted zones**
3. Select your domain
4. Click **Create record**
5. Record name: **lighthouse**
6. Record type: **CNAME**
7. Value: **cname.vercel-dns.com**
8. TTL: **300**
9. Click **Create records**

### Other DNS Providers

**General instructions:**
1. Find the DNS management section
2. Add a new CNAME record
3. Name/Host: `lighthouse` (subdomain only, not full domain)
4. Value/Target: `cname.vercel-dns.com`
5. TTL: Default or 3600
6. Save

---

## Step 4: Wait for DNS Propagation

**What is DNS propagation?**
- The process of your DNS changes spreading across the internet
- Can take 5 minutes to 48 hours (usually 5-30 minutes)

**Check propagation status:**

1. **In Vercel**:
   - Settings → Domains
   - You'll see "Valid Configuration" when ready

2. **Using DNS checker**:
   - Visit https://dnschecker.org/
   - Enter your full subdomain: `lighthouse.example.com`
   - Check if CNAME points to `cname.vercel-dns.com`

**While waiting:**
- Don't make duplicate DNS records
- Don't delete and re-add (resets propagation)
- Be patient - this is normal

---

## Step 5: Verify Domain Works

Once Vercel shows "Valid Configuration":

1. Visit `https://lighthouse.example.com`
2. You should see your dashboard
3. Verify SSL certificate is active (padlock icon in browser)

**If it doesn't load:**
- Wait longer (up to 24 hours)
- Check DNS record is correct
- Verify no typos in CNAME value
- Clear your browser cache

---

## Step 6: Update OAuth Redirect URI

**Critical step** - OAuth won't work until you add the new domain:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Click **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **Authorized redirect URIs**, click **Add URI**
5. Enter: `https://lighthouse.example.com/api/auth/callback/google`
6. Click **Save**

**Keep your old Vercel URL** as a backup redirect URI.

---

## Step 7: Update Environment Variables

Update your dashboard URL in **two locations**:

### In Vercel

1. Go to Settings → Environment Variables
2. Find `DASHBOARD_URL`
3. Update value to: `https://lighthouse.example.com`
4. Find `NEXTAUTH_URL`
5. Update value to: `https://lighthouse.example.com`
6. Save changes

### In GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Edit `DASHBOARD_URL` secret
4. Update value to: `https://lighthouse.example.com`
5. Save

**Important**: `TARGET_BASE_URL` and `CI_UPLOAD_SIGNING_KEY` stay the same.

---

## Step 8: Redeploy

Trigger a new deployment to pick up the updated environment variables:

1. Go to Vercel Deployments tab
2. Click **⋮** on latest deployment → **Redeploy**
3. Confirm

---

## Step 9: Test Everything

After redeployment:

1. Visit `https://lighthouse.example.com`
2. Click **Sign in with Google**
3. Verify OAuth works
4. Trigger a scan from GitHub Actions
5. Verify scan results upload successfully
6. Check all features work

**All should work with your custom domain!**

---

## Troubleshooting

### Domain Shows "Invalid Configuration"

**Cause**: DNS record not set up correctly.

**Fix**:
1. Verify CNAME record points to `cname.vercel-dns.com`
2. Check you entered the subdomain only (`lighthouse`, not `lighthouse.example.com`)
3. Wait up to 24 hours for propagation
4. Use https://dnschecker.org/ to verify DNS

### SSL Certificate Error

**Cause**: Vercel hasn't provisioned SSL yet.

**Fix**:
1. Wait 5-10 minutes after DNS propagation
2. Vercel automatically provisions Let's Encrypt SSL
3. Visit Settings → Domains → Check certificate status
4. If still failing after 1 hour, remove and re-add domain

### OAuth Sign-In Fails

**Cause**: Redirect URI not updated in Google Cloud Console.

**Fix**:
1. Verify redirect URI is **exactly**: `https://lighthouse.example.com/api/auth/callback/google`
2. No trailing slash
3. No typos
4. Save in Google Cloud Console
5. Wait 1-2 minutes for changes to propagate

### Scans Upload to Old URL

**Cause**: `DASHBOARD_URL` in GitHub Secrets not updated.

**Fix**:
1. Go to GitHub → Settings → Secrets → Actions
2. Update `DASHBOARD_URL` to your custom domain
3. Re-run workflow

### "Too Many Redirects" Error

**Cause**: Cloudflare proxy enabled (orange cloud).

**Fix**:
1. Go to Cloudflare DNS settings
2. Click the orange cloud next to your CNAME record
3. Change to gray cloud (DNS only)
4. Wait for changes to propagate

---

## Using a Root Domain

**Not recommended**, but possible:

If you want to use `example.com` (root domain) instead of `lighthouse.example.com` (subdomain):

### Requirements

- Your root domain must **not** be used for anything else
- You must set up **A records** (not CNAME)

### Steps

1. In Vercel: Add `example.com`
2. Vercel will show you A record IP addresses
3. Add **four A records** to your DNS:

```
Type | Name | Value
-----|------|------
A    | @    | 76.76.21.21
A    | @    | 76.76.21.22
A    | @    | 76.76.21.23
A    | @    | 76.76.21.24
```

4. Wait for DNS propagation
5. Update OAuth redirect URIs
6. Update environment variables
7. Redeploy

**Warning**: This means `example.com` redirects to your dashboard, not your main website.

---

## Multiple Domains

You can add multiple domains pointing to the same dashboard:

**Example use case:**
- `lighthouse.example.com` (primary)
- `performance.example.com` (alias)
- `your-project.vercel.app` (fallback)

**Steps:**
1. Add each domain in Vercel Settings → Domains
2. Configure DNS for each
3. Add OAuth redirect URIs for each
4. Set one as "Primary" in Vercel

**Benefit**: Flexibility for migrations or team access.

---

## Domain Migration

If you want to change your custom domain later:

1. Add new domain in Vercel
2. Configure new DNS records
3. Wait for propagation
4. Update OAuth redirect URIs (add new, keep old)
5. Update environment variables to new domain
6. Redeploy
7. Test thoroughly
8. Remove old domain from Vercel (or keep as fallback)

---

## Security Best Practices

1. **Always use HTTPS** - Vercel handles this automatically
2. **Don't use wildcards** - Use specific subdomains only
3. **Monitor DNS changes** - Set up alerts at your registrar
4. **Use Cloudflare (optional)** - Adds DDoS protection and caching
5. **Enable HSTS** - Vercel enables by default

---

## Cost

**Vercel domains are free.**

You only pay for:
- Your domain registration ($10-20/year, paid to registrar)
- No additional Vercel fees for custom domains

---

## Next Steps

After setting up your custom domain:

1. ✅ Update bookmarks to new URL
2. ✅ Share new URL with team
3. ✅ Update documentation references
4. ✅ Test all features work
5. → Return to [README.md](../README.md) to verify setup

---

## Additional Resources

- **Vercel Custom Domains**: https://vercel.com/docs/concepts/projects/domains
- **DNS Checker**: https://dnschecker.org/
- **SSL Labs Test**: https://www.ssllabs.com/ssltest/
- **Cloudflare**: https://www.cloudflare.com/
