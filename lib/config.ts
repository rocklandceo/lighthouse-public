/**
 * Centralized Configuration Module
 *
 * This module provides a single source of truth for all environment variables
 * used throughout the application. It validates required variables at startup
 * and fails fast with clear error messages.
 *
 * Usage:
 *   import { config } from '@/lib/config';
 *   const domain = config.app.targetDomain;
 *
 * For scripts (ESM):
 *   import { loadConfig } from '../lib/config.mjs';
 *   const config = loadConfig();
 */

// ============================================
// Type Definitions
// ============================================

export interface AppConfig {
  /** Application name for branding */
  name: string;
  /** Target domain without protocol (e.g., "example.com") */
  targetDomain: string;
  /** Target base URL with protocol (e.g., "https://example.com") */
  targetBaseUrl: string;
  /** URL of this dashboard (e.g., "https://lighthouse.example.com") */
  dashboardUrl: string;
  /** Sitemap URL for URL extraction */
  sitemapUrl: string;
  /** Optional description for AI context */
  siteDescription: string | null;
}

export interface AuthConfig {
  /** Google OAuth client ID */
  googleClientId: string;
  /** Google OAuth client secret */
  googleClientSecret: string;
  /** NextAuth secret for JWT signing */
  nextAuthSecret: string;
  /** NextAuth URL (usually same as dashboard URL) */
  nextAuthUrl: string;
  /** If set, restricts auth to this email domain (e.g., "example.com"). Null = allow all. */
  allowedEmailDomain: string | null;
}

export interface KVConfig {
  /** Vercel KV REST API URL */
  restApiUrl: string;
  /** Vercel KV REST API token */
  restApiToken: string;
}

export interface AIConfig {
  /** Anthropic API key */
  apiKey: string | null;
  /** Model to use for AI insights */
  model: string;
}

export interface CompetitorConfig {
  /** DataForSEO login */
  dataForSeoLogin: string | null;
  /** DataForSEO password */
  dataForSeoPassword: string | null;
  /** DataForSEO location code (default: 2840 = USA) */
  locationCode: number;
  /** DataForSEO language code (default: 'en' = English) */
  languageCode: string;
}

export interface AnalyticsConfig {
  /** Google Analytics 4 property ID (e.g., "properties/123456789") */
  propertyId: string | null;
  /** Full service account JSON (preferred) */
  serviceAccountJson: string | null;
  /** Service account email (fallback) */
  serviceAccountEmail: string | null;
  /** Service account private key (fallback) */
  serviceAccountPrivateKey: string | null;
}

export interface CIConfig {
  /** Legacy upload secret (Bearer token auth) */
  uploadSecret: string | null;
  /** HMAC signing key for secure uploads (preferred) */
  uploadSigningKey: string | null;
}

export interface NotificationConfig {
  /** Slack webhook URL for notifications */
  slackWebhookUrl: string | null;
}

export interface OperationalConfig {
  /** Score drop threshold for regression alerts (default: 5) */
  regressionThreshold: number;
  /** Number of historical runs to keep (default: 10) */
  keepRuns: number;
}

export interface Config {
  app: AppConfig;
  auth: AuthConfig;
  kv: KVConfig;
  ai: AIConfig;
  competitors: CompetitorConfig;
  analytics: AnalyticsConfig;
  ci: CIConfig;
  notifications: NotificationConfig;
  operational: OperationalConfig;
}

// ============================================
// Validation Helpers
// ============================================

/**
 * Get required environment variable or add to missing list
 */
