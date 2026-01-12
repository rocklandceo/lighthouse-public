'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import DashboardLayout from '@/components/DashboardLayout';
import ScoreCard from '@/components/ScoreCard';
import ActionItemCard from '@/components/ActionItemCard';
import ContentSuggestionCard from '@/components/ContentSuggestionCard';
import ContentGapCard from '@/components/ContentGapCard';
import CopyDiffView from '@/components/CopyDiffView';
import CompetitorConfigForm from '@/components/CompetitorConfigForm';
import type { ActionItem, SchemaSuggestion, CopyImprovement, Insight, ContentSuggestion } from '@/lib/types/insights';
import type { StoredReportRun } from '@/lib/cache';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Smartphone,
  Monitor,
  RefreshCw,
  AlertTriangle,
  Zap,
  Search,
  Copy,
  Check,
  Code,
} from 'lucide-react';

interface LighthouseScores {
  performance: number;
  accessibility: number;
  'best-practices': number;
  seo: number;
}

interface ReportData {
  date: string;
  scores: {
    mobile: LighthouseScores;
    desktop: LighthouseScores;
  };
}

interface AIInsights {
  summary: string | null;
  overallHealthScore: number | null;
  insights: Insight[];
  contentSuggestions: ContentSuggestion[];
  schemaSuggestions: SchemaSuggestion[];
  copyImprovements: CopyImprovement[];
  quickWins: ActionItem[];
  timestamp?: string;
  cacheStatus?: 'fresh' | 'stale' | 'empty' | 'unavailable';
  cachedAt?: string;
  isGenerating?: boolean;
  message?: string;
}

interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: { query: string; clicks: number; impressions: number }[];
}

interface CompetitorRanking {
  keyword: string;
  sitePosition: number | null;
  competitors: { domain: string; position: number }[];
  searchVolume: number;
  opportunity: 'high' | 'medium' | 'low';
}

interface ContentGap {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  topCompetitor: string | null;
  topCompetitorPosition: number | null;
  suggestedAction: string;
  // Enhanced fields for detailed recommendations
  headline?: string;
  rationale?: string;
  outline?: string[];
  targetKeywords?: string[];
  wordCountTarget?: number;
  estimatedReadTime?: string;
  aiWritingPrompt?: string;
}

interface CompetitorData {
  rankings?: CompetitorRanking[];
  contentGaps?: ContentGap[];
  timestamp?: string;
  errors?: string[]; // API errors to display to user
}

