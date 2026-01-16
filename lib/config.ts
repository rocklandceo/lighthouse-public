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
  apiKey: string;
  /** Model to use for AI insights */
  model: string;
}

export interface CompetitorConfig {
  /** DataForSEO login */
  dataForSeoLogin: string;
  /** DataForSEO password */
  dataForSeoPassword: string;
  /** DataForSEO location code */
  locationCode: number;
  /** DataForSEO language code */
  languageCode: string;
}

export interface AnalyticsConfig {
  /** Google Analytics 4 property ID (e.g., "properties/123456789") */
  propertyId: string;
  /** Full service account JSON */
  serviceAccountJson: string;
}

export interface CIConfig {
  /** HMAC signing key for secure uploads */
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

export interface GitHubConfig {
  /** GitHub personal access token for triggering workflows */
  token: string | null;
  /** GitHub repository owner (username or org) */
  repoOwner: string | null;
  /** GitHub repository name */
  repoName: string | null;
  /** Vercel deploy hook URL for triggering redeploys */
  vercelDeployHook: string | null;
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
  github: GitHubConfig;
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
 * Get required environment variable as number or add to missing list
 */
function getRequiredNumber(name: string, missing: string[]): number {
  const value = process.env[name];
  if (!value) {
    missing.push(name);
    return 0;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    throw new Error(`CONFIGURATION ERROR: ${name} must be a number.`);
  }
  return parsed;
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
  const targetDomain = getRequired('TARGET_DOMAIN', missing);
  const dashboardUrl = getRequired('DASHBOARD_URL', missing);
  const nextAuthUrl = getRequired('NEXTAUTH_URL', missing);
  const nextAuthSecret = getRequired('NEXTAUTH_SECRET', missing);
  const googleClientId = getRequired('GOOGLE_CLIENT_ID', missing);
  const googleClientSecret = getRequired('GOOGLE_CLIENT_SECRET', missing);
  const kvRestApiUrl = getRequired('KV_REST_API_URL', missing);
  const kvRestApiToken = getRequired('KV_REST_API_TOKEN', missing);
  const anthropicApiKey = getRequired('ANTHROPIC_API_KEY', missing);
  const aiModel = getRequired('AI_MODEL', missing);
  const dataForSeoLogin = getRequired('DATAFORSEO_LOGIN', missing);
  const dataForSeoPassword = getRequired('DATAFORSEO_PASSWORD', missing);
  const dataForSeoLocationCode = getRequiredNumber('DATAFORSEO_LOCATION_CODE', missing);
  const dataForSeoLanguageCode = getRequired('DATAFORSEO_LANGUAGE_CODE', missing);
  const googleAnalyticsPropertyId = getRequired('GOOGLE_ANALYTICS_PROPERTY_ID', missing);
  const googleServiceAccountJson = getRequired('GOOGLE_SERVICE_ACCOUNT_JSON', missing);

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
      apiKey: anthropicApiKey,
      model: aiModel,
    },
    competitors: {
      dataForSeoLogin: dataForSeoLogin,
      dataForSeoPassword: dataForSeoPassword,
      locationCode: dataForSeoLocationCode,
      languageCode: dataForSeoLanguageCode,
    },
    analytics: {
      propertyId: googleAnalyticsPropertyId,
      serviceAccountJson: googleServiceAccountJson,
    },
    ci: {
      uploadSigningKey: getOptional('CI_UPLOAD_SIGNING_KEY') || null,
    },
    notifications: {
      slackWebhookUrl: getOptional('SLACK_WEBHOOK_URL') || null,
    },
    operational: {
      regressionThreshold: getOptionalNumber('REGRESSION_THRESHOLD', 10),
      keepRuns: getOptionalNumber('KEEP_RUNS', 10),
    },
    github: {
      token: getOptional('GITHUB_TOKEN') || null,
      repoOwner: getOptional('GITHUB_REPO_OWNER') || null,
      repoName: getOptional('GITHUB_REPO_NAME') || null,
      vercelDeployHook: getOptional('VERCEL_DEPLOY_HOOK') || null,
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
  return !!(cfg.analytics.propertyId && cfg.analytics.serviceAccountJson);
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
 * Check if GitHub workflow triggers are available
 */
export function isGitHubTriggerEnabled(): boolean {
  const cfg = getConfig();
  return !!(cfg.github.token && cfg.github.repoOwner && cfg.github.repoName);
}
