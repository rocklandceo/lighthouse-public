// Native fetch is available in Next.js 16+ (Node.js 18+)

import { getConfig, isCompetitorAnalysisEnabled } from '@/lib/config';

const DATAFORSEO_BASE_URL = 'https://api.dataforseo.com/v3';

interface DataForSEOCredentials {
  login: string;
  password: string;
}

// DataForSEO API response interfaces
interface DataForSEOTask<T = unknown> {
  id: string;
  status_code: number;
  status_message: string;
  result?: T[];
}

interface DataForSEOResponse<T = unknown> {
  status_code: number;
  status_message: string;
  tasks?: DataForSEOTask<T>[];
}

// SERP item from Google organic results
interface SERPItem {
  type: string;
  domain: string;
  rank_absolute: number;
  url: string;
  title: string;
}

// SERP result container (nested in result array)
interface SERPResultContainer {
  items?: SERPItem[];
}

// Keyword data item from Google Ads API
interface KeywordDataItem {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  competition_level: 'LOW' | 'MEDIUM' | 'HIGH';
  monthly_searches?: { search_volume: number }[];
}

// Keyword suggestion item
interface KeywordSuggestionItem {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
}

// On-page audit result item
interface OnPageSummaryResult {
  crawl_progress?: { pages_crawled: number };
  page_metrics?: {
    checks?: { failed_checks_percentage: number };
    broken_resources?: number;
    duplicate_title?: number;
    no_description?: number;
  };
}

// Domain rank overview result
interface DomainRankOverviewResult {
  metrics?: {
    organic?: {
      etv?: number;
      count?: number;
      pos_1?: number;
    };
  };
}

// Competitors domain result item (for content gap analysis)
interface CompetitorsDomainResultItem {
  keyword: string;
  relevant_serp_items?: Array<{
    se_results_count: string;
    rank_absolute: number;
  }>;
  keyword_data?: {
    keyword_info?: {
      search_volume?: number;
      competition?: number;
    };
  };
}

function getCredentials(): DataForSEOCredentials {
  const config = getConfig();
  const login = config.competitors.dataForSeoLogin;
  const password = config.competitors.dataForSeoPassword;

  if (!login || !password) {
    throw new Error(
      'DataForSEO credentials not configured. ' +
        'Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables.'
    );
  }

  return { login, password };
}

/**
 * Get configured location and language codes for DataForSEO API calls.
 * Defaults: USA (2840) and English ('en').
 * Configure via DATAFORSEO_LOCATION_CODE and DATAFORSEO_LANGUAGE_CODE.
 */
function getLocationConfig(): { locationCode: number; languageCode: string } {
  const config = getConfig();
  return {
    locationCode: config.competitors.locationCode,
    languageCode: config.competitors.languageCode,
  };
}

/**
 * Check if DataForSEO is available before making API calls.
 * Use this to conditionally show/hide competitor analysis features.
 */
export { isCompetitorAnalysisEnabled };

function getAuthHeader(): string {
  const { login, password } = getCredentials();
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
}

