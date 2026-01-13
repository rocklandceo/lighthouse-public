Write-Host "============================================"
Write-Host "Lighthouse Dashboard - Secret Generator"
Write-Host "============================================"
Write-Host ""
Write-Host "This script generates secure random secrets for your deployment."
Write-Host "Copy the values below into your .env file."
Write-Host ""

# Generate NEXTAUTH_SECRET (base64, 32 bytes)
Write-Host "1. NEXTAUTH_SECRET"
Write-Host "   Purpose: Secures NextAuth session tokens"
Write-Host "   Where to set: Vercel environment variables ONLY"
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$NEXTAUTH_SECRET = [Convert]::ToBase64String($bytes)
Write-Host "   Value: $NEXTAUTH_SECRET"
Write-Host ""

# Generate CI_UPLOAD_SIGNING_KEY (hex, 32 bytes)
Write-Host "2. CI_UPLOAD_SIGNING_KEY"
Write-Host "   Purpose: Secures uploads from GitHub Actions to dashboard"
Write-Host "   ⚠️  TWO-LOCATION WARNING: Must be IDENTICAL in:"
Write-Host "       1. Vercel environment variables"
Write-Host "       2. GitHub repository secrets"
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$CI_UPLOAD_SIGNING_KEY = -join ($bytes | ForEach-Object { $_.ToString("x2") })
Write-Host "   Value: $CI_UPLOAD_SIGNING_KEY"
Write-Host ""

Write-Host "============================================"
Write-Host "Next Steps:"
Write-Host "============================================"
Write-Host "1. Copy these values into your .env file"
Write-Host "2. When deploying to Vercel:"
Write-Host "   - Add NEXTAUTH_SECRET to Vercel env vars"
Write-Host "   - Add CI_UPLOAD_SIGNING_KEY to Vercel env vars"
Write-Host "3. When setting up GitHub Actions:"
Write-Host "   - Add CI_UPLOAD_SIGNING_KEY to GitHub Secrets"
Write-Host "   - Use the EXACT SAME value as in Vercel"
Write-Host ""
Write-Host "📋 Track your progress in docs/SETUP-CREDENTIALS.md"
Write-Host ""
