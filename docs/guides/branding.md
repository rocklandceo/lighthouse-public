# Branding Customization Guide

Make the dashboard your own with custom colors, logo, and branding.

## Quick Start

Add these environment variables to customize your dashboard:

```bash
NEXT_PUBLIC_BRAND_NAME="Acme Performance Dashboard"
NEXT_PUBLIC_BRAND_PRIMARY="#1a365d"
NEXT_PUBLIC_BRAND_ACCENT="#d97706"
```

## Available Options

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_BRAND_NAME` | Dashboard title and header text | `Lighthouse Dashboard` |
| `NEXT_PUBLIC_BRAND_LOGO_PATH` | Path to logo image (relative to public/) | `/brand/logo.svg` |
| `NEXT_PUBLIC_BRAND_FAVICON_PATH` | Path to favicon | `/brand/favicon.svg` |
| `NEXT_PUBLIC_BRAND_PRIMARY` | Header and primary text color | `#0B3D91` |
| `NEXT_PUBLIC_BRAND_ACCENT` | Highlights and interactive elements | `#B45309` |
| `NEXT_PUBLIC_BRAND_BACKGROUND` | Page background color | `#FAF7F2` |
| `NEXT_PUBLIC_BRAND_TEXT` | Main text color | `#0B3D91` |

## Custom Logo

### Option 1: Replace the Default Logo

1. Create your logo as an SVG (recommended) or PNG
2. Size: 40x40 pixels works well for the header
3. Replace `public/brand/logo.svg` with your file

### Option 2: Use a Different Path

1. Add your logo to `public/` (e.g., `public/my-logo.svg`)
2. Set the environment variable:

   ```bash
   NEXT_PUBLIC_BRAND_LOGO_PATH="/my-logo.svg"
   ```

### Logo Tips

- SVG format scales best across devices
- Keep it simple - it appears small in the header
- Test on both light and dark backgrounds
- Transparent background works best

## Custom Favicon

1. Create your favicon (SVG, PNG, or ICO)
2. Add to `public/` directory
3. Set the path:

   ```bash
   NEXT_PUBLIC_BRAND_FAVICON_PATH="/my-favicon.svg"
   ```

## Color Schemes

### Professional Blue (Default)

```bash
NEXT_PUBLIC_BRAND_PRIMARY="#0B3D91"
NEXT_PUBLIC_BRAND_ACCENT="#B45309"
NEXT_PUBLIC_BRAND_BACKGROUND="#FAF7F2"
```

### Modern Dark

```bash
NEXT_PUBLIC_BRAND_PRIMARY="#1e293b"
NEXT_PUBLIC_BRAND_ACCENT="#3b82f6"
NEXT_PUBLIC_BRAND_BACKGROUND="#f8fafc"
```

### Corporate Green

```bash
NEXT_PUBLIC_BRAND_PRIMARY="#166534"
NEXT_PUBLIC_BRAND_ACCENT="#ca8a04"
NEXT_PUBLIC_BRAND_BACKGROUND="#f0fdf4"
```

### Startup Purple

```bash
NEXT_PUBLIC_BRAND_PRIMARY="#5b21b6"
NEXT_PUBLIC_BRAND_ACCENT="#ec4899"
NEXT_PUBLIC_BRAND_BACKGROUND="#faf5ff"
```

## Full Example

For a company called "Acme Corp" with navy blue branding:

```bash
# .env.local or Vercel environment variables

NEXT_PUBLIC_BRAND_NAME="Acme Performance Monitor"
NEXT_PUBLIC_BRAND_LOGO_PATH="/brand/acme-logo.svg"
NEXT_PUBLIC_BRAND_FAVICON_PATH="/brand/acme-favicon.svg"
NEXT_PUBLIC_BRAND_PRIMARY="#1a365d"
NEXT_PUBLIC_BRAND_ACCENT="#2563eb"
NEXT_PUBLIC_BRAND_BACKGROUND="#f8fafc"
NEXT_PUBLIC_BRAND_TEXT="#1e293b"
```

## Testing Changes

### Local Development

1. Add variables to `.env.local`
2. Restart the dev server (`npm run dev`)
3. View changes at `http://localhost:3000`

### Production

1. Add variables in Vercel dashboard (Settings → Environment Variables)
2. Redeploy your project
3. Changes take effect after deployment

## File Structure

```
public/
└── brand/
    ├── logo.svg          # Main logo (header)
    ├── favicon.svg       # Browser tab icon
    └── README.md         # Asset documentation
```

## Troubleshooting

### Logo not appearing

- Verify the file exists in `public/`
- Check the path starts with `/` (e.g., `/brand/logo.svg`)
- Clear browser cache and refresh

### Colors not updating

- Environment variables starting with `NEXT_PUBLIC_` require rebuild
- In Vercel, redeploy after changing these variables
- Locally, restart the dev server

### Favicon not showing

- Some browsers cache favicons aggressively
- Try incognito/private window
- Clear browser cache completely