async function makeRequest<T = unknown>(endpoint: string, body: object): Promise<DataForSEOResponse<T>> {
  const response = await fetch(`${DATAFORSEO_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': getAuthHeader(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([body]),
  });

  if (!response.ok) {
    throw new Error(`DataForSEO API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as DataForSEOResponse<T>;

  if (data.status_code !== 20000) {
    throw new Error(`DataForSEO error: ${data.status_message}`);
  }

  return data;
}

// ============================================
// SERP Analysis
// ============================================

export interface SERPResult {
  keyword: string;
  position: number | null;
  url: string | null;
  title: string | null;
  competitors: {
    domain: string;
    position: number;
    url: string;
    title: string;
  }[];
  searchVolume: number;
  difficulty: number;
  cpc: number;
  error?: string; // Indicates API failure for this keyword
}

export async function checkKeywordRankings(
  domain: string,
  keywords: string[],
  locationCode: number = 2840, // USA
  languageCode: string = 'en'
): Promise<SERPResult[]> {
  const results: SERPResult[] = [];

  for (const keyword of keywords) {
    try {
      const data = await makeRequest<SERPResultContainer>('/serp/google/organic/live/regular', {
        keyword,
        location_code: locationCode,
        language_code: languageCode,
        depth: 20,
      });

      const items: SERPItem[] = data.tasks?.[0]?.result?.[0]?.items || [];
      const domainResult = items.find((item) =>
        item.domain?.includes(domain.replace('www.', ''))
      );

      const competitors = items
        .filter((item) => item.type === 'organic')
        .slice(0, 10)
        .map((item) => ({
          domain: item.domain,
          position: item.rank_absolute,
          url: item.url,
          title: item.title,
        }));

      results.push({
        keyword,
        position: domainResult?.rank_absolute || null,
        url: domainResult?.url || null,
        title: domainResult?.title || null,
        competitors,
        searchVolume: 0, // Will be populated by keyword data
        difficulty: 0,
        cpc: 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to check ranking for "${keyword}":`, error);
      results.push({
        keyword,
        position: null,
        url: null,
        title: null,
        competitors: [],
        searchVolume: 0,
        difficulty: 0,
        cpc: 0,
        error: `API failed: ${errorMessage}`,
      });
    }
  }

  return results;
}

// ============================================
// Keyword Research
// ============================================

export interface KeywordData {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  competitionLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  trend: number[];
}

export async function getKeywordData(
  keywords: string[],
  locationCode: number = 2840,
  languageCode: string = 'en'
): Promise<KeywordData[]> {
  const data = await makeRequest<KeywordDataItem>('/keywords_data/google_ads/search_volume/live', {
    keywords,
    location_code: locationCode,
    language_code: languageCode,
  });

  const results: KeywordDataItem[] = data.tasks?.[0]?.result || [];

  return results.map((item) => ({
    keyword: item.keyword,
    searchVolume: item.search_volume || 0,
    cpc: item.cpc || 0,
    competition: item.competition || 0,
    competitionLevel: item.competition_level || 'MEDIUM',
    trend: item.monthly_searches?.map((m) => m.search_volume) || [],
  }));
}

export interface KeywordSuggestion {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  difficulty: number;
}

export async function getKeywordSuggestions(
  seedKeyword: string,
  locationCode: number = 2840,
  languageCode: string = 'en',
  limit: number = 50
): Promise<KeywordSuggestion[]> {
  // Note: The keywords_for_keywords endpoint doesn't support a 'limit' parameter
  // Results are filtered client-side instead
  const data = await makeRequest<KeywordSuggestionItem>('/keywords_data/google_ads/keywords_for_keywords/live', {
    keywords: [seedKeyword],
    location_code: locationCode,
    language_code: languageCode,
  });

  const results: KeywordSuggestionItem[] = data.tasks?.[0]?.result || [];

  // Apply limit on client side since API doesn't support limit parameter
  return results.slice(0, limit).map((item) => ({
    keyword: item.keyword,
    searchVolume: item.search_volume || 0,
    cpc: item.cpc || 0,
    competition: item.competition || 0,
    difficulty: Math.round((item.competition || 0) * 100),
  }));
}

// ============================================
// Competitor Analysis
// ============================================

export interface CompetitorDomain {
  domain: string;
  organicTraffic: number;
  organicKeywords: number;
  domainRank: number;
  error?: string; // Indicates API failure for this domain
}

export async function getCompetitorOverview(
  competitors: string[]
): Promise<CompetitorDomain[]> {
  const results: CompetitorDomain[] = [];
  const { locationCode, languageCode } = getLocationConfig();

  for (const domain of competitors) {
    try {
      // Use domain_rank_overview endpoint instead of domain_metrics_by_categories
      // which requires different parameters (category_codes, dates)
      const data = await makeRequest<DomainRankOverviewResult>('/dataforseo_labs/google/domain_rank_overview/live', {
        target: domain,
        location_code: locationCode,
        language_code: languageCode,
      });

      const metrics = data.tasks?.[0]?.result?.[0]?.metrics?.organic ?? {};

      results.push({
        domain,
        organicTraffic: metrics.etv || 0,
        organicKeywords: metrics.count || 0,
        domainRank: metrics.pos_1 || 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to get metrics for ${domain}:`, error);
      results.push({
        domain,
        organicTraffic: 0,
        organicKeywords: 0,
        domainRank: 0,
        error: `API failed: ${errorMessage}`,
      });
    }
  }

  return results;
}

// ============================================
// Content Gap Analysis
// ============================================

export interface ContentGap {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  yourPosition: number | null;
  competitorPositions: { [domain: string]: number };
  opportunity: 'high' | 'medium' | 'low';
}

export async function getContentGaps(
  yourDomain: string,
  competitorDomains: string[],
  limit: number = 50
): Promise<ContentGap[]> {
  const { locationCode, languageCode } = getLocationConfig();

  // Get keywords where competitors rank but you don't
  // Note: Removed filters as they were causing "Invalid Field" errors
  // The filtering is now done client-side for reliability
  const data = await makeRequest<CompetitorsDomainResultItem>('/dataforseo_labs/google/competitors_domain/live', {
    target: yourDomain,
    location_code: locationCode,
    language_code: languageCode,
    limit,
  });

  const results = data.tasks?.[0]?.result ?? [];
  const gaps: ContentGap[] = [];

  for (const item of results) {
    const competitorPositions: { [domain: string]: number } = {};
    let yourPosition: number | null = null;

    // Parse SERP items to find positions
    for (const serpItem of item.relevant_serp_items || []) {
      const domain = serpItem.se_results_count;
      if (competitorDomains.some(c => domain?.includes(c))) {
        competitorPositions[domain] = serpItem.rank_absolute;
      }
      if (domain?.includes(yourDomain)) {
        yourPosition = serpItem.rank_absolute;
      }
    }

    // Client-side filter: Only include keywords with search volume > 100
    const searchVolume = item.keyword_data?.keyword_info?.search_volume || 0;
    if (searchVolume < 100) continue;

    // Only include if competitors rank and we don't (or rank poorly)
    if (Object.keys(competitorPositions).length > 0 && (!yourPosition || yourPosition > 20)) {
      const avgCompetitorPos = Object.values(competitorPositions).reduce((a, b) => a + b, 0) /
        Object.values(competitorPositions).length;

      gaps.push({
        keyword: item.keyword,
        searchVolume,
        difficulty: Math.round((item.keyword_data?.keyword_info?.competition || 0) * 100),
        yourPosition,
        competitorPositions,
        opportunity: avgCompetitorPos <= 5 ? 'high' : avgCompetitorPos <= 10 ? 'medium' : 'low',
      });
    }
  }

  // Sort by opportunity and search volume
  return gaps.sort((a, b) => {
    const opportunityOrder = { high: 0, medium: 1, low: 2 };
    if (opportunityOrder[a.opportunity] !== opportunityOrder[b.opportunity]) {
      return opportunityOrder[a.opportunity] - opportunityOrder[b.opportunity];
    }
    return b.searchVolume - a.searchVolume;
  });
}

// ============================================
// On-Page SEO Analysis
// ============================================

export interface OnPageAudit {
  crawledPages: number;
  healthScore: number;
  issues: {
    critical: number;
    warning: number;
    notice: number;
  };
  topIssues: {
    type: string;
    count: number;
    severity: 'critical' | 'warning' | 'notice';
    description: string;
  }[];
}

export async function runOnPageAudit(domain: string): Promise<string> {
  // This creates a task - results need to be fetched later
  const data = await makeRequest('/on_page/task_post', {
    target: domain,
    max_crawl_pages: 100,
    load_resources: true,
    enable_javascript: true,
    custom_js: null,
  });

  const taskId = data.tasks?.[0]?.id;
  if (!taskId) {
    throw new Error('Failed to create on-page audit task: no task ID returned');
  }
  return taskId;
}

export async function getOnPageAuditResults(taskId: string): Promise<OnPageAudit | null> {
  try {
    const response = await fetch(`${DATAFORSEO_BASE_URL}/on_page/summary/${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json() as { tasks?: Array<{ status_code?: number; result?: OnPageSummaryResult[] }> };

    if (data.tasks?.[0]?.status_code !== 20000) {
      return null; // Task not ready yet
    }

    const result = data.tasks?.[0]?.result?.[0];

    return {
      crawledPages: result?.crawl_progress?.pages_crawled || 0,
      healthScore: 100 - (result?.page_metrics?.checks?.failed_checks_percentage || 0),
      issues: {
        critical: result?.page_metrics?.broken_resources || 0,
        warning: result?.page_metrics?.duplicate_title || 0,
        notice: result?.page_metrics?.no_description || 0,
      },
      topIssues: [],
    };
  } catch (error) {
    console.error('Failed to get audit results:', error);
    return null;
  }
}

// ============================================
// Ranked Keywords for Competitor Domains (Task 34)
// ============================================

// Response item from ranked_keywords endpoint
interface RankedKeywordItem {
  keyword_data: {
    keyword: string;
    keyword_info?: {
      search_volume?: number;
      competition?: number;
      cpc?: number;
    };
  };
  ranked_serp_element?: {
    serp_item?: {
      rank_absolute?: number;
      url?: string;
      title?: string;
    };
  };
}

export interface RankedKeyword {
  keyword: string;
  position: number;
  url: string;
  title: string;
  searchVolume: number;
  competition: number;
  cpc: number;
}

export interface RankedKeywordsOptions {
  limit?: number;
  locationCode?: number;
  languageCode?: string;
}

/**
 * Get top ranked keywords for a competitor domain.
 * Uses DataForSEO Labs ranked_keywords endpoint.
 */
export async function getRankedKeywordsForDomain(
  domain: string,
  options: RankedKeywordsOptions = {}
): Promise<RankedKeyword[]> {
  const { locationCode, languageCode } = getLocationConfig();
  const limit = options.limit ?? 20;

  try {
    const data = await makeRequest<RankedKeywordItem>(
      '/dataforseo_labs/google/ranked_keywords/live',
      {
        target: domain,
        location_code: options.locationCode ?? locationCode,
        language_code: options.languageCode ?? languageCode,
        limit,
        order_by: ['ranked_serp_element.serp_item.rank_absolute,asc'],
      }
    );

    const results = data.tasks?.[0]?.result ?? [];
    return results.map((item) => ({
      keyword: item.keyword_data?.keyword || '',
      position: item.ranked_serp_element?.serp_item?.rank_absolute ?? 0,
      url: item.ranked_serp_element?.serp_item?.url || '',
      title: item.ranked_serp_element?.serp_item?.title || '',
      searchVolume: item.keyword_data?.keyword_info?.search_volume ?? 0,
      competition: item.keyword_data?.keyword_info?.competition ?? 0,
      cpc: item.keyword_data?.keyword_info?.cpc ?? 0,
    }));
  } catch (error) {
    console.error(`Failed to get ranked keywords for ${domain}:`, error);
    return [];
  }
}

// ============================================
// Domain Pages Summary (Task 41)
// ============================================

// Response item from domain_pages_summary endpoint
interface DomainPageItem {
  page?: string;
  metrics?: {
    organic?: {
      etv?: number;
      count?: number;
      impressions_etv?: number;
    };
  };
}

export interface DomainPageSummary {
  url: string;
  estimatedTraffic: number;
  keywordsCount: number;
  impressions: number;
  isOpportunity: boolean;
}

/**
 * Get summary of indexed pages for a domain with traffic estimates.
 * Pages with 0 keywords are flagged as optimization opportunities.
 */
export async function getDomainPagesSummary(
  domain: string,
  limit: number = 50
): Promise<DomainPageSummary[]> {
  const { locationCode, languageCode } = getLocationConfig();

  try {
    const data = await makeRequest<DomainPageItem>(
      '/dataforseo_labs/google/domain_pages_summary/live',
      {
        target: domain,
        location_code: locationCode,
        language_code: languageCode,
        limit,
        order_by: ['metrics.organic.etv,desc'],
      }
    );

    const results = data.tasks?.[0]?.result ?? [];
    return results.map((item) => {
      const keywordsCount = item.metrics?.organic?.count ?? 0;
      return {
        url: item.page || '',
        estimatedTraffic: item.metrics?.organic?.etv ?? 0,
        keywordsCount,
        impressions: item.metrics?.organic?.impressions_etv ?? 0,
        isOpportunity: keywordsCount === 0,
      };
    });
  } catch (error) {
    console.error(`Failed to get domain pages summary for ${domain}:`, error);
    return [];
  }
}

// ============================================
// Keyword Ideas (Task 42)
// ============================================

// Response item from keyword_ideas endpoint
interface KeywordIdeaItem {
  keyword?: string;
  keyword_info?: {
    search_volume?: number;
    competition?: number;
    cpc?: number;
  };
}

export interface KeywordIdea {
  keyword: string;
  searchVolume: number;
  competition: number;
  cpc: number;
  difficulty: number;
  isOpportunity: boolean;
  seedKeyword: string;
}

export interface KeywordIdeasOptions {
  limit?: number;
  locationCode?: number;
  languageCode?: string;
}

/**
 * Get keyword ideas based on a seed keyword.
 * Returns related keywords with search metrics.
 */
export async function getKeywordIdeas(
  seedKeyword: string,
  options: KeywordIdeasOptions = {}
): Promise<KeywordIdea[]> {
  const { locationCode, languageCode } = getLocationConfig();
  const limit = options.limit ?? 5;

  try {
    const data = await makeRequest<KeywordIdeaItem>(
      '/dataforseo_labs/google/keyword_ideas/live',
      {
        keywords: [seedKeyword],
        location_code: options.locationCode ?? locationCode,
        language_code: options.languageCode ?? languageCode,
        limit,
      }
    );

    const results = data.tasks?.[0]?.result ?? [];
    return results.map((item) => ({
      keyword: item.keyword || '',
      searchVolume: item.keyword_info?.search_volume ?? 0,
      competition: item.keyword_info?.competition ?? 0,
      cpc: item.keyword_info?.cpc ?? 0,
      difficulty: Math.round((item.keyword_info?.competition ?? 0) * 100),
      isOpportunity: true, // Will be updated after cross-reference with target site rankings
      seedKeyword,
    }));
  } catch (error) {
    console.error(`Failed to get keyword ideas for "${seedKeyword}":`, error);
    return [];
  }
}
