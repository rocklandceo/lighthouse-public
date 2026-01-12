import { kv } from '@vercel/kv';
import type { AIInsightsResponse } from '@/lib/types/insights';
import type { RankedKeyword, DomainPageSummary, KeywordIdea } from '@/lib/dataforseo';

// Cache TTL settings (using Upstash Redis via Vercel KV)
export const CACHE_TTL = {
  AI_INSIGHTS: 60 * 60 * 4, // 4 hours - AI insights don't change frequently
  STALE_THRESHOLD: 60 * 60 * 2, // 2 hours - consider stale after this
  COMPETITOR_KEYWORDS: 60 * 60, // 1 hour - ranked keywords per competitor
  DOMAIN_PAGES: 60 * 60 * 4, // 4 hours - domain pages summary
  KEYWORD_IDEAS: 60 * 60, // 1 hour - keyword ideas per seed keyword
};

export const CACHE_KEYS = {
  AI_INSIGHTS: 'ai-insights:latest',
  AI_INSIGHTS_TIMESTAMP: 'ai-insights:timestamp',
  AI_INSIGHTS_GENERATING: 'ai-insights:generating',
  AI_INSIGHTS_HISTORY_LIST: 'ai-insights:history:list',
  COMPETITOR_DATA: 'competitor:data',
  COMPETITOR_TIMESTAMP: 'competitor:timestamp',
  COMPETITOR_CONFIG: 'competitor:config',
  // DataForSEO extended data (Tasks 34, 41, 42)
  COMPETITOR_KEYWORDS_PREFIX: 'competitor:keywords:', // + domain
  DOMAIN_PAGES_PREFIX: 'competitor:pages:', // + domain
  KEYWORD_IDEAS_PREFIX: 'competitor:ideas:', // + seedKeyword
};

// Note: Quick wins completion is now stored per-user with key format: quick-wins:completed:{userId}

// Historical settings
const HISTORY_MAX_ENTRIES = 10;
const HISTORY_TTL = 60 * 60 * 24 * 30; // 30 days

export interface CachedInsights {
  data: AIInsightsResponse;
  timestamp: number;
  isStale: boolean;
  isGenerating: boolean;
}

export interface HistoricalInsight {
  data: AIInsightsResponse;
  timestamp: number;
  date: string;
}

// Competitor analysis data structure (matches CompetitorAnalysisResponse from API)
export interface CompetitorAnalysisData {
  rankings?: {
    keyword: string;
    sitePosition: number | null;
    competitors: { domain: string; position: number }[];
    searchVolume: number;
    opportunity: 'high' | 'medium' | 'low';
    error?: string;
  }[];
  competitorProfiles?: {
    domain: string;
    organicTraffic: number;
    organicKeywords: number;
    error?: string;
  }[];
  contentGaps?: {
    keyword: string;
    searchVolume: number;
    difficulty: number;
    topCompetitor: string | null;
    topCompetitorPosition: number | null;
    suggestedAction: string;
  }[];
  keywordSuggestions?: {
    keyword: string;
    searchVolume: number;
    difficulty: number;
    cpc: number;
  }[];
  timestamp: string;
  errors?: string[];
}

/**
 * Get cached AI insights with staleness info
 */
export async function getCachedInsights(): Promise<CachedInsights | null> {
  try {
    const [data, timestamp, generating] = await Promise.all([
      kv.get<AIInsightsResponse>(CACHE_KEYS.AI_INSIGHTS),
      kv.get<number>(CACHE_KEYS.AI_INSIGHTS_TIMESTAMP),
      kv.get<boolean>(CACHE_KEYS.AI_INSIGHTS_GENERATING),
    ]);

    if (!data || !timestamp) {
      return null;
    }

    const now = Date.now();
    const age = (now - timestamp) / 1000; // age in seconds
    const isStale = age > CACHE_TTL.STALE_THRESHOLD;

    return {
      data,
      timestamp,
      isStale,
      isGenerating: generating || false,
    };
  } catch (error) {
    console.error('Cache read error:', error);
    return null;
  }
}

/**
 * Store AI insights in cache and history
 */
