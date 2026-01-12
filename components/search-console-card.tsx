'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface SearchConsoleMetrics {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchConsoleData {
  siteUrl: string;
  dateRange: {
    start: string;
    end: string;
  };
  total: SearchConsoleMetrics;
}

function MetricCard({ label, value, format = 'number' }: { label: string; value: number; format?: 'number' | 'percentage' | 'decimal' }) {
  const formatValue = () => {
    if (format === 'percentage') {
      return `${(value * 100).toFixed(2)}%`;
    }
    if (format === 'decimal') {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      <div className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <span className="font-semibold text-2xl text-blue-600 dark:text-blue-400">
          {formatValue()}
        </span>
      </div>
    </div>
  );
}

export function SearchConsoleCard() {
  const { status } = useSession();
  const [data, setData] = useState<SearchConsoleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ details?: string; serviceAccount?: string } | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (status !== 'authenticated') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/search-console?days=7');

        if (!response.ok) {
          const errorData = await response.json();
          setErrorDetails(errorData);
          throw new Error(errorData.error || 'Failed to fetch data');
        }

        const result = await response.json();
        setData(result);
        setError(null);
        setErrorDetails(null);
      } catch (err) {
        console.error('Search Console fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [status]);

  if (status !== 'authenticated') {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
          Google Search Console
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    const isAccessDenied = error.includes('Access denied');

    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mb-6">
          Google Search Console
        </h2>
        <div className="py-6">
          {isAccessDenied && errorDetails?.serviceAccount ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
                  Service account needs access
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                  Add this email to your Search Console property:
                </p>
                <code className="block p-2 bg-amber-100 dark:bg-amber-900/40 rounded text-xs break-all text-amber-900 dark:text-amber-100">
                  {errorDetails.serviceAccount}
                </code>
              </div>
              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                <p className="font-medium mb-1">Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Search Console</a></li>
                  <li>Select your site property</li>
                  <li>Settings → Users and permissions</li>
                  <li>Add user with the email above (Full access)</li>
                </ol>
              </div>
            </div>
          ) : (
            <p className="text-center text-zinc-600 dark:text-zinc-400">
              {error === 'Google Search Console credentials not configured'
                ? 'Search Console integration not configured'
                : `Error: ${error}`}
            </p>
          )}
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
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Google Search Console
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
          Last 7 days ({data.dateRange.start} to {data.dateRange.end})
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard label="Total Clicks" value={data.total.clicks} format="number" />
        <MetricCard label="Total Impressions" value={data.total.impressions} format="number" />
        <MetricCard label="Avg CTR" value={data.total.ctr} format="percentage" />
        <MetricCard label="Avg Position" value={data.total.position} format="decimal" />
      </div>
    </div>
  );
}
