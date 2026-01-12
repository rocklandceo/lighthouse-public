'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface Insight {
  category: string;
  severity: 'high' | 'medium' | 'low';
  finding: string;
  recommendation: string;
}

interface AIInsightsData {
  summary: string;
  insights: Insight[];
  timestamp: string;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'high':
      return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400';
    case 'medium':
      return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400';
    case 'low':
      return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400';
    default:
      return 'bg-zinc-50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400';
  }
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <div className={`rounded-lg border p-4 ${getSeverityColor(insight.severity)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm uppercase tracking-wide">
            {insight.category}
          </span>
          <span className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-black/20">
            {insight.severity}
          </span>
        </div>
      </div>
      <p className="text-sm mb-2">
        <strong>Finding:</strong> {insight.finding}
      </p>
      <p className="text-sm">
        <strong>Recommendation:</strong> {insight.recommendation}
      </p>
    </div>
  );
}

export function AIInsightsPanel() {
  const { status } = useSession();
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      if (status !== 'authenticated') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/ai-insights');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch insights');
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('AI insights fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch insights');
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, [status]);

  if (status !== 'authenticated') {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
          AI Performance Insights
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Analyzing performance data with AI...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
          AI Performance Insights
        </h2>
        <div className="text-center py-8">
          <p className="text-zinc-600 dark:text-zinc-400">
            {error === 'Anthropic API key not configured'
              ? 'AI insights not configured'
              : error === 'No performance data available'
              ? 'No performance data available for analysis'
              : `Error: ${error}`}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <span>AI Performance Insights</span>
          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            Powered by AI
          </span>
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
          {data.summary}
        </p>
      </div>

      <div className="space-y-4">
        {data.insights.map((insight, index) => (
          <InsightCard key={index} insight={insight} />
        ))}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-4 text-right">
        Last updated: {new Date(data.timestamp).toLocaleString()}
      </p>
    </div>
  );
}