function getRequired(name: string, missing: string[]): string {
  const value = process.env[name];
  if (!value) {
    missing.push(name);
    return '';
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
function getOptional(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

/**
 * Get optional environment variable as number
 */
function getOptionalNumber(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Parse domain from URL
 */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

// ============================================
// Configuration Loading
// ============================================

/**
 * Load and validate configuration from environment variables.
 * Throws an error if required variables are missing.
 */
export function loadConfig(): Config {
  const missing: string[] = [];

  // Required variables
  const targetBaseUrl = getRequired('TARGET_BASE_URL', missing);
  const dashboardUrl = getRequired('DASHBOARD_URL', missing);
  const nextAuthUrl = getOptional('NEXTAUTH_URL', dashboardUrl);
  const nextAuthSecret = getRequired('NEXTAUTH_SECRET', missing);
  const googleClientId = getRequired('GOOGLE_CLIENT_ID', missing);
  const googleClientSecret = getRequired('GOOGLE_CLIENT_SECRET', missing);
  const kvRestApiUrl = getRequired('KV_REST_API_URL', missing);
  const kvRestApiToken = getRequired('KV_REST_API_TOKEN', missing);

  // Fail fast if required variables are missing
  if (missing.length > 0) {
    const message = [
      '================================================================',
      'CONFIGURATION ERROR: Missing required environment variables',
      '================================================================',
      '',
      'The following required variables are not set:',
      ...missing.map(name => `  - ${name}`),
      '',
      'Please create a .env.local file or set these in your Vercel project.',
      'See .env.example for documentation on all variables.',
      '',
      '================================================================',
    ].join('\n');

    throw new Error(message);
  }

  // Derive target domain from URL if not explicitly set
  const targetDomain = getOptional('TARGET_DOMAIN') || extractDomain(targetBaseUrl);

  // Build config object
  const config: Config = {
    app: {
      name: getOptional('APP_NAME', 'Lighthouse Dashboard'),
      targetDomain,
      targetBaseUrl,
      dashboardUrl,
      sitemapUrl: getOptional('SITEMAP_URL', `${targetBaseUrl}/sitemap.xml`),
      siteDescription: getOptional('SITE_DESCRIPTION') || null,
    },
    auth: {
      googleClientId,
      googleClientSecret,
      nextAuthSecret,
      nextAuthUrl,
      allowedEmailDomain: getOptional('ALLOWED_EMAIL_DOMAIN') || null,
    },
    kv: {
      restApiUrl: kvRestApiUrl,
      restApiToken: kvRestApiToken,
    },
    ai: {
      apiKey: getOptional('ANTHROPIC_API_KEY') || null,
      model: getOptional('AI_MODEL', 'claude-3-5-haiku-20241022'),
    },
    competitors: {
      dataForSeoLogin: getOptional('DATAFORSEO_LOGIN') || null,
      dataForSeoPassword: getOptional('DATAFORSEO_PASSWORD') || null,
      locationCode: getOptionalNumber('DATAFORSEO_LOCATION_CODE', 2840), // Default: USA
      languageCode: getOptional('DATAFORSEO_LANGUAGE_CODE', 'en'), // Default: English
    },
    analytics: {
      propertyId: getOptional('GOOGLE_ANALYTICS_PROPERTY_ID') || null,
      serviceAccountJson: getOptional('GOOGLE_SERVICE_ACCOUNT_JSON') || null,
      serviceAccountEmail: getOptional('GOOGLE_SERVICE_ACCOUNT_EMAIL') || null,
      serviceAccountPrivateKey: getOptional('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY') || null,
    },
    ci: {
      uploadSecret: getOptional('CI_UPLOAD_SECRET') || null,
      uploadSigningKey: getOptional('CI_UPLOAD_SIGNING_KEY') || null,
    },
    notifications: {
      slackWebhookUrl: getOptional('SLACK_WEBHOOK_URL') || null,
    },
    operational: {
      regressionThreshold: getOptionalNumber('REGRESSION_THRESHOLD', 5),
      keepRuns: getOptionalNumber('KEEP_RUNS', 10),
    },
  };

  return Object.freeze(config) as Config;
}

// ============================================
// Singleton Export
// ============================================

/**
 * Singleton config instance.
 * Loaded once at module initialization.
 *
 * Note: This will throw at startup if required variables are missing,
 * which is the desired "fail fast" behavior.
 */
let _config: Config | null = null;

/**
 * Get the config singleton.
 * Lazily initializes on first access to avoid issues with build-time evaluation.
 */
export function getConfig(): Config {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * Convenience export for common usage pattern.
 * Use this in server components and API routes.
 *
 * Note: Accessing this at module top-level may cause build errors
 * if env vars aren't available at build time. In that case, use
 * getConfig() inside your function body instead.
 */
export const config = new Proxy({} as Config, {
  get(_target, prop) {
    return getConfig()[prop as keyof Config];
  },
});

// ============================================
// Feature Availability Checks
// ============================================

/**
 * Check if AI insights feature is available
 */
export function isAIEnabled(): boolean {
  return !!getConfig().ai.apiKey;
}

/**
 * Check if competitor analysis feature is available
 */
export function isCompetitorAnalysisEnabled(): boolean {
  const cfg = getConfig();
  return !!(cfg.competitors.dataForSeoLogin && cfg.competitors.dataForSeoPassword);
}

/**
 * Check if Google Analytics integration is available
 */
export function isAnalyticsEnabled(): boolean {
  const cfg = getConfig();
  return !!(
    cfg.analytics.propertyId &&
    (cfg.analytics.serviceAccountJson ||
      (cfg.analytics.serviceAccountEmail && cfg.analytics.serviceAccountPrivateKey))
  );
}

/**
 * Check if Slack notifications are available
 */
export function isSlackEnabled(): boolean {
  return !!getConfig().notifications.slackWebhookUrl;
}

/**
 * Check if secure upload (HMAC) is available
 */
export function isSecureUploadEnabled(): boolean {
  return !!getConfig().ci.uploadSigningKey;
}

/**
 * Check if legacy upload (Bearer token) is available
 */
export function isLegacyUploadEnabled(): boolean {
  return !!getConfig().ci.uploadSecret;
}
