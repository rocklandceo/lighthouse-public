import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// We need to test configuration loading, so we'll mock process.env
// and reset the module between tests

describe('lib/config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('throws error when required variables are missing', async () => {
      // Set only some required variables
      process.env.TARGET_BASE_URL = 'https://example.com';
      // Missing: DASHBOARD_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, etc.

      const { loadConfig } = await import('@/lib/config');

      expect(() => loadConfig()).toThrow('CONFIGURATION ERROR');
    });

    it('loads config successfully with all required variables', async () => {
      // Set all required environment variables
      process.env.TARGET_BASE_URL = 'https://example.com';
      process.env.DASHBOARD_URL = 'https://dashboard.example.com';
      process.env.NEXTAUTH_SECRET = 'test-secret-at-least-32-chars-long';
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
      process.env.KV_REST_API_URL = 'https://kv.example.com';
      process.env.KV_REST_API_TOKEN = 'test-kv-token';

      const { loadConfig } = await import('@/lib/config');
      const config = loadConfig();

      expect(config.app.targetBaseUrl).toBe('https://example.com');
      expect(config.app.targetDomain).toBe('example.com');
      expect(config.app.dashboardUrl).toBe('https://dashboard.example.com');
    });

    it('extracts domain from URL correctly', async () => {
      process.env.TARGET_BASE_URL = 'https://www.example.com/path';
      process.env.DASHBOARD_URL = 'https://dashboard.example.com';
      process.env.NEXTAUTH_SECRET = 'test-secret-at-least-32-chars-long';
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
      process.env.KV_REST_API_URL = 'https://kv.example.com';
      process.env.KV_REST_API_TOKEN = 'test-kv-token';

      const { loadConfig } = await import('@/lib/config');
      const config = loadConfig();

      // Should strip www. prefix
      expect(config.app.targetDomain).toBe('example.com');
    });

    it('uses default values for optional variables', async () => {
      process.env.TARGET_BASE_URL = 'https://example.com';
      process.env.DASHBOARD_URL = 'https://dashboard.example.com';
      process.env.NEXTAUTH_SECRET = 'test-secret-at-least-32-chars-long';
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
      process.env.KV_REST_API_URL = 'https://kv.example.com';
      process.env.KV_REST_API_TOKEN = 'test-kv-token';

      const { loadConfig } = await import('@/lib/config');
      const config = loadConfig();

      expect(config.app.name).toBe('Lighthouse Dashboard');
      expect(config.app.sitemapUrl).toBe('https://example.com/sitemap.xml');
      expect(config.ai.model).toBe('claude-3-5-haiku-20241022');
    });
  });

  describe('feature availability checks', () => {
    beforeEach(() => {
      // Reset modules to clear the config singleton
      vi.resetModules();
      // Set minimum required variables for config to load
      process.env.TARGET_BASE_URL = 'https://example.com';
      process.env.DASHBOARD_URL = 'https://dashboard.example.com';
      process.env.NEXTAUTH_SECRET = 'test-secret-at-least-32-chars-long';
      process.env.GOOGLE_CLIENT_ID = 'test-client-id';
      process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
      process.env.KV_REST_API_URL = 'https://kv.example.com';
      process.env.KV_REST_API_TOKEN = 'test-kv-token';
      // Explicitly unset optional keys
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.DATAFORSEO_LOGIN;
      delete process.env.DATAFORSEO_PASSWORD;
    });

    it('isAIEnabled returns false when API key not set', async () => {
      const { isAIEnabled } = await import('@/lib/config');
      expect(isAIEnabled()).toBe(false);
    });

    it('isAIEnabled returns true when API key is set', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-api-key';
      const { isAIEnabled } = await import('@/lib/config');
      expect(isAIEnabled()).toBe(true);
    });

    it('isCompetitorAnalysisEnabled returns false when credentials not set', async () => {
      const { isCompetitorAnalysisEnabled } = await import('@/lib/config');
      expect(isCompetitorAnalysisEnabled()).toBe(false);
    });

    it('isCompetitorAnalysisEnabled returns true when both credentials set', async () => {
      process.env.DATAFORSEO_LOGIN = 'test-login';
      process.env.DATAFORSEO_PASSWORD = 'test-password';
      const { isCompetitorAnalysisEnabled } = await import('@/lib/config');
      expect(isCompetitorAnalysisEnabled()).toBe(true);
    });

    it('isCompetitorAnalysisEnabled returns false when only login set', async () => {
      process.env.DATAFORSEO_LOGIN = 'test-login';
      const { isCompetitorAnalysisEnabled } = await import('@/lib/config');
      expect(isCompetitorAnalysisEnabled()).toBe(false);
    });
  });
});