export async function setCachedInsights(data: AIInsightsResponse): Promise<void> {
  try {
    const timestamp = Date.now();
    const historyKey = `ai-insights:history:${timestamp}`;

    // Store current insights
    await Promise.all([
      kv.set(CACHE_KEYS.AI_INSIGHTS, data, { ex: CACHE_TTL.AI_INSIGHTS }),
      kv.set(CACHE_KEYS.AI_INSIGHTS_TIMESTAMP, timestamp, { ex: CACHE_TTL.AI_INSIGHTS }),
      kv.set(CACHE_KEYS.AI_INSIGHTS_GENERATING, false),
      // Store in history
      kv.set(historyKey, { data, timestamp, date: new Date(timestamp).toISOString() }, { ex: HISTORY_TTL }),
    ]);

    // Update history list (keep last N entries)
    await updateHistoryList(timestamp);
  } catch (error) {
    console.error('Cache write error:', error);
  }
}

/**
 * Update the history list, keeping only the most recent entries
 */
async function updateHistoryList(newTimestamp: number): Promise<void> {
  try {
    const historyList = await kv.get<number[]>(CACHE_KEYS.AI_INSIGHTS_HISTORY_LIST) || [];
    historyList.unshift(newTimestamp);

    // Keep only the most recent entries
    const trimmedList = historyList.slice(0, HISTORY_MAX_ENTRIES);

    // Remove old entries from cache
    const removedTimestamps = historyList.slice(HISTORY_MAX_ENTRIES);
    for (const ts of removedTimestamps) {
      await kv.del(`ai-insights:history:${ts}`);
    }

    await kv.set(CACHE_KEYS.AI_INSIGHTS_HISTORY_LIST, trimmedList, { ex: HISTORY_TTL });
  } catch (error) {
    console.error('History list update error:', error);
  }
}

/**
 * Get historical AI insights
 */
export async function getHistoricalInsights(): Promise<HistoricalInsight[]> {
  try {
    const historyList = await kv.get<number[]>(CACHE_KEYS.AI_INSIGHTS_HISTORY_LIST) || [];
    const insights: HistoricalInsight[] = [];

    for (const timestamp of historyList) {
      const entry = await kv.get<HistoricalInsight>(`ai-insights:history:${timestamp}`);
      if (entry) {
        insights.push(entry);
      }
    }

    return insights;
  } catch (error) {
    console.error('History read error:', error);
    return [];
  }
}

/**
 * Mark that AI insights are being generated
 */
export async function setGenerating(isGenerating: boolean): Promise<void> {
  try {
    await kv.set(CACHE_KEYS.AI_INSIGHTS_GENERATING, isGenerating, { ex: 300 }); // 5 min max
  } catch (error) {
    console.error('Cache generating flag error:', error);
  }
}

/**
 * Check if KV is available (for fallback handling)
 */
export async function isKVAvailable(): Promise<boolean> {
  try {
    await kv.ping();
    return true;
  } catch {
    return false;
  }
}

/**
 * Store competitor analysis data in cache
 */
export async function setCachedCompetitorData(data: CompetitorAnalysisData): Promise<void> {
  try {
    const timestamp = Date.now();
    await Promise.all([
      kv.set(CACHE_KEYS.COMPETITOR_DATA, data, { ex: CACHE_TTL.AI_INSIGHTS }),
      kv.set(CACHE_KEYS.COMPETITOR_TIMESTAMP, timestamp, { ex: CACHE_TTL.AI_INSIGHTS }),
    ]);
  } catch (error) {
    console.error('Competitor cache write error:', error);
  }
}

/**
 * Get cached competitor data if available
 */
export async function getCachedCompetitorData(): Promise<{ data: CompetitorAnalysisData; timestamp: number } | null> {
  try {
    const [data, timestamp] = await Promise.all([
      kv.get<CompetitorAnalysisData>(CACHE_KEYS.COMPETITOR_DATA),
      kv.get<number>(CACHE_KEYS.COMPETITOR_TIMESTAMP),
    ]);

    if (!data || !timestamp) {
      return null;
    }

    return { data, timestamp };
  } catch (error) {
    console.error('Competitor cache read error:', error);
    return null;
  }
}