export default function Dashboard() {
  const { status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [searchConsole, setSearchConsole] = useState<SearchConsoleData | null>(null);
  const [competitorData, setCompetitorData] = useState<CompetitorData | null>(null);
  const [competitorsLoading, setCompetitorsLoading] = useState(false);
  const [competitorsError, setCompetitorsError] = useState<string | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState<number | null>(null);
  const [completedQuickWins, setCompletedQuickWins] = useState<string[]>([]);
  const [availablePages, setAvailablePages] = useState<{ path: string; url: string }[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>(''); // Empty string = site-wide

  // Fetch available pages for page selector
  const fetchAvailablePages = async () => {
    try {
      const res = await fetch('/api/reports/pages');
      if (res.ok) {
        const data = await res.json();
        setAvailablePages(data.pages || []);
      }
    } catch (err) {
      console.error('Failed to fetch available pages:', err);
    }
  };

  // Fetch completed quick wins
  const fetchCompletedQuickWins = async () => {
    try {
      const res = await fetch('/api/quick-wins/complete');
      if (res.ok) {
        const data = await res.json();
        setCompletedQuickWins(data.completed || []);
      }
    } catch (err) {
      console.error('Failed to fetch completed quick wins:', err);
    }
  };

  // Toggle quick win completion
  const toggleQuickWin = async (id: string, completed: boolean) => {
    try {
      const res = await fetch('/api/quick-wins/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedQuickWins(data.completed || []);
      }
    } catch (err) {
      console.error('Failed to toggle quick win:', err);
    }
  };

  // Copy JSON-LD to clipboard
  const copyJsonLd = async (jsonLd: string, idx: number) => {
    try {
      // Try to parse and format the JSON-LD for better readability
      let formattedJson = jsonLd;
      try {
        const parsed = JSON.parse(jsonLd);
        formattedJson = JSON.stringify(parsed, null, 2);
      } catch {
        // If parsing fails, use original string
      }
      await navigator.clipboard.writeText(formattedJson);
      setCopiedSchema(idx);
      setTimeout(() => setCopiedSchema(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch fast data first (reports, search console, pages, and completed quick wins)
      await Promise.all([
        fetchReports(),
        fetchSearchConsole(),
        fetchCompletedQuickWins(),
        fetchAvailablePages(),
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }

    // Fetch AI insights separately (slow, calls AI API)
    setInsightsLoading(true);
    try {
      await fetchAIInsights();
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchReports = async () => {
    const res = await fetch('/api/reports');
    if (res.ok) {
      const data = await res.json();
      setReportData(data.runs || []);
    }
  };

  const fetchAIInsights = async () => {
    try {
      const res = await fetch('/api/ai-insights');
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    }
  };

  const refreshAIInsights = async (pagePath?: string) => {
    setInsightsLoading(true);
    try {
      // Trigger background refresh with optional page parameter
      const res = await fetch('/api/ai-insights/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pagePath || null }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data) {
          setAiInsights({
            ...data.data,
            cacheStatus: 'fresh',
            cachedAt: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to refresh AI insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const fetchSearchConsole = async () => {
    try {
      const res = await fetch('/api/search-console');
      if (res.ok) {
        const data = await res.json();
        // API returns { total: { clicks, impressions, ctr, position }, daily: [...] }
        // Transform to expected format
        if (data.total) {
          setSearchConsole({
            clicks: data.total.clicks || 0,
            impressions: data.total.impressions || 0,
            ctr: data.total.ctr || 0,
            position: data.total.position || 0,
            topQueries: [], // Not returned by current API
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch Search Console data:', error);
    }
  };

  const fetchCompetitors = async () => {
    setCompetitorsLoading(true);
    setCompetitorsError(null);
    try {
      const res = await fetch('/api/competitors');
      const data = await res.json();

      if (res.ok) {
        setCompetitorData(data);
      } else {
        // Handle API errors
        setCompetitorsError(data.error || data.message || 'Failed to fetch competitor data');
      }
    } catch (err) {
      console.error('Competitor fetch error:', err);
      setCompetitorsError(err instanceof Error ? err.message : 'Network error - failed to connect');
    } finally {
      setCompetitorsLoading(false);
    }
  };

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/scan', { method: 'POST' });
      if (res.ok) {
        await fetchAllData();
      }
    } finally {
      setScanning(false);
    }
  };

  // Show sign-in screen if not authenticated (check this BEFORE loading state)
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--warm-50)]">
        <div className="text-center bg-white p-10 rounded-2xl shadow-xl border border-[var(--warm-200)]">
          <h1 className="text-2xl font-bold text-[var(--navy-800)] mb-4">SEO Dashboard</h1>
          <p className="text-[var(--navy-800)]/70 mb-6">Please sign in to access the dashboard.</p>
          <Link
            href="/api/auth/signin"
            className="inline-block px-8 py-3 gradient-bronze text-white rounded-xl hover:shadow-lg transition-all font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Show loading spinner while auth is loading or data is being fetched
  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--warm-50)]">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 text-[var(--bronze-600)] mx-auto mb-4" />
          <p className="text-[var(--navy-800)]/70">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Note: reportData state is typed as ReportData[] but API returns StoredReportRun[]
  const latestRun = reportData[0] as unknown as StoredReportRun | undefined;
  const previousRun = reportData[1] as unknown as StoredReportRun | undefined;

  // Safely extract scores from the nested report structure
  // API returns: { timestamp, date, reports: [{ scores: { mobile, desktop } }] }
  const getScores = (run: StoredReportRun | undefined) => {
    if (!run) return { mobile: undefined, desktop: undefined };
    // Handle both formats: direct scores or nested in reports[0]
    return run.reports?.[0]?.scores || { mobile: undefined, desktop: undefined };
  };

  const latestScores = getScores(latestRun);
  const previousScores = getScores(previousRun);

  // Safely extract scores from report data
  // Check for duplicate dates to determine formatting
  // Note: reportData comes from API as StoredReportRun[] but state is typed as ReportData[]
  const recentReports = reportData.slice(0, 7) as unknown as StoredReportRun[];
  const dateStrings = recentReports.map((r) =>
    new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );
  const hasDuplicateDates = dateStrings.length !== new Set(dateStrings).size;

  const trendData = recentReports.reverse().map((r) => {
    const scores = r.reports?.[0]?.scores || { mobile: undefined, desktop: undefined };
    const dateObj = new Date(r.date);
    // Show time if there are duplicate dates, otherwise just month/day
    const dateLabel = hasDuplicateDates
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
        ' ' + dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return {
      date: dateLabel,
      mobilePerf: scores.mobile?.performance || 0,
      desktopPerf: scores.desktop?.performance || 0,
      mobileSEO: scores.mobile?.seo || 0,
      desktopSEO: scores.desktop?.seo || 0,
    };
  });

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      lastScan={latestRun?.date}
      healthScore={aiInsights?.overallHealthScore ?? undefined}
    >
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Quick Actions */}
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-[var(--navy-800)]">Dashboard Overview</h2>
            <button
              onClick={runScan}
              disabled={scanning}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all font-medium"
              style={{ background: 'linear-gradient(135deg, #B45309 0%, #D97706 100%)' }}
            >
              <RefreshCw className={scanning ? 'animate-spin' : ''} size={16} />
              {scanning ? 'Scanning...' : 'Run New Scan'}
            </button>
          </div>

          {/* AI Summary */}
          <div className="bg-gradient-to-r from-[var(--warm-100)] to-[var(--warm-200)] border border-[var(--bronze-300)] rounded-xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
              <h3 className="text-lg font-semibold text-[var(--navy-800)] flex items-center gap-2">
                <Zap className="text-[var(--bronze-500)]" size={20} />
                AI Analysis Summary
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {availablePages.length > 0 && (
                  <select
                    value={selectedPage}
                    onChange={(e) => setSelectedPage(e.target.value)}
                    aria-label="Select page for AI analysis"
                    className="text-sm px-3 py-1.5 bg-white/80 border border-[var(--warm-300)] rounded-lg text-[var(--navy-800)] focus:ring-2 focus:ring-[var(--bronze-500)] focus:border-[var(--bronze-500)]"
                  >
                    <option value="">All Pages (Site-wide)</option>
                    {availablePages.map((page) => (
                      <option key={page.path} value={page.path}>
                        {page.path === '/' ? 'Homepage' : page.path}
                      </option>
                    ))}
                  </select>
                )}
                {aiInsights?.cachedAt && (
                  <span className="text-xs text-[var(--navy-800)]/50">
                    {aiInsights.cacheStatus === 'stale' ? '⚠️ ' : ''}
                    Updated {new Date(aiInsights.cachedAt).toLocaleString()}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => refreshAIInsights(selectedPage || undefined)}
                  disabled={insightsLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--navy-800)] bg-white/60 hover:bg-white rounded-lg border border-[var(--warm-300)] disabled:opacity-50 transition-all"
                >
                  <RefreshCw className={insightsLoading ? 'animate-spin' : ''} size={14} />
                  {insightsLoading ? 'Generating...' : 'Refresh'}
                </button>
              </div>
            </div>
            {insightsLoading && !aiInsights?.summary ? (
              <div className="flex items-center gap-2 text-[var(--navy-800)]/60">
                <RefreshCw className="animate-spin" size={16} />
                <span>Generating AI insights... This may take 10-30 seconds.</span>
              </div>
            ) : aiInsights?.summary ? (
              <p className="text-[var(--navy-800)]/80">{aiInsights.summary}</p>
            ) : (
              <p className="text-[var(--navy-800)]/60">
                {aiInsights?.message || 'No AI insights available. Click Refresh to generate analysis.'}
              </p>
            )}
          </div>

          {/* Score Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard
              title="Mobile Performance"
              score={latestScores.mobile?.performance || 0}
              previousScore={previousScores.mobile?.performance}
              icon={<Smartphone size={18} className="text-gray-400" />}
            />
            <ScoreCard
              title="Desktop Performance"
              score={latestScores.desktop?.performance || 0}
              previousScore={previousScores.desktop?.performance}
              icon={<Monitor size={18} className="text-gray-400" />}
            />
            <ScoreCard
              title="Mobile SEO"
              score={latestScores.mobile?.seo || 0}
              previousScore={previousScores.mobile?.seo}
              icon={<Search size={18} className="text-gray-400" />}
            />
            <ScoreCard
              title="Desktop SEO"
              score={latestScores.desktop?.seo || 0}
              previousScore={previousScores.desktop?.seo}
              icon={<Search size={18} className="text-gray-400" />}
            />
          </div>

          {/* Performance Trend Chart */}
          {trendData.length > 0 && (
            <div className="bg-white rounded-xl border border-[var(--warm-200)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--navy-800)] mb-4">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--warm-200)" />
                  <XAxis dataKey="date" stroke="var(--navy-800)" />
                  <YAxis domain={[0, 100]} stroke="var(--navy-800)" />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="desktopPerf"
                    name="Desktop Performance"
                    stroke="#0B3D91"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="mobilePerf"
                    name="Mobile Performance"
                    stroke="#B45309"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Search Console Summary */}
          {searchConsole && (
            <div className="bg-white rounded-xl border border-[var(--warm-200)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--navy-800)] mb-4">Search Console (Last 7 Days)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-[var(--warm-50)] rounded-xl border border-[var(--warm-200)]">
                  <div className="text-2xl font-bold text-[var(--navy-800)]">{searchConsole.clicks.toLocaleString()}</div>
                  <div className="text-sm text-[var(--navy-800)]/60">Clicks</div>
                </div>
                <div className="text-center p-4 bg-[var(--warm-50)] rounded-xl border border-[var(--warm-200)]">
                  <div className="text-2xl font-bold text-emerald-600">{searchConsole.impressions.toLocaleString()}</div>
                  <div className="text-sm text-[var(--navy-800)]/60">Impressions</div>
                </div>
                <div className="text-center p-4 bg-[var(--warm-50)] rounded-xl border border-[var(--warm-200)]">
                  <div className="text-2xl font-bold text-[var(--bronze-600)]">{(searchConsole.ctr * 100).toFixed(1)}%</div>
                  <div className="text-sm text-[var(--navy-800)]/60">CTR</div>
                </div>
                <div className="text-center p-4 bg-[var(--warm-50)] rounded-xl border border-[var(--warm-200)]">
                  <div className="text-2xl font-bold text-[var(--bronze-500)]">{searchConsole.position.toFixed(1)}</div>
                  <div className="text-sm text-[var(--navy-800)]/60">Avg Position</div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Wins with Completion Tracking */}
          {aiInsights?.quickWins && aiInsights.quickWins.length > 0 && (
            <div className="bg-white rounded-xl border border-[var(--warm-200)] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--navy-800)] flex items-center gap-2">
                  <Zap className="text-[var(--bronze-500)]" size={20} />
                  Quick Wins (Under 30 Minutes)
                </h3>
                {completedQuickWins.length > 0 && (
                  <span className="text-sm text-green-600 font-medium">
                    {completedQuickWins.length} completed
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {aiInsights.quickWins.slice(0, 3).map((item, idx) => {
                  const itemId = `${item.type}-${item.title.toLowerCase().replace(/\s+/g, '-')}-${idx}`;
                  return (
                    <ActionItemCard
                      key={idx}
                      item={item}
                      index={idx}
                      isCompleted={completedQuickWins.includes(itemId)}
                      onToggleComplete={toggleQuickWin}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-8">
          <h2 className="text-lg font-semibold text-[var(--navy-800)]">Lighthouse Performance Analysis</h2>

          {/* Detailed Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mobile Scores */}
            <div className="bg-white rounded-xl border border-[var(--warm-200)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--navy-800)] mb-4 flex items-center gap-2">
                <Smartphone size={20} className="text-[var(--bronze-600)]" />
                Mobile Scores
              </h3>
              <div className="space-y-4">
                <ScoreCard
                  title="Performance"
                  score={latestScores.mobile?.performance || 0}
                  previousScore={previousScores.mobile?.performance}
                />
                <ScoreCard
                  title="Accessibility"
                  score={latestScores.mobile?.accessibility || 0}
                  previousScore={previousScores.mobile?.accessibility}
                />
                <ScoreCard
                  title="Best Practices"
                  score={latestScores.mobile?.['best-practices'] || 0}
                  previousScore={previousScores.mobile?.['best-practices']}
                />
                <ScoreCard
                  title="SEO"
                  score={latestScores.mobile?.seo || 0}
                  previousScore={previousScores.mobile?.seo}
                />
              </div>
            </div>

            {/* Desktop Scores */}
            <div className="bg-white rounded-xl border border-[var(--warm-200)] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--navy-800)] mb-4 flex items-center gap-2">
                <Monitor size={20} className="text-[var(--navy-800)]" />
                Desktop Scores
              </h3>
              <div className="space-y-4">
                <ScoreCard
                  title="Performance"
                  score={latestScores.desktop?.performance || 0}
                  previousScore={previousScores.desktop?.performance}
                />
                <ScoreCard
                  title="Accessibility"
                  score={latestScores.desktop?.accessibility || 0}
                  previousScore={previousScores.desktop?.accessibility}
                />
                <ScoreCard
                  title="Best Practices"
                  score={latestScores.desktop?.['best-practices'] || 0}
                  previousScore={previousScores.desktop?.['best-practices']}
                />
                <ScoreCard
                  title="SEO"
                  score={latestScores.desktop?.seo || 0}
                  previousScore={previousScores.desktop?.seo}
                />
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          {aiInsights?.insights && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Recommendations</h3>
              <div className="space-y-4">
                {aiInsights.insights
                  .filter((i) => i.category === 'Performance')
                  .map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-l-4 ${
                        insight.severity === 'high'
                          ? 'bg-red-50 border-red-500'
                          : insight.severity === 'medium'
                          ? 'bg-yellow-50 border-yellow-500'
                          : 'bg-green-50 border-green-500'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle
                          size={18}
                          className={
                            insight.severity === 'high'
                              ? 'text-red-500'
                              : insight.severity === 'medium'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                          }
                        />
                        <div>
                          <p className="font-medium text-gray-900">{insight.finding}</p>
                          <p className="text-sm text-gray-600 mt-1">{insight.recommendation}</p>
                        </div>
                      </div>
                      {insight.actionItems && insight.actionItems.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {insight.actionItems.map((item, itemIdx) => (
                            <ActionItemCard key={itemIdx} item={item} index={itemIdx} />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SEO & Content Tab */}
      {activeTab === 'seo' && (
        <div className="space-y-8">
          <h2 className="text-lg font-semibold text-gray-900">SEO & Content Recommendations</h2>

          {/* Content Suggestions */}
          {aiInsights?.contentSuggestions && aiInsights.contentSuggestions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Blog Content</h3>
              <div className="space-y-4">
                {aiInsights.contentSuggestions.map((suggestion, idx) => (
                  <ContentSuggestionCard key={idx} suggestion={suggestion} />
                ))}
              </div>
            </div>
          )}

          {/* Schema Suggestions */}
          {aiInsights?.schemaSuggestions && aiInsights.schemaSuggestions.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Schema Markup Recommendations</h3>
              <p className="text-sm text-gray-600 mb-4">Structured data helps search engines understand your content and can enable rich results in search.</p>
              <div className="space-y-4">
                {aiInsights.schemaSuggestions.map((schema, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {schema.pageType && (
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium uppercase">
                          {schema.pageType}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium">
                        {schema.type}
                      </span>
                      {schema.schemaTypes && schema.schemaTypes.length > 1 && (
                        <span className="text-xs text-gray-500">
                          +{schema.schemaTypes.length - 1} more types
                        </span>
                      )}
                    </div>
                    {schema.pageUrl && (
                      <div className="text-sm text-blue-600 mb-2 font-mono">
                        {schema.pageUrl}
                      </div>
                    )}
                    {!schema.pageUrl && schema.targetPages && schema.targetPages.length > 0 && (
                      <div className="text-sm text-gray-500 mb-2">
                        Target: {schema.targetPages.join(', ')}
                      </div>
                    )}
                    <p className="text-gray-600 mb-3">{schema.description}</p>
                    {schema.schemaTypes && schema.schemaTypes.length > 1 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {schema.schemaTypes.map((type, typeIdx) => (
                          <span key={typeIdx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                    <details className="group">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                        <Code size={14} />
                        View JSON-LD Code
                      </summary>
                      <div className="relative mt-2">
                        <button
                          onClick={() => copyJsonLd(schema.jsonLd, idx)}
                          className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors z-10"
                          title="Copy to clipboard"
                        >
                          {copiedSchema === idx ? (
                            <Check size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} className="text-gray-400" />
                          )}
                        </button>
                        <pre className="bg-gray-900 text-gray-100 p-4 pr-12 rounded-lg overflow-x-auto text-sm max-h-64">
                          <code>
                            {(() => {
                              try {
                                return JSON.stringify(JSON.parse(schema.jsonLd), null, 2);
                              } catch {
                                return schema.jsonLd;
                              }
                            })()}
                          </code>
                        </pre>
                        {copiedSchema === idx && (
                          <div className="absolute top-2 right-12 px-2 py-1 bg-green-600 text-white text-xs rounded">
                            Copied!
                          </div>
                        )}
                      </div>
                    </details>
                    {schema.implementationNotes && (
                      <p className="text-sm text-gray-500 mt-3 italic">{schema.implementationNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Copy Improvements with Visual Diff */}
          {aiInsights?.copyImprovements && aiInsights.copyImprovements.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Copy & Messaging Improvements</h3>
              <p className="text-sm text-gray-600 mb-4">Improve your site&apos;s messaging to increase conversions and user engagement.</p>
              <div className="space-y-6">
                {aiInsights.copyImprovements.map((copy, idx) => (
                  <div key={idx} className={`border-2 rounded-lg p-4 ${
                    copy.priority === 'high' ? 'border-red-200 bg-red-50/30' :
                    copy.priority === 'medium' ? 'border-yellow-200 bg-yellow-50/30' :
                    'border-green-200 bg-green-50/30'
                  }`}>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {copy.priority && (
                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                          copy.priority === 'high' ? 'bg-red-100 text-red-700' :
                          copy.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {copy.priority}
                        </span>
                      )}
                      {copy.pageType && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-medium uppercase">
                          {copy.pageType}
                        </span>
                      )}
                      {copy.category && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                          {copy.category}
                        </span>
                      )}
                      <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-sm font-medium">
                        {copy.location}
                      </span>
                      <span className="text-gray-600 text-sm">{copy.element}</span>
                    </div>
                    {copy.pageUrl && (
                      <div className="text-sm text-blue-600 mb-3 font-mono">
                        {copy.pageUrl}
                      </div>
                    )}
                    <CopyDiffView currentCopy={copy.currentCopy} suggestedCopy={copy.suggestedCopy} />
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Rationale:</strong> {copy.rationale}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        <strong>Expected Impact:</strong> {copy.expectedImpact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Competitors Tab */}
      {activeTab === 'competitors' && (
        <div className="space-y-8">
          {/* Competitor Configuration */}
          <CompetitorConfigForm onConfigSaved={() => setCompetitorData(null)} />

          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Competitor Analysis</h2>
            <button
              onClick={fetchCompetitors}
              disabled={competitorsLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={competitorsLoading ? 'animate-spin' : ''} size={16} />
              {competitorsLoading ? 'Analyzing...' : 'Run Analysis'}
            </button>
          </div>

          {/* Display loading state */}
          {competitorsLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <div className="flex items-center justify-center gap-3">
                <RefreshCw className="animate-spin text-blue-600" size={24} />
                <p className="text-blue-800 font-medium">Running competitor analysis...</p>
              </div>
              <p className="text-sm text-blue-600 mt-2">
                This may take a minute. Fetching keyword rankings, competitor profiles, and content gaps.
              </p>
            </div>
          )}

          {/* Display fetch error */}
          {competitorsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Failed to run competitor analysis:</p>
                  <p className="mt-1 text-sm text-red-700">{competitorsError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Display API errors if any */}
          {competitorData?.errors && competitorData.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-red-800">Some API requests failed:</p>
                  <ul className="mt-2 text-sm text-red-700 space-y-1">
                    {competitorData.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                    {competitorData.errors.length > 5 && (
                      <li className="text-red-600">...and {competitorData.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!competitorsLoading && !competitorData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">
                Competitor analysis requires DataForSEO API credentials.
                Click &quot;Run Analysis&quot; to fetch competitor data.
              </p>
              <p className="text-sm text-yellow-600 mt-2">
                This will use DataForSEO API credits.
              </p>
            </div>
          )}

          {competitorData && (
            <>
              {/* Keyword Rankings */}
              {competitorData.rankings && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Keyword Rankings</h3>
                  {/* Desktop: Table view */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3">Keyword</th>
                          <th className="text-center py-2 px-3">Your Site</th>
                          <th className="text-center py-2 px-3">#1 Competitor</th>
                          <th className="text-center py-2 px-3">#2 Competitor</th>
                          <th className="text-center py-2 px-3">#3 Competitor</th>
                          <th className="text-center py-2 px-3">Volume</th>
                        </tr>
                      </thead>
                      <tbody>
                        {competitorData.rankings.map((r, idx) => {
                          // Sort competitors by position and take top 3
                          const sortedCompetitors = [...r.competitors]
                            .sort((a, b) => a.position - b.position)
                            .slice(0, 3);
                          return (
                            <tr key={idx} className="border-b border-gray-100">
                              <td className="py-2 px-3 font-medium">{r.keyword}</td>
                              <td className="py-2 px-3 text-center">
                                {r.sitePosition ? (
                                  <span className={r.sitePosition <= 10 ? 'text-green-600 font-semibold' : ''}>
                                    #{r.sitePosition}
                                  </span>
                                ) : (
                                  <span className="text-red-500 text-xs">Not ranking</span>
                                )}
                              </td>
                              {[0, 1, 2].map((i) => (
                                <td key={i} className="py-2 px-3 text-center">
                                  {sortedCompetitors[i] ? (
                                    <div className="flex flex-col">
                                      <span className="text-xs text-gray-500 truncate max-w-[120px]" title={sortedCompetitors[i].domain}>
                                        {sortedCompetitors[i].domain.replace('www.', '')}
                                      </span>
                                      <span className="font-medium">#{sortedCompetitors[i].position}</span>
                                    </div>
                                  ) : (
                                    <span className="text-gray-300">—</span>
                                  )}
                                </td>
                              ))}
                              <td className="py-2 px-3 text-center">{r.searchVolume.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile/Tablet: Card view */}
                  <div className="lg:hidden space-y-3">
                    {competitorData.rankings.map((r, idx) => {
                      const sortedCompetitors = [...r.competitors]
                        .sort((a, b) => a.position - b.position)
                        .slice(0, 3);
                      return (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900 text-sm">{r.keyword}</span>
                            <span className="text-xs text-gray-500">{r.searchVolume.toLocaleString()} vol</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="text-blue-600 font-medium">Your Site</div>
                              <div className="font-semibold text-lg">
                                {r.sitePosition ? `#${r.sitePosition}` : <span className="text-red-500 text-sm">N/A</span>}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-gray-500">#1 Competitor</div>
                              {sortedCompetitors[0] ? (
                                <>
                                  <div className="font-semibold text-lg">#{sortedCompetitors[0].position}</div>
                                  <div className="text-gray-500 truncate">{sortedCompetitors[0].domain.replace('www.', '')}</div>
                                </>
                              ) : (
                                <div className="text-gray-300">—</div>
                              )}
                            </div>
                          </div>
                          {sortedCompetitors.length > 1 && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {[1, 2].map((i) => (
                                <div key={i} className="text-center p-2 bg-gray-50 rounded">
                                  <div className="text-gray-500">#{i + 1} Competitor</div>
                                  {sortedCompetitors[i] ? (
                                    <>
                                      <div className="font-medium">#{sortedCompetitors[i].position}</div>
                                      <div className="text-gray-500 truncate text-[10px]">{sortedCompetitors[i].domain.replace('www.', '')}</div>
                                    </>
                                  ) : (
                                    <div className="text-gray-300">—</div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Content Gaps */}
              {competitorData.contentGaps && competitorData.contentGaps.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Gap Opportunities</h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Keywords where competitors rank but your site does not. Click each card for detailed content recommendations.
                  </p>
                  <div className="space-y-3">
                    {competitorData.contentGaps.map((gap, idx) => (
                      <ContentGapCard key={idx} gap={gap} />
                    ))}
                  </div>
                </div>
              )}

              {/* No Content Gaps Found */}
              {competitorData.contentGaps && competitorData.contentGaps.length === 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-green-800 font-medium">Great news! Your site ranks for all tracked keywords.</p>
                  <p className="text-green-600 text-sm mt-1">Consider adding more keywords to track in the configuration above.</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Action Items Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-8">
          <h2 className="text-lg font-semibold text-gray-900">All Action Items</h2>

          {aiInsights?.insights && (
            <div className="space-y-6">
              {/* High Priority */}
              <div>
                <h3 className="text-md font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} />
                  High Priority
                </h3>
                <div className="space-y-2">
                  {aiInsights.insights
                    .filter((i) => i.severity === 'high')
                    .flatMap((i) => i.actionItems || [])
                    .map((item, idx) => (
                      <ActionItemCard key={idx} item={item} index={idx} />
                    ))}
                </div>
              </div>

              {/* Medium Priority */}
              <div>
                <h3 className="text-md font-semibold text-yellow-700 mb-3">Medium Priority</h3>
                <div className="space-y-2">
                  {aiInsights.insights
                    .filter((i) => i.severity === 'medium')
                    .flatMap((i) => i.actionItems || [])
                    .map((item, idx) => (
                      <ActionItemCard key={idx} item={item} index={idx} />
                    ))}
                </div>
              </div>

              {/* Low Priority */}
              <div>
                <h3 className="text-md font-semibold text-green-700 mb-3">Low Priority (Polish)</h3>
                <div className="space-y-2">
                  {aiInsights.insights
                    .filter((i) => i.severity === 'low')
                    .flatMap((i) => i.actionItems || [])
                    .map((item, idx) => (
                      <ActionItemCard key={idx} item={item} index={idx} />
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
