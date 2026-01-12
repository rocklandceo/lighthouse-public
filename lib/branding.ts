/**
 * Centralized branding configuration
 *
 * All branding values can be customized via environment variables.
 * Default values provide a clean, neutral appearance.
 */

export interface BrandingConfig {
  /** Brand name shown in header and browser tab */
  name: string;
  /** Path to logo (relative to public/) */
  logoPath: string;
  /** Path to favicon */
  faviconPath: string;
  /** Primary color for header/buttons */
  primaryColor: string;
  /** Accent color for highlights */
  accentColor: string;
  /** Page background color */
  backgroundColor: string;
  /** Primary text color */
  textColor: string;
}

const DEFAULTS: BrandingConfig = {
  name: 'Lighthouse Dashboard',
  logoPath: '/brand/logo.svg',
  faviconPath: '/brand/favicon.svg',
  primaryColor: '#0B3D91',
  accentColor: '#B45309',
  backgroundColor: '#FAF7F2',
  textColor: '#0B3D91',
};

/**
 * Get branding configuration from environment variables with fallbacks to defaults.
 * Uses NEXT_PUBLIC_ prefix for client-side access.
 */
export function getBranding(): BrandingConfig {
  return {
    name: process.env.NEXT_PUBLIC_BRAND_NAME || DEFAULTS.name,
    logoPath: process.env.NEXT_PUBLIC_BRAND_LOGO_PATH || DEFAULTS.logoPath,
    faviconPath: process.env.NEXT_PUBLIC_BRAND_FAVICON_PATH || DEFAULTS.faviconPath,
    primaryColor: process.env.NEXT_PUBLIC_BRAND_PRIMARY || DEFAULTS.primaryColor,
    accentColor: process.env.NEXT_PUBLIC_BRAND_ACCENT || DEFAULTS.accentColor,
    backgroundColor: process.env.NEXT_PUBLIC_BRAND_BACKGROUND || DEFAULTS.backgroundColor,
    textColor: process.env.NEXT_PUBLIC_BRAND_TEXT || DEFAULTS.textColor,
  };
}

/**
 * Get CSS custom property object for injecting brand colors into HTML element.
 * Used in root layout to set CSS variables.
 */
export function getBrandingCssVars(): Record<string, string> {
  const branding = getBranding();
  return {
    '--brand-primary': branding.primaryColor,
    '--brand-accent': branding.accentColor,
    '--brand-background': branding.backgroundColor,
    '--brand-text': branding.textColor,
  };
}