// ============================================
// Competitor Configuration
// ============================================

export interface CompetitorConfig {
  competitors: string[];
  keywords: string[];
  lastUpdated: string;
}

/**
 * Get competitor configuration.
 * Returns empty arrays if no config is stored.
 * Users must configure competitors via the dashboard UI.
 */
export async function getCompetitorConfig(): Promise<CompetitorConfig> {
  try {
    const config = await kv.get<CompetitorConfig>(CACHE_KEYS.COMPETITOR_CONFIG);
    if (config) {
      return config;
    }
  } catch (error) {
    console.error('Competitor config read error:', error);
  }

  // Return empty config - user must configure via dashboard
  return {
    competitors: [],
    keywords: [],
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Save competitor configuration
 */
export async function setCompetitorConfig(config: Partial<CompetitorConfig>): Promise<CompetitorConfig> {
  try {
    const current = await getCompetitorConfig();
    const updated: CompetitorConfig = {
      competitors: config.competitors || current.competitors,
      keywords: config.keywords || current.keywords,
      lastUpdated: new Date().toISOString(),
    };

    // Store without expiration (persistent config)
    await kv.set(CACHE_KEYS.COMPETITOR_CONFIG, updated);

    return updated;
  } catch (error) {
    console.error('Competitor config write error:', error);
    throw error;
  }
}

// ============================================
// DataForSEO Extended Data (Tasks 34, 41, 42)
// ============================================

/**
 * Store ranked keywords for a competitor domain
 */
export async function setCachedCompetitorKeywords(
  domain: string,
  keywords: RankedKeyword[]
): Promise<void> {
  try {
    const key = `${CACHE_KEYS.COMPETITOR_KEYWORDS_PREFIX}${domain}`;
    await kv.set(key, keywords, { ex: CACHE_TTL.COMPETITOR_KEYWORDS });
  } catch (error) {
    console.error(`Failed to cache competitor keywords for ${domain}:`, error);
  }
}

/**
 * Get cached ranked keywords for a competitor domain
 */
export async function getCachedCompetitorKeywords(
  domain: string
): Promise<RankedKeyword[] | null> {
  try {
    const key = `${CACHE_KEYS.COMPETITOR_KEYWORDS_PREFIX}${domain}`;
    return await kv.get<RankedKeyword[]>(key);
  } catch (error) {
    console.error(`Failed to get cached competitor keywords for ${domain}:`, error);
    return null;
  }
}

/**
 * Store domain pages summary
 */
export async function setCachedDomainPages(
  domain: string,
  pages: DomainPageSummary[]
): Promise<void> {
  try {
    const key = `${CACHE_KEYS.DOMAIN_PAGES_PREFIX}${domain}`;
    await kv.set(key, pages, { ex: CACHE_TTL.DOMAIN_PAGES });
  } catch (error) {
    console.error(`Failed to cache domain pages for ${domain}:`, error);
  }
}

/**
 * Get cached domain pages summary
 */
export async function getCachedDomainPages(
  domain: string
): Promise<DomainPageSummary[] | null> {
  try {
    const key = `${CACHE_KEYS.DOMAIN_PAGES_PREFIX}${domain}`;
    return await kv.get<DomainPageSummary[]>(key);
  } catch (error) {
    console.error(`Failed to get cached domain pages for ${domain}:`, error);
    return null;
  }
}

/**
 * Store keyword ideas for a seed keyword
 */
export async function setCachedKeywordIdeas(
  seedKeyword: string,
  ideas: KeywordIdea[]
): Promise<void> {
  try {
    const key = `${CACHE_KEYS.KEYWORD_IDEAS_PREFIX}${seedKeyword.toLowerCase().replace(/\s+/g, '-')}`;
    await kv.set(key, ideas, { ex: CACHE_TTL.KEYWORD_IDEAS });
  } catch (error) {
    console.error(`Failed to cache keyword ideas for "${seedKeyword}":`, error);
  }
}

/**
 * Get cached keyword ideas for a seed keyword
 */
export async function getCachedKeywordIdeas(
  seedKeyword: string
): Promise<KeywordIdea[] | null> {
  try {
    const key = `${CACHE_KEYS.KEYWORD_IDEAS_PREFIX}${seedKeyword.toLowerCase().replace(/\s+/g, '-')}`;
    return await kv.get<KeywordIdea[]>(key);
  } catch (error) {
    console.error(`Failed to get cached keyword ideas for "${seedKeyword}":`, error);
    return null;
  }
}

// ============================================
// Lighthouse Report Storage
// ============================================

// Report storage settings
const REPORTS_MAX_RUNS = 30; // Keep last 30 runs
const REPORTS_TTL = 60 * 60 * 24 * 60; // 60 days retention

// Report cache keys
export const REPORT_CACHE_KEYS = {
  LATEST: 'reports:latest',
  RUNS_LIST: 'reports:runs:list',
  RUN_PREFIX: 'reports:runs:',
};

// Score interfaces (matching reports.ts)
export interface LighthouseScore {
  performance: number;
  accessibility: number;
  'best-practices': number;
  seo: number;
}

export interface DeviceScores {
  mobile?: LighthouseScore;
  desktop?: LighthouseScore;
}

export interface StoredReportData {
  timestamp: string;
  scores: DeviceScores;
  url: string;
}

export interface StoredPageScore {
  path: string;
  url: string;
  scores: DeviceScores;
}

export interface StoredReportRun {
  timestamp: string; // Format: YYYYMMDD-HHMMSS
  date: string; // ISO date string
  reports: StoredReportData[];
  pageScores?: StoredPageScore[];
}

export interface LatestReportData {
  timestamp: string;
  scores: DeviceScores;
  pageScores: StoredPageScore[];
  updatedAt: string;
}

/**
 * Store the latest report data (from CI scans)
 */
export async function storeLatestReport(data: LatestReportData): Promise<void> {
  try {
    await kv.set(REPORT_CACHE_KEYS.LATEST, data);
    console.log('Stored latest report data');
  } catch (error) {
    console.error('Failed to store latest report:', error);
    throw error;
  }
}

/**
 * Get the latest report data
 */
export async function getLatestReport(): Promise<LatestReportData | null> {
  try {
    return await kv.get<LatestReportData>(REPORT_CACHE_KEYS.LATEST);
  } catch (error) {
    console.error('Failed to get latest report:', error);
    return null;
  }
}

/**
 * Store a historical report run
 */
export async function storeReportRun(run: StoredReportRun): Promise<void> {
  try {
    const runKey = `${REPORT_CACHE_KEYS.RUN_PREFIX}${run.timestamp}`;

    // Store the run data
    await kv.set(runKey, run, { ex: REPORTS_TTL });

    // Update the runs list
    await updateReportRunsList(run.timestamp);

    console.log(`Stored report run: ${run.timestamp}`);
  } catch (error) {
    console.error('Failed to store report run:', error);
    throw error;
  }
}

/**
 * Update the list of historical runs, keeping only recent ones
 */
async function updateReportRunsList(newTimestamp: string): Promise<void> {
  try {
    const runsList = await kv.get<string[]>(REPORT_CACHE_KEYS.RUNS_LIST) || [];

    // Add new timestamp if not already present
    if (!runsList.includes(newTimestamp)) {
      runsList.unshift(newTimestamp);
    }

    // Sort by timestamp (newest first)
    runsList.sort((a, b) => b.localeCompare(a));

    // Keep only the most recent runs
    const trimmedList = runsList.slice(0, REPORTS_MAX_RUNS);

    // Delete old runs that are being removed
    const removedTimestamps = runsList.slice(REPORTS_MAX_RUNS);
    for (const ts of removedTimestamps) {
      await kv.del(`${REPORT_CACHE_KEYS.RUN_PREFIX}${ts}`);
    }

    await kv.set(REPORT_CACHE_KEYS.RUNS_LIST, trimmedList, { ex: REPORTS_TTL });
  } catch (error) {
    console.error('Failed to update runs list:', error);
    throw error;
  }
}

/**
 * Get list of historical run timestamps
 */
export async function getReportRunsList(): Promise<string[]> {
  try {
    return await kv.get<string[]>(REPORT_CACHE_KEYS.RUNS_LIST) || [];
  } catch (error) {
    console.error('Failed to get runs list:', error);
    return [];
  }
}

/**
 * Get a specific historical run
 */
export async function getReportRun(timestamp: string): Promise<StoredReportRun | null> {
  try {
    return await kv.get<StoredReportRun>(`${REPORT_CACHE_KEYS.RUN_PREFIX}${timestamp}`);
  } catch (error) {
    console.error(`Failed to get report run ${timestamp}:`, error);
    return null;
  }
}

/**
 * Get all historical runs
 */
export async function getAllReportRuns(): Promise<StoredReportRun[]> {
  try {
    const runsList = await getReportRunsList();
    const runs: StoredReportRun[] = [];

    for (const timestamp of runsList) {
      const run = await getReportRun(timestamp);
      if (run) {
        runs.push(run);
      }
    }

    return runs;
  } catch (error) {
    console.error('Failed to get all report runs:', error);
    return [];
  }
}

// ============================================
// Security: Replay Protection and Rate Limiting
// ============================================

/**
 * Security cache key prefixes
 */
export const SECURITY_CACHE_KEYS = {
  /** Prefix for nonce storage (replay protection) */
  NONCE_PREFIX: 'nonce:',
  /** Prefix for rate limit counters */
  RATE_LIMIT_PREFIX: 'ratelimit:',
};

/** TTL for nonce storage (5 minutes) */
const NONCE_TTL = 60 * 5;

/**
 * Check if a nonce has been used and store it if not.
 * Used for replay attack protection.
 *
 * @param nonce - Unique request identifier
 * @returns true if nonce is new (request is valid), false if already used
 */
export async function checkAndStoreNonce(nonce: string): Promise<boolean> {
  try {
    const key = `${SECURITY_CACHE_KEYS.NONCE_PREFIX}${nonce}`;

    // Try to set the nonce with NX flag (only set if not exists)
    // This is atomic - if it succeeds, the nonce wasn't used before
    const result = await kv.set(key, Date.now(), { ex: NONCE_TTL, nx: true });

    // If result is null or 'OK' depends on the redis client
    // @vercel/kv returns 'OK' on success, null if key already exists
    return result === 'OK';
  } catch (error) {
    console.error('Nonce check error:', error);
    // On error, reject the request for safety
    return false;
  }
}

/**
 * Check and increment rate limit counter.
 * Uses a sliding window approach with KV TTL.
 *
 * @param identifier - Unique identifier (e.g., hashed IP address)
 * @param limit - Maximum requests allowed in the window
 * @param windowSeconds - Time window in seconds
 * @returns true if under limit (request allowed), false if rate limited
 */
export async function checkRateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  try {
    const key = `${SECURITY_CACHE_KEYS.RATE_LIMIT_PREFIX}${identifier}`;
    const now = Date.now();

    // Get current count
    const current = await kv.get<number>(key);

    if (current === null) {
      // First request in window - set counter to 1 with TTL
      await kv.set(key, 1, { ex: windowSeconds });
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: now + windowSeconds * 1000,
      };
    }

    if (current >= limit) {
      // Rate limit exceeded
      const ttl = await kv.ttl(key);
      return {
        allowed: false,
        remaining: 0,
        resetAt: now + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000),
      };
    }

    // Increment counter
    const newCount = await kv.incr(key);
    const ttl = await kv.ttl(key);

    return {
      allowed: true,
      remaining: Math.max(0, limit - newCount),
      resetAt: now + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000),
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow the request but log the issue
    return {
      allowed: true,
      remaining: limit,
      resetAt: Date.now() + windowSeconds * 1000,
    };
  }
}

/**
 * Hash an IP address for storage (privacy-preserving)
 */
export function hashIdentifier(identifier: string): string {
  // Use a simple hash for privacy - we don't need cryptographic strength here
  // Just need consistent mapping for rate limiting
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    const char = identifier.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `ip-${Math.abs(hash).toString(16)}`;
}
