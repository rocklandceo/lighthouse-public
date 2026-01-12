// Type definitions for enhanced AI insights system

// Shared implementation details interface for all recommendations
export interface ImplementationDetails {
  steps: string[];
  targetFiles?: string[];
  targetUrls?: string[];
  estimatedTimeMinutes?: number;
  requiredTools?: string[];
  codeExample?: string;
  beforeAfter?: { before: string; after: string };
  expectedMetrics?: { metric: string; before: string; after: string }[];
}

export interface ActionItem {
  type: 'code' | 'content' | 'schema' | 'technical' | 'copy';
  title: string;
  description: string;
  implementation?: string;
  estimatedImpact: string;
  effort: 'low' | 'medium' | 'high';
  priority: number;
  // Enhanced fields for detailed action items
  category?: 'performance' | 'seo' | 'accessibility' | 'security' | 'ux' | 'content';
  pageUrl?: string;
  codeSnippet?: string;
  beforeAfter?: { before: string; after: string };
  timeToImplement?: string;
  tools?: string[];
}

export interface Insight {
  category: string;
  severity: 'high' | 'medium' | 'low';
  finding: string;
  recommendation: string;
  actionItems: ActionItem[];
  // Enhanced implementation details
  implementation?: ImplementationDetails;
  affectedPages?: string[];
  device?: 'mobile' | 'desktop' | 'both';
}

export interface ContentSuggestion {
  topic: string;
  headline: string;
  rationale: string;
  targetKeywords: string[];
  searchVolume: string;
  difficulty: 'low' | 'medium' | 'high';
  priority: 'high' | 'medium' | 'low';
  outline: string[];
  keyTakeaways?: string[];
  callToAction?: string;
  wordCountTarget: number;
  estimatedReadTime: string;
  aiWritingPrompt: string;
}

export interface SchemaSuggestion {
  type: string;
  description: string;
  jsonLd: string;
  targetPages: string[];
  implementationNotes: string;
  // Enhanced fields for multi-page schema recommendations
  pageUrl?: string;
  pageType?: 'homepage' | 'blog' | 'faq' | 'support' | 'informational' | 'pricing' | 'legal';
  schemaTypes?: string[]; // Multiple schema types for a single page
  // Implementation details
  implementationSteps?: string[];
  targetFile?: string;
  estimatedTimeMinutes?: number;
  validationUrl?: string; // URL to test schema validity
}

export interface CopyImprovement {
  location: string;
  element: string;
  currentCopy: string;
  suggestedCopy: string;
  rationale: string;
  expectedImpact: string;
  // Enhanced fields for multi-page copy recommendations
  pageUrl?: string;
  pageType?: 'homepage' | 'pricing' | 'support' | 'blog' | 'legal' | 'features' | 'about';
  category?: 'headline' | 'cta' | 'description' | 'navigation' | 'form' | 'error' | 'social-proof';
  priority?: 'high' | 'medium' | 'low';
  // Implementation details
  targetFile?: string;
  implementationSteps?: string[];
  estimatedTimeMinutes?: number;
  abTestSuggestion?: string;
}

export interface CompetitorInsight {
  competitor: string;
  insight: string;
  opportunity: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AIInsightsResponse {
  summary: string;
  overallHealthScore: number;
  insights: Insight[];
  contentSuggestions: ContentSuggestion[];
  schemaSuggestions: SchemaSuggestion[];
  copyImprovements: CopyImprovement[];
  quickWins: ActionItem[];
  competitorInsights?: CompetitorInsight[];
  timestamp: string;
  analysisVersion: string;
}

// Google Analytics types
export interface GAMetrics {
  sessions: number;
  pageViews: number;
  users: number;
  newUsers: number;
  avgSessionDuration: number;
  bounceRate: number;
  engagementRate: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  users: number;
  bounceRate: number;
}

export interface TopPage {
  pagePath: string;
  pageTitle: string;
  pageViews: number;
  avgTimeOnPage: number;
  bounceRate: number;
  entrances: number;
}

export interface DeviceBreakdown {
  device: string;
  sessions: number;
  percentage: number;
}

export interface AnalyticsOverview {
  metrics: GAMetrics;
  trafficSources: TrafficSource[];
  topPages: TopPage[];
  deviceBreakdown: DeviceBreakdown[];
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export interface AnalyticsTrend {
  date: string;
  sessions: number;
  pageViews: number;
  users: number;
}

// DataForSEO types
export interface KeywordRanking {
  keyword: string;
  position: number;
  previousPosition?: number;
  url: string;
  searchVolume: number;
  competition: number;
  cpc: number;
}

export interface CompetitorProfile {
  domain: string;
  organicTraffic: number;
  organicKeywords: number;
  domainAuthority: number;
}

export interface ContentGap {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  competitorsCovering: string[];
  opportunityScore: number;
}

export interface CompetitorAnalysis {
  rankings: KeywordRanking[];
  competitors: CompetitorProfile[];
  contentGaps: ContentGap[];
  timestamp: string;
}

// Dashboard state types
export type DashboardTab = 'overview' | 'performance' | 'seo' | 'competitors' | 'actions';

export interface DashboardState {
  activeTab: DashboardTab;
  loading: boolean;
  error: string | null;
}
