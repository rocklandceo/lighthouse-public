#!/bin/bash

echo "============================================"
echo "Lighthouse Dashboard - Secret Generator"
echo "============================================"
echo ""
echo "This script generates secure random secrets for your deployment."
echo "Copy the values below into your .env file."
echo ""

# Generate NEXTAUTH_SECRET
echo "1. NEXTAUTH_SECRET"
echo "   Purpose: Secures NextAuth session tokens"
echo "   Where to set: Vercel environment variables ONLY"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "   Value: $NEXTAUTH_SECRET"
echo ""

# Generate CI_UPLOAD_SIGNING_KEY
echo "2. CI_UPLOAD_SIGNING_KEY"
echo "   Purpose: Secures uploads from GitHub Actions to dashboard"
echo "   ⚠️  TWO-LOCATION WARNING: Must be IDENTICAL in:"
echo "       1. Vercel environment variables"
echo "       2. GitHub repository secrets"
CI_UPLOAD_SIGNING_KEY=$(openssl rand -hex 32)
echo "   Value: $CI_UPLOAD_SIGNING_KEY"
echo ""

echo "============================================"
echo "Next Steps:"
echo "============================================"
echo "1. Copy these values into your .env file"
echo "2. When deploying to Vercel:"
echo "   - Add NEXTAUTH_SECRET to Vercel env vars"
echo "   - Add CI_UPLOAD_SIGNING_KEY to Vercel env vars"
echo "3. When setting up GitHub Actions:"
echo "   - Add CI_UPLOAD_SIGNING_KEY to GitHub Secrets"
echo "   - Use the EXACT SAME value as in Vercel"
echo ""
echo "📋 Continue with README.md setup guide"
echo ""
