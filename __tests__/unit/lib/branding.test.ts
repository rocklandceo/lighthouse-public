import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('lib/branding', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getBranding', () => {
    it('returns default values when no env vars set', async () => {
      const { getBranding } = await import('@/lib/branding');
      const branding = getBranding();

      expect(branding.name).toBe('Lighthouse Dashboard');
      expect(branding.logoPath).toBe('/brand/logo.svg');
      expect(branding.faviconPath).toBe('/brand/favicon.svg');
      expect(branding.primaryColor).toBe('#0B3D91');
      expect(branding.accentColor).toBe('#B45309');
    });

    it('uses custom values from environment variables', async () => {
      process.env.NEXT_PUBLIC_BRAND_NAME = 'My Custom Dashboard';
      process.env.NEXT_PUBLIC_BRAND_LOGO_PATH = '/custom/logo.png';
      process.env.NEXT_PUBLIC_BRAND_PRIMARY = '#FF0000';

      const { getBranding } = await import('@/lib/branding');
      const branding = getBranding();

      expect(branding.name).toBe('My Custom Dashboard');
      expect(branding.logoPath).toBe('/custom/logo.png');
      expect(branding.primaryColor).toBe('#FF0000');
      // Unchanged defaults
      expect(branding.faviconPath).toBe('/brand/favicon.svg');
    });
  });

  describe('getBrandingCssVars', () => {
    it('returns CSS variable object with brand colors', async () => {
      const { getBrandingCssVars } = await import('@/lib/branding');
      const vars = getBrandingCssVars();

      expect(vars).toHaveProperty('--brand-primary');
      expect(vars).toHaveProperty('--brand-accent');
      expect(vars).toHaveProperty('--brand-background');
      expect(vars).toHaveProperty('--brand-text');
    });

    it('reflects custom color values', async () => {
      process.env.NEXT_PUBLIC_BRAND_PRIMARY = '#123456';
      process.env.NEXT_PUBLIC_BRAND_ACCENT = '#654321';

      const { getBrandingCssVars } = await import('@/lib/branding');
      const vars = getBrandingCssVars();

      expect(vars['--brand-primary']).toBe('#123456');
      expect(vars['--brand-accent']).toBe('#654321');
    });
  });
});
