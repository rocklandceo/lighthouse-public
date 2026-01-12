'use client';

import React from 'react';
import CompetitorConfigForm from '@/components/CompetitorConfigForm';
import ContentGapCard from '@/components/ContentGapCard';
import { RefreshCw, AlertTriangle, TrendingUp, Target } from 'lucide-react';

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
  headline?: string;
  rationale?: string;
  outline?: string[];
  targetKeywords?: string[];
  wordCountTarget?: number;
  estimatedReadTime?: string;
  aiWritingPrompt?: string;
}

interface CompetitorsTabProps {
  rankings: CompetitorRanking[];
  contentGaps: ContentGap[];
  errors: string[];
  loading?: boolean;
  onRefresh: () => void;
  onConfigSaved: () => void;
}

/**
 * Competitors tab showing keyword rankings, content gaps, and competitor analysis.
 * Includes configuration form for managing tracked competitors and keywords.
 */
export default function CompetitorsTab({
  rankings,
  contentGaps,
  errors,
  loading = false,
  onRefresh,
  onConfigSaved,
}: CompetitorsTabProps) {
  const opportunityColors = {
    high: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-8">
      {/* Configuration */}
      <CompetitorConfigForm onConfigSaved={onConfigSaved} />

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : 'Refresh Analysis'}
        </button>
      </div>

      {/* API Errors */}
      {errors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Some data could not be retrieved</h4>
              <ul className="mt-2 text-sm text-amber-700 space-y-1">
                {errors.slice(0, 3).map((error, idx) => (
                  <li key={idx}>{error}</li>
                ))}
                {errors.length > 3 && (
                  <li className="text-amber-600">...and {errors.length - 3} more</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Keyword Rankings */}
      {rankings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={20} />
            Keyword Rankings
          </h3>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Keyword
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Your Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Search Volume
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Opportunity
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rankings.map((ranking, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {ranking.keyword}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ranking.sitePosition ?? 'Not ranking'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {ranking.searchVolume.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${opportunityColors[ranking.opportunity]}`}>
                        {ranking.opportunity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Gaps */}
      {contentGaps.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} />
            Content Opportunities
          </h3>
          <div className="space-y-4">
            {contentGaps.map((gap, idx) => (
              <ContentGapCard key={idx} gap={gap} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {rankings.length === 0 && contentGaps.length === 0 && !loading && (
        <div className="text-center py-12 text-gray-500">
          <p>No competitor data available.</p>
          <p className="text-sm mt-2">Configure competitors and keywords above, then click Refresh.</p>
        </div>
      )}
    </div>
  );
}
